<?php
$api_key = "YOUR_API_KEY_HERE";
$ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models?key=" . $api_key);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo "CURL ERROR: " . curl_error($ch);
    curl_close($ch);
    exit;
}
curl_close($ch);

$data = json_decode($response, true);
if (isset($data['models'])) {
    foreach ($data['models'] as $model) {
        $name = $model['name'];
        $methods = implode(', ', $model['supportedGenerationMethods'] ?? []);
        if (strpos($name, 'gemini') !== false && strpos($methods, 'generateContent') !== false) {
            echo $name . "\n";
        }
    }
} else {
    echo $response;
}
?>
