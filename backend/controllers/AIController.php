<?php
require_once __DIR__ . '/../models/AI.php';
// if ai_config.php exists, it might define GEMINI_API_KEY
if (file_exists(__DIR__ . '/../config/ai_config.php')) {
    require_once __DIR__ . '/../config/ai_config.php';
}

class AIController {
    private $aiModel;
    private $apiKey;

    public function __construct() {
        $this->aiModel = new AI();
        // default or loaded from config
        $this->apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : "YOUR_API_KEY_HERE";
    }

    private function callGemini($prompt, $apiKey, $model = "gemini-2.5-flash") {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $apiKey;
        
        $payload = [
            "contents" => [
                [
                    "parts" => [
                        ["text" => $prompt]
                    ]
                ]
            ]
        ];

        // If we want JSON specifically for analytics
        if ($model === "gemini-1.5-flash-8b") {
            $payload["generationConfig"] = [
                "temperature" => 0.1,
                "responseMimeType" => "application/json"
            ];
        }

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
        
        if (isset($result['error'])) {
            throw new Exception("Gemini API Error: " . $result['error']['message']);
        }
        
        if(isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            return $result['candidates'][0]['content']['parts'][0]['text'];
        }
        
        throw new Exception("Unexpected response format from Gemini API: " . $response);
    }

    private function extractJsonFromMarkdown($text) {
        $text = trim($text);
        if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $text, $matches)) {
            return $matches[1];
        }
        return $text;
    }

    // handle AI chat logic
    public function handleChat($inputData) {
        $userMessage = $inputData->message ?? null;

        if (!$userMessage) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Message is required"]);
            return;
        }

        try {
            // FIRST GEMINI CALL - intent
            $firstPrompt = "You are an intent classification system for a pharmacy database. " .
                           "Analyze the following user message: '{$userMessage}'\n" .
                           "Identify the 'Intent' which MUST be exactly either 'Stock Check', 'Top Selling', or 'General Chat'. " .
                           "Also extract the 'Medicine Name' if applicable. " .
                           "Return ONLY a valid JSON object with keys 'Intent' and 'Medicine Name' (set to null if not applicable). Do not include any other text.";
            
            $intentResultRaw = $this->callGemini($firstPrompt, $this->apiKey, "gemini-2.5-flash");
            $intentResultClean = $this->extractJsonFromMarkdown($intentResultRaw);
            $intentData = json_decode($intentResultClean, true);
            
            $intent = $intentData['Intent'] ?? null;
            $medicineName = $intentData['Medicine Name'] ?? null;
            
            $dbResult = [];
            
            // Database query based on intent
            try {
                if ($intent === "Stock Check" && $medicineName) {
                    $dbResult = $this->aiModel->getStockByName($medicineName);
                } 
                elseif ($intent === "Top Selling") {
                    $dbResult = $this->aiModel->getTopSellingMedicines();
                }
                elseif ($intent === "General Chat") {
                    $dbResult = ["status" => "No database query needed for general conversation."];
                } 
                else {
                    $dbResult = ["error" => "Could not determine a valid database query for this request."];
                }
            } catch (Exception $e) {
                $dbResult = ["database_error" => "The database query failed: " . $e->getMessage()];
            }
            
            // SECOND GEMINI CALL - natural response
            $dbResultString = json_encode($dbResult);
            $secondPrompt = "Based on this raw database result: {$dbResultString}\n" .
                            "Generate a short, friendly, and natural language response to the user's original question: '{$userMessage}'.\n" .
                            "The response MUST be in the same language as the original question (Sinhala or English).\n" .
                            "Do not mention the database or raw JSON in your response.";
                            
            $finalResponse = $this->callGemini($secondPrompt, $this->apiKey, "gemini-2.5-flash");
            
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
    }

    // handle AI sales analytics
    public function handleSalesAnalytics($supplierId) {
        if ($this->apiKey === 'YOUR_API_KEY_HERE' || empty($this->apiKey)) {
            echo json_encode(["success" => false, "error" => "API_KEY_MISSING", "message" => "Please configure your Gemini API Key in backend/config/ai_config.php"]);
            return;
        }

        try {
            $historicalData = $this->aiModel->getHistoricalSales($supplierId);

            foreach ($historicalData as &$row) {
                $row['sales'] = (float)$row['sales'];
            }

            if (empty($historicalData)) {
                $historicalData = [
                    ["name" => "Jan 2026", "sales" => 12000],
                    ["name" => "Feb 2026", "sales" => 15000],
                    ["name" => "Mar 2026", "sales" => 14000],
                    ["name" => "Apr 2026", "sales" => 18000],
                    ["name" => "May 2026", "sales" => 21000]
                ];
            }

            // Prepare Prompt for Gemini API
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

            // Call Gemini API
            $textResponse = $this->callGemini($prompt, $this->apiKey, "gemini-1.5-flash-8b");
            
            $textResponse = preg_replace('/```json\s*/', '', $textResponse);
            $textResponse = preg_replace('/```\s*/', '', $textResponse);
            
            $aiResult = json_decode(trim($textResponse), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Failed to parse AI JSON response.");
            }

            // Merge historical and predicted data for the graph
            $chartData = $historicalData;
            
            if (isset($aiResult['predictions']) && is_array($aiResult['predictions'])) {
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
    }
}
?>
