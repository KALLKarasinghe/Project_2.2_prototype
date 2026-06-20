<?php
class Database {
    private $host = "localhost";
    private $db_name = "pharma_network"; // ඔයාගේ database නම මෙතන තියෙනවා
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            // Products API එක වැඩ කරන්න PDO කනෙක්ෂන් එකක් ඕනේ
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        echo "Database connection established.";
        return $this->conn;
    }
}
?>