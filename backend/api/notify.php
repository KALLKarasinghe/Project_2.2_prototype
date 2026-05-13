<?php
/**
 * PayHere Server-to-Server Notification (Webhook)
 * POST /api/notify.php
 * 
 * PayHere sends a POST request here after a successful payment.
 * This script:
 *   1. Receives payment data from PayHere
 *   2. Verifies the MD5 hash signature to confirm authenticity
 *   3. Updates the order status to 'Paid' in the database
 * 
 * IMPORTANT: This URL must be publicly accessible for PayHere to reach it.
 *            During development with XAMPP, you can use ngrok to expose it.
 */
require_once __DIR__ . '/../config/database.php';

// ─── PayHere Credentials ─────────────────────────────────
$merchant_secret = 'MzM3MjU0MjYxNjEzMDE5MjY3Nzc0MDgyNzUwOTYyOTE5NDQ2MTU3';

// Log all incoming notifications for debugging
$log_file = __DIR__ . '/../logs/payhere_notifications.log';
$log_dir  = dirname($log_file);
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}

// Capture the raw POST data
$raw_post = file_get_contents("php://input");
file_put_contents($log_file, date('Y-m-d H:i:s') . " - RAW: " . $raw_post . "\n", FILE_APPEND);

// PayHere sends form-encoded data (application/x-www-form-urlencoded)
$merchant_id       = $_POST['merchant_id'] ?? '';
$order_id          = $_POST['order_id'] ?? '';
$payhere_amount    = $_POST['payhere_amount'] ?? '';
$payhere_currency  = $_POST['payhere_currency'] ?? '';
$status_code       = $_POST['status_code'] ?? '';
$md5sig            = $_POST['md5sig'] ?? '';
$payment_id        = $_POST['payment_id'] ?? '';
$method            = $_POST['method'] ?? '';
$status_message    = $_POST['status_message'] ?? '';

// Log parsed data
$log_entry = date('Y-m-d H:i:s') . " - order_id={$order_id}, amount={$payhere_amount}, status_code={$status_code}, payment_id={$payment_id}\n";
file_put_contents($log_file, $log_entry, FILE_APPEND);

// ─── Step 1: Verify the MD5 signature ─────────────────────
// PayHere hash formula:
// MD5( merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret) )
// All uppercased after MD5

$hashed_secret = strtoupper(md5($merchant_secret));

$expected_hash = strtoupper(md5(
    $merchant_id .
    $order_id .
    $payhere_amount .
    $payhere_currency .
    $status_code .
    $hashed_secret
));

if ($md5sig !== $expected_hash) {
    // Hash mismatch — this request may not be from PayHere
    $log_msg = date('Y-m-d H:i:s') . " - ❌ HASH MISMATCH for order {$order_id}. Expected: {$expected_hash}, Got: {$md5sig}\n";
    file_put_contents($log_file, $log_msg, FILE_APPEND);
    http_response_code(403);
    echo "Hash verification failed.";
    exit;
}

// ─── Step 2: Process based on status_code ─────────────────
// PayHere status codes:
//   2  = Success (payment completed)
//   0  = Pending
//  -1  = Canceled
//  -2  = Failed
//  -3  = Chargedback

$db = (new Database())->getConnection();

try {
    if ($status_code == 2) {
        // ─── Payment Successful ──────────────────────
        // The order_id format from our frontend: "GM-xxxxx"
        // We need to find and update orders related to this transaction

        // Option A: If order_id maps to a single order
        $stmt = $db->prepare("UPDATE orders SET status = 'Paid' WHERE id = :oid OR legacy_id = :legacy_oid");
        $stmt->execute([
            ':oid'        => $order_id,
            ':legacy_oid' => $order_id,
        ]);

        // If the order_id is a transaction reference (not a single order ID),
        // you could also store a payments table. For now, we log it:
        $log_msg = date('Y-m-d H:i:s') . " - ✅ PAYMENT SUCCESS for order {$order_id}. Payment ID: {$payment_id}, Amount: {$payhere_amount} {$payhere_currency}\n";
        file_put_contents($log_file, $log_msg, FILE_APPEND);

        // Return 200 to acknowledge receipt
        http_response_code(200);
        echo "OK";

    } elseif ($status_code == 0) {
        $log_msg = date('Y-m-d H:i:s') . " - ⏳ PENDING for order {$order_id}\n";
        file_put_contents($log_file, $log_msg, FILE_APPEND);
        http_response_code(200);
        echo "Pending";

    } else {
        // Failed, Canceled, or Chargedback
        $stmt = $db->prepare("UPDATE orders SET status = 'Rejected' WHERE id = :oid OR legacy_id = :legacy_oid");
        $stmt->execute([
            ':oid'        => $order_id,
            ':legacy_oid' => $order_id,
        ]);

        $log_msg = date('Y-m-d H:i:s') . " - ❌ FAILED/CANCELED for order {$order_id}. Status code: {$status_code}, Message: {$status_message}\n";
        file_put_contents($log_file, $log_msg, FILE_APPEND);
        http_response_code(200);
        echo "Handled";
    }
} catch (PDOException $e) {
    $log_msg = date('Y-m-d H:i:s') . " - ‼️ DB ERROR for order {$order_id}: " . $e->getMessage() . "\n";
    file_put_contents($log_file, $log_msg, FILE_APPEND);
    http_response_code(500);
    echo "Database error.";
}
