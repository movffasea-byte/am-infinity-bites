const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        category TEXT,
        archived INTEGER DEFAULT 0
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        email TEXT,
        name TEXT,
        phone TEXT,
        address TEXT,
        items TEXT,
        amount REAL,
        payment_method TEXT,
        reference TEXT,
        status TEXT,
        created_at TEXT,
        archived INTEGER DEFAULT 0
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        created_at TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS addons (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL
      )
    `);

    // Seed addons if empty
    const { rows } = await client.query('SELECT COUNT(*) as count FROM addons');
    if (parseInt(rows[0].count) === 0) {
      const defaultAddons = [
        ['Strawberry', 500], ['Banana', 300], ['Mango', 400],
        ['Pineapple', 350], ['Watermelon', 300], ['Blueberry', 700],
        ['Kiwi', 600], ['Grapes', 500], ['Pawpaw (Papaya)', 250], ['Apple Slices', 400]
      ];
      for (const [name, price] of defaultAddons) {
        await client.query('INSERT INTO addons (name, price) VALUES ($1, $2)', [name, price]);
      }
    }

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

function getPool() {
  return pool;
}

module.exports = { initDB, getPool };