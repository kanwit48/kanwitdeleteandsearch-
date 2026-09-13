/**
 * Cloud Database Backend (Express + MySQL)
 * Features: Auth (Sign In, Sign Up), CRUD (Add, Edit, Delete), Live Search & Filter
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3103;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'std6730251417',
  password: process.env.DB_PASSWORD || 't7!s9Wqz',
  database: process.env.DB_NAME || 'ip_std6730251417',
};

let dbPool = null;

async function initDB() {
  try {
    dbPool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+07:00'
    });
    const conn = await dbPool.getConnection();
    console.log(' Connected to MySQL DB: ip_std6730251417');
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        stock_text VARCHAR(100),
        category VARCHAR(100),
        location_count INT DEFAULT 1,
        location_text VARCHAR(255),
        badge_status VARCHAR(50) DEFAULT 'In Stock',
        rating DECIMAL(3, 1) DEFAULT 5.0,
        image_url TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    conn.release();
    console.log(' Tables users and products verified.');
  } catch (err) {
    console.error(' MySQL Connection Warning:', err.message);
  }
}

// 1. Root / Health check
app.get('/api', (req, res) => {
  res.json({ status: 'success', message: 'ShopApp Backend Running', port: PORT });
});

// 2. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, role = 'user' } = req.body || {};
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password and name are required' });
    }
    if (!dbPool) return res.status(500).json({ error: 'Database not connected' });

    const [existing] = await dbPool.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const [rs] = await dbPool.query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username.trim(), password, name.trim(), role]
    );

    console.log(` Registered User: ${username} (ID: ${rs.insertId})`);
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: String(rs.insertId),
        username: username.trim(),
        name: name.trim(),
        role,
      },
      token: `token_${rs.insertId}_${Date.now()}`
    });
  } catch (err) {
    console.error(' Register error:', err.message);
    res.status(500).json({ error: 'Failed to register', details: err.message });
  }
});

// 3. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (!dbPool) return res.status(500).json({ error: 'Database not connected' });

    const [rows] = await dbPool.query(
      'SELECT id, username, name, role FROM users WHERE username = ? AND password = ?',
      [username.trim(), password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    console.log(` Logged in: ${user.username} (${user.name})`);
    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: String(user.id),
        username: user.username,
        name: user.name,
        role: user.role,
      },
      token: `token_${user.id}_${Date.now()}`
    });
  } catch (err) {
    console.error(' Login error:', err.message);
    res.status(500).json({ error: 'Failed to login', details: err.message });
  }
});

// 4. Products: Get all with search and category filtering
app.get('/api/products', async (req, res) => {
  try {
    if (!dbPool) return res.status(500).json({ error: 'DB not connected' });
    const { search, q, category } = req.query;
    const filterText = (search || q || '').trim();

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filterText) {
      sql += ' AND (name LIKE ? OR category LIKE ? OR location_text LIKE ? OR description LIKE ?)';
      const wild = `%${filterText}%`;
      params.push(wild, wild, wild, wild);
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY id ASC';

    const [rows] = await dbPool.query(sql, params);
    const formatted = rows.map(r => ({
      id: String(r.id),
      name: r.name,
      price: Number(r.price),
      stock: Number(r.stock),
      stock_text: r.stock_text || `${r.stock} in stock`,
      category: r.category,
      location_count: Number(r.location_count || 1),
      location_text: r.location_text || 'Bangkok Store',
      badge_status: r.badge_status || 'In Stock',
      rating: Number(r.rating || 5.0),
      image_url: r.image_url,
      description: r.description
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Products: Get by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    if (!dbPool) return res.status(500).json({ error: 'DB not connected' });
    const [rows] = await dbPool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Products: Create
app.post('/api/products', async (req, res) => {
  try {
    if (!dbPool) return res.status(500).json({ error: 'DB not connected' });
    const {
      name,
      price = 0,
      stock = 0,
      stock_text,
      category = 'Gaming Gear',
      location = 'Bangkok Store',
      location_text,
      location_count = 1,
      image,
      image_url,
      status = 'In Stock',
      badge_status,
      rating = 5.0,
      description = ''
    } = req.body || {};

    if (!name || String(name).trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const finalStockText = stock_text || `${stock} in stock`;
    const finalLocationText = location_text || location || 'Bangkok Store';
    const finalBadgeStatus = badge_status || status || 'In Stock';
    const finalImageUrl = image_url || image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';

    const [rs] = await dbPool.query(
      `INSERT INTO products 
        (name, price, stock, stock_text, category, location_count, location_text, badge_status, rating, image_url, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        Number(price) || 0,
        Number(stock) || 0,
        finalStockText,
        category,
        Number(location_count) || 1,
        finalLocationText,
        finalBadgeStatus,
        Number(rating) || 5.0,
        finalImageUrl,
        description
      ]
    );

    console.log(` Created Product ID: ${rs.insertId} - ${name}`);
    res.status(201).json({
      success: true,
      productId: rs.insertId,
      message: 'Product created successfully'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// 7. Products: Update (PUT & POST)
async function handleUpdate(req, res) {
  try {
    if (!dbPool) return res.status(500).json({ error: 'DB not connected' });
    const { id } = req.params;
    const {
      name,
      price,
      stock,
      stock_text,
      category,
      location,
      location_text,
      location_count,
      image,
      image_url,
      status,
      badge_status,
      rating,
      description
    } = req.body || {};

    const [existing] = await dbPool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found' });

    const curr = existing[0];
    const newName = name !== undefined ? name : curr.name;
    const newPrice = price !== undefined ? Number(price) : curr.price;
    const newStock = stock !== undefined ? Number(stock) : curr.stock;
    const newStockText = stock_text !== undefined ? stock_text : (stock !== undefined ? `${stock} in stock` : curr.stock_text);
    const newCategory = category !== undefined ? category : curr.category;
    const newLoc = location_text !== undefined ? location_text : (location !== undefined ? location : curr.location_text);
    const newLocCount = location_count !== undefined ? Number(location_count) : curr.location_count;
    const newBadge = badge_status !== undefined ? badge_status : (status !== undefined ? status : curr.badge_status);
    const newRating = rating !== undefined ? Number(rating) : curr.rating;
    const newImg = image_url !== undefined ? image_url : (image !== undefined ? image : curr.image_url);
    const newDesc = description !== undefined ? description : curr.description;

    await dbPool.query(
      `UPDATE products 
       SET name = ?, price = ?, stock = ?, stock_text = ?, category = ?, 
           location_count = ?, location_text = ?, badge_status = ?, rating = ?, 
           image_url = ?, description = ?
       WHERE id = ?`,
      [newName, newPrice, newStock, newStockText, newCategory, newLocCount, newLoc, newBadge, newRating, newImg, newDesc, id]
    );

    console.log(` Updated Product ID: ${id} - ${newName}`);
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
}

app.put('/api/products/:id', handleUpdate);
app.post('/api/products/:id', handleUpdate);

// 8. Products: Delete
app.delete('/api/products/:id', async (req, res) => {
  try {
    if (!dbPool) return res.status(500).json({ error: 'DB not connected' });
    const { id } = req.params;
    await dbPool.query('DELETE FROM products WHERE id = ?', [id]);
    console.log(` Deleted Product ID: ${id}`);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log('========================================');
  console.log(` Backend Running with Auth, CRUD, Search!`);
  console.log(` Listening on port: ${PORT}`);
  console.log('========================================');
  await initDB();
});
