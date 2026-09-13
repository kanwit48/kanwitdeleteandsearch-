-- ============================================================================
-- SQL Schema & Sample Data for Cloud MySQL Database
-- Course: Internet Programming (React Native + Cloud DB)
-- phpMyAdmin URL: http://119.59.102.161/nindamdb
-- ============================================================================

-- 1. Create Table `products` / `inventory`
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `stock` INT DEFAULT 0,
  `category` VARCHAR(100) DEFAULT NULL,
  `location` VARCHAR(100) DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `brand` VARCHAR(100) DEFAULT NULL,
  `sizes` VARCHAR(100) DEFAULT NULL,
  `productCode` VARCHAR(50) DEFAULT NULL,
  `orderName` VARCHAR(50) DEFAULT NULL,
  `lastUpdate` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Insert 3 Products (Sample Data matching lecture slides)
INSERT INTO `products` (`id`, `name`, `stock`, `category`, `location`, `image`, `status`, `brand`, `sizes`, `productCode`, `orderName`, `lastUpdate`)
VALUES
(1, 'Unisex T-Shirt White', 0, 'T-shirts', '3 stores', 'http://nindam.sytes.net/std6630202040/Inventory/img/white.jpg', 'Active', 'Unnamed Brand', 'XS, S, M, L, XL, XXL', '119-12', 'SK19-111', NOW()),
(2, 'Unisex T-Shirt Black', 12, 'T-shirts', '3 stores', 'http://nindam.sytes.net/std6630202040/Inventory/img/black.png', 'Active', 'Unnamed Brand', 'XS, S, M, L, XL, XXL', '119-13', 'SK19-112', NOW()),
(3, 'Unisex T-Shirt Yellow', 12, 'T-shirts', '3 stores', 'http://nindam.sytes.net/std6630202040/Inventory/img/yellow.jpg', 'Active', 'Unnamed Brand', 'XS, S, M, L, XL, XXL', '119-14', 'SK19-113', NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `stock`=VALUES(`stock`);