<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = (new Database())->getConnection();

    $sql = "ALTER TABLE medicines ADD COLUMN mrp DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER price";
    $db->exec($sql);

    echo "MRP column added successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
