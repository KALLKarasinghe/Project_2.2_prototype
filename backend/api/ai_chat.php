<?php
// Disable HTML error output to prevent breaking JSON responses
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Include CORS Configuration FIRST so headers are always sent
require_once '../config/cors.php';

// Set up a custom error handler to return PHP errors as JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "PHP Error: $errstr in $errfile on line $errline"
    ]);
    exit;
});

// Set up an exception handler to return uncaught exceptions as JSON
set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Uncaught Exception",
        "details" => $e->getMessage()
    ]);
    exit;
});

// Include Database Configuration
require_once '../config/database.php';

// =========================================================================
// GEMINI API CONFIGURATION
// =========================================================================
$api_key = "YOUR_API_KEY_HERE";
// =========================================================================

// Safely get and decode POST data
$rawData = file_get_contents("php://input");
$inputData = json_decode($rawData);

// Check for JSON decoding errors
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Invalid JSON payload received",
        "details" => json_last_error_msg()
    ]);
    exit;
}

$userMessage = $inputData->message ?? null;

if (!$userMessage) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Message is required"]);
    exit;
}

/**
 * Helper function to call Google Gemini API
 */
function callGemini($prompt, $apiKey) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;
    
    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if(curl_errno($ch)){
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception("cURL Error: " . $error);
    }
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("Gemini API Error (HTTP $httpCode): " . $response);
    }

    $result = json_decode($response, true);
    if(isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        return $result['candidates'][0]['content']['parts'][0]['text'];
    }
    
    throw new Exception("Unexpected response format from Gemini API: " . $response);
}

// Function to safely extract JSON from markdown output (```json ... ```)
function extractJsonFromMarkdown($text) {
    $text = trim($text);
    if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $text, $matches)) {
        return $matches[1];
    }
    return $text;
}

try {
    // FIRST GEMINI CALL
    $firstPrompt = "You are an intent classification system for a pharmacy database. " .
                   "Analyze the following user message: '{$userMessage}'\n" .
                   "Identify the 'Intent' which MUST be exactly either 'Stock Check', 'Top Selling', or 'General Chat'. " .
                   "Also extract the 'Medicine Name' if applicable. " .
                   "Return ONLY a valid JSON object with keys 'Intent' and 'Medicine Name' (set to null if not applicable). Do not include any other text.";
    
    $intentResultRaw = callGemini($firstPrompt, $api_key);
    $intentResultClean = extractJsonFromMarkdown($intentResultRaw);
    $intentData = json_decode($intentResultClean, true);
    
    $intent = $intentData['Intent'] ?? null;
    $medicineName = $intentData['Medicine Name'] ?? null;
    
    // Initialize Database
    $database = new Database();
    $db = $database->getConnection();
    $dbResult = [];
    
    // PHP MYSQL EXECUTION
    try {
        if ($intent === "Stock Check" && $medicineName) {
            $stmt = $db->prepare("SELECT stock FROM medicines WHERE name LIKE :name");
            $stmt->execute(['name' => '%' . $medicineName . '%']);
            $dbResult = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } 
        elseif ($intent === "Top Selling") {
            $stmt = $db->prepare("SELECT medicine_name, SUM(qty) as total FROM order_items GROUP BY medicine_id ORDER BY total DESC LIMIT 5");
            $stmt->execute();
            $dbResult = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        elseif ($intent === "General Chat") {
            $dbResult = ["status" => "No database query needed for general conversation."];
        } 
        else {
            $dbResult = ["error" => "Could not determine a valid database query for this request."];
        }
    } catch (PDOException $e) {
        $dbResult = ["database_error" => "The database query failed: " . $e->getMessage()];
    }
    
    // SECOND GEMINI CALL
    $dbResultString = json_encode($dbResult);
    $secondPrompt = "Based on this raw database result: {$dbResultString}\n" .
                    "Generate a short, friendly, and natural language response to the user's original question: '{$userMessage}'.\n" .
                    "The response MUST be in the same language as the original question (Sinhala or English).\n" .
                    "Do not mention the database or raw JSON in your response.";
                    
    $finalResponse = callGemini($secondPrompt, $api_key);
    
    echo json_encode([
        "success" => true,
        "response" => $finalResponse,
        "debug_intent" => $intent, 
        "debug_db_result" => $dbResult 
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "An error occurred while processing the request.",
        "details" => $e->getMessage()
    ]);
}
?>
