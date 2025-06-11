<?php
/**
 * Booking Handler
 * Manages appointment booking, time slot management, and appointment operations
 */

require_once 'config.php';
require_once 'session-handler.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class BookingHandler {
    private $db;
    private $sessionHandler;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->sessionHandler = new CustomSessionHandler();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            $this->handleGetRequest();
        } elseif ($method === 'POST') {
            $this->handlePostRequest();
        } else {
            sendResponse(['error' => 'Method not allowed'], 405);
        }
    }
    
    private function handleGetRequest() {
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'getSlots':
                $this->getAvailableSlots();
                break;
            case 'getAppointments':
                $this->getUserAppointments();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function handlePostRequest() {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? $_POST['action'] ?? '';
        
        switch ($action) {
            case 'createBooking':
                $this->createBooking($input);
                break;
            case 'cancelBooking':
                $this->cancelBooking($input);
                break;
            case 'updateBooking':
                $this->updateBooking($input);
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function getAvailableSlots() {
        try {
            $doctorId = (int)($_GET['doctor'] ?? 0);
            $date = $_GET['date'] ?? '';
            
            if (!$doctorId || !$date) {
                sendResponse(['error' => 'Doctor ID and date are required'], 400);
            }
            
            // Validate date format
            $dateObj = DateTime::createFromFormat('Y-m-d', $date);
            if (!$dateObj || $dateObj->format('Y-m-d') !== $date) {
                sendResponse(['error' => 'Invalid date format. Use YYYY-MM-DD'], 400);
            }
            
            // Check if date is not in the past
            $today = new DateTime();
            $today->setTime(0, 0, 0);
            if ($dateObj < $today) {
                sendResponse(['error' => 'Cannot book appointments for past dates'], 400);
            }
            
            // Check if doctor exists
            $stmt = $this->db->prepare("SELECT id, name FROM doctors WHERE id = ?");
            $stmt->execute([$doctorId]);
            $doctor = $stmt->fetch();
            
            if (!$doctor) {
                sendResponse(['error' => 'Doctor not found'], 404);
            }
            
            // Get available time slots
            $stmt = $this->db->prepare("
                SELECT time, is_available, 
                       CASE WHEN appointment_id IS NULL THEN 1 ELSE 0 END as available
                FROM time_slots 
                WHERE doctor_id = ? AND date = ? 
                ORDER BY time
            ");
            $stmt->execute([$doctorId, $date]);
            $slots = $stmt->fetchAll();
            
            // If no slots exist for this date, generate them
            if (empty($slots)) {
                $this->generateSlotsForDate($doctorId, $date);
                
                // Fetch slots again
                $stmt->execute([$doctorId, $date]);
                $slots = $stmt->fetchAll();
            }
            
            // Format time slots
            $formattedSlots = array_map(function($slot) {
                return [
                    'time' => date('H:i', strtotime($slot['time'])),
                    'available' => (bool)$slot['available']
                ];
            }, $slots);
            
            sendResponse([
                'success' => true,
                'doctor' => $doctor,
                'date' => $date,
                'slots' => $formattedSlots
            ]);
            
        } catch (Exception $e) {
            logError("Error getting available slots: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load available slots'], 500);
        }
    }
    
    private function generateSlotsForDate($doctorId, $date) {
        $workingHours = [
            '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00',
            '14:00:00', '14:30:00', '15:00:00', '15:30:00', '16:00:00', '16:30:00',
            '17:00:00', '17:30:00'
        ];
        
        $stmt = $this->db->prepare("
            INSERT INTO time_slots (doctor_id, date, time, is_available) 
            VALUES (?, ?, ?, TRUE)
            ON CONFLICT (doctor_id, date, time) DO NOTHING
        ");
        
        foreach ($workingHours as $time) {
            $stmt->execute([$doctorId, $date, $time]);
        }
    }
    
    private function createBooking($data) {
        try {
            // Validate required fields
            $requiredFields = [
                'doctorId', 'date', 'time', 'patientName', 'patientAge', 
                'patientGender', 'patientPhone', 'patientEmail'
            ];
            
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty(trim($data[$field]))) {
                    sendResponse(['error' => "Field '{$field}' is required"], 400);
                }
            }
            
            // Sanitize input
            $doctorId = (int)$data['doctorId'];
            $date = $data['date'];
            $time = $data['time'];
            $patientName = sanitizeInput($data['patientName']);
            $patientAge = (int)$data['patientAge'];
            $patientGender = sanitizeInput($data['patientGender']);
            $patientPhone = sanitizeInput($data['patientPhone']);
            $patientEmail = sanitizeInput($data['patientEmail']);
            $symptoms = sanitizeInput($data['symptoms'] ?? '');
            $medicalHistory = sanitizeInput($data['medicalHistory'] ?? '');
            
            // Validate input
            if (!validateEmail($patientEmail)) {
                sendResponse(['error' => 'Invalid email address'], 400);
            }
            
            if (!validatePhone($patientPhone)) {
                sendResponse(['error' => 'Invalid phone number'], 400);
            }
            
            if ($patientAge < 1 || $patientAge > 120) {
                sendResponse(['error' => 'Invalid age'], 400);
            }
            
            if (!in_array($patientGender, ['male', 'female', 'other'])) {
                sendResponse(['error' => 'Invalid gender'], 400);
            }
            
            // Validate date and time
            $appointmentDateTime = DateTime::createFromFormat('Y-m-d H:i', $date . ' ' . $time);
            if (!$appointmentDateTime) {
                sendResponse(['error' => 'Invalid date or time format'], 400);
            }
            
            // Check if appointment is not in the past
            if ($appointmentDateTime <= new DateTime()) {
                sendResponse(['error' => 'Cannot book appointments in the past'], 400);
            }
            
            // Start transaction
            $this->db->beginTransaction();
            
            try {
                // Check if doctor exists and is available
                $stmt = $this->db->prepare("SELECT id, name, available FROM doctors WHERE id = ?");
                $stmt->execute([$doctorId]);
                $doctor = $stmt->fetch();
                
                if (!$doctor) {
                    throw new Exception('Doctor not found');
                }
                
                if (!$doctor['available']) {
                    throw new Exception('Doctor is currently not available for bookings');
                }
                
                // Check if time slot is available
                $stmt = $this->db->prepare("
                    SELECT id FROM time_slots 
                    WHERE doctor_id = ? AND date = ? AND time = ? AND appointment_id IS NULL
                ");
                $stmt->execute([$doctorId, $date, $time]);
                $slot = $stmt->fetch();
                
                if (!$slot) {
                    throw new Exception('Selected time slot is not available');
                }
                
                // Generate booking ID
                $bookingId = generateBookingId();
                
                // Get current user if logged in
                $sessionId = $_COOKIE['session_id'] ?? '';
                $userId = null;
                if ($sessionId) {
                    $sessionData = $this->sessionHandler->getSession($sessionId);
                    if ($sessionData) {
                        $userId = $sessionData['id'];
                    }
                }
                
                // Create appointment
                $stmt = $this->db->prepare("
                    INSERT INTO appointments (
                        booking_id, user_id, doctor_id, appointment_date, appointment_time,
                        patient_name, patient_age, patient_gender, patient_phone, patient_email,
                        symptoms, medical_history, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                ");
                
                $stmt->execute([
                    $bookingId, $userId, $doctorId, $date, $time,
                    $patientName, $patientAge, $patientGender, $patientPhone, $patientEmail,
                    $symptoms, $medicalHistory
                ]);
                
                $appointmentId = $this->db->lastInsertId();
                
                // Update time slot
                $stmt = $this->db->prepare("
                    UPDATE time_slots SET appointment_id = ?, is_available = FALSE 
                    WHERE id = ?
                ");
                $stmt->execute([$appointmentId, $slot['id']]);
                
                // Commit transaction
                $this->db->commit();
                
                // Send confirmation (in real app, you might send email/SMS)
                $this->sendBookingConfirmation($bookingId, $patientEmail, $doctor['name'], $date, $time);
                
                sendResponse([
                    'success' => true,
                    'message' => 'Appointment booked successfully',
                    'bookingId' => $bookingId,
                    'appointmentId' => $appointmentId
                ]);
                
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
            
        } catch (Exception $e) {
            logError("Booking creation error: " . $e->getMessage());
            sendResponse(['error' => $e->getMessage()], 400);
        }
    }
    
    private function cancelBooking($data) {
        try {
            $bookingId = sanitizeInput($data['bookingId'] ?? '');
            
            if (empty($bookingId)) {
                sendResponse(['error' => 'Booking ID is required'], 400);
            }
            
            // Start transaction
            $this->db->beginTransaction();
            
            try {
                // Get appointment details
                $stmt = $this->db->prepare("
                    SELECT id, doctor_id, appointment_date, appointment_time, status 
                    FROM appointments WHERE booking_id = ?
                ");
                $stmt->execute([$bookingId]);
                $appointment = $stmt->fetch();
                
                if (!$appointment) {
                    throw new Exception('Appointment not found');
                }
                
                if ($appointment['status'] === 'cancelled') {
                    throw new Exception('Appointment is already cancelled');
                }
                
                if ($appointment['status'] === 'completed') {
                    throw new Exception('Cannot cancel completed appointment');
                }
                
                // Check if appointment is at least 24 hours in the future
                $appointmentDateTime = new DateTime($appointment['appointment_date'] . ' ' . $appointment['appointment_time']);
                $now = new DateTime();
                $hoursDiff = ($appointmentDateTime->getTimestamp() - $now->getTimestamp()) / 3600;
                
                if ($hoursDiff < 24) {
                    throw new Exception('Appointments can only be cancelled at least 24 hours in advance');
                }
                
                // Update appointment status
                $stmt = $this->db->prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?");
                $stmt->execute([$appointment['id']]);
                
                // Free up the time slot
                $stmt = $this->db->prepare("
                    UPDATE time_slots SET appointment_id = NULL, is_available = TRUE 
                    WHERE doctor_id = ? AND date = ? AND time = ? AND appointment_id = ?
                ");
                $stmt->execute([
                    $appointment['doctor_id'],
                    $appointment['appointment_date'],
                    $appointment['appointment_time'],
                    $appointment['id']
                ]);
                
                $this->db->commit();
                
                sendResponse([
                    'success' => true,
                    'message' => 'Appointment cancelled successfully'
                ]);
                
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
            
        } catch (Exception $e) {
            logError("Booking cancellation error: " . $e->getMessage());
            sendResponse(['error' => $e->getMessage()], 400);
        }
    }
    
    private function updateBooking($data) {
        try {
            $bookingId = sanitizeInput($data['bookingId'] ?? '');
            $newDate = $data['newDate'] ?? '';
            $newTime = $data['newTime'] ?? '';
            
            if (empty($bookingId) || empty($newDate) || empty($newTime)) {
                sendResponse(['error' => 'Booking ID, new date, and new time are required'], 400);
            }
            
            // Start transaction
            $this->db->beginTransaction();
            
            try {
                // Get current appointment
                $stmt = $this->db->prepare("
                    SELECT id, doctor_id, appointment_date, appointment_time, status 
                    FROM appointments WHERE booking_id = ?
                ");
                $stmt->execute([$bookingId]);
                $appointment = $stmt->fetch();
                
                if (!$appointment) {
                    throw new Exception('Appointment not found');
                }
                
                if ($appointment['status'] === 'cancelled') {
                    throw new Exception('Cannot update cancelled appointment');
                }
                
                if ($appointment['status'] === 'completed') {
                    throw new Exception('Cannot update completed appointment');
                }
                
                // Check if new slot is available
                $stmt = $this->db->prepare("
                    SELECT id FROM time_slots 
                    WHERE doctor_id = ? AND date = ? AND time = ? AND appointment_id IS NULL
                ");
                $stmt->execute([$appointment['doctor_id'], $newDate, $newTime]);
                $newSlot = $stmt->fetch();
                
                if (!$newSlot) {
                    throw new Exception('Selected time slot is not available');
                }
                
                // Free up old slot
                $stmt = $this->db->prepare("
                    UPDATE time_slots SET appointment_id = NULL, is_available = TRUE 
                    WHERE doctor_id = ? AND date = ? AND time = ? AND appointment_id = ?
                ");
                $stmt->execute([
                    $appointment['doctor_id'],
                    $appointment['appointment_date'],
                    $appointment['appointment_time'],
                    $appointment['id']
                ]);
                
                // Reserve new slot
                $stmt = $this->db->prepare("
                    UPDATE time_slots SET appointment_id = ?, is_available = FALSE 
                    WHERE id = ?
                ");
                $stmt->execute([$appointment['id'], $newSlot['id']]);
                
                // Update appointment
                $stmt = $this->db->prepare("
                    UPDATE appointments SET appointment_date = ?, appointment_time = ? 
                    WHERE id = ?
                ");
                $stmt->execute([$newDate, $newTime, $appointment['id']]);
                
                $this->db->commit();
                
                sendResponse([
                    'success' => true,
                    'message' => 'Appointment updated successfully'
                ]);
                
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
            
        } catch (Exception $e) {
            logError("Booking update error: " . $e->getMessage());
            sendResponse(['error' => $e->getMessage()], 400);
        }
    }
    
    private function getUserAppointments() {
        try {
            // Get current user
            $sessionId = $_COOKIE['session_id'] ?? '';
            if (!$sessionId) {
                sendResponse(['error' => 'Authentication required'], 401);
            }
            
            $sessionData = $this->sessionHandler->getSession($sessionId);
            if (!$sessionData) {
                sendResponse(['error' => 'Invalid session'], 401);
            }
            
            $userId = $sessionData['id'];
            
            // Get user's appointments
            $stmt = $this->db->prepare("
                SELECT a.*, d.name as doctor_name, d.specialty 
                FROM appointments a 
                JOIN doctors d ON a.doctor_id = d.id 
                WHERE a.user_id = ? 
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
            ");
            $stmt->execute([$userId]);
            $appointments = $stmt->fetchAll();
            
            sendResponse([
                'success' => true,
                'appointments' => $appointments
            ]);
            
        } catch (Exception $e) {
            logError("Error getting user appointments: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load appointments'], 500);
        }
    }
    
    private function sendBookingConfirmation($bookingId, $email, $doctorName, $date, $time) {
        // In a real application, you would send an email or SMS confirmation here
        // For now, just log the confirmation
        logError("Booking confirmation", [
            'bookingId' => $bookingId,
            'email' => $email,
            'doctor' => $doctorName,
            'date' => $date,
            'time' => $time
        ]);
    }
    
    public function getUpcomingAppointments($doctorId = null, $limit = 10) {
        try {
            $sql = "
                SELECT a.*, d.name as doctor_name, d.specialty 
                FROM appointments a 
                JOIN doctors d ON a.doctor_id = d.id 
                WHERE a.appointment_date >= CURRENT_DATE AND a.status != 'cancelled'
            ";
            
            $params = [];
            if ($doctorId) {
                $sql .= " AND a.doctor_id = ?";
                $params[] = $doctorId;
            }
            
            $sql .= " ORDER BY a.appointment_date ASC, a.appointment_time ASC LIMIT ?";
            $params[] = $limit;
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll();
            
        } catch (Exception $e) {
            logError("Error getting upcoming appointments: " . $e->getMessage());
            return [];
        }
    }
}

// Handle the request
$bookingHandler = new BookingHandler();
$bookingHandler->handleRequest();
?>
