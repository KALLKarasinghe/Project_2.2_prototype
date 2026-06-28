<?php
/**
 * Medicines API
 * GET  /api/medicines.php?role=Supplier&company_id=5 - Get medicines for a specific company
 * GET  /api/medicines.php?role=Pharmacy             - Get all available medicines (stock > 0)
 * GET  /api/medicines.php?role=Customer             - Get all available medicines (stock > 0)
 * POST /api/medicines.php                           - Add new medicine (supplier only)
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $role = $_GET['role'] ?? '';
        $company_id = $_GET['company_id'] ?? null;

        $sql = "SELECT p.id, p.supplier_id as company_id, p.brand, p.name, 
                       i.price, i.mrp, i.expire_date as expireDate, i.stock, p.description, 
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
            // Pharmacies and customers see all medicines that have stock
            $sql .= " AND i.stock > 0";
        }

        $sql .= " ORDER BY p.id DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $medicines = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch dynamic commission rate
        $setStmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'");
        $setResult = $setStmt->fetch(PDO::FETCH_ASSOC);
        $commissionRate = $setResult ? (float)$setResult['setting_value'] : 1.0;
        $multiplier = 1 + ($commissionRate / 100);

        // Cast numeric types and add markup for buyers
        foreach ($medicines as &$med) {
            $basePrice = (float) $med['price'];
            if (strtolower($role) === 'pharmacy' || strtolower($role) === 'customer') {
                $med['price'] = round($basePrice * $multiplier, 2);
            } else {
                $med['price'] = $basePrice;
            }
            $med['stock'] = (int) $med['stock'];
        }
        unset($med);

        echo json_encode(["success" => true, "data" => $medicines]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Security check: only allow 'supplier' to add medicines
    $role = $data['role'] ?? '';
    if (strtolower($role) !== 'supplier' && strtolower($role) !== 'company') {
        http_response_code(403);
        echo json_encode(["error" => "Only registered suppliers can add medicines."]);
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

    if (!$supplier_id || !$name || !$brand || !$price || !$mrp) {
        http_response_code(400);
        echo json_encode(["error" => "Supplier ID, name, brand, base price, and MRP are required."]);
        exit;
    }

    try {
        // Check if the user is admin_approved
        $checkStmt = $db->prepare("SELECT admin_approved FROM users WHERE id = :id");
        $checkStmt->execute([':id' => $supplier_id]);
        $userCheck = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$userCheck || $userCheck['admin_approved'] == 0) {
            http_response_code(403);
            echo json_encode(["error" => "Your account must be approved by an Admin before you can add medicines."]);
            exit;
        }
        // fetch current commission rate to validate
        $setStmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'");
        $setResult = $setStmt->fetch(PDO::FETCH_ASSOC);
        $commissionRate = $setResult ? (float)$setResult['setting_value'] : 1.0;
        
        $finalPrice = round($price * (1 + ($commissionRate / 100)), 2);

        if ($finalPrice > $mrp) {
            http_response_code(400);
            echo json_encode(["error" => "The final platform price (Rs. {$finalPrice}) exceeds your MRP (Rs. {$mrp}). Please adjust the base price or MRP."]);
            exit;
        }

        $db->beginTransaction();

        // 1. Insert into products
        $sqlProduct = "INSERT INTO products (supplier_id, name, brand, description) 
                       VALUES (:supplier_id, :name, :brand, :description)";
        $stmtProduct = $db->prepare($sqlProduct);
        $stmtProduct->execute([
            ':supplier_id' => $supplier_id,
            ':name'        => $name,
            ':brand'       => $brand,
            ':description' => $description
        ]);
        
        $productId = $db->lastInsertId();

        // 2. Insert into inventory
        $sqlInventory = "INSERT INTO inventory (product_id, price, mrp, stock, expire_date) 
                         VALUES (:product_id, :price, :mrp, :stock, :expire_date)";
        $stmtInventory = $db->prepare($sqlInventory);
        $stmtInventory->execute([
            ':product_id'  => $productId,
            ':price'       => $price,
            ':mrp'         => $mrp,
            ':stock'       => $stock,
            ':expire_date' => $expire_date
        ]);

        $db->commit();
        echo json_encode(["success" => true, "id" => $productId, "message" => "Medicine added successfully."]);

    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use GET or POST."]);
}
