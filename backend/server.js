const express = require('express');
const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Fruit Website Backend is active!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});