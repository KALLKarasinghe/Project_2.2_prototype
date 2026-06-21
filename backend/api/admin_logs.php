<?php
/**
 * Admin Logs API
 * GET /api/admin_logs.php - Get recent orders for admin dashboard
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // We join products to get the medicine name
        $sql = "SELECT o.id, o.quantity, o.status, pr.name as medicine_name
                FROM orders o
                LEFT JOIN products pr ON o.product_id = pr.id
                ORDER BY o.id ASC LIMIT 100";
        
        $stmt = $db->query($sql);
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted_logs = [];
        foreach ($logs as $log) {
            $formatted_logs[] = [
                // frontend does order.id.slice(-6)
                "id" => "ORD" . str_pad($log['id'], 6, "0", STR_PAD_LEFT),
                "quantity" => $log['quantity'],
                "status" => $log['status'],
                "medicineName" => $log['medicine_name'] ?? 'Unknown Medicine'
            ];
        }

        echo json_encode([
            "success" => true,
            "data" => $formatted_logs
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use GET."]);
}
