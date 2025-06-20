<?php
/**
 * Contact Form Handler
 * Processes contact form submissions and stores them as admin messages
 */

require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = ['name', 'email', 'subject', 'message'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }
    
    // Sanitize inputs
    $name = trim(htmlspecialchars($input['name']));
    $email = trim(filter_var($input['email'], FILTER_SANITIZE_EMAIL));
    $phone = isset($input['phone']) ? trim(htmlspecialchars($input['phone'])) : '';
    $subject = trim(htmlspecialchars($input['subject']));
    $message = trim(htmlspecialchars($input['message']));
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }
    
    // Generate unique message ID
    $message_id = 'MSG-' . date('Ymd') . '-' . sprintf('%06d', rand(100000, 999999));
    
    // Create contact message data
    $contact_data = [
        'id' => $message_id,
        'type' => 'contact',
        'from_name' => $name,
        'from_email' => $email,
        'from_phone' => $phone,
        'subject' => $subject,
        'message' => $message,
        'status' => 'unread',
        'priority' => getPriority($subject),
        'timestamp' => date('Y-m-d H:i:s'),
        'created_at' => time(),
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    // Store message in mock storage
    if (storeContactMessage($contact_data)) {
        // Send auto-reply email notification (simulated)
        $auto_reply = [
            'to' => $email,
            'subject' => 'Thank you for contacting HealthCare+',
            'message' => "Dear $name,\n\nThank you for reaching out to us. We have received your message regarding: $subject\n\nOur team will review your inquiry and respond within 24 hours.\n\nMessage ID: $message_id\n\nBest regards,\nHealthCare+ Support Team"
        ];
        
        // In a real implementation, you would send actual email here
        // mail($auto_reply['to'], $auto_reply['subject'], $auto_reply['message']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Your message has been sent successfully!',
            'message_id' => $message_id,
            'auto_reply_sent' => true
        ]);
        
    } else {
        throw new Exception('Failed to store message');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Store contact message in mock storage
 */
function storeContactMessage($data) {
    $messages_file = __DIR__ . '/data/contact_messages.json';
    
    // Ensure data directory exists
    if (!is_dir(__DIR__ . '/data')) {
        mkdir(__DIR__ . '/data', 0755, true);
    }
    
    // Load existing messages
    $messages = [];
    if (file_exists($messages_file)) {
        $messages = json_decode(file_get_contents($messages_file), true) ?: [];
    }
    
    // Add new message
    $messages[] = $data;
    
    // Keep only latest 1000 messages
    if (count($messages) > 1000) {
        $messages = array_slice($messages, -1000);
    }
    
    // Save messages
    return file_put_contents($messages_file, json_encode($messages, JSON_PRETTY_PRINT)) !== false;
}

/**
 * Determine message priority based on subject
 */
function getPriority($subject) {
    $high_priority = ['support', 'billing', 'urgent', 'emergency'];
    $medium_priority = ['partnership', 'business'];
    
    $subject_lower = strtolower($subject);
    
    foreach ($high_priority as $keyword) {
        if (strpos($subject_lower, $keyword) !== false) {
            return 'high';
        }
    }
    
    foreach ($medium_priority as $keyword) {
        if (strpos($subject_lower, $keyword) !== false) {
            return 'medium';
        }
    }
    
    return 'normal';
}
?>