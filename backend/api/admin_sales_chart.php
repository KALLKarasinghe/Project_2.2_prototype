<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

try {
    // Get sales grouped by month for the current year
    $sql = "SELECT DATE_FORMAT(o.created_at, '%b') as month, SUM(o.quantity * m.price) as total_sales 
            FROM orders o 
            JOIN medicines m ON o.medicine_id = m.id 
            WHERE YEAR(o.created_at) = YEAR(CURRENT_DATE()) 
            AND o.status NOT IN ('Cancelled', 'Rejected')
            GROUP BY MONTH(o.created_at), DATE_FORMAT(o.created_at, '%b')
            ORDER BY MONTH(o.created_at)";

    $stmt = $db->query($sql);
    $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fill in missing months with 0
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
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
