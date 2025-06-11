<?php
/**
 * Booking Handler (Static Demo Mode)
 * Manages appointment booking with mock data
 */

require_once 'config.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class BookingHandler {
    private $mockStorage;
    
    public function __construct() {
        $this->mockStorage = MockDataStorage::getInstance();
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
        $action = $_POST['action'] ?? '';
        
        switch ($action) {
            case 'book':
                $this->bookAppointment();
                break;
            case 'cancel':
                $this->cancelAppointment();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function getAvailableSlots() {
        try {
            $doctorId = (int)($_GET['doctor_id'] ?? 0);
            $date = $_GET['date'] ?? '';
            
            if ($doctorId <= 0) {
                sendResponse(['error' => 'Invalid doctor ID'], 400);
            }
            
            if (empty($date) || !strtotime($date)) {
                sendResponse(['error' => 'Invalid date'], 400);
            }
            
            $doctor = $this->mockStorage->getDoctorById($doctorId);
            if (!$doctor) {
                sendResponse(['error' => 'Doctor not found'], 404);
            }
            
            $timeSlots = $this->mockStorage->getAvailableTimeSlots($doctorId, $date);
            
            sendResponse([
                'success' => true,
                'doctor_id' => $doctorId,
                'date' => $date,
                'timeSlots' => $timeSlots
            ]);
            
        } catch (Exception $e) {
            logError("Error getting time slots: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load time slots'], 500);
        }
    }
    
    private function getUserAppointments() {
        try {
            // For demo purposes, return empty appointments
            sendResponse([
                'success' => true,
                'appointments' => []
            ]);
            
        } catch (Exception $e) {
            logError("Error getting user appointments: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load appointments'], 500);
        }
    }
    
    private function bookAppointment() {
        try {
            // Get booking data
            $doctorId = (int)($_POST['doctor_id'] ?? 0);
            $appointmentDate = $_POST['appointment_date'] ?? '';
            $appointmentTime = $_POST['appointment_time'] ?? '';
            $patientName = sanitizeInput($_POST['patient_name'] ?? '');
            $patientAge = (int)($_POST['patient_age'] ?? 0);
            $patientGender = sanitizeInput($_POST['patient_gender'] ?? '');
            $patientPhone = sanitizeInput($_POST['patient_phone'] ?? '');
            $patientEmail = sanitizeInput($_POST['patient_email'] ?? '');
            $symptoms = sanitizeInput($_POST['symptoms'] ?? '');
            $medicalHistory = sanitizeInput($_POST['medical_history'] ?? '');
            
            // Validate required fields
            $errors = [];
            
            if ($doctorId <= 0) {
                $errors[] = 'Doctor ID is required';
            }
            
            if (empty($appointmentDate) || !strtotime($appointmentDate)) {
                $errors[] = 'Valid appointment date is required';
            }
            
            if (empty($appointmentTime)) {
                $errors[] = 'Appointment time is required';
            }
            
            if (empty($patientName)) {
                $errors[] = 'Patient name is required';
            }
            
            if ($patientAge <= 0 || $patientAge > 150) {
                $errors[] = 'Valid patient age is required';
            }
            
            if (!in_array($patientGender, ['male', 'female', 'other'])) {
                $errors[] = 'Valid gender is required';
            }
            
            if (!validatePhone($patientPhone)) {
                $errors[] = 'Valid phone number is required';
            }
            
            if (!validateEmail($patientEmail)) {
                $errors[] = 'Valid email address is required';
            }
            
            if (!empty($errors)) {
                sendResponse(['error' => 'Validation failed', 'details' => $errors], 400);
            }
            
            // Check if doctor exists
            $doctor = $this->mockStorage->getDoctorById($doctorId);
            if (!$doctor) {
                sendResponse(['error' => 'Doctor not found'], 404);
            }
            
            // Check if doctor is available
            if (!$doctor['available']) {
                sendResponse(['error' => 'Doctor is not currently accepting appointments'], 400);
            }
            
            // Validate appointment date (not in the past, within next 30 days)
            $appointmentDateTime = strtotime($appointmentDate);
            $today = strtotime(date('Y-m-d'));
            $maxDate = strtotime('+30 days');
            
            if ($appointmentDateTime < $today) {
                sendResponse(['error' => 'Cannot book appointments in the past'], 400);
            }
            
            if ($appointmentDateTime > $maxDate) {
                sendResponse(['error' => 'Cannot book appointments more than 30 days in advance'], 400);
            }
            
            // Create appointment data
            $appointmentData = [
                'doctor_id' => $doctorId,
                'appointment_date' => $appointmentDate,
                'appointment_time' => $appointmentTime,
                'patient_name' => $patientName,
                'patient_age' => $patientAge,
                'patient_gender' => $patientGender,
                'patient_phone' => $patientPhone,
                'patient_email' => $patientEmail,
                'symptoms' => $symptoms,
                'medical_history' => $medicalHistory
            ];
            
            // Save appointment
            $appointment = $this->mockStorage->saveAppointment($appointmentData);
            
            sendResponse([
                'success' => true,
                'message' => 'Appointment booked successfully',
                'appointment' => [
                    'booking_id' => $appointment['booking_id'],
                    'doctor_name' => $doctor['name'],
                    'appointment_date' => $appointmentDate,
                    'appointment_time' => $appointmentTime,
                    'patient_name' => $patientName,
                    'status' => 'pending'
                ]
            ]);
            
        } catch (Exception $e) {
            logError("Error booking appointment: " . $e->getMessage());
            sendResponse(['error' => 'Failed to book appointment'], 500);
        }
    }
    
    private function cancelAppointment() {
        try {
            $bookingId = sanitizeInput($_POST['booking_id'] ?? '');
            
            if (empty($bookingId)) {
                sendResponse(['error' => 'Booking ID is required'], 400);
            }
            
            // For demo purposes, always return success
            sendResponse([
                'success' => true,
                'message' => 'Appointment cancelled successfully'
            ]);
            
        } catch (Exception $e) {
            logError("Error cancelling appointment: " . $e->getMessage());
            sendResponse(['error' => 'Failed to cancel appointment'], 500);
        }
    }
}

// Handle the request
$bookingHandler = new BookingHandler();
$bookingHandler->handleRequest();
?>