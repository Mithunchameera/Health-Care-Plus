<?php
/**
 * Admin Messages API
 * Handles retrieval and management of contact messages for admin dashboard
 */

require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $query = $_GET;
    
    switch ($method) {
        case 'GET':
            if (isset($query['action'])) {
                switch ($query['action']) {
                    case 'list':
                        echo json_encode(getContactMessages($query));
                        break;
                    case 'get':
                        echo json_encode(getContactMessage($query['id'] ?? ''));
                        break;
                    case 'stats':
                        echo json_encode(getMessageStats());
                        break;
                    default:
                        throw new Exception('Invalid action');
                }
            } else {
                echo json_encode(getContactMessages($query));
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (isset($input['action'])) {
                switch ($input['action']) {
                    case 'mark_read':
                        echo json_encode(markMessageAsRead($input['id'] ?? ''));
                        break;
                    case 'reply':
                        echo json_encode(replyToMessage($input));
                        break;
                    case 'delete':
                        echo json_encode(deleteMessage($input['id'] ?? ''));
                        break;
                    default:
                        throw new Exception('Invalid action');
                }
            }
            break;
            
        default:
            throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Get contact messages with pagination and filtering
 */
function getContactMessages($params = []) {
    $messages_file = __DIR__ . '/data/contact_messages.json';
    
    if (!file_exists($messages_file)) {
        return [
            'success' => true,
            'messages' => [],
            'total' => 0,
            'page' => 1,
            'per_page' => 20
        ];
    }
    
    $messages = json_decode(file_get_contents($messages_file), true) ?: [];
    
    // Sort by timestamp (newest first)
    usort($messages, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });
    
    // Apply filters
    if (isset($params['status']) && $params['status'] !== 'all') {
        $messages = array_filter($messages, function($msg) use ($params) {
            return $msg['status'] === $params['status'];
        });
    }
    
    if (isset($params['priority']) && $params['priority'] !== 'all') {
        $messages = array_filter($messages, function($msg) use ($params) {
            return $msg['priority'] === $params['priority'];
        });
    }
    
    if (isset($params['search']) && !empty($params['search'])) {
        $search = strtolower($params['search']);
        $messages = array_filter($messages, function($msg) use ($search) {
            return strpos(strtolower($msg['from_name']), $search) !== false ||
                   strpos(strtolower($msg['from_email']), $search) !== false ||
                   strpos(strtolower($msg['subject']), $search) !== false ||
                   strpos(strtolower($msg['message']), $search) !== false;
        });
    }
    
    $total = count($messages);
    $page = max(1, intval($params['page'] ?? 1));
    $per_page = max(1, min(100, intval($params['per_page'] ?? 20)));
    $offset = ($page - 1) * $per_page;
    
    $messages = array_slice($messages, $offset, $per_page);
    
    // Add formatted timestamps
    foreach ($messages as &$message) {
        $message['formatted_time'] = formatTimeAgo($message['timestamp']);
        $message['formatted_date'] = date('M j, Y g:i A', strtotime($message['timestamp']));
    }
    
    return [
        'success' => true,
        'messages' => array_values($messages),
        'total' => $total,
        'page' => $page,
        'per_page' => $per_page,
        'total_pages' => ceil($total / $per_page)
    ];
}

/**
 * Get a single contact message
 */
function getContactMessage($id) {
    if (empty($id)) {
        throw new Exception('Message ID is required');
    }
    
    $messages_file = __DIR__ . '/data/contact_messages.json';
    
    if (!file_exists($messages_file)) {
        throw new Exception('Message not found');
    }
    
    $messages = json_decode(file_get_contents($messages_file), true) ?: [];
    
    foreach ($messages as $message) {
        if ($message['id'] === $id) {
            $message['formatted_time'] = formatTimeAgo($message['timestamp']);
            $message['formatted_date'] = date('M j, Y g:i A', strtotime($message['timestamp']));
            return [
                'success' => true,
                'message' => $message
            ];
        }
    }
    
    throw new Exception('Message not found');
}

/**
 * Get message statistics
 */
function getMessageStats() {
    $messages_file = __DIR__ . '/data/contact_messages.json';
    
    if (!file_exists($messages_file)) {
        return [
            'success' => true,
            'stats' => [
                'total' => 0,
                'unread' => 0,
                'replied' => 0,
                'today' => 0,
                'this_week' => 0,
                'by_priority' => [
                    'high' => 0,
                    'medium' => 0,
                    'normal' => 0
                ]
            ]
        ];
    }
    
    $messages = json_decode(file_get_contents($messages_file), true) ?: [];
    
    $stats = [
        'total' => count($messages),
        'unread' => 0,
        'replied' => 0,
        'today' => 0,
        'this_week' => 0,
        'by_priority' => [
            'high' => 0,
            'medium' => 0,
            'normal' => 0
        ]
    ];
    
    $today = date('Y-m-d');
    $week_start = date('Y-m-d', strtotime('monday this week'));
    
    foreach ($messages as $message) {
        // Status counts
        if ($message['status'] === 'unread') {
            $stats['unread']++;
        } elseif ($message['status'] === 'replied') {
            $stats['replied']++;
        }
        
        // Time-based counts
        $msg_date = date('Y-m-d', strtotime($message['timestamp']));
        if ($msg_date === $today) {
            $stats['today']++;
        }
        if ($msg_date >= $week_start) {
            $stats['this_week']++;
        }
        
        // Priority counts
        $priority = $message['priority'] ?? 'normal';
        if (isset($stats['by_priority'][$priority])) {
            $stats['by_priority'][$priority]++;
        }
    }
    
    return [
        'success' => true,
        'stats' => $stats
    ];
}

/**
 * Mark message as read
 */
function markMessageAsRead($id) {
    if (empty($id)) {
        throw new Exception('Message ID is required');
    }
    
    $messages_file = __DIR__ . '/data/contact_messages.json';
    
    if (!file_exists($messages_file)) {
        throw new Exception('Message not found');
    }
    
    $messages = json_decode(file_get_contents($messages_file), true) ?: [];
    $found = false;
    
    foreach ($messages as &$message) {
        if ($message['id'] === $id) {
            $message['status'] = 'read';
            $message['read_at'] = date('Y-m-d H:i:s');
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        throw new Exception('Message not found');
    }
    
    file_put_contents($messages_file, json_encode($messages, JSON_PRETTY_PRINT));
    
    return [
        'success' => true,
        'message' => 'Message marked as read'
    ];
}

/**
 * Reply to message
 */
function replyToMessage($data) {
    $required = ['id', 'reply_message'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }
    
    $messages_file = __DIR__ . '/data/contact_messages.json';
    
    if (!file_exists($messages_file)) {
        throw new Exception('Message not found');
    }
    
    $messages = json_decode(file_get_contents($messages_file), true) ?: [];
    $found = false;
    
    foreach ($messages as &$message) {
        if ($message['id'] === $data['id']) {
            $message['status'] = 'replied';
            $message['reply'] = [
                'message' => $data['reply_message'],
                'replied_by' => 'Admin',
                'replied_at' => date('Y-m-d H:i:s')
            ];
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        throw new Exception('Message not found');
    }
    
    file_put_contents($messages_file, json_encode($messages, JSON_PRETTY_PRINT));
    
    // In a real implementation, send actual email here
    
    return [
        'success' => true,
        'message' => 'Reply sent successfully'
    ];
}

/**
 * Delete message
 */
function deleteMessage($id) {
    if (empty($id)) {
        throw new Exception('Message ID is required');
    }
    
    $messages_file = __DIR__ . '/data/contact_messages.json';
    
    if (!file_exists($messages_file)) {
        throw new Exception('Message not found');
    }
    
    $messages = json_decode(file_get_contents($messages_file), true) ?: [];
    $original_count = count($messages);
    
    $messages = array_filter($messages, function($msg) use ($id) {
        return $msg['id'] !== $id;
    });
    
    if (count($messages) === $original_count) {
        throw new Exception('Message not found');
    }
    
    file_put_contents($messages_file, json_encode(array_values($messages), JSON_PRETTY_PRINT));
    
    return [
        'success' => true,
        'message' => 'Message deleted successfully'
    ];
}

/**
 * Format time ago helper
 */
function formatTimeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) {
        return 'Just now';
    } elseif ($time < 3600) {
        return floor($time / 60) . ' minutes ago';
    } elseif ($time < 86400) {
        return floor($time / 3600) . ' hours ago';
    } elseif ($time < 2592000) {
        return floor($time / 86400) . ' days ago';
    } elseif ($time < 31104000) {
        return floor($time / 2592000) . ' months ago';
    } else {
        return floor($time / 31104000) . ' years ago';
    }
}
?>