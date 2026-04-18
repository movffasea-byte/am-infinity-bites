const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('./database');

const SECRET_KEY = process.env.JWT_SECRET;

// =====================
// SIGNUP
// =====================
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required!' });

  try {
    const pool = getPool();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Email already registered!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, new Date().toISOString()]
    );

    // ── Notify admin of new registration ──
    try {
      const transporter = require('./server').transporter;
      await transporter.sendMail({
        from: `"A&M Infinity Bites" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: '🆕 New User Registered — A&M Infinity Bites',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fffdf7; border-radius: 12px;">
            <h2 style="color: #ff6b2b;">New User Registered!</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('Admin notification failed:', mailErr);
    }

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
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required!' });

  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Invalid email or password!' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password!' });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful!', token, name: user.name, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// =====================
// GET PROFILE
// =====================
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, name, email, phone, address, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// =====================
// UPDATE PROFILE
// =====================
router.put('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { name, phone, address } = req.body;
    const pool = getPool();
    await pool.query(
      'UPDATE users SET name=$1, phone=$2, address=$3 WHERE id=$4',
      [name, phone, address, decoded.id]
    );
    res.json({ message: 'Profile updated successfully!' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// =====================
// GET USER ORDERS
// =====================
router.get('/my-orders', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM orders WHERE email = $1 ORDER BY id DESC',
      [decoded.email]
    );

    const orders = result.rows.map(row => ({
      ...row,
      items: (() => { try { return JSON.parse(row.items); } catch { return []; } })()
    }));

    res.json(orders);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;