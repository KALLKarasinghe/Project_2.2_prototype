<?php
require_once __DIR__ . '/../models/Wallet.php';

class WalletController {
    private $walletModel;

    public function __construct() {
        $this->walletModel = new Wallet();
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $this->getWalletData();
        } elseif ($method === 'POST') {
            $this->requestWithdrawal();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
    }

    private function getWalletData() {
        $supplier_id = $_GET['supplier_id'] ?? null;
        
        if (!$supplier_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Supplier ID is required']);
            exit;
        }

        try {
            // get delivered orders for earnings
            $orders = $this->walletModel->getDeliveredOrdersBySupplier($supplier_id);
            $total_earnings = 0;
            $earnings_history = [];
            
            foreach ($orders as $order) {
                $amount = floatval($order['quantity']) * floatval($order['price']);
                $total_earnings += $amount;
                
                $earnings_history[] = [
                    'type' => 'credit',
                    'amount' => $amount,
                    'description' => 'Payment for Order #' . $order['order_id'],
                    'date' => $order['created_at'],
                    'status' => 'Completed'
                ];
            }
            
            // get withdrawals
            $withdrawals = $this->walletModel->getWithdrawalsBySupplier($supplier_id);
            $total_withdrawn = 0;
            $withdrawal_history = [];
            
            foreach ($withdrawals as $w) {
                // include both pending and completed
                if ($w['status'] !== 'Rejected') {
                    $total_withdrawn += floatval($w['amount']);
                }
                
                $withdrawal_history[] = [
                    'type' => 'debit',
                    'amount' => floatval($w['amount']),
                    'status' => $w['status'],
                    'description' => 'Withdrawal to Bank',
                    'date' => $w['created_at']
                ];
            }
            
            $current_balance = $total_earnings - $total_withdrawn;
            
            // merge and sort transactions
            $transactions = array_merge($earnings_history, $withdrawal_history);
            usort($transactions, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            echo json_encode([
                'success' => true,
                'balance' => $current_balance,
                'total_earnings' => $total_earnings,
                'total_withdrawn' => $total_withdrawn,
                'transactions' => $transactions
            ]);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    private function requestWithdrawal() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->supplier_id) || !isset($data->amount) || !isset($data->bank_details)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing fields']);
            exit;
        }
        
        $amount = floatval($data->amount);
        if ($amount <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid amount']);
            exit;
        }
        
        try {
            $success = $this->walletModel->createWithdrawal($data->supplier_id, $amount, $data->bank_details);
            
            if ($success) {
                echo json_encode(['success' => true, 'message' => 'Withdrawal requested successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to process request']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
