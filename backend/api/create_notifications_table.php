<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = (new Database())->getConnection();

    $sql = "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";

    $db->exec($sql);
    echo "Notifications table created successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
