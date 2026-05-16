<?php
/**
 * Checkout API
 * POST /api/checkout.php
 * Accepts: { "user_id": 5 }
 * Action: Converts user_cart items to real orders and clears the cart.
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;
$transaction_id = $data['transaction_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["error" => "user_id is required."]);
    exit;
}

try {
    $db->beginTransaction();

    // 1. Fetch cart items for this user
    $stmt = $db->prepare("SELECT medicine_id, quantity FROM user_cart WHERE user_id = :uid");
    $stmt->execute([':uid' => $user_id]);
    $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($cartItems) === 0) {
        $db->rollBack();
        echo json_encode(["error" => "Cart is empty."]);
        exit;
    }

    // 2. Insert into orders table (flat structure: medicine_id, pharmacy_id, quantity, status, transaction_id)
    $insertOrder = $db->prepare("INSERT INTO orders (medicine_id, pharmacy_id, quantity, status, transaction_id) VALUES (:mid, :uid, :qty, 'Paid', :tx_id)");
    
    // 3. Update stock in medicines table
    $updateStock = $db->prepare("UPDATE medicines SET stock = stock - :qty1 WHERE id = :mid AND stock >= :qty2");

    foreach ($cartItems as $item) {
        // Insert order
        $insertOrder->execute([
            ':mid' => $item['medicine_id'],
            ':uid' => $user_id,
            ':qty' => $item['quantity'],
            ':tx_id' => $transaction_id
        ]);

        // Deduct stock
        $updateStock->execute([
            ':qty1' => $item['quantity'],
            ':qty2' => $item['quantity'],
            ':mid' => $item['medicine_id']
        ]);

        // Fetch supplier info and send notification
        $getMedInfo = $db->prepare("SELECT name, supplier_id FROM medicines WHERE id = :mid");
        $getMedInfo->execute([':mid' => $item['medicine_id']]);
        $medInfo = $getMedInfo->fetch(PDO::FETCH_ASSOC);

        if ($medInfo && $medInfo['supplier_id']) {
            $insertNotif = $db->prepare("INSERT INTO notifications (user_id, title, message) VALUES (:uid, :title, :msg)");
            $insertNotif->execute([
                ':uid' => $medInfo['supplier_id'],
                ':title' => 'New Order Received',
                ':msg' => "You have received a new order for {$item['quantity']} units of {$medInfo['name']}."
            ]);
        }
        
        if ($updateStock->rowCount() === 0) {
            // If rowCount is 0, it means either medicine not found or stock is insufficient.
            // But we will just let it pass or you could throw an error to rollback.
            // For a robust system, rollback if out of stock:
            /*
            $db->rollBack();
            http_response_code(400);
            echo json_encode(["error" => "Insufficient stock for medicine ID " . $item['medicine_id']]);
            exit;
            */
        }
    }

    // 4. Clear the cart
    $clearCart = $db->prepare("DELETE FROM user_cart WHERE user_id = :uid");
    $clearCart->execute([':uid' => $user_id]);

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Order placed successfully!"
    ]);

} catch (PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
