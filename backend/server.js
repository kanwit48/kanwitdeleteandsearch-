/**
 * ============================================================================
 * Cloud Database Backend (Express + MySQL)
 * ============================================================================
 * Course: Internet Programming - React Native + Cloud DB
 * Server Host: 119.59.102.161
 * ============================================================================
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const port = process.env.PORT || 3012;

// --- Middlewares ---
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// --- MySQL Connection Pool ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
});

// Test Database Connection
(async function testMySQL() {
  try {
    const conn = await pool.getConnection();
    console.log(" Connected to MySQL Database:", process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error(" MySQL Connection Failed:", err.message);
  }
})();

// ============================================================================
// API ENDPOINTS
// ============================================================================

// 1. Root / Health Check (Slide 21)
app.get("/api", (req, res) => {
  res.json({
    status: "success",
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// 2. Get All Products (Slide 15, 24)
app.get("/api/products", async (req, res) => {
  try {
    // Check if table 'products' or 'inventory' exists
    let rows;
    try {
      [rows] = await pool.query("SELECT * FROM products ORDER BY id ASC");
    } catch (e) {
      [rows] = await pool.query("SELECT * FROM inventory ORDER BY id ASC");
    }

    res.json(rows);
  } catch (err) {
    console.error(" Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
});

// 3. Get Single Product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Start Server (Slide 15, 20)
app.listen(port, "0.0.0.0", () => {
  console.log(` API running on port ${port}`);
  console.log(` Endpoints:`);
  console.log(`   - http://119.59.102.161:${port}/api`);
  console.log(`   - http://119.59.102.161:${port}/api/products`);
});