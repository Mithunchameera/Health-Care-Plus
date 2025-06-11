<?php
/**
 * Patient API Endpoints
 * Handles patient-specific API requests
 */

require_once 'config.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$currentUser = checkUserAuth(['patient']);
if (!$currentUser) {
    sendResponse(['error' => 'Authentication required'], 401);
}

class PatientAPI {
    private $mockStorage;
    private $currentUser;
    
    public function __construct($user) {
        $this->mockStorage = MockDataStorage::getInstance();
        $this->currentUser = $user;
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? $_POST['action'] ?? '';
        
        switch ($action) {
            case 'get_stats':
                $this->getPatientStats();
                break;
            case 'get_upcoming_appointments':
                $this->getUpcomingAppointments();
                break;
            case 'get_appointments':
                $this->getAllAppointments();
                break;
            case 'get_appointment':
                $this->getAppointment();
                break;
            case 'cancel_appointment':
                $this->cancelAppointment();
                break;
            case 'get_payment_history':
                $this->getPaymentHistory();
                break;
            case 'update_profile':
                $this->updateProfile();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function getPatientStats() {
        try {
            $appointments = $this->mockStorage->getAppointmentsByPatient($this->currentUser['id']);
            $upcomingCount = 0;
            $doctorsVisited = [];
            
            foreach ($appointments as $appointment) {
                if (strtotime($appointment['date']) > time()) {
                    $upcomingCount++;
                }
                $doctorsVisited[] = $appointment['doctor_id'];
            }
            
            $stats = [
                'total_appointments' => count($appointments),
                'upcoming_appointments' => $upcomingCount,
                'doctors_visited' => count(array_unique($doctorsVisited)),
                'prescriptions' => rand(5, 15) // Mock data for prescriptions
            ];
            
            sendResponse([
                'success' => true,
                'stats' => $stats
            ]);
            
        } catch (Exception $e) {
            logError("Get patient stats error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load statistics'], 500);
        }
    }
    
    private function getUpcomingAppointments() {
        try {
            $appointments = $this->mockStorage->getAppointmentsByPatient($this->currentUser['id']);
            $upcomingAppointments = [];
            
            foreach ($appointments as $appointment) {
                if (strtotime($appointment['date']) > time()) {
                    $doctor = $this->mockStorage->getDoctorById($appointment['doctor_id']);
                    $appointment['doctor_name'] = $doctor ? $doctor['name'] : 'Unknown Doctor';
                    $appointment['specialty'] = $doctor ? $doctor['specialty'] : 'Unknown';
                    $upcomingAppointments[] = $appointment;
                }
            }
            
            // Sort by date
            usort($upcomingAppointments, function($a, $b) {
                return strtotime($a['date']) - strtotime($b['date']);
            });
            
            sendResponse([
                'success' => true,
                'appointments' => array_slice($upcomingAppointments, 0, 5) // Limit to 5 upcoming
            ]);
            
        } catch (Exception $e) {
            logError("Get upcoming appointments error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load upcoming appointments'], 500);
        }
    }
    
    private function getAllAppointments() {
        try {
            $appointments = $this->mockStorage->getAppointmentsByPatient($this->currentUser['id']);
            
            foreach ($appointments as &$appointment) {
                $doctor = $this->mockStorage->getDoctorById($appointment['doctor_id']);
                $appointment['doctor_name'] = $doctor ? $doctor['name'] : 'Unknown Doctor';
                $appointment['specialty'] = $doctor ? $doctor['specialty'] : 'Unknown';
                $appointment['fee'] = $doctor ? $doctor['fee'] : 0;
            }
            
            // Sort by date (newest first)
            usort($appointments, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            sendResponse([
                'success' => true,
                'appointments' => $appointments
            ]);
            
        } catch (Exception $e) {
            logError("Get all appointments error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load appointments'], 500);
        }
    }
    
    private function getAppointment() {
        try {
            $appointmentId = $_GET['id'] ?? 0;
            $appointments = $this->mockStorage->getAppointmentsByPatient($this->currentUser['id']);
            
            $appointment = null;
            foreach ($appointments as $apt) {
                if ($apt['id'] == $appointmentId) {
                    $appointment = $apt;
                    break;
                }
            }
            
            if (!$appointment) {
                sendResponse(['error' => 'Appointment not found'], 404);
                return;
            }
            
            $doctor = $this->mockStorage->getDoctorById($appointment['doctor_id']);
            $appointment['doctor_name'] = $doctor ? $doctor['name'] : 'Unknown Doctor';
            $appointment['specialty'] = $doctor ? $doctor['specialty'] : 'Unknown';
            $appointment['doctor_info'] = $doctor;
            
            sendResponse([
                'success' => true,
                'appointment' => $appointment
            ]);
            
        } catch (Exception $e) {
            logError("Get appointment error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load appointment'], 500);
        }
    }
    
    private function cancelAppointment() {
        try {
            $appointmentId = $_POST['id'] ?? 0;
            
            // In a real application, this would update the database
            // For mock purposes, we'll just return success
            
            sendResponse([
                'success' => true,
                'message' => 'Appointment cancelled successfully'
            ]);
            
        } catch (Exception $e) {
            logError("Cancel appointment error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to cancel appointment'], 500);
        }
    }
    
    private function getPaymentHistory() {
        try {
            // Mock payment history data
            $payments = [
                [
                    'id' => 1,
                    'date' => '2025-06-10',
                    'appointment_type' => 'Cardiology Consultation',
                    'doctor_name' => 'Dr. Sarah Johnson',
                    'amount' => 250.00,
                    'method' => 'Credit Card',
                    'status' => 'completed'
                ],
                [
                    'id' => 2,
                    'date' => '2025-05-28',
                    'appointment_type' => 'Pediatric Checkup',
                    'doctor_name' => 'Dr. Emily Rodriguez',
                    'amount' => 180.00,
                    'method' => 'Insurance',
                    'status' => 'completed'
                ]
            ];
            
            sendResponse([
                'success' => true,
                'payments' => $payments
            ]);
            
        } catch (Exception $e) {
            logError("Get payment history error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load payment history'], 500);
        }
    }
    
    private function updateProfile() {
        try {
            $updateData = [
                'full_name' => sanitizeInput($_POST['profile-name'] ?? ''),
                'email' => sanitizeInput($_POST['profile-email'] ?? ''),
                'phone' => sanitizeInput($_POST['profile-phone'] ?? ''),
                'date_of_birth' => $_POST['profile-dob'] ?? '',
                'address' => sanitizeInput($_POST['profile-address'] ?? ''),
                'emergency_contact' => sanitizeInput($_POST['profile-emergency'] ?? ''),
                'insurance_number' => sanitizeInput($_POST['profile-insurance'] ?? '')
            ];
            
            // Validate data
            $errors = [];
            
            if (empty($updateData['full_name'])) {
                $errors[] = 'Full name is required';
            }
            
            if (!validateEmail($updateData['email'])) {
                $errors[] = 'Valid email is required';
            }
            
            if (!validatePhone($updateData['phone'])) {
                $errors[] = 'Valid phone number is required';
            }
            
            if (!empty($errors)) {
                sendResponse(['error' => 'Validation failed', 'details' => $errors], 400);
                return;
            }
            
            // In a real application, this would update the database
            // For mock purposes, we'll just return success with updated data
            
            sendResponse([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => array_merge($this->currentUser, $updateData)
            ]);
            
        } catch (Exception $e) {
            logError("Update profile error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to update profile'], 500);
        }
    }
}

// Handle the request
$patientAPI = new PatientAPI($currentUser);
$patientAPI->handleRequest();
?>