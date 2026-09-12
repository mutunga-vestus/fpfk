import 'dotenv/config';

const ENV = process.env.MPESA_ENV || 'sandbox'; // 'sandbox' | 'production'
const BASE_URL = ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE; // Paybill number
const VALIDATION_URL = process.env.MPESA_VALIDATION_URL; // must be a public HTTPS URL Safaricom can reach
const CONFIRMATION_URL = process.env.MPESA_CONFIRMATION_URL; // must be a public HTTPS URL Safaricom can reach

let cachedToken = null;
let cachedTokenExpiry = 0;

// --- Get (and cache) an OAuth access token from Safaricom ---
async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) {
    return cachedToken;
  }

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    throw new Error('Failed to authenticate with M-Pesa');
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Refresh a minute before actual expiry (Safaricom tokens last ~3600s)
  cachedTokenExpiry = Date.now() + (Number(data.expires_in || 3600) - 60) * 1000;
  return cachedToken;
}

// Normalizes Kenyan phone numbers to the 2547XXXXXXXX / 2541XXXXXXXX format Safaricom expects.
export function normalizePhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) return `254${digits}`;
  return null;
}

// One-time setup: tell Safaricom where to send C2B payment notifications
export async function registerC2BUrls() {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/mpesa/c2b/v1/registerurl`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ShortCode: SHORTCODE,
      ResponseType: 'Completed', // what Safaricom assumes if our ValidationURL is unreachable
      ConfirmationURL: CONFIRMATION_URL,
      ValidationURL: VALIDATION_URL,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.errorMessage || data.ResponseDescription || 'Failed to register C2B URLs');
  }
  return data;
}

export async function simulateC2B({ phone, amount, billRefNumber }) {
  if (ENV === 'production') {
    throw new Error('simulateC2B is only available in sandbox');
  }
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/mpesa/c2b/v2/simulate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ShortCode: SHORTCODE,
      CommandID: 'CustomerPayBillOnline',
      Amount: Math.round(Number(amount)),
      Msisdn: phone,
      BillRefNumber: (billRefNumber || 'Giving').slice(0, 20),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.errorMessage || data.ResponseDescription || 'Failed to simulate C2B payment');
  }
  return data;
}