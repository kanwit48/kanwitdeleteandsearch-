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

// 4. Create / Add New Product (Slide 4, 5)
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      price = 0,
      stock = 0,
      stock_text,
      category = "Gaming Gear",
      location = "Bangkok Store",
      location_text,
      location_count = 1,
      image,
      image_url,
      status = "In Stock",
      badge_status,
      rating = 5.0,
      description = "",
      brand,
      sizes,
      productCode,
      orderName,
    } = req.body || {};

    if (!name || String(name).trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }

    const finalStockText = stock_text || `${stock} in stock`;
    const finalLocationText = location_text || location || "Bangkok Store";
    const finalBadgeStatus = badge_status || status || "In Stock";
    const finalImageUrl = image_url || image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500";

    const [rs] = await pool.query(
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
        description,
      ]
    );

    console.log(`✅ Created Product ID: ${rs.insertId} - ${name}`);
    return res.status(201).json({
      success: true,
      productId: rs.insertId,
      message: "Product created successfully",
    });
  } catch (err) {
    console.error("❌ Error creating product:", err.message);
    res.status(500).json({ error: "Failed to create product", details: err.message });
  }
});

// 5. Update / Edit Product (Slide 8) - Supports both PUT and POST
async function handleUpdateProduct(req, res) {
  try {
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
      description,
    } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Check if product exists
    const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const current = existing[0];
    const newName = name !== undefined ? name : current.name;
    const newPrice = price !== undefined ? Number(price) : current.price;
    const newStock = stock !== undefined ? Number(stock) : current.stock;
    const newStockText = stock_text !== undefined ? stock_text : (stock !== undefined ? `${stock} in stock` : current.stock_text);
    const newCategory = category !== undefined ? category : current.category;
    const newLocationText = location_text !== undefined ? location_text : (location !== undefined ? location : current.location_text);
    const newLocationCount = location_count !== undefined ? Number(location_count) : current.location_count;
    const newBadgeStatus = badge_status !== undefined ? badge_status : (status !== undefined ? status : current.badge_status);
    const newRating = rating !== undefined ? Number(rating) : current.rating;
    const newImageUrl = image_url !== undefined ? image_url : (image !== undefined ? image : current.image_url);
    const newDescription = description !== undefined ? description : current.description;

    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, price = ?, stock = ?, stock_text = ?, category = ?, 
           location_count = ?, location_text = ?, badge_status = ?, rating = ?, 
           image_url = ?, description = ?
       WHERE id = ?`,
      [
        newName,
        newPrice,
        newStock,
        newStockText,
        newCategory,
        newLocationCount,
        newLocationText,
        newBadgeStatus,
        newRating,
        newImageUrl,
        newDescription,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found or not modified" });
    }

    console.log(`✅ Updated Product ID: ${id} - ${newName}`);
    return res.json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    console.error("❌ Error updating product:", err.message);
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
}

app.put("/api/products/:id", handleUpdateProduct);
app.post("/api/products/:id", handleUpdateProduct); // Fallback

// 6. Delete Product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    console.log(`✅ Deleted Product ID: ${id}`);
    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err.message);
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
});

// Start Server (Slide 15, 20)
app.listen(port, "0.0.0.0", () => {
  console.log(` API running on port ${port}`);
  console.log(` Endpoints:`);
  console.log(`   - GET    http://119.59.102.161:${port}/api`);
  console.log(`   - GET    http://119.59.102.161:${port}/api/products`);
  console.log(`   - POST   http://119.59.102.161:${port}/api/products`);
  console.log(`   - PUT    http://119.59.102.161:${port}/api/products/:id`);
  console.log(`   - DELETE http://119.59.102.161:${port}/api/products/:id`);
});