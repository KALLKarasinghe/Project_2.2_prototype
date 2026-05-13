<?php
/**
 * PayHere Hash Generator
 * POST /api/generate_hash.php
 * 
 * Receives: order_id, amount, currency
 * Returns:  { hash: "..." }
 * 
 * The hash is: MD5( merchant_id + order_id + amount_formatted + currency + MD5(merchant_secret) )
 * All values uppercased after MD5.
 */
require_once __DIR__ . '/../config/cors.php';

// ─── PayHere Credentials ─────────────────────────────────
// Replace with your actual credentials
$merchant_id     = '1235734';
$merchant_secret = 'MzM3MjU0MjYxNjEzMDE5MjY3Nzc0MDgyNzUwOTYyOTE5NDQ2MTU3';

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['order_id']) || !isset($data['amount']) || empty($data['currency'])) {
    http_response_code(400);
    echo json_encode(["error" => "order_id, amount, and currency are required."]);
    exit;
}

$order_id = $data['order_id'];
$currency = $data['currency'];

// Amount MUST be formatted to 2 decimal places with no thousands separator
$amount = number_format((float) $data['amount'], 2, '.', '');

// Step 1: MD5 hash the merchant_secret and uppercase it
$hashed_secret = strtoupper(md5($merchant_secret));

// Step 2: Build the hash string and MD5 it
// Format: merchant_id + order_id + amount + currency + hashed_secret
$hash_string = $merchant_id . $order_id . $amount . $currency . $hashed_secret;
$generated_hash = strtoupper(md5($hash_string));

echo json_encode([
    "hash"        => $generated_hash,
    "merchant_id" => $merchant_id,
]);
