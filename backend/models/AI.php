<?php
require_once __DIR__ . '/../config/database.php';

class AI {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // AI Chat - check medicine stock
    public function getStockByName($medicineName) {
        $stmt = $this->conn->prepare("SELECT i.stock FROM products p JOIN inventory i ON p.id = i.product_id WHERE p.name LIKE :name");
        $stmt->execute(['name' => '%' . $medicineName . '%']);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // AI Chat - get top selling medicines
    public function getTopSellingMedicines() {
        $stmt = $this->conn->prepare("SELECT medicine_name, SUM(qty) as total FROM order_items GROUP BY medicine_id ORDER BY total DESC LIMIT 5");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // AI Analytics - get historical sales
    public function getHistoricalSales($supplierId = null) {
        $query = "
            SELECT 
                DATE_FORMAT(o.created_at, '%b %Y') as name,
                SUM(o.quantity * i.price) as sales
            FROM orders o
            JOIN inventory i ON o.product_id = i.product_id
            JOIN products p ON o.product_id = p.id
            WHERE o.status != 'Pending' AND o.status != 'Rejected'
        ";
        
        if ($supplierId) {
            $query .= " AND p.supplier_id = :supplier_id ";
        }
        
        $query .= "
            GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
            ORDER BY o.created_at ASC
            LIMIT 12
        ";
        
        $stmt = $this->conn->prepare($query);
        
        if ($supplierId) {
            $stmt->execute([':supplier_id' => $supplierId]);
        } else {
            $stmt->execute();
        }
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
