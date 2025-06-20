<?php
// Disable error display for JSON responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

session_start();
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Initialize database connection
try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_conversations':
            getConversations();
            break;
        case 'get_messages':
            getMessages();
            break;
        case 'send_message':
            sendMessage();
            break;
        case 'mark_read':
            markMessageRead();
            break;
        case 'get_unread_count':
            getUnreadCount();
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

function getConversations() {
    global $pdo;
    
    $userType = $_SESSION['user_type'] ?? '';
    $userId = $_SESSION['user_id'] ?? 0;
    
    if ($userType === 'patient') {
        // Get conversations with doctors
        $stmt = $pdo->prepare("
            SELECT DISTINCT 
                d.id as doctor_id,
                d.full_name as doctor_name,
                d.specialty,
                d.photo_url,
                m.last_message,
                m.last_message_time,
                m.unread_count
            FROM doctors d
            LEFT JOIN (
                SELECT 
                    CASE 
                        WHEN sender_type = 'patient' THEN receiver_id 
                        ELSE sender_id 
                    END as doctor_id,
                    message as last_message,
                    created_at as last_message_time,
                    COUNT(CASE WHEN is_read = 0 AND receiver_type = 'patient' THEN 1 END) as unread_count
                FROM messages 
                WHERE (sender_id = ? AND sender_type = 'patient') 
                   OR (receiver_id = ? AND receiver_type = 'patient')
                GROUP BY doctor_id
                ORDER BY created_at DESC
            ) m ON d.id = m.doctor_id
            WHERE m.doctor_id IS NOT NULL
            ORDER BY m.last_message_time DESC
        ");
        $stmt->execute([$userId, $userId]);
    } else {
        // Get conversations with patients
        $stmt = $pdo->prepare("
            SELECT DISTINCT 
                p.id as patient_id,
                p.full_name as patient_name,
                p.email,
                p.phone,
                m.last_message,
                m.last_message_time,
                m.unread_count
            FROM patients p
            LEFT JOIN (
                SELECT 
                    CASE 
                        WHEN sender_type = 'doctor' THEN receiver_id 
                        ELSE sender_id 
                    END as patient_id,
                    message as last_message,
                    created_at as last_message_time,
                    COUNT(CASE WHEN is_read = 0 AND receiver_type = 'doctor' THEN 1 END) as unread_count
                FROM messages 
                WHERE (sender_id = ? AND sender_type = 'doctor') 
                   OR (receiver_id = ? AND receiver_type = 'doctor')
                GROUP BY patient_id
                ORDER BY created_at DESC
            ) m ON p.id = m.patient_id
            WHERE m.patient_id IS NOT NULL
            ORDER BY m.last_message_time DESC
        ");
        $stmt->execute([$userId, $userId]);
    }
    
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($conversations);
}

function getMessages() {
    global $pdo;
    
    $otherUserId = $_GET['other_user_id'] ?? 0;
    $otherUserType = $_GET['other_user_type'] ?? '';
    $currentUserId = $_SESSION['user_id'] ?? 0;
    $currentUserType = $_SESSION['user_type'] ?? '';
    
    $stmt = $pdo->prepare("
        SELECT 
            id,
            sender_id,
            sender_type,
            receiver_id,
            receiver_type,
            message,
            message_type,
            attachment_url,
            is_read,
            created_at
        FROM messages 
        WHERE ((sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?)
           OR (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?))
        ORDER BY created_at ASC
    ");
    
    $stmt->execute([
        $currentUserId, $currentUserType, $otherUserId, $otherUserType,
        $otherUserId, $otherUserType, $currentUserId, $currentUserType
    ]);
    
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Mark messages as read
    $readStmt = $pdo->prepare("
        UPDATE messages 
        SET is_read = 1 
        WHERE receiver_id = ? AND receiver_type = ? AND sender_id = ? AND sender_type = ?
    ");
    $readStmt->execute([$currentUserId, $currentUserType, $otherUserId, $otherUserType]);
    
    echo json_encode($messages);
}

function sendMessage() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $senderId = $_SESSION['user_id'] ?? 0;
    $senderType = $_SESSION['user_type'] ?? '';
    $receiverId = $input['receiver_id'] ?? 0;
    $receiverType = $input['receiver_type'] ?? '';
    $message = $input['message'] ?? '';
    $messageType = $input['message_type'] ?? 'text';
    
    if (empty($message) || empty($receiverId) || empty($receiverType)) {
        throw new Exception('Missing required fields');
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, message, message_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([$senderId, $senderType, $receiverId, $receiverType, $message, $messageType]);
    
    $messageId = $pdo->lastInsertId();
    
    // Get the sent message
    $getStmt = $pdo->prepare("SELECT * FROM messages WHERE id = ?");
    $getStmt->execute([$messageId]);
    $sentMessage = $getStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode($sentMessage);
}

function markMessageRead() {
    global $pdo;
    
    $messageId = $_GET['message_id'] ?? 0;
    
    $stmt = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE id = ?");
    $stmt->execute([$messageId]);
    
    echo json_encode(['success' => true]);
}

function getUnreadCount() {
    global $pdo;
    
    $userId = $_SESSION['user_id'] ?? 0;
    $userType = $_SESSION['user_type'] ?? '';
    
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as unread_count 
        FROM messages 
        WHERE receiver_id = ? AND receiver_type = ? AND is_read = 0
    ");
    $stmt->execute([$userId, $userType]);
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($result);
}
?>