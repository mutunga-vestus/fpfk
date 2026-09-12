import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'data', 'content.json');

async function migrate() {
  console.log('Connecting to Postgres...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS content (
      page TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ content table ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_verified BOOLEAN NOT NULL DEFAULT false,
      verification_token TEXT,
      verification_expires TIMESTAMPTZ,
      reset_token TEXT,
      reset_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ admin_users table ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      nationality TEXT,
      reason TEXT,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Backfill columns for existing databases created before these fields were added.
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS phone TEXT;`);
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS nationality TEXT;`);
  await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS reason TEXT;`);
  console.log('✓ messages table ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS giving_records (
      id SERIAL PRIMARY KEY,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      giving_type TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      amount NUMERIC,
      reference TEXT,
      is_confirmed BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'manual',
      checkout_request_id TEXT,
      merchant_request_id TEXT,
      mpesa_receipt TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ giving_records table ready');

  // Safe to re-run: adds the STK Push tracking columns if giving_records
  // already existed from before M-Pesa integration was added.
  await pool.query(`ALTER TABLE giving_records ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'manual';`);
  await pool.query(`ALTER TABLE giving_records ADD COLUMN IF NOT EXISTS checkout_request_id TEXT;`);
  await pool.query(`ALTER TABLE giving_records ADD COLUMN IF NOT EXISTS merchant_request_id TEXT;`);
  await pool.query(`ALTER TABLE giving_records ADD COLUMN IF NOT EXISTS mpesa_receipt TEXT;`);
  console.log('✓ giving_records columns up to date');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_id TEXT NOT NULL,
      event_title TEXT NOT NULL,
      full_name TEXT NOT NULL,
      nationality TEXT,
      phone TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ event_registrations table ready');

  const { rows } = await pool.query('SELECT count(*) FROM content');
  const existingCount = parseInt(rows[0].count, 10);

  if (existingCount > 0) {
    console.log(`content table already has ${existingCount} row(s) — skipping seed.`);
    console.log('(Delete rows manually or drop the table first if you want to reseed.)');
  } else {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const content = JSON.parse(raw);

    for (const [page, data] of Object.entries(content)) {
      await pool.query(
        `INSERT INTO content (page, data) VALUES ($1, $2)
         ON CONFLICT (page) DO NOTHING`,
        [page, data]
      );
      console.log(`✓ seeded "${page}"`);
    }
  }

  await pool.end();
  console.log('Done.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
