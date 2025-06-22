<?php
/**
 * Appointment Status API - Real-time Status Management
 * Handles appointment status updates and broadcasting
 */

require_once 'config.php';
require_once 'database.php';
require_once 'websocket-handler.php';
require_once 'performance-optimization.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class AppointmentStatusAPI {
    private $db;
    private $realTimeHandler;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->realTimeHandler = new RealTimeHandler();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                $this->getAppointmentStatuses();
                break;
            case 'POST':
                $this->updateAppointmentStatus();
                break;
            case 'PUT':
                $this->bulkUpdateStatuses();
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
        }
    }
    
    private function getAppointmentStatuses() {
        try {
            $user_id = $_GET['user_id'] ?? null;
            $role = $_GET['role'] ?? null;
            
            if (!$user_id || !$role) {
                throw new Exception('User ID and role required');
            }
            
            $sql = "
                SELECT 
                    a.id,
                    a.status,
                    a.appointment_date,
                    a.appointment_time,
                    a.booking_reference,
                    a.payment_status,
                    a.updated_at,
                    CASE 
                        WHEN a.status = 'scheduled' AND a.appointment_date = CURRENT_DATE AND a.appointment_time <= CURRENT_TIME + INTERVAL '30 minutes' THEN 'upcoming'
                        WHEN a.status = 'scheduled' AND a.appointment_date < CURRENT_DATE THEN 'overdue'
                        ELSE a.status
                    END as display_status,
                    pd.first_name as patient_name,
                    pd.last_name as patient_surname,
                    dd.first_name as doctor_name,
                    dd.last_name as doctor_surname,
                    doc.specialty
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                JOIN users pd ON p.user_id = pd.id
                JOIN doctors doc ON a.doctor_id = doc.id
                JOIN users dd ON doc.user_id = dd.id
            ";
            
            $params = [];
            
            if ($role === 'patient') {
                $sql .= " WHERE pd.id = ?";
                $params[] = $user_id;
            } elseif ($role === 'doctor') {
                $sql .= " WHERE dd.id = ?";
                $params[] = $user_id;
            } elseif ($role === 'admin') {
                // Admin can see all appointments
            } else {
                throw new Exception('Invalid role');
            }
            
            $sql .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC";
            
            $appointments = $this->db->fetchAll($sql, $params);
            
            // Add real-time status indicators
            foreach ($appointments as &$appointment) {
                $appointment['status_indicator'] = $this->getStatusIndicator($appointment);
                $appointment['can_update'] = $this->canUpdateStatus($appointment, $role);
                $appointment['next_actions'] = $this->getNextActions($appointment, $role);
            }
            
            optimizeAjaxResponse([
                'success' => true,
                'appointments' => $appointments,
                'timestamp' => time()
            ]);
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    
    private function updateAppointmentStatus() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $appointment_id = $input['appointment_id'] ?? null;
            $new_status = $input['status'] ?? null;
            $user_id = $input['user_id'] ?? null;
            $role = $input['role'] ?? null;
            $notes = $input['notes'] ?? '';
            
            if (!$appointment_id || !$new_status || !$user_id || !$role) {
                throw new Exception('Missing required fields');
            }
            
            // Validate status transition
            $current_appointment = $this->db->fetchOne(
                "SELECT * FROM appointments WHERE id = ?",
                [$appointment_id]
            );
            
            if (!$current_appointment) {
                throw new Exception('Appointment not found');
            }
            
            if (!$this->isValidStatusTransition($current_appointment['status'], $new_status, $role)) {
                throw new Exception('Invalid status transition');
            }
            
            // Update appointment status
            $this->db->beginTransaction();
            
            $updated_rows = $this->db->update(
                "UPDATE appointments SET status = ?, notes = ?, updated_at = NOW() WHERE id = ?",
                [$new_status, $notes, $appointment_id]
            );
            
            if ($updated_rows === 0) {
                throw new Exception('Failed to update appointment');
            }
            
            // Log status change
            $this->db->query(
                "INSERT INTO appointment_status_log (appointment_id, old_status, new_status, changed_by, changed_at, notes) VALUES (?, ?, ?, ?, NOW(), ?)",
                [$appointment_id, $current_appointment['status'], $new_status, $user_id, $notes]
            );
            
            $this->db->commit();
            
            // Broadcast real-time update
            $updated_appointment = $this->getAppointmentDetails($appointment_id);
            $this->realTimeHandler->broadcastUpdate('appointment_status_change', [
                'appointment_id' => $appointment_id,
                'old_status' => $current_appointment['status'],
                'new_status' => $new_status,
                'appointment' => $updated_appointment,
                'changed_by' => $user_id,
                'timestamp' => time()
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Appointment status updated successfully',
                'appointment' => $updated_appointment
            ]);
            
        } catch (Exception $e) {
            $this->db->rollback();
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    
    private function getStatusIndicator($appointment) {
        $status = $appointment['display_status'];
        $indicators = [
            'scheduled' => ['color' => '#3b82f6', 'icon' => 'clock', 'pulse' => false],
            'confirmed' => ['color' => '#22c55e', 'icon' => 'check-circle', 'pulse' => false],
            'upcoming' => ['color' => '#f59e0b', 'icon' => 'bell', 'pulse' => true],
            'completed' => ['color' => '#10b981', 'icon' => 'check-circle-2', 'pulse' => false],
            'cancelled' => ['color' => '#ef4444', 'icon' => 'x-circle', 'pulse' => false],
            'no_show' => ['color' => '#6b7280', 'icon' => 'user-x', 'pulse' => false],
            'overdue' => ['color' => '#dc2626', 'icon' => 'alert-triangle', 'pulse' => true]
        ];
        
        return $indicators[$status] ?? $indicators['scheduled'];
    }
    
    private function canUpdateStatus($appointment, $role) {
        $current_status = $appointment['status'];
        $valid_transitions = [
            'doctor' => [
                'scheduled' => ['confirmed', 'cancelled'],
                'confirmed' => ['completed', 'no_show', 'cancelled'],
                'completed' => [],
                'cancelled' => [],
                'no_show' => []
            ],
            'patient' => [
                'scheduled' => ['cancelled'],
                'confirmed' => ['cancelled'],
                'completed' => [],
                'cancelled' => [],
                'no_show' => []
            ],
            'admin' => [
                'scheduled' => ['confirmed', 'cancelled'],
                'confirmed' => ['completed', 'no_show', 'cancelled'],
                'completed' => ['cancelled'],
                'cancelled' => ['scheduled'],
                'no_show' => ['scheduled']
            ]
        ];
        
        return isset($valid_transitions[$role][$current_status]) && 
               !empty($valid_transitions[$role][$current_status]);
    }
    
    private function getNextActions($appointment, $role) {
        $status = $appointment['status'];
        $actions = [];
        
        if ($role === 'doctor') {
            switch ($status) {
                case 'scheduled':
                    $actions = ['confirm', 'cancel'];
                    break;
                case 'confirmed':
                    $actions = ['complete', 'mark_no_show', 'cancel'];
                    break;
            }
        } elseif ($role === 'patient') {
            if (in_array($status, ['scheduled', 'confirmed'])) {
                $actions = ['cancel'];
            }
        } elseif ($role === 'admin') {
            $actions = ['edit', 'cancel', 'reschedule'];
        }
        
        return $actions;
    }
    
    private function isValidStatusTransition($current_status, $new_status, $role) {
        $valid_transitions = [
            'doctor' => [
                'scheduled' => ['confirmed', 'cancelled'],
                'confirmed' => ['completed', 'no_show', 'cancelled']
            ],
            'patient' => [
                'scheduled' => ['cancelled'],
                'confirmed' => ['cancelled']
            ],
            'admin' => [
                'scheduled' => ['confirmed', 'cancelled'],
                'confirmed' => ['completed', 'no_show', 'cancelled'],
                'completed' => ['cancelled'],
                'cancelled' => ['scheduled'],
                'no_show' => ['scheduled']
            ]
        ];
        
        return isset($valid_transitions[$role][$current_status]) &&
               in_array($new_status, $valid_transitions[$role][$current_status]);
    }
    
    private function getAppointmentDetails($appointment_id) {
        return $this->db->fetchOne("
            SELECT 
                a.*,
                pd.first_name as patient_name,
                pd.last_name as patient_surname,
                dd.first_name as doctor_name,
                dd.last_name as doctor_surname,
                doc.specialty
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN users pd ON p.user_id = pd.id
            JOIN doctors doc ON a.doctor_id = doc.id
            JOIN users dd ON doc.user_id = dd.id
            WHERE a.id = ?
        ", [$appointment_id]);
    }
}

// Create status log table if it doesn't exist
try {
    $db = Database::getInstance();
    $db->query("CREATE TABLE IF NOT EXISTS appointment_status_log (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        old_status VARCHAR(20),
        new_status VARCHAR(20),
        changed_by INTEGER REFERENCES users(id),
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
    )");
} catch (Exception $e) {
    error_log("Failed to create status log table: " . $e->getMessage());
}

$api = new AppointmentStatusAPI();
$api->handleRequest();