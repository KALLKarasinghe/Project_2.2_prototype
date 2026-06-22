<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbName = "pharma_network";

$conn = new mysqli($host, $user, $pass, $dbName);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "ALTER TABLE users ADD COLUMN admin_approved BOOLEAN DEFAULT FALSE;";
if ($conn->query($sql) === TRUE) {
    echo "Table users altered successfully";
} else {
    echo "Error altering table: " . $conn->error;
}
$conn->close();
?>
