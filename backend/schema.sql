-- ============================================================================
-- SQL Schema & Sample Data for Cloud MySQL Database
-- Course: Internet Programming (React Native + Cloud DB + Auth + Search + Delete)
-- Database: ip_std6730251417
-- ============================================================================

-- 1. Table: users (Authentication - Login, Sign Up, and Guest Login)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'user',
  `is_guest` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Demo Users (Admin, Standard User, and Guest)
INSERT INTO `users` (`username`, `password`, `name`, `role`, `is_guest`)
VALUES
('kanwit', '123456', 'Kanwit Voottikulsin', 'admin', FALSE),
('user1', '123456', 'Demo User', 'user', FALSE),
('guest', 'guest', 'Guest Visitor', 'guest', TRUE)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `role`=VALUES(`role`);

-- 2. Table: products (Inventory & Catalog - Add, Edit, Delete, Search)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `stock_text` VARCHAR(100),
  `category` VARCHAR(100),
  `location_count` INT DEFAULT 1,
  `location_text` VARCHAR(255),
  `badge_status` VARCHAR(50) DEFAULT 'In Stock',
  `rating` DECIMAL(3, 1) DEFAULT 5.0,
  `image_url` TEXT,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert 3 Gaming Gear Products
INSERT INTO `products` (`id`, `name`, `price`, `stock`, `stock_text`, `category`, `location_count`, `location_text`, `badge_status`, `rating`, `image_url`, `description`)
VALUES
(1, 'HyperX Cloud Alpha Wireless Gaming Headset', 4590.00, 25, '25 in stock', 'Gaming Headset', 2, 'Bangkok Store', 'In Stock', 4.9, 'https://row.hyperx.com/cdn/shop/files/hyperx_cloud_alpha_2_wireless_aj5c7aa_angle_4.jpg?v=1783627902', 'หูฟังเกมมิ่งไร้สาย ไดรเวอร์ Dual Chamber แบตเตอรี่ใช้งานได้ยาวนานถึง 300 ชั่วโมง พร้อมระบบเสียง DTS Spatial Audio'),
(2, 'MEZZON Wireless RGB Mechanical Keyboard', 1890.00, 14, '14 in stock', 'Gaming Keyboard', 1, 'Main Warehouse', 'In Stock', 4.8, 'https://media.sbdesignsquare.com/media/catalog/product/3/9/39023754-1.jpg', 'คีย์บอร์ดเกมมิ่งไร้สาย Mechanical Full-size ไฟ RGB ปรับแต่งได้ 18 โหมด พร้อมปุ่ม Multi-function Knob'),
(3, 'Logitech G PRO X SUPERLIGHT Wireless Gaming Mouse', 4290.00, 3, '3 in stock', 'Gaming Mouse', 1, 'Bangkok Store', 'Low in stock', 4.9, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlBLsKuJ2lV6B1njgvLjTtkfApV4rfZusJbGmHKuebsw&s=10', 'เมาส์เกมมิ่งไร้สายน้ำหนักเบาพิเศษ เซนเซอร์ HERO 25K ความแม่นยำสูงระดับโปรอีสปอร์ต')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `stock`=VALUES(`stock`), `price`=VALUES(`price`);