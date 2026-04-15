require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const authRoutes = require('./auth');
const verifyToken = require('./middleware');
const { initDB, saveDB, getDB } = require('./database');


const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// CONFIG
// =====================
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

// Email config — replace with your Gmail and app password
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Store OTPs temporarily in memory
const otpStore = {};

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to A&M Infinity Bites Backend!');
});

// =====================
// PRODUCTS
// =====================
app.get('/products', (req, res) => {
  const db = getDB();
  const result = db.exec('SELECT * FROM products');
  const products = result[0] ? result[0].values.map(row => ({
    id: row[0], name: row[1], price: row[2], description: row[3], image: row[4], category: row[5]
  })) : [];
  res.json(products);
});

// GET all addons
app.get('/api/addons', (req, res) => {
  try {
    const db = getDB();
    const result = db.exec(`SELECT * FROM addons ORDER BY name ASC`);
    if (!result.length) return res.json([]);

    const cols = result[0].columns;
    const addons = result[0].values.map(row => {
      const obj = {};
      cols.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });

    res.json(addons);
  } catch (err) {
    console.error('Error fetching addons:', err);
    res.status(500).json({ error: 'Failed to fetch addons' });
  }
});

app.get('/products/:id', (req, res) => {
  const db = getDB();
  const result = db.exec(`SELECT * FROM products WHERE id = ${req.params.id}`);
  const product = result[0] ? {
    id: result[0].values[0][0],
    name: result[0].values[0][1],
    price: result[0].values[0][2],
    description: result[0].values[0][3],
    image: result[0].values[0][4]
  } : null;
  res.json(product);
});

app.post('/products', verifyToken, (req, res) => {
  const db = getDB();
  const { name, price, description, image, category } = req.body;
  db.run('INSERT INTO products (name, price, description, image, category) VALUES (?,?,?,?,?)',
    [name, price, description, image, category]);
  saveDB();
  res.json({ message: 'Product added!' });
});

app.put('/products/:id', verifyToken, (req, res) => {
  const db = getDB();
  const { name, price, description, image, category } = req.body;
  db.run('UPDATE products SET name=?, price=?, description=?, image=?, category=? WHERE id=?',
    [name, price, description, image, category, req.params.id]);
  saveDB();
  res.json({ message: 'Product updated!' });
});

app.put('/orders/reference/:reference', async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;
    db.run('UPDATE orders SET status=? WHERE reference=?',
      [status, req.params.reference]);
    saveDB();
    res.json({ message: 'Order status updated!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.delete('/products/:id', verifyToken, (req, res) => {
  const db = getDB();
  db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
  saveDB();
  res.json({ message: 'Product deleted!' });
});

// =====================
// ORDERS
// =====================
app.post('/orders', async (req, res) => {
  try {
    const db = getDB();
    const { email, name, phone, address, items, amount, payment_method, reference, status } = req.body;
    db.run(
      `INSERT INTO orders (email, name, phone, address, items, amount, payment_method, reference, status, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [email, name, phone, address, JSON.stringify(items), amount, payment_method, reference || '', status, new Date().toISOString()]
    );
    saveDB();
    res.json({ message: 'Order saved!' });
  } catch (err) {
    console.error('Order save error:', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

app.get('/orders', verifyToken, (req, res) => {
  try {
    const db = getDB();
    const result = db.exec('SELECT * FROM orders ORDER BY id DESC');
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
      created_at: row[10],
      archived: row[11]
    })) : [];
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Update order status
app.put('/orders/:id/status', verifyToken, (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;
    db.run('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
    saveDB();
    res.json({ message: 'Order status updated!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Archive / Restore order
app.put('/orders/:id/archive', verifyToken, (req, res) => {
  try {
    const db = getDB();
    const { archived } = req.body;
    db.run('UPDATE orders SET archived=? WHERE id=?', [archived ? 1 : 0, req.params.id]);
    saveDB();
    res.json({ message: 'Order archive status updated!' });
  } catch (err) {
    console.error('Archive order error:', err);
    res.status(500).json({ error: 'Failed to archive order' });
  }
});

// Delete order permanently
app.delete('/orders/:id', verifyToken, (req, res) => {
  try {
    const db = getDB();
    db.run('DELETE FROM orders WHERE id=?', [req.params.id]);
    saveDB();
    res.json({ message: 'Order deleted!' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// =====================
// OTP - EMAIL VERIFICATION
// =====================

// Generate and send OTP
app.post('/auth/send-otp', async (req, res) => {
  const { email, name } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 10 minute expiry
  otpStore[email] = {
    otp,
    expires: Date.now() + 10 * 60 * 1000
  };

  try {
    await transporter.sendMail({
      from: `"A&M Infinity Bites" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your A&M Infinity Bites Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fffdf7; border-radius: 12px;">
          <h2 style="color: #ff6b2b; font-size: 1.5rem; margin-bottom: 8px;">A&M Infinity Bites</h2>
          <p style="color: #444; margin-bottom: 24px;">Hi ${name || 'there'}, welcome! Please verify your email address.</p>
          <div style="background: #ff6b2b; color: #fff; font-size: 2.5rem; font-weight: bold; text-align: center; padding: 24px; border-radius: 10px; letter-spacing: 8px;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 0.85rem; margin-top: 20px;">This code expires in 10 minutes. Do not share it with anyone.</p>
          <p style="color: #999; font-size: 0.85rem;">If you did not create an account, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'OTP sent successfully!' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Check email config.' });
  }
});

// Verify OTP
app.post('/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
  }

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  }

  // OTP is valid
  delete otpStore[email];
  res.json({ message: 'Email verified successfully!' });
});

// =====================
// PAYSTACK PAYMENT
// =====================


app.post('/payment/initialize', async (req, res) => {
  try {
    const { email, amount } = req.body;

    

    

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100),
        currency: 'NGN',
        callback_url: process.env.CALLBACK_URL
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Paystack error:", error.response?.data || error.message);
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
      const db = getDB();
      db.run(
        'UPDATE orders SET status=? WHERE reference=?',
        ['paid', reference]
      );
      saveDB();
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
  const db = getDB();

  db.run(`CREATE TABLE IF NOT EXISTS orders (
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
  )`);

  saveDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

