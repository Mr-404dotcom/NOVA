-- Nova's current React UI only collects newsletter email subscriptions.
-- This script is safe to re-import: it never drops a database, table, or row.
CREATE DATABASE IF NOT EXISTS nova_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nova_app;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(254) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_newsletter_subscribers_email (email)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci
  COMMENT='Email addresses submitted through the Nova newsletter form';

-- Product catalog tables for the first store-management feature.
-- Category deletion is restricted while products reference it.
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci
  COMMENT='Product categories managed by the store';

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) UNSIGNED NOT NULL,
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  image_url VARCHAR(2048) NULL,
  status ENUM('draft', 'active', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category_id (category_id),
  KEY idx_products_status (status),
  KEY idx_products_name (name),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci
  COMMENT='Store catalog products';
