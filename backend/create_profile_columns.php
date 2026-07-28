<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = (new Database())->getConnection();

    $sql1 = "ALTER TABLE users ADD COLUMN profile_pic VARCHAR(255) NULL";
    $sql2 = "ALTER TABLE users ADD COLUMN bank_details TEXT NULL";

    try {
        $db->exec($sql1);
        echo "profile_pic column added successfully.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "profile_pic column already exists.\n";
        } else {
            throw $e;
        }
    }

    try {
        $db->exec($sql2);
        echo "bank_details column added successfully.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "bank_details column already exists.\n";
        } else {
            throw $e;
        }
    }

} catch (PDOException $e) {
    echo "Error updating table: " . $e->getMessage() . "\n";
}
?>
