<?php
require_once __DIR__ . '/../../config/database.php';

class Medicine {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    // get medicines based on role
    public function getMedicines($role, $company_id) {
        $sql = "SELECT p.id, p.supplier_id as company_id, p.brand, p.name, 
                       i.price, i.mrp, i.expire_date as expireDate, i.stock, p.description, 
                       u.name AS company_name
                FROM products p
                JOIN inventory i ON p.id = i.product_id
                LEFT JOIN users u ON p.supplier_id = u.id
                WHERE 1=1";
        
        $params = [];

        if (strtolower($role) === 'supplier') {
            $sql .= " AND p.supplier_id = :cid";
            $params[':cid'] = $company_id;
        } elseif (strtolower($role) === 'pharmacy' || strtolower($role) === 'customer') {
            // Pharmacies and customers see all medicines that have stock
            $sql .= " AND i.stock > 0";
        }

        $sql .= " ORDER BY p.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // get commission rate
    public function getCommissionRate() {
        $stmt = $this->db->query("SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? (float)$result['setting_value'] : 1.0;
    }

    // check if supplier is approved
    public function isSupplierApproved($supplier_id) {
        $stmt = $this->db->prepare("SELECT admin_approved FROM users WHERE id = :id");
        $stmt->execute([':id' => $supplier_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return ($user && $user['admin_approved'] == 1);
    }

    // add a new medicine
    public function addMedicine($supplier_id, $name, $brand, $description, $price, $mrp, $stock, $expire_date) {
        $this->db->beginTransaction();
        try {
            // insert product
            $sqlProduct = "INSERT INTO products (supplier_id, name, brand, description) 
                           VALUES (:supplier_id, :name, :brand, :description)";
            $stmtProduct = $this->db->prepare($sqlProduct);
            $stmtProduct->execute([
                ':supplier_id' => $supplier_id,
                ':name'        => $name,
                ':brand'       => $brand,
                ':description' => $description
            ]);
            
            $productId = $this->db->lastInsertId();

            // insert inventory
            $sqlInventory = "INSERT INTO inventory (product_id, price, mrp, stock, expire_date) 
                             VALUES (:product_id, :price, :mrp, :stock, :expire_date)";
            $stmtInventory = $this->db->prepare($sqlInventory);
            $stmtInventory->execute([
                ':product_id'  => $productId,
                ':price'       => $price,
                ':mrp'         => $mrp,
                ':stock'       => $stock,
                ':expire_date' => $expire_date
            ]);

            $this->db->commit();
            return $productId;
        } catch (PDOException $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
