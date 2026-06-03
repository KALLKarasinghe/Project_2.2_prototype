<?php
/**
 * Checkout API
 * POST /api/checkout.php
 * Accepts: { "user_id": 5, "transaction_id": "tx123", "payment_method": "PayHere", "amount": 1200.00, "receipt_image": "base64..." }
 * Action: Converts user_cart items to real orders, saves payment record, and clears the cart.
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
$payment_method = $data['payment_method'] ?? 'PayHere';
$receipt_image = $data['receipt_image'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["error" => "user_id is required."]);
    exit;
}

try {
    $db->beginTransaction();

    // 1. Fetch cart items for this user with prices
    $stmt = $db->prepare("
        SELECT uc.medicine_id as product_id, uc.quantity, i.price 
        FROM user_cart uc 
        JOIN inventory i ON uc.medicine_id = i.product_id 
        WHERE uc.user_id = :uid
    ");
    $stmt->execute([':uid' => $user_id]);
    $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($cartItems) === 0) {
        $db->rollBack();
        echo json_encode(["error" => "Cart is empty."]);
        exit;
    }

    // Insert order (assuming status depends on payment_method: Bank Transfer -> Pending, PayHere -> Paid/Approved)
    $orderStatus = ($payment_method === 'Bank Transfer') ? 'Pending' : 'Approved';
    $paymentStatus = ($payment_method === 'Bank Transfer') ? 'Pending' : 'Paid';

    $insertOrder = $db->prepare("INSERT INTO orders (product_id, pharmacy_id, quantity, status) VALUES (:mid, :uid, :qty, :status)");
    $updateStock = $db->prepare("UPDATE inventory SET stock = stock - :qty1 WHERE product_id = :mid AND stock >= :qty2");
    $insertPayment = $db->prepare("INSERT INTO payments (order_id, amount, payment_method, status, receipt_image) VALUES (:oid, :amt, :method, :status, :receipt)");

    $orderIds = [];

    foreach ($cartItems as $item) {
        // Insert order
        $insertOrder->execute([
            ':mid' => $item['product_id'],
            ':uid' => $user_id,
            ':qty' => $item['quantity'],
            ':status' => $orderStatus
        ]);
        
        $orderId = $db->lastInsertId();
        $orderIds[] = $orderId;
        
        // Calculate amount for this specific order item
        $amount = (float)$item['price'] * (int)$item['quantity'];

        // Apply discount logic if needed (Assuming the total sent from frontend matches, but we'll calculate base here. Premium discount can be fetched if necessary, but skipping for simplicity or can be passed)
        // For a prototype, just save the exact calculated line-item amount
        $insertPayment->execute([
            ':oid' => $orderId,
            ':amt' => $amount,
            ':method' => $payment_method,
            ':status' => $paymentStatus,
            ':receipt' => $receipt_image
        ]);

        // Deduct stock
        $updateStock->execute([
            ':qty1' => $item['quantity'],
            ':qty2' => $item['quantity'],
            ':mid' => $item['product_id']
        ]);

        // Fetch supplier info and send notification
        $getMedInfo = $db->prepare("SELECT name, supplier_id FROM products WHERE id = :mid");
        $getMedInfo->execute([':mid' => $item['product_id']]);
        $medInfo = $getMedInfo->fetch(PDO::FETCH_ASSOC);

        if ($medInfo && $medInfo['supplier_id']) {
            $insertNotif = $db->prepare("INSERT INTO notifications (user_id, title, message) VALUES (:uid, :title, :msg)");
            $insertNotif->execute([
                ':uid' => $medInfo['supplier_id'],
                ':title' => 'New Order Received',
                ':msg' => "You have received a new order for {$item['quantity']} units of {$medInfo['name']}."
            ]);
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
