<?php
/**
 * Doctor Appointments API
 * Handles appointment management operations for doctors
 */

require_once 'config.php';
require_once 'session-auth.php';

// Set CORS headers
setCORSHeaders();

// Initialize session configuration
initializeSessionConfig();

class DoctorAppointmentsAPI {
    private $mockStorage;
    
    public function __construct() {
        $this->mockStorage = MockDataStorage::getInstance();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';
        
        try {
            switch ($method) {
                case 'GET':
                    $this->handleGetRequest($action);
                    break;
                case 'POST':
                    $this->handlePostRequest($action);
                    break;
                default:
                    $this->sendError('Method not allowed', 405);
            }
        } catch (Exception $e) {
            error_log("Doctor Appointments API error: " . $e->getMessage());
            $this->sendError('Internal server error', 500);
        }
    }
    
    private function handleGetRequest($action) {
        switch ($action) {
            case 'get_appointments':
                $this->getAppointments();
                break;
            case 'get_patients':
                $this->getPatients();
                break;
            case 'get_appointment_details':
                $this->getAppointmentDetails();
                break;
            case 'get_schedule':
                $this->getSchedule();
                break;
            default:
                $this->sendError('Invalid action', 400);
        }
    }
    
    private function handlePostRequest($action) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($action) {
            case 'create_appointment':
                $this->createAppointment($input);
                break;
            case 'update_appointment':
                $this->updateAppointment($input);
                break;
            case 'update_appointment_status':
                $this->updateAppointmentStatus($input);
                break;
            case 'cancel_appointment':
                $this->cancelAppointment($input);
                break;
            default:
                $this->sendError('Invalid action', 400);
        }
    }
    
    private function getAppointments() {
        // Get filter parameters
        $doctorId = $_GET['doctor_id'] ?? 1; // Default to doctor 1
        $date = $_GET['date'] ?? null;
        $status = $_GET['status'] ?? null;
        $limit = $_GET['limit'] ?? 100;
        
        // Generate mock appointments for the doctor
        $appointments = $this->generateMockAppointments($doctorId, $limit);
        
        // Apply filters
        if ($date) {
            $appointments = array_filter($appointments, function($apt) use ($date) {
                return $apt['date'] === $date;
            });
        }
        
        if ($status) {
            $appointments = array_filter($appointments, function($apt) use ($status) {
                return $apt['status'] === $status;
            });
        }
        
        $this->sendSuccess([
            'appointments' => array_values($appointments),
            'total' => count($appointments)
        ]);
    }
    
    private function getPatients() {
        $doctorId = $_GET['doctor_id'] ?? 1;
        
        // Generate mock patients
        $patients = $this->generateMockPatients();
        
        $this->sendSuccess([
            'patients' => $patients,
            'total' => count($patients)
        ]);
    }
    
    private function getAppointmentDetails() {
        $appointmentId = $_GET['appointment_id'] ?? null;
        
        if (!$appointmentId) {
            $this->sendError('Appointment ID is required', 400);
            return;
        }
        
        // Mock appointment details
        $appointment = [
            'id' => $appointmentId,
            'patient_id' => 1,
            'patient_name' => 'John Doe',
            'patient_phone' => '+1 (555) 123-4567',
            'patient_email' => 'john.doe@email.com',
            'date' => date('Y-m-d'),
            'time' => '10:00',
            'duration' => 60,
            'type' => 'consultation',
            'status' => 'scheduled',
            'notes' => 'Regular checkup appointment',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $this->sendSuccess(['appointment' => $appointment]);
    }
    
    private function getSchedule() {
        $doctorId = $_GET['doctor_id'] ?? 1;
        $date = $_GET['date'] ?? date('Y-m-d');
        
        // Generate schedule for the day
        $schedule = $this->generateDaySchedule($doctorId, $date);
        
        $this->sendSuccess(['schedule' => $schedule]);
    }
    
    private function createAppointment($data) {
        // Validate required fields
        $required = ['patient_id', 'date', 'time', 'duration', 'type'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $this->sendError("Field '$field' is required", 400);
                return;
            }
        }
        
        // Mock creation - in real implementation, save to database
        $appointmentId = rand(1000, 9999);
        
        $appointment = [
            'id' => $appointmentId,
            'patient_id' => $data['patient_id'],
            'date' => $data['date'],
            'time' => $data['time'],
            'duration' => $data['duration'],
            'type' => $data['type'],
            'status' => $data['status'] ?? 'scheduled',
            'notes' => $data['notes'] ?? '',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $this->sendSuccess([
            'message' => 'Appointment created successfully',
            'appointment' => $appointment
        ]);
    }
    
    private function updateAppointment($data) {
        if (!isset($data['id'])) {
            $this->sendError('Appointment ID is required', 400);
            return;
        }
        
        // Mock update - in real implementation, update database
        $this->sendSuccess([
            'message' => 'Appointment updated successfully',
            'appointment_id' => $data['id']
        ]);
    }
    
    private function updateAppointmentStatus($data) {
        if (!isset($data['id']) || !isset($data['status'])) {
            $this->sendError('Appointment ID and status are required', 400);
            return;
        }
        
        $validStatuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
        if (!in_array($data['status'], $validStatuses)) {
            $this->sendError('Invalid status', 400);
            return;
        }
        
        // Mock update - in real implementation, update database
        $this->sendSuccess([
            'message' => 'Appointment status updated successfully',
            'appointment_id' => $data['id'],
            'status' => $data['status']
        ]);
    }
    
    private function cancelAppointment($data) {
        if (!isset($data['id'])) {
            $this->sendError('Appointment ID is required', 400);
            return;
        }
        
        // Mock cancellation - in real implementation, update database
        $this->sendSuccess([
            'message' => 'Appointment cancelled successfully',
            'appointment_id' => $data['id']
        ]);
    }
    
    private function generateMockAppointments($doctorId, $limit = 50) {
        $appointments = [];
        $statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
        $types = ['consultation', 'follow-up', 'check-up', 'procedure', 'surgery'];
        $durations = [30, 45, 60, 90, 120];
        
        $patientNames = [
            'John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'David Brown',
            'Emily Davis', 'Robert Miller', 'Lisa Wilson', 'James Moore', 'Maria Garcia',
            'Christopher Taylor', 'Jennifer Anderson', 'Daniel Thomas', 'Ashley Jackson',
            'Matthew White', 'Jessica Harris', 'Anthony Martin', 'Amanda Thompson'
        ];
        
        for ($i = 1; $i <= $limit; $i++) {
            $date = new DateTime();
            $date->modify('+' . rand(-30, 30) . ' days');
            
            $hour = rand(9, 17); // 9 AM to 5 PM
            $minute = rand(0, 1) * 30; // 0 or 30 minutes
            
            $appointments[] = [
                'id' => $i,
                'doctor_id' => $doctorId,
                'patient_id' => rand(1, 100),
                'patient_name' => $patientNames[array_rand($patientNames)],
                'phone' => '+1 (555) ' . rand(100, 999) . '-' . rand(1000, 9999),
                'date' => $date->format('Y-m-d'),
                'time' => sprintf('%02d:%02d', $hour, $minute),
                'datetime' => $date->format('Y-m-d H:i:s'),
                'duration' => $durations[array_rand($durations)],
                'type' => $types[array_rand($types)],
                'status' => $statuses[array_rand($statuses)],
                'notes' => 'Sample appointment notes for appointment ' . $i,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
        }
        
        // Sort by date and time
        usort($appointments, function($a, $b) {
            return strtotime($a['datetime']) <=> strtotime($b['datetime']);
        });
        
        return $appointments;
    }
    
    private function generateMockPatients() {
        $patients = [];
        $firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        
        for ($i = 1; $i <= 100; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            
            $patients[] = [
                'id' => $i,
                'name' => $firstName . ' ' . $lastName,
                'email' => strtolower($firstName . '.' . $lastName) . '@email.com',
                'phone' => '+1 (555) ' . rand(100, 999) . '-' . rand(1000, 9999),
                'gender' => rand(0, 1) ? 'Male' : 'Female',
                'date_of_birth' => date('Y-m-d', strtotime('-' . rand(18, 80) . ' years')),
                'address' => rand(100, 999) . ' Main St, City, State ' . rand(10000, 99999),
                'created_at' => date('Y-m-d H:i:s')
            ];
        }
        
        return $patients;
    }
    
    private function generateDaySchedule($doctorId, $date) {
        $schedule = [];
        $startHour = 9; // 9 AM
        $endHour = 17; // 5 PM
        
        for ($hour = $startHour; $hour < $endHour; $hour++) {
            for ($minute = 0; $minute < 60; $minute += 30) {
                $time = sprintf('%02d:%02d', $hour, $minute);
                $isBooked = rand(0, 100) < 30; // 30% chance of being booked
                
                $slot = [
                    'time' => $time,
                    'available' => !$isBooked,
                    'appointment_id' => $isBooked ? rand(1, 1000) : null,
                    'patient_name' => $isBooked ? 'Sample Patient' : null,
                    'type' => $isBooked ? 'consultation' : null
                ];
                
                $schedule[] = $slot;
            }
        }
        
        return $schedule;
    }
    
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode(['success' => true] + $data);
        exit;
    }
    
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit;
    }
}

// Initialize and handle request
$api = new DoctorAppointmentsAPI();
$api->handleRequest();
?>