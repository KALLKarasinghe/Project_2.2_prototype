<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbName = "pharma_network";

$conn = new mysqli($host, $user, $pass, $dbName);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$tables = ['mock_company_registry', 'mock_slmc_database', 'users'];
foreach ($tables as $table) {
    echo "TABLE: $table\n";
    $result = $conn->query("DESCRIBE $table");
    if ($result) {
        while($row = $result->fetch_assoc()) {
            echo "{$row['Field']} - {$row['Type']} - {$row['Null']} - {$row['Key']} - {$row['Default']} - {$row['Extra']}\n";
        }
    } else {
        echo "Table not found.\n";
    }
    echo "--------------------------\n";
}
$conn->close();
?>
