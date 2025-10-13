CREATE TABLE IF NOT EXISTS menu_category (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(128) UNIQUE NOT NULL,
    description TEXT,
    sort_order INT UNSIGNED DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_menu_category_name (name),
    INDEX idx_menu_category_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
