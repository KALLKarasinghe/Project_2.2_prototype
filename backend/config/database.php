<?php
/**
 * Database Connection - PDO
 * B2B Pharmaceutical Network
 */

class Database {
    private $host = "sql302.infinityfree.com";
    private $db_name = "if0_41906696_pharmacy_db";
    private $username = "if0_41906696";
    private $password = "Project123Pro";
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
