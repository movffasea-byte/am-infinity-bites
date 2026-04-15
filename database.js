const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'products.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT,
      category TEXT,
      archived INTEGER DEFAULT 0
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      created_at TEXT
    )
  `);

  // Addons table
db.run(`
  CREATE TABLE IF NOT EXISTS addons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL
  )
`);

// Seed default fruit addons if table is empty
const addonCount = db.exec(`SELECT COUNT(*) as count FROM addons`);
if (addonCount[0].values[0][0] === 0) {
  const defaultAddons = [
    ['Strawberry', 500],
    ['Banana', 300],
    ['Mango', 400],
    ['Pineapple', 350],
    ['Watermelon', 300],
    ['Blueberry', 700],
    ['Kiwi', 600],
    ['Grapes', 500],
    ['Pawpaw (Papaya)', 250],
    ['Apple Slices', 400],
  ];
  defaultAddons.forEach(([name, price]) => {
    db.run(`INSERT INTO addons (name, price) VALUES (?, ?)`, [name, price]);
  });
}

  // Add missing columns safely
  const alterColumns = [
    `ALTER TABLE products ADD COLUMN category TEXT`,
    `ALTER TABLE products ADD COLUMN archived INTEGER DEFAULT 0`,
    `ALTER TABLE orders ADD COLUMN name TEXT`,
    `ALTER TABLE orders ADD COLUMN phone TEXT`,
    `ALTER TABLE orders ADD COLUMN address TEXT`,
    `ALTER TABLE orders ADD COLUMN items TEXT`,
    `ALTER TABLE orders ADD COLUMN payment_method TEXT`,
    `ALTER TABLE orders ADD COLUMN created_at TEXT`,
    `ALTER TABLE orders ADD COLUMN archived INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN phone TEXT`,
    `ALTER TABLE users ADD COLUMN address TEXT`,
    `ALTER TABLE users ADD COLUMN created_at TEXT`
  ];

  alterColumns.forEach(sql => {
    try { db.run(sql); } catch (e) {}
  });

  saveDB();
  return db;
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDB() {
  return db;
}

module.exports = { initDB, saveDB, getDB };