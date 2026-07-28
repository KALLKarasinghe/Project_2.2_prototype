<?php
require_once __DIR__ . '/../models/OrderChat.php';

class OrderChatController {
    private $db;
    private $chatModel;

    public function __construct($db) {
        $this->db = $db;
        $this->chatModel = new OrderChat($db);
    }

    public function handleRequest($method) {
        if ($method === 'GET') {
            $this->getChatMessages();
        } elseif ($method === 'POST') {
            $this->sendMessage();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
    }

    private function getChatMessages() {
        $order_id = $_GET['order_id'] ?? null;
        
        if (!$order_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Order ID is required']);
            return;
        }
        
        try {
            $messages = $this->chatModel->getMessages($order_id);
            echo json_encode(['success' => true, 'messages' => $messages]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    private function sendMessage() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->order_id) || !isset($data->sender_id) || !isset($data->message)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing fields (order_id, sender_id, message)']);
            return;
        }
        
        try {
            $newMessage = $this->chatModel->addMessage($data->order_id, $data->sender_id, $data->message);
            
            if ($newMessage) {
                echo json_encode(['success' => true, 'message' => $newMessage]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to send message']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
