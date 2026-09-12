import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import multer from 'multer';
import axios from 'axios';
import { requireAuth } from './middleware/auth.js';
import { pool } from './db.js';
import { sendMail } from './mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Ensure uploads folder exists
await fs.mkdir(UPLOADS_DIR, { recursive: true });

// Ensure the STK push transaction table exists (persists across restarts,
// unlike an in-memory Map).
await pool.query(`
  CREATE TABLE IF NOT EXISTS mpesa_stk_transactions (
    checkout_request_id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'pending',
    amount NUMERIC,
    phone TEXT,
    mpesa_receipt TEXT,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
  )
`);

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images publicly
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Multer config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max (covers images and short video clips)
  fileFilter: (req, file, cb) => {
    const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP, GIF images or MP4, WEBM, MOV videos are allowed'));
    }
    cb(null, true);
  },
});


// --- Register a new admin account ---
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and a password of at least 8 characters are required' });
  }

  try {
    const existing = await pool.query('SELECT 1 FROM admin_users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `INSERT INTO admin_users (email, password_hash, is_verified, verification_token, verification_expires)
       VALUES ($1, $2, false, $3, $4)`,
      [email, passwordHash, verificationToken, verificationExpires]
    );

    const verifyLink = `${FRONTEND_URL}/admin/verify-email?token=${verificationToken}`;
    await sendMail({
      to: email,
      subject: 'Verify your admin account',
      html: `<p>Click the link below to verify your admin account:</p>
             <p><a href="${verifyLink}">${verifyLink}</a></p>
             <p>This link expires in 1 hour.</p>`,
    });

    res.json({ success: true, message: 'Account created. Check your email to verify it before logging in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// --- Verify email address ---
app.get('/api/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const { rows } = await pool.query(
      `SELECT id FROM admin_users
       WHERE verification_token = $1 AND verification_expires > now()`,
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    await pool.query(
      `UPDATE admin_users
       SET is_verified = true, verification_token = NULL, verification_expires = NULL
       WHERE id = $1`,
      [rows[0].id]
    );

    res.json({ success: true, message: 'Email verified — you can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// --- Login ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Incorrect email or password' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Incorrect email or password' });

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- Re-check password without issuing a new token (used to unlock after inactivity) ---
app.post('/api/verify-password', requireAuth, async (req, res) => {
  const { password } = req.body;
  try {
    const { rows } = await pool.query('SELECT password_hash FROM admin_users WHERE id = $1', [req.user.sub]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Account not found' });

    const validPassword = await bcrypt.compare(password || '', user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Incorrect password' });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// --- Forgot password: request a reset link ---
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const genericResponse = { success: true, message: 'If that email exists, a reset link has been sent.' };

  if (!email) return res.json(genericResponse);

  try {
    const { rows } = await pool.query('SELECT id FROM admin_users WHERE email = $1', [email]);
    if (rows.length === 0) return res.json(genericResponse); // don't reveal whether email exists

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `UPDATE admin_users SET reset_token = $1, reset_expires = $2 WHERE id = $3`,
      [resetToken, resetExpires, rows[0].id]
    );

    const resetLink = `${FRONTEND_URL}/admin/reset-password?token=${resetToken}`;
    await sendMail({
      to: email,
      subject: 'Reset your admin password',
      html: `<p>Click the link below to reset your password:</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
    });

    res.json(genericResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// --- Reset password using token from email ---
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'A valid token and a password of at least 8 characters are required' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id FROM admin_users WHERE reset_token = $1 AND reset_expires > now()`,
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE admin_users
       SET password_hash = $1, reset_token = NULL, reset_expires = NULL
       WHERE id = $2`,
      [passwordHash, rows[0].id]
    );

    res.json({ success: true, message: 'Password updated — you can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// CONTENT + UPLOADS (unchanged, still protected by requireAuth)


app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  const type = ALLOWED_VIDEO_TYPES.includes(req.file.mimetype) ? 'video' : 'image';
  res.json({ url, type });
});

app.get('/api/content', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT page, data FROM content');
    const content = {};
    for (const row of rows) content[row.page] = row.data;
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load content' });
  }
});

