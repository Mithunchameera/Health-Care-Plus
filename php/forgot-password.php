<?php
/**
 * Forgot Password Handler
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

if (!$input || !isset($input['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit();
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

try {
    // Check if user exists
    $user = getUserByEmail($email);
    
    if (!$user) {
        // For security, don't reveal if email exists or not
        echo json_encode([
            'success' => true, 
            'message' => 'If an account with this email exists, you will receive a password reset link.'
        ]);
        exit();
    }
    
    // Generate reset token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Store reset token
    if (storePasswordResetToken($user['id'], $token, $expires)) {
        // Send reset email
        $resetLink = getAppUrl() . "/reset-password.html?token=" . $token;
        
        if (sendPasswordResetEmail($email, $user['first_name'], $resetLink)) {
            echo json_encode([
                'success' => true,
                'message' => 'Password reset link sent to your email.'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to send email. Please try again later.'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to generate reset token. Please try again.'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Forgot password error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred. Please try again later.'
    ]);
}

/**
 * Get user by email
 */
function getUserByEmail($email) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = true");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log("Get user by email error: " . $e->getMessage());
        return false;
    }
}

/**
 * Store password reset token
 */
function storePasswordResetToken($userId, $token, $expires) {
    try {
        $pdo = getDBConnection();
        
        // First, create the password_resets table if it doesn't exist
        $createTableSQL = "
        CREATE TABLE IF NOT EXISTS password_resets (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $pdo->exec($createTableSQL);
        
        // Delete any existing tokens for this user
        $deleteStmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $deleteStmt->execute([$userId]);
        
        // Insert new token
        $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
        return $stmt->execute([$userId, $token, $expires]);
        
    } catch (Exception $e) {
        error_log("Store reset token error: " . $e->getMessage());
        return false;
    }
}

/**
 * Send password reset email
 */
function sendPasswordResetEmail($email, $name, $resetLink) {
    // In a real application, you would use a proper mail service
    // For now, we'll simulate email sending and log the details
    
    $subject = "Password Reset - HealthCare+";
    $message = "
    <html>
    <head>
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>HealthCare+ Password Reset</h1>
            </div>
            <div class='content'>
                <h2>Hello {$name},</h2>
                <p>We received a request to reset your password for your HealthCare+ account.</p>
                <p>Click the button below to reset your password:</p>
                <a href='{$resetLink}' class='button'>Reset Password</a>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style='word-break: break-all;'>{$resetLink}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
            </div>
            <div class='footer'>
                <p>&copy; 2024 HealthCare+. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // For development/demo purposes, log the email details
    error_log("Password Reset Email Details:");
    error_log("To: " . $email);
    error_log("Subject: " . $subject);
    error_log("Reset Link: " . $resetLink);
    
    // In production, uncomment and configure this with proper SMTP settings
    /*
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: " . FROM_EMAIL . "\r\n";
    
    return mail($email, $subject, $message, $headers);
    */
    
    // For demo purposes, always return true
    return true;
}

/**
 * Get application URL
 */
function getAppUrl() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost:5000';
    return $protocol . '://' . $host;
}
?>