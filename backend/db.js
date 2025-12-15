const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No DATABASE_URL found in environment');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Ensure tasks table exists
const ensureTable = async () => {
  const createQuery = `CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false
  )`;
  try {
    await pool.query(createQuery);
    // Ensure soft-delete column exists
    await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false");
  } catch (err) {
    console.error('Error creando tabla tasks', err);
  }
};

ensureTable();

module.exports = pool;

