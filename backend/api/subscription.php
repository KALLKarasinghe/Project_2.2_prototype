<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $user_id = $data['user_id'] ?? null;
    $plan_type = $data['plan_type'] ?? null;

    if (!$user_id || !in_array($plan_type, ['Weekly', 'Monthly', 'Yearly'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid subscription data."]);
        exit;
    }

    try {
        $interval = '';
        if ($plan_type === 'Weekly') $interval = 'INTERVAL 1 WEEK';
        elseif ($plan_type === 'Monthly') $interval = 'INTERVAL 1 MONTH';
        elseif ($plan_type === 'Yearly') $interval = 'INTERVAL 1 YEAR';

        $db->beginTransaction();
        
        $stmt = $db->prepare("UPDATE subscriptions SET status = 'Expired' WHERE user_id = ?");
        $stmt->execute([$user_id]);

        $stmt = $db->prepare("INSERT INTO subscriptions (user_id, plan_type, expires_at) VALUES (?, ?, DATE_ADD(NOW(), $interval))");
        $stmt->execute([$user_id, $plan_type]);
        
        $db->commit();
        echo json_encode(["success" => true, "message" => "Subscription activated successfully!"]);
    } catch (PDOException $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(["error" => "user_id is required."]);
        exit;
    }
    try {
        $stmt = $db->prepare("SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$user_id]);
        $sub = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $sub ?: null]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
