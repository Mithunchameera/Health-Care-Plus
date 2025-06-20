<?php
/**
 * Messaging API Endpoints
 * Handles messaging and communication functionality
 */

require_once 'config.php';
require_once 'database.php';

// Set CORS headers
setCORSHeaders();

// Initialize session
initializeSessionConfig();
session_start();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'get_conversations':
        getConversations();
        break;
    case 'get_unread_count':
        getUnreadCount();
        break;
    case 'get_messages':
        getMessages();
        break;
    case 'send_message':
        sendMessage();
        break;
    case 'mark_as_read':
        markAsRead();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function getConversations() {
    try {
        // Mock conversations data for demo environment
        $conversations = [
            [
                'id' => 1,
                'other_user_name' => 'Dr. Sarah Johnson',
                'other_user_type' => 'doctor',
                'last_message' => 'Please continue taking your medication as prescribed and schedule a follow-up in 2 weeks.',
                'last_message_time' => '2025-06-20 10:30:00',
                'unread_count' => 0
            ],
            [
                'id' => 2,
                'other_user_name' => 'Dr. Michael Chen',
                'other_user_type' => 'doctor',
                'last_message' => 'Your test results look good. No immediate concerns, but we should monitor your blood pressure.',
                'last_message_time' => '2025-06-19 14:15:00',
                'unread_count' => 1
            ],
            [
                'id' => 3,
                'other_user_name' => 'Healthcare+ Support',
                'other_user_type' => 'admin',
                'last_message' => 'Your appointment has been confirmed for June 25th at 10:00 AM with Dr. Johnson.',
                'last_message_time' => '2025-06-18 16:45:00',
                'unread_count' => 0
            ]
        ];
        
        header('Content-Type: application/json');
        echo json_encode($conversations);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load conversations']);
    }
}

function getUnreadCount() {
    try {
        // Mock unread count for demo environment
        $unreadCount = 1;
        
        header('Content-Type: application/json');
        echo json_encode(['unread_count' => $unreadCount]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get unread count']);
    }
}

function getMessages() {
    try {
        $conversationId = $_GET['conversation_id'] ?? '';
        
        if (empty($conversationId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Conversation ID required']);
            return;
        }
        
        // Mock messages data for demo environment
        $messages = [
            [
                'id' => 1,
                'sender_name' => 'Dr. Michael Chen',
                'sender_type' => 'doctor',
                'message' => 'Hello! I wanted to follow up on your recent visit. How are you feeling?',
                'timestamp' => '2025-06-19 14:00:00',
                'is_read' => true
            ],
            [
                'id' => 2,
                'sender_name' => 'John Doe',
                'sender_type' => 'patient',
                'message' => 'Hi Dr. Chen, I\'m feeling much better. The medication you prescribed is working well.',
                'timestamp' => '2025-06-19 14:05:00',
                'is_read' => true
            ],
            [
                'id' => 3,
                'sender_name' => 'Dr. Michael Chen',
                'sender_type' => 'doctor',
                'message' => 'That\'s great to hear! Your test results look good. No immediate concerns, but we should monitor your blood pressure.',
                'timestamp' => '2025-06-19 14:15:00',
                'is_read' => false
            ]
        ];
        
        header('Content-Type: application/json');
        echo json_encode($messages);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load messages']);
    }
}

function sendMessage() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $message = $input['message'] ?? '';
        $conversationId = $input['conversation_id'] ?? '';
        
        if (empty($message) || empty($conversationId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Message and conversation ID required']);
            return;
        }
        
        // In a real implementation, save message to database
        // For demo, just return success
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message_id' => rand(1000, 9999),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send message']);
    }
}

function markAsRead() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $messageId = $input['message_id'] ?? '';
        
        if (empty($messageId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Message ID required']);
            return;
        }
        
        // In a real implementation, update message status in database
        // For demo, just return success
        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to mark message as read']);
    }
}
?>