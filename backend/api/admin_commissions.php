<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

try {
    // Get dynamic commission rate
    $setStmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'");
    $setResult = $setStmt->fetch(PDO::FETCH_ASSOC);
    $commissionRate = $setResult ? (float)$setResult['setting_value'] : 1.0;
    $commissionFraction = $commissionRate / 100;

    // 1. Total order value (completed orders)
    $stmt = $db->prepare("
        SELECT 
            SUM(o.quantity * i.price) as total_base_sales,
            SUM(o.quantity * i.price * :comm) as total_commissions
        FROM orders o
        JOIN inventory i ON o.product_id = i.product_id
        WHERE o.status != 'Pending' AND o.status != 'Rejected'
    ");
    $stmt->execute([':comm' => $commissionFraction]);
    $sales = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Breakdown by Company (Supplier)
    $compStmt = $db->prepare("
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
    $companies = $compStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => [
            "current_rate" => $commissionRate,
            "total_commissions" => (float)($sales['total_commissions'] ?? 0),
            "companies" => $companies
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
