require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const authRoutes = require('./auth');
const verifyToken = require('./middleware');
const { initDB, getPool } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

const otpStore = {};

// =====================
// CORS — allow GitHub Pages frontend
// =====================
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to A&M Infinity Bites Backend!');
});

// =====================
// PRODUCTS
// =====================
app.get('/products', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM products WHERE archived = 0 ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/addons', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM addons ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching addons:', err);
    res.status(500).json({ error: 'Failed to fetch addons' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/products', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const { name, price, description, image, category } = req.body;
    await pool.query(
      'INSERT INTO products (name, price, description, image, category) VALUES ($1, $2, $3, $4, $5)',
      [name, price, description, image, category]
    );
    res.json({ message: 'Product added!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/products/:id', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const { name, price, description, image, category } = req.body;
    await pool.query(
      'UPDATE products SET name=$1, price=$2, description=$3, image=$4, category=$5 WHERE id=$6',
      [name, price, description, image, category, req.params.id]
    );
    res.json({ message: 'Product updated!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/products/:id', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// =====================
// ORDERS
// =====================
app.post('/orders', async (req, res) => {
  try {
    const pool = getPool();
    const { email, name, phone, address, items, amount, payment_method, reference, status } = req.body;
    await pool.query(
      `INSERT INTO orders (email, name, phone, address, items, amount, payment_method, reference, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [email, name, phone, address, JSON.stringify(items), amount, payment_method, reference || '', status, new Date().toISOString()]
    );
    res.json({ message: 'Order saved!' });
  } catch (err) {
    console.error('Order save error:', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

app.get('/orders', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    const orders = result.rows.map(row => ({
      ...row,
      items: (() => { try { return JSON.parse(row.items); } catch { return []; } })()
    }));
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

app.put('/orders/:id/status', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const { status } = req.body;
    await pool.query('UPDATE orders SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ message: 'Order status updated!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.put('/orders/reference/:reference', async (req, res) => {
  try {
    const pool = getPool();
    const { status } = req.body;
    await pool.query('UPDATE orders SET status=$1 WHERE reference=$2', [status, req.params.reference]);
    res.json({ message: 'Order status updated!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.put('/orders/:id/archive', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const { archived } = req.body;
    await pool.query('UPDATE orders SET archived=$1 WHERE id=$2', [archived ? 1 : 0, req.params.id]);
    res.json({ message: 'Order archive status updated!' });
  } catch (err) {
    console.error('Archive order error:', err);
    res.status(500).json({ error: 'Failed to archive order' });
  }
});

app.delete('/orders/:id', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM orders WHERE id=$1', [req.params.id]);
    res.json({ message: 'Order deleted!' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// =====================
// OTP
// =====================
app.post('/auth/send-otp', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };

  try {
    await transporter.sendMail({
      from: `"A&M Infinity Bites" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your A&M Infinity Bites Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fffdf7; border-radius: 12px;">
          <h2 style="color: #ff6b2b;">A&M Infinity Bites</h2>
          <p style="color: #444;">Hi ${name || 'there'}, please verify your email address.</p>
          <div style="background: #ff6b2b; color: #fff; font-size: 2.5rem; font-weight: bold; text-align: center; padding: 24px; border-radius: 10px; letter-spacing: 8px;">${otp}</div>
          <p style="color: #999; font-size: 0.85rem; margin-top: 20px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `
    });
    res.json({ message: 'OTP sent successfully!' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Check email config.' });
  }
});

app.post('/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

  delete otpStore[email];
  res.json({ message: 'Email verified successfully!' });
});

// =====================
// PAYSTACK
// =====================
app.post('/payment/initialize', async (req, res) => {
  try {
    const { email, amount } = req.body;
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { email, amount: Math.round(amount * 100), currency: 'NGN', callback_url: process.env.CALLBACK_URL },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Paystack error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

app.get('/payment/verify/:reference', async (req, res) => {
  try {
    const reference = req.params.reference;
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );
    const data = response.data.data;
    if (data.status === 'success') {
      const pool = getPool();
      await pool.query('UPDATE orders SET status=$1 WHERE reference=$2', ['paid', reference]);
    }
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// =====================
// START SERVER
// =====================
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});