app.put('/api/content/:page', requireAuth, async (req, res) => {
  const { page } = req.params;
  try {
    const existing = await pool.query('SELECT 1 FROM content WHERE page = $1', [page]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: `Unknown page: ${page}` });
    }

    const { rows } = await pool.query(
      `UPDATE content SET data = $2, updated_at = now()
       WHERE page = $1
       RETURNING data`,
      [page, req.body]
    );
    res.json({ success: true, page: rows[0].data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save content' });
  }
});


//  Public: submit a message from the Connect page 
app.post('/api/messages', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!email || !message || !message.trim()) {
    return res.status(400).json({ error: 'Email and message are required' });
  }

  try {
    await pool.query(
      `INSERT INTO messages (first_name, last_name, email, message)
       VALUES ($1, $2, $3, $4)`,
      [firstName || '', lastName || '', email, message]
    );
    res.json({ success: true, message: "Thank you — your message has been sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

//Admin: view all messages, newest first 
app.get('/api/messages', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// Admin: mark a message as read
app.patch('/api/messages/:id/read', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE messages SET is_read = true WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// --- Admin: delete a message ---
app.delete('/api/messages/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});


//Public: notify the church of a gift made via M-Pesa or bank transfer 
app.post('/api/giving', async (req, res) => {
  const { fullName, email, phone, givingType, paymentMethod, amount, reference } = req.body;

  if (!givingType || !paymentMethod) {
    return res.status(400).json({ error: 'Giving type and payment method are required' });
  }
  if (!email && !phone) {
    return res.status(400).json({ error: 'Please provide an email or phone number so we can follow up' });
  }

  const parsedAmount = amount !== undefined && amount !== '' ? Number(amount) : null;
  if (parsedAmount !== null && (Number.isNaN(parsedAmount) || parsedAmount < 0)) {
    return res.status(400).json({ error: 'Amount must be a valid positive number' });
  }

  try {
    await pool.query(
      `INSERT INTO giving_records (full_name, email, phone, giving_type, payment_method, amount, reference)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [fullName || '', email || '', phone || '', givingType, paymentMethod, parsedAmount, reference || '']
    );
    res.json({ success: true, message: 'Thank you! We\'ve recorded your gift and will follow up if needed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record your gift' });
  }
});

// Admin: view all giving records, newest first 
app.get('/api/giving', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM giving_records ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load giving records' });
  }
});

//Admin: mark a giving record as confirmed/received
app.patch('/api/giving/:id/confirm', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE giving_records SET is_confirmed = true WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

//Admin: delete a giving record
app.delete('/api/giving/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM giving_records WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});
// M-PESA C2B ("Pay Bill directly" — Safaricom notifies us automatically

app.post('/api/giving/c2b/validation', async (req, res) => {
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// Safaricom calls this AFTER a payment to your Paybill completes.
app.post('/api/giving/c2b/confirmation', async (req, res) => {
  try {
    const {
      TransID,
      TransAmount,
      MSISDN,
      BillRefNumber,
      FirstName,
      MiddleName,
      LastName,
    } = req.body || {};

    const donorName =
      (BillRefNumber && BillRefNumber.trim()) ||
      [FirstName, MiddleName, LastName].filter(Boolean).join(' ') ||
      'Anonymous (Paybill)';

    await pool.query(
      `INSERT INTO giving_records
         (full_name, phone, giving_type, payment_method, amount, status, is_confirmed, mpesa_receipt)
       VALUES ($1, $2, 'Giving', 'M-Pesa Paybill (Auto)', $3, 'success', true, $4)
       ON CONFLICT DO NOTHING`,
      [donorName, MSISDN || '', TransAmount, TransID]
    );

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error(err);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// M-PESA STK PUSH 
const {
  MPESA_ENV = 'sandbox',
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_STK_CALLBACK_URL,
} = process.env;

const MPESA_BASE_URL =
  MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

function mpesaTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

async function getMpesaAccessToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const { data } = await axios.get(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return data.access_token;
}

//Public: kick off an STK push to the donor's phone
app.post('/api/mpesa/stkpush', async (req, res) => {
  try {
    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_SHORTCODE || !MPESA_PASSKEY) {
      return res.status(500).json({
        error: 'M-Pesa STK push is not configured yet. Set the MPESA_* environment variables.',
      });
    }

    const { phone, amount, accountReference, description } = req.body;

    if (!/^254(7|1)\d{8}$/.test(phone || '')) {
      return res.status(400).json({ error: 'Invalid phone number format.' });
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount.' });
    }

    const token = await getMpesaAccessToken();
    const timestamp = mpesaTimestamp();
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const { data } = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(numericAmount),
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: MPESA_STK_CALLBACK_URL,
        AccountReference: (accountReference || 'Giving').slice(0, 12),
        TransactionDesc: (description || 'Giving').slice(0, 13),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.ResponseCode !== '0') {
      return res.status(502).json({ error: data.ResponseDescription || 'STK push was rejected.' });
    }

    await pool.query(
      `INSERT INTO mpesa_stk_transactions (checkout_request_id, status, amount, phone)
       VALUES ($1, 'pending', $2, $3)
       ON CONFLICT (checkout_request_id) DO NOTHING`,
      [data.CheckoutRequestID, numericAmount, phone]
    );

    res.json({ checkoutRequestId: data.CheckoutRequestID });
  } catch (err) {
    console.error('STK push error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Could not reach M-Pesa. Please try again.' });
  }
});

//Safaricom callbacks
app.post('/api/mpesa/callback', async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.sendStatus(400);

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

    if (ResultCode === 0) {
      const items = CallbackMetadata?.Item || [];
      const get = (name) => items.find((i) => i.Name === name)?.Value;
      const mpesaReceipt = get('MpesaReceiptNumber');
      const paidAmount = get('Amount');
      const payerPhone = get('PhoneNumber');

      await pool.query(
        `UPDATE mpesa_stk_transactions
         SET status = 'success', mpesa_receipt = $2, amount = $3, phone = $4, completed_at = now()
         WHERE checkout_request_id = $1`,
        [CheckoutRequestID, mpesaReceipt, paidAmount, payerPhone]
      );

      // Also create a confirmed giving record, same as the C2B flow does.
      await pool.query(
        `INSERT INTO giving_records
           (full_name, phone, giving_type, payment_method, amount, status, is_confirmed, mpesa_receipt)
         VALUES ('', $1, 'Giving', 'M-Pesa STK Push', $2, 'success', true, $3)
         ON CONFLICT DO NOTHING`,
        [payerPhone, paidAmount, mpesaReceipt]
      );
    } else {
      const status = ResultCode === 1032 ? 'cancelled' : 'failed';
      await pool.query(
        `UPDATE mpesa_stk_transactions
         SET status = $2, message = $3
         WHERE checkout_request_id = $1`,
        [CheckoutRequestID, status, ResultDesc]
      );
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('STK callback error:', err);
    res.sendStatus(500);
  }
});

// --- Public: polled by Give.jsx while waiting for the customer to pay ---
app.get('/api/mpesa/stkpush/status/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT status, message FROM mpesa_stk_transactions WHERE checkout_request_id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.json({ status: 'pending' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

//Public: register for an event
app.post('/api/events/register', async (req, res) => {
  const { eventId, eventTitle, fullName, nationality, phone } = req.body;

  if (!eventTitle || !fullName?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Full name, phone number, and event are required' });
  }

  try {
    await pool.query(
      `INSERT INTO event_registrations (event_id, event_title, full_name, nationality, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      [eventId || eventTitle, eventTitle, fullName.trim(), nationality || '', phone.trim()]
    );
    res.json({ success: true, message: "You're registered! We look forward to seeing you there." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register for this event' });
  }
});

// Admin: view all registrations, newest first
app.get('/api/events/registrations', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM event_registrations ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load event registrations' });
  }
});

// Admin: delete a registration
app.delete('/api/events/registrations/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM event_registrations WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

//Turn multer/upload errors into a normal JSON error response instead of
// an HTML stack trace (fileFilter rejections and "file too large" both
// come through here).
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large (50MB max).' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));