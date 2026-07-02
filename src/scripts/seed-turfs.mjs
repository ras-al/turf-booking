// scripts/seed-turfs.mjs
//
// Seeds the `turfs` table from a CSV file.
//
// Setup:
//   npm install @supabase/supabase-js csv-parse
//
// Env vars needed (put in a local .env.seed file, do NOT commit it):
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=xxxx        <- Project Settings > API > service_role (secret, bypasses RLS)
//   SEED_OWNER_ID=xxxx-xxxx-xxxx          <- a real profiles.id (see instructions below)
//
// Run:
//   node --env-file=.env.seed scripts/seed-turfs.mjs turfs_seed.csv

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OWNER_ID = process.env.SEED_OWNER_ID;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !OWNER_ID) {
  console.error(
    'Missing env vars. Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_OWNER_ID.'
  );
  process.exit(1);
}

const csvPath = process.argv[2] ?? 'turfs_seed.csv';
const csvRaw = fs.readFileSync(path.resolve(csvPath), 'utf-8');

const rows = parse(csvRaw, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

const splitList = (value) =>
  value
    ? value.split('|').map((s) => s.trim()).filter(Boolean)
    : [];

const turfs = rows.map((row) => ({
  owner_id: OWNER_ID,
  name: row.name,
  description: row.description || null,
  address: row.address,
  city: row.city,
  latitude: row.latitude ? Number(row.latitude) : null,
  longitude: row.longitude ? Number(row.longitude) : null,
  photos: splitList(row.photos),
  amenities: splitList(row.amenities),
  sports: splitList(row.sports),
  size: row.size || null,
  price_per_hour: Math.round(Number(row.price_per_hour_rupees) * 100), // rupees -> paise
  is_active: true,
  is_approved: true,
  avg_rating: row.avg_rating ? Number(row.avg_rating) : 0,
  total_reviews: row.total_reviews ? Number(row.total_reviews) : 0,
}));

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const { data, error } = await supabase.from('turfs').insert(turfs).select('id, name');

if (error) {
  console.error('Insert failed:', error);
  process.exit(1);
}

console.log(`Inserted ${data.length} turfs:`);
data.forEach((t) => console.log(` - ${t.name} (${t.id})`));
