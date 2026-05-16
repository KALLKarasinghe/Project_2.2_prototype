<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $reviewer_id = $data['reviewer_id'] ?? null;
    $target_id = $data['target_id'] ?? null;
    $rating = $data['rating'] ?? 0;
    $comment = $data['comment'] ?? '';

    if (!$reviewer_id || !$target_id || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid rating data."]);
        exit;
    }

    try {
        $stmt = $db->prepare("INSERT INTO reviews (reviewer_id, target_id, rating, comment) VALUES (?, ?, ?, ?)");
        $stmt->execute([$reviewer_id, $target_id, $rating, $comment]);
        echo json_encode(["success" => true, "message" => "Review submitted successfully!"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $target_id = $_GET['target_id'] ?? null;
    if (!$target_id) {
        http_response_code(400);
        echo json_encode(["error" => "target_id is required."]);
        exit;
    }
    try {
        $stmt = $db->prepare("SELECT r.*, u.name as reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.target_id = ? ORDER BY r.created_at DESC");
        $stmt->execute([$target_id]);
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
