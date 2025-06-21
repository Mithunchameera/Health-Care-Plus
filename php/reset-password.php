<?php
/**
 * Reset Password Handler
 * HealthCare+ E-Channelling System
 */

require_once 'config.php';

// Database connection function for compatibility
function getDBConnection() {
    try {
        $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        throw new Exception("Database connection failed");
    }
}

// Set CORS headers
setCORSHeaders();

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['token']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Token and password are required']);
    exit();
}

$token = $input['token'];
$password = $input['password'];

// Validate password
if (strlen($password) < PASSWORD_MIN_LENGTH) {
    echo json_encode([
        'success' => false, 
        'message' => 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long'
    ]);
    exit();
}

try {
    // Verify reset token
    $resetData = getPasswordResetData($token);
    
    if (!$resetData) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired reset token'
        ]);
        exit();
    }
    
    // Check if token has expired
    if (strtotime($resetData['expires_at']) < time()) {
        echo json_encode([
            'success' => false,
            'message' => 'Reset token has expired. Please request a new one.'
        ]);
        exit();
    }
    
    // Check if token has already been used
    if ($resetData['used']) {
        echo json_encode([
            'success' => false,
            'message' => 'Reset token has already been used'
        ]);
        exit();
    }
    
    // Update user password
    if (updateUserPassword($resetData['user_id'], $password)) {
        // Mark token as used
        markTokenAsUsed($resetData['id']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update password. Please try again.'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Reset password error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred. Please try again later.'
    ]);
}

/**
 * Get password reset data by token
 */
function getPasswordResetData($token) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("
            SELECT pr.*, u.email, u.first_name 
            FROM password_resets pr
            JOIN users u ON pr.user_id = u.id
            WHERE pr.token = ? AND u.is_active = true
        ");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log("Get reset data error: " . $e->getMessage());
        return false;
    }
}

/**
 * Update user password
 */
function updateUserPassword($userId, $password) {
    try {
        $pdo = getDBConnection();
        
        // Hash the password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Update password and updated_at timestamp
        $stmt = $pdo->prepare("
            UPDATE users 
            SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        
        return $stmt->execute([$passwordHash, $userId]);
        
    } catch (Exception $e) {
        error_log("Update password error: " . $e->getMessage());
        return false;
    }
}

/**
 * Mark reset token as used
 */
function markTokenAsUsed($resetId) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("UPDATE password_resets SET used = true WHERE id = ?");
        return $stmt->execute([$resetId]);
    } catch (Exception $e) {
        error_log("Mark token used error: " . $e->getMessage());
        return false;
    }
}
?>