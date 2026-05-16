<?php
/**
 * Admin Statistics API
 * GET /api/admin_stats.php - Get counts for active users, orders, and medicines
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Get active users count
        $stmtUsers = $db->query("SELECT COUNT(*) as count FROM users WHERE lower(status) = 'active'");
        $activeUsers = $stmtUsers->fetch(PDO::FETCH_ASSOC)['count'];

        // Get total orders count
        $stmtOrders = $db->query("SELECT COUNT(*) as count FROM orders");
        $totalOrders = $stmtOrders->fetch(PDO::FETCH_ASSOC)['count'];

        // Get total medicines count
        $stmtMedicines = $db->query("SELECT COUNT(*) as count FROM medicines");
        $totalMedicines = $stmtMedicines->fetch(PDO::FETCH_ASSOC)['count'];

        echo json_encode([
            "success" => true,
            "data" => [
                "activeUsers" => (int)$activeUsers,
                "totalOrders" => (int)$totalOrders,
                "totalMedicines" => (int)$totalMedicines
            ]
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use GET."]);
}
