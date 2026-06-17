<?php
/**
 * Products API
 * GET  /api/products.php?role=Supplier&company_id=5 - Get products for a specific company
 * GET  /api/products.php?role=Pharmacy             - Get all available products (stock > 0)
 * GET  /api/products.php?role=Customer             - Get all available products (stock > 0)
 * POST /api/products.php                           - Add new product (supplier only)
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $role = $_GET['role'] ?? '';
        $company_id = $_GET['company_id'] ?? null;

        $sql = "SELECT p.id, p.supplier_id as company_id, p.brand, p.name, p.dosage,
                       i.price, i.mrp, i.expire_date as expireDate, i.stock, i.batch_number, p.description, 
                       u.name AS company_name
                FROM products p
                JOIN inventory i ON p.id = i.product_id
                LEFT JOIN users u ON p.supplier_id = u.id
                WHERE 1=1";
        
        $params = [];

        // Role-based fetching logic
        if (strtolower($role) === 'supplier') {
            if (!$company_id) {
                http_response_code(400);
                echo json_encode(["error" => "company_id is required for supplier role."]);
                exit;
            }
            $sql .= " AND p.supplier_id = :cid";
            $params[':cid'] = $company_id;
        } elseif (strtolower($role) === 'pharmacy' || strtolower($role) === 'customer') {
            // Pharmacies and customers see all products that have stock
            $sql .= " AND i.stock > 0";
        }

        $sql .= " ORDER BY p.id DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch dynamic commission rate
        $setStmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'");
        $setResult = $setStmt->fetch(PDO::FETCH_ASSOC);
        $commissionRate = $setResult ? (float)$setResult['setting_value'] : 1.0;
        $multiplier = 1 + ($commissionRate / 100);

        // Cast numeric types and add markup for buyers
        foreach ($products as &$med) {
            $basePrice = (float) $med['price'];
            if (strtolower($role) === 'pharmacy' || strtolower($role) === 'customer') {
                $med['price'] = round($basePrice * $multiplier, 2);
            } else {
                $med['price'] = $basePrice;
            }
            $med['stock'] = (int) $med['stock'];
        }
        unset($med);

        echo json_encode(["success" => true, "data" => $products]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Security check: only allow 'supplier' to add products
    $role = $data['role'] ?? '';
    if (strtolower($role) !== 'supplier' && strtolower($role) !== 'company') {
        http_response_code(403);
        echo json_encode(["error" => "Only registered suppliers can add products."]);
        exit;
    }

    $supplier_id  = $data['company_id'] ?? null; // Frontend sends company_id
    $name         = $data['name'] ?? '';
    $brand        = $data['brand'] ?? '';
    $price        = $data['price'] ?? 0;
    $mrp          = $data['mrp'] ?? 0;
    $stock        = $data['stock'] ?? 0;
    $expire_date  = $data['expireDate'] ?? null;
    $description  = $data['description'] ?? '';
    $dosage       = $data['dosage'] ?? null;
    $batch_number = $data['batch_number'] ?? null;

    if (!$supplier_id || !$name || !$brand || !$price || !$mrp || !$stock || !$expire_date) {
        http_response_code(400);
        echo json_encode(["error" => "Supplier ID, name, brand, base price, MRP, stock, and expire date are required."]);
        exit;
    }

    try {
        $db->beginTransaction();
        // fetch current commission rate to validate
        $setStmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'");
        $setResult = $setStmt->fetch(PDO::FETCH_ASSOC);
        $commissionRate = $setResult ? (float)$setResult['setting_value'] : 1.0;
        
        $finalPrice = round($price * (1 + ($commissionRate / 100)), 2);

        if ($finalPrice > $mrp) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(["error" => "The final platform price (Rs. {$finalPrice}) exceeds your MRP (Rs. {$mrp}). Please adjust the base price or MRP."]);
            exit;
        }

        $sql1 = "INSERT INTO products (supplier_id, name, brand, description, dosage) 
                VALUES (:supplier_id, :name, :brand, :description, :dosage)";
        
        $stmt1 = $db->prepare($sql1);
        $stmt1->execute([
            ':supplier_id' => $supplier_id,
            ':name'        => $name,
            ':brand'       => $brand,
            ':description' => $description,
            ':dosage'      => $dosage
        ]);

        $newId = $db->lastInsertId();

        $sql2 = "INSERT INTO inventory (product_id, price, mrp, stock, expire_date, batch_number)
                 VALUES (:product_id, :price, :mrp, :stock, :expire_date, :batch_number)";
        $stmt2 = $db->prepare($sql2);
        $stmt2->execute([
            ':product_id'   => $newId,
            ':price'        => $price,
            ':mrp'          => $mrp,
            ':stock'        => $stock,
            ':expire_date'  => $expire_date,
            ':batch_number' => $batch_number
        ]);

        $db->commit();
        echo json_encode(["success" => true, "id" => $newId, "message" => "Product added successfully."]);

    } catch (PDOException $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use GET or POST."]);
}
