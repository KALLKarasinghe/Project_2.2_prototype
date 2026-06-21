<?php
require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo "Tables in database:\n";
print_r($tables);
?>
