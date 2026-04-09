const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const SECRET_KEY = 'fruitwebsite_secret_123';

// SIGNUP
router.post('/signup', async (req, res) => {
  const users = JSON.parse(fs.readFileSync('./users.json'));
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered!' });
  }

  // Encrypt password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword
  };

  users.push(newUser);
  fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));

  res.json({ message: 'Account created successfully!' });
});

// LOGIN
router.post('/login', async (req, res) => {
  const users = JSON.parse(fs.readFileSync('./users.json'));
  const { email, password } = req.body;

  // Find user
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password!' });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password!' });
  }

  // Create token
  const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, { expiresIn: '7d' });

  res.json({ message: 'Login successful!', token, name: user.name });
});

module.exports = router;