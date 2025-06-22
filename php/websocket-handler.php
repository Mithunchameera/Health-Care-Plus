<?php
/**
 * WebSocket Alternative - Server-Sent Events for Real-time Updates
 * Pure PHP implementation replacing WebSocket functionality
 */

require_once 'config.php';
require_once 'database.php';

class RealTimeHandler {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function handleSSE() {
        // Set headers for Server-Sent Events
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        
        // Prevent timeout
        set_time_limit(0);
        
        while (true) {
            // Check for new appointments or updates
            $updates = $this->checkForUpdates();
            
            if (!empty($updates)) {
                echo "data: " . json_encode($updates) . "\n\n";
                ob_flush();
                flush();
            }
            
            // Wait 5 seconds before next check - reduce server load
            sleep(5);
            
            // Check if client disconnected
            if (connection_aborted()) {
                break;
            }
        }
    }
    
    private function checkForUpdates() {
        try {
            // Get recent appointments (last 5 minutes)
            $recent_appointments = $this->db->fetchAll(
                "SELECT a.*, u.first_name, u.last_name 
                 FROM appointments a 
                 JOIN patients p ON a.patient_id = p.id 
                 JOIN users u ON p.user_id = u.id 
                 WHERE a.created_at > NOW() - INTERVAL '5 minutes' 
                 ORDER BY a.created_at DESC 
                 LIMIT 10"
            );
            
            $updates = [];
            
            foreach ($recent_appointments as $appointment) {
                $updates[] = [
                    'type' => 'new_appointment',
                    'data' => $appointment,
                    'timestamp' => time()
                ];
            }
            
            return $updates;
            
        } catch (Exception $e) {
            return [['type' => 'error', 'message' => 'Update check failed']];
        }
    }
    
    public function broadcastUpdate($type, $data) {
        // Store update in database for SSE clients to pick up
        try {
            $this->db->query(
                "INSERT INTO realtime_updates (update_type, update_data, created_at) VALUES (?, ?, NOW())",
                [$type, json_encode($data)]
            );
            
            // Clean old updates (older than 1 hour)
            $this->db->query(
                "DELETE FROM realtime_updates WHERE created_at < NOW() - INTERVAL '1 hour'"
            );
            
        } catch (Exception $e) {
            error_log("Failed to store realtime update: " . $e->getMessage());
        }
    }
}

// Handle SSE requests
if (isset($_GET['stream']) && $_GET['stream'] === 'updates') {
    $handler = new RealTimeHandler();
    $handler->handleSSE();
    exit;
}