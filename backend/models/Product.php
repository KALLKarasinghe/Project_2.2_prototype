<?php
require_once __DIR__ . '/../../config/database.php';

class Product {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    // get products based on role and search query
    public function getProducts($role, $company_id, $search) {
        $sql = "SELECT p.id, p.supplier_id as company_id, p.brand, p.name, 
                       i.price, i.mrp, i.expire_date as expireDate, i.stock, p.description, 
                       u.name AS company_name
                FROM products p
                JOIN inventory i ON p.id = i.product_id
                LEFT JOIN users u ON p.supplier_id = u.id
                WHERE 1=1";
        
        $params = [];

        if (strtolower($role) === 'supplier') {
            $sql .= " AND p.supplier_id = ?";
            $params[] = $company_id;
        } elseif (strtolower($role) === 'pharmacy' || strtolower($role) === 'customer') {
            // pharmacies and customers see all products that have stock
            $sql .= " AND i.stock > 0";
        }

        if (!empty($search)) {
            $sql .= " AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)";
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
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

    // add a new product
    public function addProduct($supplier_id, $name, $brand, $description, $price, $mrp, $stock, $expire_date) {
        $this->db->beginTransaction();
        try {
            // insert product
            $sql1 = "INSERT INTO products (supplier_id, name, brand, description) 
                    VALUES (:supplier_id, :name, :brand, :description)";
            
            $stmt1 = $this->db->prepare($sql1);
            $stmt1->execute([
                ':supplier_id' => $supplier_id,
                ':name'        => $name,
                ':brand'       => $brand,
                ':description' => $description
            ]);

            $newId = $this->db->lastInsertId();

            // insert inventory
            $sql2 = "INSERT INTO inventory (product_id, price, mrp, stock, expire_date)
                     VALUES (:product_id, :price, :mrp, :stock, :expire_date)";
            $stmt2 = $this->db->prepare($sql2);
            $stmt2->execute([
                ':product_id'  => $newId,
                ':price'       => $price,
                ':mrp'         => $mrp,
                ':stock'       => $stock,
                ':expire_date' => $expire_date
            ]);

            $this->db->commit();
            return $newId;
        } catch (PDOException $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
