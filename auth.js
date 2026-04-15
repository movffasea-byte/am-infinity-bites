const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB, saveDB } = require('./database');


const SECRET_KEY = process.env.JWT_SECRET ;

// =====================
// SIGNUP
// =====================
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const db = getDB();

    // Check if user already exists
    const existing = db.exec(`SELECT id FROM users WHERE email = '${email}'`);
    if (existing[0] && existing[0].values.length > 0) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, new Date().toISOString()]
    );
    saveDB();

    res.json({ message: 'Account created successfully!' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Failed to create account' });
  }
});

// =====================
// LOGIN
// =====================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required!' });
  }

  try {
    const db = getDB();
    const result = db.exec(`SELECT * FROM users WHERE email = '${email}'`);

    if (!result[0] || result[0].values.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    const row = result[0].values[0];
    const user = {
      id: row[0],
      name: row[1],
      email: row[2],
      password: row[3],
      phone: row[4],
      address: row[5]
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// =====================
// GET PROFILE
// =====================
router.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const db = getDB();
    const result = db.exec(`SELECT id, name, email, phone, address, created_at FROM users WHERE id = ${decoded.id}`);

    if (!result[0] || result[0].values.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const row = result[0].values[0];
    res.json({
      id: row[0],
      name: row[1],
      email: row[2],
      phone: row[3] || '',
      address: row[4] || '',
      created_at: row[5]
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// =====================
// UPDATE PROFILE
// =====================
router.put('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { name, phone, address } = req.body;
    const db = getDB();

    db.run(
      `UPDATE users SET name=?, phone=?, address=? WHERE id=?`,
      [name, phone, address, decoded.id]
    );
    saveDB();

    res.json({ message: 'Profile updated successfully!' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// =====================
// GET USER ORDERS
// =====================
router.get('/my-orders', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const db = getDB();

    const result = db.exec(
      `SELECT * FROM orders WHERE email = '${decoded.email}' ORDER BY id DESC`
    );

    const orders = result[0] ? result[0].values.map(row => ({
      id: row[0],
      email: row[1],
      name: row[2],
      phone: row[3],
      address: row[4],
      items: (() => { try { return JSON.parse(row[5]); } catch { return []; } })(),
      amount: row[6],
      payment_method: row[7],
      reference: row[8],
      status: row[9],
      created_at: row[10]
    })) : [];

    res.json(orders);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;