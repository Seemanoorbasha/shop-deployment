
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
const app = express();

const PORT = process.env.PORT || 3000;

// Connect to db4free MySQL
const db = mysql.createConnection({
  host: 'db4free.net',
  user: 'seemauser1',
  password: 'Seema@1234',
  database: 'shop2025',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection FAILED:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL database.');
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/create-products-table', (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      price FLOAT,
      image TEXT,
      quantity VARCHAR(50),
      category VARCHAR(100)
    );
  `;
  db.query(sql, (err) => {
    if (err) {
      console.error('❌ Table creation failed:', err.message);
      return res.status(500).json({ error: 'Table creation failed', details: err.message });
    }
    res.send('✅ products table created successfully.');
  });
});

app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

app.post('/products', (req, res) => {
  const { name, price, image, quantity, category } = req.body;
  const id = uuidv4();
  db.query(
    'INSERT INTO products (id, name, price, image, quantity, category) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, price, image, quantity, category],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(201).json({ id, name, price, image, quantity, category });
    }
  );
});

app.put('/products/:id', (req, res) => {
  const { name, price, image, quantity, category } = req.body;
  const { id } = req.params;
  db.query(
    'UPDATE products SET name = ?, price = ?, image = ?, quantity = ?, category = ? WHERE id = ?',
    [name, price, image, quantity, category, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
      res.json({ id, name, price, image, quantity, category });
    }
  );
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.status(204).send();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
