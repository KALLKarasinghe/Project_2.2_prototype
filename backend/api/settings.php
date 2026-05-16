<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $rate = $result ? (float)$result['setting_value'] : 1.0;
        
        echo json_encode(["success" => true, "commission_rate" => $rate]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $rate = $data['commission_rate'] ?? null;

    if ($rate === null || !is_numeric($rate)) {
        http_response_code(400);
        echo json_encode(["error" => "Valid commission rate is required."]);
        exit;
    }

    try {
        $stmt = $db->prepare("UPDATE settings SET setting_value = :val WHERE setting_key = 'commission_rate'");
        $stmt->execute([':val' => (string)$rate]);
        
        // Notify all suppliers about the change
        $supStmt = $db->query("SELECT id FROM users WHERE role = 'Company' OR role = 'Supplier'");
        $suppliers = $supStmt->fetchAll(PDO::FETCH_ASSOC);

        $notifStmt = $db->prepare("INSERT INTO notifications (user_id, title, message) VALUES (:uid, :title, :msg)");
        foreach ($suppliers as $sup) {
            $notifStmt->execute([
                ':uid' => $sup['id'],
                ':title' => 'Platform Notice',
                ':msg' => "The platform sales commission rate has been updated to {$rate}%."
            ]);
        }

        echo json_encode(["success" => true, "message" => "Commission rate updated."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}
