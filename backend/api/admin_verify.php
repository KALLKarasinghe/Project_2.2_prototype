<?php
/**
 * Admin Verify API
 * GET  /api/admin_verify.php - Fetch pending pharmacy, company, and agent users with details
 * POST /api/admin_verify.php - Approve or reject a user (JSON: { "user_id": 1, "action": "approve"|"reject" })
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Fetch pending users directly from the unified users table
        $sql = "
            SELECT 
                id as user_id, 
                email, 
                role, 
                status,
                admin_approved,
                name,
                phone,
                address,
                license_document as license_file_path,
                created_at
            FROM users 
            WHERE (LOWER(status) = 'pending' OR admin_approved = 0)
            AND LOWER(role) IN ('pharmacy', 'supplier', 'agent', 'medical agent')
            ORDER BY id ASC
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $pendingUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["success" => true, "data" => $pendingUsers]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $user_id = $data['user_id'] ?? null;
    $action = $data['action'] ?? null; // 'approve' or 'reject'
    
    if (!$user_id || !in_array($action, ['approve', 'reject'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid request. Provide 'user_id' and 'action' ('approve' or 'reject')."]);
        exit;
    }
    
    // Map to database ENUM: 'Active', 'Pending', 'Inactive'
    $newStatus = ($action === 'approve') ? 'Active' : 'Inactive';
    $adminApproved = ($action === 'approve') ? 1 : 0;
    
    try {
        $stmt = $db->prepare("UPDATE users SET status = :status, admin_approved = :admin_approved WHERE id = :id");
        $stmt->execute([
            ':status' => $newStatus,
            ':admin_approved' => $adminApproved,
            ':id' => $user_id
        ]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "User status updated to {$newStatus}."]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "User not found or status already updated."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use GET or POST."]);
}
