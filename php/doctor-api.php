<?php
/**
 * Doctor API Endpoints
 * Handles doctor-specific API requests
 */

require_once 'config.php';
require_once 'session-auth.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Require doctor authentication
$currentUser = requireAuth(['doctor']);

class DoctorAPI {
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
                $this->getDoctorStats();
                break;
            case 'get_today_appointments':
                $this->getTodayAppointments();
                break;
            case 'get_appointments':
                $this->getAllAppointments();
                break;
            case 'get_patients':
                $this->getPatients();
                break;
            case 'get_weekly_schedule':
                $this->getWeeklySchedule();
                break;
            case 'get_availability':
                $this->getAvailability();
                break;
            case 'update_availability':
                $this->updateAvailability();
                break;
            case 'confirm_appointment':
                $this->confirmAppointment();
                break;
            case 'get_patient_history':
                $this->getPatientHistory();
                break;
            case 'update_profile':
                $this->updateProfile();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function getDoctorStats() {
        try {
            $doctorInfo = $this->mockStorage->getDoctorById($this->currentUser['doctor_id']);
            $appointments = $this->mockStorage->getAppointmentsByDoctor($this->currentUser['doctor_id']);
            
            $todayAppointments = 0;
            $upcomingCount = 0;
            
            foreach ($appointments as $appointment) {
                if (date('Y-m-d', strtotime($appointment['date'])) === date('Y-m-d')) {
                    $todayAppointments++;
                }
                if (strtotime($appointment['date']) > time()) {
                    $upcomingCount++;
                }
            }
            
            $stats = [
                'today_appointments' => $todayAppointments,
                'total_patients' => $doctorInfo ? $doctorInfo['patients_treated'] : 0,
                'upcoming_count' => $upcomingCount,
                'doctor_rating' => $doctorInfo ? $doctorInfo['rating'] : 0
            ];
            
            sendResponse([
                'success' => true,
                'stats' => $stats
            ]);
            
        } catch (Exception $e) {
            logError("Get doctor stats error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load statistics'], 500);
        }
    }
    
    private function getTodayAppointments() {
        try {
            $appointments = $this->mockStorage->getAppointmentsByDoctor($this->currentUser['doctor_id']);
            $todayAppointments = [];
            
            foreach ($appointments as $appointment) {
                if (date('Y-m-d', strtotime($appointment['date'])) === date('Y-m-d')) {
                    // Get patient information
                    $patient = $this->mockStorage->getUserById($appointment['patient_id']);
                    $appointment['patient_name'] = $patient ? $patient['full_name'] : 'Unknown Patient';
                    $appointment['patient_phone'] = $patient ? $patient['phone'] : '';
                    $appointment['patient_email'] = $patient ? $patient['email'] : '';
                    $todayAppointments[] = $appointment;
                }
            }
            
            // Sort by time
            usort($todayAppointments, function($a, $b) {
                return strtotime($a['time']) - strtotime($b['time']);
            });
            
            sendResponse([
                'success' => true,
                'appointments' => $todayAppointments
            ]);
            
        } catch (Exception $e) {
            logError("Get today appointments error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load today appointments'], 500);
        }
    }
    
    private function getAllAppointments() {
        try {
            $appointments = $this->mockStorage->getAppointmentsByDoctor($this->currentUser['doctor_id']);
            
            foreach ($appointments as &$appointment) {
                $patient = $this->mockStorage->getUserById($appointment['patient_id']);
                $appointment['patient_name'] = $patient ? $patient['full_name'] : 'Unknown Patient';
                $appointment['patient_phone'] = $patient ? $patient['phone'] : '';
                $appointment['patient_email'] = $patient ? $patient['email'] : '';
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
    
    private function getPatients() {
        try {
            $appointments = $this->mockStorage->getAppointmentsByDoctor($this->currentUser['doctor_id']);
            $patientIds = array_unique(array_column($appointments, 'patient_id'));
            $patients = [];
            
            foreach ($patientIds as $patientId) {
                $patient = $this->mockStorage->getUserById($patientId);
                if ($patient) {
                    $patientAppointments = array_filter($appointments, function($apt) use ($patientId) {
                        return $apt['patient_id'] == $patientId;
                    });
                    
                    $lastVisit = null;
                    foreach ($patientAppointments as $apt) {
                        if ($apt['status'] === 'completed' && (!$lastVisit || strtotime($apt['date']) > strtotime($lastVisit))) {
                            $lastVisit = $apt['date'];
                        }
                    }
                    
                    $patients[] = [
                        'id' => $patient['id'],
                        'name' => $patient['full_name'],
                        'email' => $patient['email'],
                        'phone' => $patient['phone'],
                        'last_visit' => $lastVisit,
                        'total_visits' => count($patientAppointments)
                    ];
                }
            }
            
            sendResponse([
                'success' => true,
                'patients' => $patients
            ]);
            
        } catch (Exception $e) {
            logError("Get patients error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load patients'], 500);
        }
    }
    
    private function getWeeklySchedule() {
        try {
            // Mock weekly schedule data
            $schedule = [
                'monday' => ['09:00', '10:30', '14:00'],
                'tuesday' => ['09:00', '11:00', '15:00'],
                'wednesday' => ['10:00', '13:00', '16:00'],
                'thursday' => ['09:30', '14:30'],
                'friday' => ['08:00', '11:30', '15:30'],
                'saturday' => ['10:00', '14:00'],
                'sunday' => []
            ];
            
            sendResponse([
                'success' => true,
                'schedule' => $schedule
            ]);
            
        } catch (Exception $e) {
            logError("Get weekly schedule error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load schedule'], 500);
        }
    }
    
    private function getAvailability() {
        try {
            $date = $_GET['date'] ?? date('Y-m-d');
            
            // Mock availability data
            $availability = [
                'available' => ['09:00', '10:30', '14:00', '15:30'],
                'booked' => ['11:00', '16:00']
            ];
            
            sendResponse([
                'success' => true,
                'availability' => $availability
            ]);
            
        } catch (Exception $e) {
            logError("Get availability error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load availability'], 500);
        }
    }
    
    private function updateAvailability() {
        try {
            $date = $_POST['date'] ?? '';
            $slots = json_decode($_POST['slots'] ?? '[]', true);
            
            // In a real application, this would update the database
            sendResponse([
                'success' => true,
                'message' => 'Availability updated successfully'
            ]);
            
        } catch (Exception $e) {
            logError("Update availability error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to update availability'], 500);
        }
    }
    
    private function confirmAppointment() {
        try {
            $appointmentId = $_POST['id'] ?? 0;
            
            // In a real application, this would update the appointment status
            sendResponse([
                'success' => true,
                'message' => 'Appointment confirmed successfully'
            ]);
            
        } catch (Exception $e) {
            logError("Confirm appointment error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to confirm appointment'], 500);
        }
    }
    
    private function getPatientHistory() {
        try {
            $patientId = $_GET['patient_id'] ?? 0;
            $patient = $this->mockStorage->getUserById($patientId);
            
            if (!$patient) {
                sendResponse(['error' => 'Patient not found'], 404);
                return;
            }
            
            $appointments = array_filter($this->mockStorage->getAppointmentsByDoctor($this->currentUser['doctor_id']), 
                function($apt) use ($patientId) {
                    return $apt['patient_id'] == $patientId;
                }
            );
            
            // Sort by date (newest first)
            usort($appointments, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            sendResponse([
                'success' => true,
                'patient' => [
                    'id' => $patient['id'],
                    'name' => $patient['full_name'],
                    'email' => $patient['email'],
                    'phone' => $patient['phone'],
                    'date_of_birth' => $patient['date_of_birth'],
                    'address' => $patient['address']
                ],
                'history' => $appointments
            ]);
            
        } catch (Exception $e) {
            logError("Get patient history error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load patient history'], 500);
        }
    }
    
    private function updateProfile() {
        try {
            $updateData = [
                'full_name' => sanitizeInput($_POST['doctor-full-name'] ?? ''),
                'email' => sanitizeInput($_POST['doctor-email'] ?? ''),
                'phone' => sanitizeInput($_POST['doctor-phone'] ?? ''),
                'department' => sanitizeInput($_POST['doctor-specialty'] ?? ''),
                'license_number' => sanitizeInput($_POST['doctor-license'] ?? ''),
                'experience' => intval($_POST['doctor-experience'] ?? 0),
                'about' => sanitizeInput($_POST['doctor-about'] ?? '')
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
$doctorAPI = new DoctorAPI($currentUser);
$doctorAPI->handleRequest();
?>