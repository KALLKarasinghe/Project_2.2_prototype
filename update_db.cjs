const fs = require('fs');
const path = require('path');

const dbPath = 'c:\\Users\\linuk\\OneDrive\\Desktop\\GitHub\\Project_2.2_prototype\\database.sql';
let sql = fs.readFileSync(dbPath, 'utf8');

// 1. Replace MEDICINES table with PRODUCTS and INVENTORY
const medicinesTableRegex = /CREATE TABLE medicines \([\s\S]*?\) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;/;
const productsAndInventoryTables = `CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    legacy_id VARCHAR(20) UNIQUE COMMENT 'Maps to old frontend IDs like m1, m2, etc.',
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    supplier_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_brand (brand),
    INDEX idx_supplier (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 3. INVENTORY TABLE
-- =====================================================
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    mrp DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    expire_date DATE DEFAULT NULL,
    batch_number VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

sql = sql.replace(medicinesTableRegex, productsAndInventoryTables);

// 2. Add PAYMENTS table after ORDERS
const ordersTableRegex = /CREATE TABLE orders \([\s\S]*?\) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;/;
const ordersAndPaymentsTables = `CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    legacy_id VARCHAR(20) UNIQUE COMMENT 'Maps to old frontend IDs like o1, o2, etc.',
    product_id INT NOT NULL,
    pharmacy_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    status ENUM('Pending', 'Approved', 'Delivered', 'Rejected') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_pharmacy (pharmacy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 6. PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('PayHere', 'Bank Transfer') NOT NULL,
    status ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Pending',
    receipt_image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

sql = sql.replace(ordersTableRegex, ordersAndPaymentsTables);

// 3. Update medicine_reviews to product_reviews
sql = sql.replace(/CREATE TABLE medicine_reviews \(/g, 'CREATE TABLE product_reviews (');
sql = sql.replace(/medicine_id INT NOT NULL/g, 'product_id INT NOT NULL');
sql = sql.replace(/FOREIGN KEY \(medicine_id\) REFERENCES medicines\(id\)/g, 'FOREIGN KEY (product_id) REFERENCES products(id)');
sql = sql.replace(/INDEX idx_medicine \(medicine_id\)/g, 'INDEX idx_product (product_id)');

sql = sql.replace(/INSERT INTO medicine_reviews/g, 'INSERT INTO product_reviews');
sql = sql.replace(/\(medicine_id,/g, '(product_id,');
sql = sql.replace(/FROM medicines/g, 'FROM products');

// 4. Transform SEED DATA - Medicines into Products and Inventory
const seedMedicinesRegex = /INSERT INTO medicines \([\s\S]*?VALUES\s*([\s\S]*?);/;
const seedMedicinesMatch = sql.match(seedMedicinesRegex);

if (seedMedicinesMatch) {
    const valuesString = seedMedicinesMatch[1];
    
    // Parse the values tuples
    // e.g. ('m1',  'Panadol (Paracetamol 500mg)',  'GSK', 50000,  10.00,  (SELECT id FROM users WHERE legacy_id='u_s7'),  '2027-06-30', 'Effective for fast pain relief and reducing fever.')
    // Note: the existing columns are: legacy_id, name, brand, stock, price, supplier_id, expire_date, description
    
    const lines = valuesString.split(/,\n/);
    
    let productsSeed = "INSERT INTO products (legacy_id, name, brand, supplier_id, description) VALUES\n";
    let inventorySeed = "INSERT INTO inventory (product_id, stock, price, mrp, expire_date) VALUES\n";
    
    let pRows = [];
    let iRows = [];
    
    lines.forEach(line => {
        line = line.trim();
        if (line.endsWith(';')) line = line.substring(0, line.length - 1);
        if (line.startsWith('(') && line.endsWith(')')) {
            const inner = line.substring(1, line.length - 1);
            // Splitting by comma carefully... simpler to just use regex
            const parts = inner.split(/,(?![^()]*\))/); // split by comma not inside parens
            
            if (parts.length >= 8) {
                const legacy_id = parts[0].trim();
                const name = parts[1].trim();
                const brand = parts[2].trim();
                const stock = parts[3].trim();
                const price = parts[4].trim();
                const supplier_id = parts[5].trim();
                const expire_date = parts[6].trim();
                const description = parts[7].trim();
                
                pRows.push(`(${legacy_id}, ${name}, ${brand}, ${supplier_id}, ${description})`);
                iRows.push(`((SELECT id FROM products WHERE legacy_id=${legacy_id}), ${stock}, ${price}, ${price}, ${expire_date})`);
            }
        }
    });
    
    const newSeed = `-- =====================================================\n-- SEED DATA - Products\n-- =====================================================\n${productsSeed}${pRows.join(',\n')};\n\n-- =====================================================\n-- SEED DATA - Inventory\n-- =====================================================\n${inventorySeed}${iRows.join(',\n')};`;
    
    sql = sql.replace(seedMedicinesRegex, newSeed);
}

// 5. Update ORDERS seed data to use product_id instead of medicine_id
sql = sql.replace(/\(legacy_id, medicine_id, pharmacy_id, quantity, status\)/g, '(legacy_id, product_id, pharmacy_id, quantity, status)');

fs.writeFileSync(dbPath, sql, 'utf8');
console.log('Database SQL file updated successfully.');
