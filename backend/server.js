const express = require('express');
const cors = require('cors');
const axios = require('axios')
const authRoutes = require('./auth');
const verifyToken = require('./middleware');
const { initDB, saveDB, getDB } = require('./database');

const app = express();
const PORT = 3000;

//paystack config
const PAYSTACK_SECRET = "sk_test_fdbde1b9b4b592b43144e7dc9e060a1ba44a5d28"; // Replace with your actual Paystack secret key

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Fruit Website Backend!');
});

// GET all products
app.get('/products', (req, res) => {
  const db = getDB();
  const result = db.exec('SELECT * FROM products');
  const products = result[0] ? result[0].values.map(row => ({
    id: row[0], name: row[1], price: row[2], description: row[3], image: row[4], category: row[5]
  })) : [];
  res.json(products);
});

// GET single product
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

// POST new product
app.post('/products', verifyToken, (req, res) => {
  const db = getDB();
  const { name, price, description, image,  category } = req.body;
  db.run('INSERT INTO products (name, price, description, image, category) VALUES (?,?,?,?,?)',
    [name, price, description, image, category]);
  saveDB();
  res.json({ message: 'Product added!' });
});

// PUT update product
app.put('/products/:id', verifyToken, (req, res) => {
  const db = getDB();
  const { name, price, description, image } = req.body;
  db.run('UPDATE products SET name=?, price=?, description=?, image=? WHERE id=?',
    [name, price, description, image, req.params.id]);
  saveDB();
  res.json({ message: 'Product updated!' });
});

// DELETE product
app.delete('/products/:id', verifyToken, (req, res) => {
  const db = getDB();
  db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
  saveDB();
  res.json({ message: 'Product deleted!' });
});

// =================== PAYSTACK PAYMENT ===================

// Initialize Paystack Payment
app.post('/payment/initialize', async (req, res) => {
  try {
    const { email, amount } = req.body;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { email, amount: amount * 100, currency: 'NGN' },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }

  
});

// Verify Paystack Payment
app.get('/payment/verify/:reference', async (req, res) => {
  try {
    const reference = req.params.reference;

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });

    const data = response.data.data;

    if (data.status === 'success') {
      const db = getDB();
      db.run(
        'INSERT INTO orders (email, amount, reference, status) VALUES (?,?,?,?)',
        [data.customer.email, data.amount / 100, reference, data.status]
      );
      saveDB();
    }

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});




initDB().then(() => {
  const db = getDB();
  // Ensure orders table exists
  db.run(
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      amount REAL,
      reference TEXT,
      status TEXT
    )`
  );
  saveDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});