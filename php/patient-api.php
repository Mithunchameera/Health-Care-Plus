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

// Check if this is a doctors request (which should be public for booking)
$action = $_GET['action'] ?? $_POST['action'] ?? '';
if ($action === 'get_doctors') {
    // Allow public access to doctors list for booking purposes
    $currentUser = null;
} else {
    // Require authentication for other patient actions
    $currentUser = checkUserAuth(['patient']);
    if (!$currentUser) {
        sendResponse(['error' => 'Authentication required'], 401);
    }
}

class PatientAPI {
    private $mockStorage;
    private $currentUser;
    
    public function __construct($user = null) {
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
            case 'get_doctors':
                $this->getDoctors();
                break;
            case 'get_timeslots':
                $this->getTimeSlots();
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
    
    private function getDoctors() {
        try {
            $doctors = $this->mockStorage->getDoctors();
            
            sendResponse([
                'success' => true,
                'doctors' => $doctors
            ]);
            
        } catch (Exception $e) {
            logError("Get doctors error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load doctors'], 500);
        }
    }
    
    private function getTimeSlots() {
        try {
            $doctorId = $_GET['doctor_id'] ?? 0;
            $date = $_GET['date'] ?? '';
            
            if (!$doctorId || !$date) {
                sendResponse(['error' => 'Doctor ID and date are required'], 400);
                return;
            }
            
            // Validate date format
            $dateObj = DateTime::createFromFormat('Y-m-d', $date);
            if (!$dateObj || $dateObj->format('Y-m-d') !== $date) {
                sendResponse(['error' => 'Invalid date format'], 400);
                return;
            }
            
            // Check if date is in the past
            if ($dateObj < new DateTime('today')) {
                sendResponse(['error' => 'Cannot book appointments for past dates'], 400);
                return;
            }
            
            // Check if doctor exists
            $doctor = $this->mockStorage->getDoctorById($doctorId);
            if (!$doctor) {
                sendResponse(['error' => 'Doctor not found'], 404);
                return;
            }
            
            // Check if doctor is available
            if (!$doctor['available']) {
                sendResponse(['error' => 'Doctor is currently unavailable'], 400);
                return;
            }
            
            // Generate time slots based on doctor's specialty and working hours
            $timeSlots = $this->generateTimeSlots($doctorId, $date);
            
            sendResponse([
                'success' => true,
                'timeslots' => $timeSlots,
                'doctor_name' => $doctor['name'],
                'date' => $date
            ]);
            
        } catch (Exception $e) {
            logError("Get time slots error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load time slots'], 500);
        }
    }
    
    private function generateTimeSlots($doctorId, $date) {
        // Get existing appointments for this doctor on this date
        $existingAppointments = $this->mockStorage->getAppointmentsByDoctorAndDate($doctorId, $date);
        $bookedTimes = array_column($existingAppointments, 'time');
        
        // Define working hours (9 AM to 5 PM)
        $startHour = 9;
        $endHour = 17;
        $slotDuration = 30; // 30 minutes per slot
        
        $timeSlots = [];
        $dayOfWeek = date('N', strtotime($date)); // 1 = Monday, 7 = Sunday
        
        // Skip Sundays
        if ($dayOfWeek == 7) {
            return $timeSlots;
        }
        
        // Saturday has reduced hours (9 AM to 1 PM)
        if ($dayOfWeek == 6) {
            $endHour = 13;
        }
        
        for ($hour = $startHour; $hour < $endHour; $hour++) {
            for ($minute = 0; $minute < 60; $minute += $slotDuration) {
                $time = sprintf('%02d:%02d', $hour, $minute);
                
                // Skip lunch break (12:00 - 13:00)
                if ($hour == 12) {
                    continue;
                }
                
                // Check if slot is not already booked
                if (!in_array($time, $bookedTimes)) {
                    $timeSlots[] = [
                        'time' => $time,
                        'available' => true,
                        'formatted' => date('g:i A', strtotime($time))
                    ];
                }
            }
        }
        
        return $timeSlots;
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