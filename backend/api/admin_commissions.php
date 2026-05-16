<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

try {
    // 1. Total order value (completed orders)
    // Actually we added 1% on the frontend, so the total checkout value is 101% of the supplier price.
    // The commission is 1% of the supplier price, which is ~0.99% of the order total.
    // Let's just calculate it from medicines.price * orders.quantity
    
    // Get dynamic commission rate
    $setStmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'");
    $setResult = $setStmt->fetch(PDO::FETCH_ASSOC);
    $commissionRate = $setResult ? (float)$setResult['setting_value'] : 1.0;
    $commissionFraction = $commissionRate / 100;

    $stmt = $db->prepare("
        SELECT 
            SUM(o.quantity * m.price) as total_base_sales,
            SUM(o.quantity * m.price * :comm) as total_commissions
        FROM orders o
        JOIN medicines m ON o.medicine_id = m.id
        WHERE o.status != 'Pending' AND o.status != 'Rejected'
    ");
    $stmt->execute([':comm' => $commissionFraction]);
    $sales = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Subscriptions revenue
    $subStmt = $db->query("
        SELECT 
            COUNT(*) as total_subs,
            SUM(CASE 
                WHEN plan = 'Weekly' THEN 1000 
                WHEN plan = 'Monthly' THEN 3500 
                WHEN plan = 'Yearly' THEN 35000 
                ELSE 0 END) as sub_revenue
        FROM subscriptions
        WHERE status = 'Active'
    ");
    $subs = $subStmt->fetch(PDO::FETCH_ASSOC);

    // 3. Breakdown by Company (Supplier)
    $compStmt = $db->prepare("
        SELECT 
            u.name as company_name,
            SUM(o.quantity * m.price) as base_sales,
            SUM(o.quantity * m.price * :comm) as commission
        FROM orders o
        JOIN medicines m ON o.medicine_id = m.id
        JOIN users u ON m.supplier_id = u.id
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
            "subscription_revenue" => (float)($subs['sub_revenue'] ?? 0),
            "total_subs" => (int)($subs['total_subs'] ?? 0),
            "companies" => $companies
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
