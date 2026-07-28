<?php
require_once __DIR__ . '/../config/database.php';

class Admin {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // get commission rate
    public function getCommissionRate() {
        $stmt = $this->conn->query("SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? (float)$result['setting_value'] : 1.0;
    }

    // get total sales and commissions
    public function getTotalSalesAndCommissions($commissionFraction) {
        $stmt = $this->conn->prepare("
            SELECT 
                SUM(o.quantity * i.price) as total_base_sales,
                SUM(o.quantity * i.price * :comm) as total_commissions
            FROM orders o
            JOIN inventory i ON o.product_id = i.product_id
            WHERE o.status != 'Pending' AND o.status != 'Rejected'
        ");
        $stmt->execute([':comm' => $commissionFraction]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // get commissions by company
    public function getCommissionsByCompany($commissionFraction) {
        $compStmt = $this->conn->prepare("
            SELECT 
                u.name as company_name,
                SUM(o.quantity * i.price) as base_sales,
                SUM(o.quantity * i.price * :comm) as commission
            FROM orders o
            JOIN inventory i ON o.product_id = i.product_id
            JOIN products p ON o.product_id = p.id
            JOIN users u ON p.supplier_id = u.id
            WHERE o.status != 'Pending' AND o.status != 'Rejected'
            GROUP BY u.id
            ORDER BY commission DESC
        ");
        $compStmt->execute([':comm' => $commissionFraction]);
        return $compStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // get recent logs
    public function getRecentLogs() {
        $sql = "SELECT o.id, o.quantity, o.status, pr.name as medicine_name
                FROM orders o
                LEFT JOIN products pr ON o.product_id = pr.id
                ORDER BY o.id ASC LIMIT 100";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // get monthly sales for chart
    public function getMonthlySales() {
        $sql = "SELECT DATE_FORMAT(o.created_at, '%b') as month, SUM(o.quantity * i.price) as total_sales 
                FROM orders o 
                JOIN inventory i ON o.product_id = i.product_id 
                WHERE YEAR(o.created_at) = YEAR(CURRENT_DATE()) 
                AND o.status NOT IN ('Cancelled', 'Rejected')
                GROUP BY MONTH(o.created_at), DATE_FORMAT(o.created_at, '%b')
                ORDER BY MONTH(o.created_at)";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // count active users
    public function getActiveUsersCount() {
        $stmt = $this->conn->query("SELECT COUNT(*) as count FROM users WHERE lower(status) = 'active'");
        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    // count total orders
    public function getTotalOrdersCount() {
        $stmt = $this->conn->query("SELECT COUNT(*) as count FROM orders");
        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    // count total medicines
    public function getTotalMedicinesCount() {
        $stmt = $this->conn->query("SELECT COUNT(*) as count FROM products");
        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    // get pending users
    public function getPendingUsers() {
        $sql = "
            SELECT 
                id as user_id, 
                email, 
                role, 
                status,
                admin_approved,
                name,
                phone,
                address,
                license_document as license_file_path,
                created_at
            FROM users 
            WHERE (LOWER(status) = 'pending' OR admin_approved = 0)
            AND LOWER(role) IN ('pharmacy', 'supplier', 'agent', 'medical agent')
            ORDER BY id ASC
        ";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // update user status
    public function updateUserStatus($user_id, $newStatus, $adminApproved) {
        $stmt = $this->conn->prepare("UPDATE users SET status = :status, admin_approved = :admin_approved WHERE id = :id");
        $stmt->execute([
            ':status' => $newStatus,
            ':admin_approved' => $adminApproved,
            ':id' => $user_id
        ]);
        return $stmt->rowCount() > 0;
    }
}
?>
