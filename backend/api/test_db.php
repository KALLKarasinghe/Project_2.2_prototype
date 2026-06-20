<?php
// 1. ඔයාගේ database.php ෆයිල් එක include කරගන්න
// (ෆයිල් එක තියෙන තැන අනුව path එක වෙනස් කරගන්න - උදා: 'config/database.php')
require_once __DIR__ . '/../config/database.php'; 

try {
    // 2. Class එකෙන් අලුත් Object එකක් හදනවා
    $database = new Database();
    
    // 3. getConnection() එක රන් කරලා බලනවා
    $dbConnection = $database->getConnection();
    
    if ($dbConnection) {
        echo "<br><span style='color: green; font-weight: bold;'>✔ සාර්ථකයි! ඩේටාබේස් එක සාර්ථකව කනෙක්ට් වුණා.</span>";
    } else {
        echo "<br><span style='color: red; font-weight: bold;'>❌ අවුලක්! කනෙක්ෂන් එක null ආවා.</span>";
    }

} catch (Exception $e) {
    echo "<br>ලෙඩක් අහුවුණා: " . $e->getMessage();
}
?>