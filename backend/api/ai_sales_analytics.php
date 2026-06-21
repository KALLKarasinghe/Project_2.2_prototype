<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/ai_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

if (!defined('GEMINI_API_KEY') || GEMINI_API_KEY === 'YOUR_API_KEY_HERE' || empty(GEMINI_API_KEY)) {
    echo json_encode(["success" => false, "error" => "API_KEY_MISSING", "message" => "Please configure your Gemini API Key in backend/config/ai_config.php"]);
    exit;
}

$db = (new Database())->getConnection();

try {
    $supplierId = isset($_GET['supplier_id']) ? (int)$_GET['supplier_id'] : null;

    $query = "
        SELECT 
            DATE_FORMAT(o.created_at, '%b %Y') as name,
            SUM(o.quantity * i.price) as sales
        FROM orders o
        JOIN inventory i ON o.product_id = i.product_id
        JOIN products p ON o.product_id = p.id
        WHERE o.status != 'Pending' AND o.status != 'Rejected'
    ";
    
    if ($supplierId) {
        $query .= " AND p.supplier_id = :supplier_id ";
    }
    
    $query .= "
        GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
        ORDER BY o.created_at ASC
        LIMIT 12
    ";
    
    $stmt = $db->prepare($query);
    
    if ($supplierId) {
        $stmt->execute([':supplier_id' => $supplierId]);
    } else {
        $stmt->execute();
    }
    
    $historicalData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ensure numeric values
    foreach ($historicalData as &$row) {
        $row['sales'] = (float)$row['sales'];
    }

    if (empty($historicalData)) {
        // Dummy data if DB is empty to demonstrate the AI
        $historicalData = [
            ["name" => "Jan 2026", "sales" => 12000],
            ["name" => "Feb 2026", "sales" => 15000],
            ["name" => "Mar 2026", "sales" => 14000],
            ["name" => "Apr 2026", "sales" => 18000],
            ["name" => "May 2026", "sales" => 21000]
        ];
    }

    // 2. Prepare Prompt for Gemini API
    $jsonData = json_encode($historicalData);
    $prompt = "
    You are an expert business analyst for a B2B pharmaceutical supply chain.
    Here is our historical monthly sales data (in Sri Lankan Rupees):
    $jsonData
    
    Task:
    1. Analyze the trends.
    2. Provide a brief business insight paragraph (max 3 sentences).
    3. Provide sales predictions for the next 3 months based on this trend. 
       Use realistic names like 'Jun 2026', 'Jul 2026' for the upcoming months.
    
    You MUST return the output STRICTLY as a valid JSON object (without markdown code blocks) with the following structure:
    {
        \"insight\": \"Your business insight here...\",
        \"predictions\": [
            { \"name\": \"Jun 2026\", \"predicted_sales\": 25000 },
            { \"name\": \"Jul 2026\", \"predicted_sales\": 26500 },
            { \"name\": \"Aug 2026\", \"predicted_sales\": 28000 }
        ]
    }";

    // 3. Call Gemini API
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" . GEMINI_API_KEY;
    
    $payload = json_encode([
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ],
        "generationConfig" => [
            "temperature" => 0.4,
            "responseMimeType" => "application/json"
        ]
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new Exception("cURL Error: " . $err);
    }

    $geminiData = json_decode($response, true);
    
    if (isset($geminiData['error'])) {
        throw new Exception("Gemini API Error: " . $geminiData['error']['message']);
    }

    // Extract text from Gemini response
    $textResponse = $geminiData['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    // Sometimes Gemini wraps JSON in markdown blocks even when mimeType is set
    $textResponse = preg_replace('/```json\s*/', '', $textResponse);
    $textResponse = preg_replace('/```\s*/', '', $textResponse);
    
    $aiResult = json_decode(trim($textResponse), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Failed to parse AI JSON response.");
    }

    // 4. Merge historical and predicted data for the graph
    $chartData = $historicalData;
    
    if (isset($aiResult['predictions']) && is_array($aiResult['predictions'])) {
        // Link the last actual month with the first prediction to draw a continuous line
        if (!empty($historicalData)) {
            $lastActual = $historicalData[count($historicalData) - 1];
            // $aiResult['predictions'][0]['sales'] = $lastActual['sales']; 
            // Better to keep them separate keys for Recharts to handle lines
        }

        foreach ($aiResult['predictions'] as $pred) {
            $chartData[] = [
                "name" => $pred['name'],
                "predicted_sales" => (float)$pred['predicted_sales']
            ];
        }
    }

    echo json_encode([
        "success" => true,
        "data" => [
            "chartData" => $chartData,
            "insight" => $aiResult['insight'] ?? "No insight generated."
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
