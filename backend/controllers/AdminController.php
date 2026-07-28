<?php
require_once __DIR__ . '/../models/Admin.php';

class AdminController {
    private $adminModel;

    public function __construct() {
        $this->adminModel = new Admin();
    }

    // Handle commissions request
    public function getCommissions() {
        try {
            $commissionRate = $this->adminModel->getCommissionRate();
            $commissionFraction = $commissionRate / 100;

            $sales = $this->adminModel->getTotalSalesAndCommissions($commissionFraction);
            $companies = $this->adminModel->getCommissionsByCompany($commissionFraction);

            echo json_encode([
                "success" => true,
                "data" => [
                    "current_rate" => $commissionRate,
                    "total_commissions" => (float)($sales['total_commissions'] ?? 0),
                    "companies" => $companies
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    // Handle logs request
    public function getLogs() {
        try {
            $logs = $this->adminModel->getRecentLogs();
            $formatted_logs = [];
            foreach ($logs as $log) {
                $formatted_logs[] = [
                    "id" => "ORD" . str_pad($log['id'], 6, "0", STR_PAD_LEFT),
                    "quantity" => $log['quantity'],
                    "status" => $log['status'],
                    "medicineName" => $log['medicine_name'] ?? 'Unknown Medicine'
                ];
            }

            echo json_encode([
                "success" => true,
                "data" => $formatted_logs
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    // Handle sales chart request
    public function getSalesChart() {
        try {
            $sales = $this->adminModel->getMonthlySales();
            
            // fill missing months with 0
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            $data = [];
            foreach ($months as $m) {
                $found = false;
                foreach ($sales as $s) {
                    if ($s['month'] === $m) {
                        $data[] = ["name" => $m, "sales" => (float) $s['total_sales']];
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $data[] = ["name" => $m, "sales" => 0];
                }
            }

            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    // Handle stats request
    public function getStats() {
        try {
            $activeUsers = $this->adminModel->getActiveUsersCount();
            $totalOrders = $this->adminModel->getTotalOrdersCount();
            $totalMedicines = $this->adminModel->getTotalMedicinesCount();

            echo json_encode([
                "success" => true,
                "data" => [
                    "activeUsers" => $activeUsers,
                    "totalOrders" => $totalOrders,
                    "totalMedicines" => $totalMedicines
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    // Handle get pending users request
    public function getPendingUsers() {
        try {
            $pendingUsers = $this->adminModel->getPendingUsers();
            echo json_encode(["success" => true, "data" => $pendingUsers]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    // Handle approve/reject user request
    public function verifyUser($data) {
        $user_id = $data['user_id'] ?? null;
        $action = $data['action'] ?? null;
        
        if (!$user_id || !in_array($action, ['approve', 'reject'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid request. Provide 'user_id' and 'action' ('approve' or 'reject')."]);
            return;
        }
        
        $newStatus = ($action === 'approve') ? 'Active' : 'Inactive';
        $adminApproved = ($action === 'approve') ? 1 : 0;
        
        try {
            $updated = $this->adminModel->updateUserStatus($user_id, $newStatus, $adminApproved);
            
            if ($updated) {
                echo json_encode(["success" => true, "message" => "User status updated to {$newStatus}."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "User not found or status already updated."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
}
?>
