import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('Connecting to Neon PostgreSQL...');
  await testConnection();

  const client = await pool.connect();
  try {
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../database/seed.sql');

    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema to Neon DB...');
    await client.query(schemaSql);
    console.log('✅ Schema applied successfully.');

    console.log('Reading seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Applying seed data...');
    await client.query(seedSql);
    console.log('✅ Seed data applied successfully.');

    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('Active tables in Neon database:');
    res.rows.forEach(r => console.log('  - ' + r.table_name));

    const userRes = await client.query('SELECT id, full_name, email, role FROM users');
    console.log('Users created:');
    console.table(userRes.rows);

    const restRes = await client.query('SELECT id, name, currency, currency_symbol FROM restaurants');
    console.log('Restaurants:');
    console.table(restRes.rows);

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
