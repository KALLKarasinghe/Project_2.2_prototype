<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = (new Database())->getConnection();

    $sql = "CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value VARCHAR(255) NOT NULL
    )";
    $db->exec($sql);

    // Insert default commission rate if not exists
    $stmt = $db->prepare("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('commission_rate', '1.0')");
    $stmt->execute();

    echo "Settings table created successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
