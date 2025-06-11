<?php
/**
 * Admin API Endpoints
 * Handles admin-specific API requests
 */

require_once 'config.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$currentUser = checkUserAuth(['admin', 'staff']);
if (!$currentUser) {
    sendResponse(['error' => 'Authentication required'], 401);
}

class AdminAPI {
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
                $this->getSystemStats();
                break;
            case 'get_recent_activity':
                $this->getRecentActivity();
                break;
            case 'get_doctors':
                $this->getDoctors();
                break;
            case 'get_appointments':
                $this->getAppointments();
                break;
            case 'get_patients':
                $this->getPatients();
                break;
            case 'get_staff':
                $this->getStaff();
                break;
            case 'add_doctor':
                $this->addDoctor();
                break;
            case 'update_settings':
                $this->updateSettings();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function getSystemStats() {
        try {
            $doctors = $this->mockStorage->getDoctors();
            $appointments = $this->mockStorage->getAppointments();
            $users = $this->mockStorage->getUsers();
            
            $patients = array_filter($users, function($user) {
                return $user['role'] === 'patient';
            });
            
            $todayAppointments = 0;
            foreach ($appointments as $appointment) {
                if (date('Y-m-d', strtotime($appointment['date'])) === date('Y-m-d')) {
                    $todayAppointments++;
                }
            }
            
            // Calculate monthly revenue (mock calculation)
            $monthlyRevenue = 0;
            foreach ($appointments as $appointment) {
                if (date('Y-m', strtotime($appointment['date'])) === date('Y-m')) {
                    $doctor = $this->mockStorage->getDoctorById($appointment['doctor_id']);
                    $monthlyRevenue += $doctor ? $doctor['fee'] : 150;
                }
            }
            
            $stats = [
                'total_doctors' => count($doctors),
                'total_patients' => count($patients),
                'today_appointments' => $todayAppointments,
                'monthly_revenue' => $monthlyRevenue
            ];
            
            sendResponse([
                'success' => true,
                'stats' => $stats
            ]);
            
        } catch (Exception $e) {
            logError("Get system stats error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load statistics'], 500);
        }
    }
    
    private function getRecentActivity() {
        try {
            // Mock recent activity data
            $activities = [
                [
                    'time' => '11:30',
                    'description' => 'New appointment booked',
                    'user' => 'John Doe',
                    'status' => 'confirmed'
                ],
                [
                    'time' => '11:15',
                    'description' => 'Doctor schedule updated',
                    'user' => 'Dr. Sarah Johnson',
                    'status' => 'updated'
                ],
                [
                    'time' => '10:45',
                    'description' => 'Payment processed',
                    'user' => 'Maria Garcia',
                    'status' => 'completed'
                ],
                [
                    'time' => '10:30',
                    'description' => 'New patient registered',
                    'user' => 'Admin',
                    'status' => 'active'
                ],
                [
                    'time' => '10:15',
                    'description' => 'Appointment cancelled',
                    'user' => 'Dr. Michael Chen',
                    'status' => 'cancelled'
                ]
            ];
            
            sendResponse([
                'success' => true,
                'activity' => $activities
            ]);
            
        } catch (Exception $e) {
            logError("Get recent activity error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load recent activity'], 500);
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
    
    private function getAppointments() {
        try {
            $appointments = $this->mockStorage->getAppointments();
            
            foreach ($appointments as &$appointment) {
                $doctor = $this->mockStorage->getDoctorById($appointment['doctor_id']);
                $patient = $this->mockStorage->getUserById($appointment['patient_id']);
                
                $appointment['doctor_name'] = $doctor ? $doctor['name'] : 'Unknown Doctor';
                $appointment['patient_name'] = $patient ? $patient['full_name'] : 'Unknown Patient';
                $appointment['fee'] = $doctor ? $doctor['fee'] : 150;
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
            logError("Get appointments error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load appointments'], 500);
        }
    }
    
    private function getPatients() {
        try {
            $users = $this->mockStorage->getUsers();
            $appointments = $this->mockStorage->getAppointments();
            
            $patients = array_filter($users, function($user) {
                return $user['role'] === 'patient';
            });
            
            foreach ($patients as &$patient) {
                $patientAppointments = array_filter($appointments, function($apt) use ($patient) {
                    return $apt['patient_id'] == $patient['id'];
                });
                
                $lastVisit = null;
                foreach ($patientAppointments as $apt) {
                    if ($apt['status'] === 'completed' && (!$lastVisit || strtotime($apt['date']) > strtotime($lastVisit))) {
                        $lastVisit = $apt['date'];
                    }
                }
                
                $patient['name'] = $patient['full_name'];
                $patient['last_visit'] = $lastVisit;
                $patient['total_visits'] = count($patientAppointments);
            }
            
            sendResponse([
                'success' => true,
                'patients' => array_values($patients)
            ]);
            
        } catch (Exception $e) {
            logError("Get patients error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load patients'], 500);
        }
    }
    
    private function getStaff() {
        try {
            $users = $this->mockStorage->getUsers();
            
            $staff = array_filter($users, function($user) {
                return in_array($user['role'], ['admin', 'staff']);
            });
            
            foreach ($staff as &$member) {
                $member['name'] = $member['full_name'];
            }
            
            sendResponse([
                'success' => true,
                'staff' => array_values($staff)
            ]);
            
        } catch (Exception $e) {
            logError("Get staff error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load staff'], 500);
        }
    }
    
    private function addDoctor() {
        try {
            // Check permissions
            if (!hasPermission($this->currentUser, 'manage_doctors')) {
                sendResponse(['error' => 'Insufficient permissions'], 403);
                return;
            }
            
            $doctorData = [
                'name' => sanitizeInput($_POST['new-doctor-name'] ?? ''),
                'email' => sanitizeInput($_POST['new-doctor-email'] ?? ''),
                'phone' => sanitizeInput($_POST['new-doctor-phone'] ?? ''),
                'specialty' => sanitizeInput($_POST['new-doctor-specialty'] ?? ''),
                'experience' => intval($_POST['new-doctor-experience'] ?? 0),
                'fee' => floatval($_POST['new-doctor-fee'] ?? 0)
            ];
            
            // Validate data
            $errors = [];
            
            if (empty($doctorData['name'])) {
                $errors[] = 'Doctor name is required';
            }
            
            if (!validateEmail($doctorData['email'])) {
                $errors[] = 'Valid email is required';
            }
            
            if (!validatePhone($doctorData['phone'])) {
                $errors[] = 'Valid phone number is required';
            }
            
            if (empty($doctorData['specialty'])) {
                $errors[] = 'Specialty is required';
            }
            
            if ($doctorData['experience'] < 0) {
                $errors[] = 'Experience must be a positive number';
            }
            
            if ($doctorData['fee'] <= 0) {
                $errors[] = 'Consultation fee must be greater than 0';
            }
            
            if (!empty($errors)) {
                sendResponse(['error' => 'Validation failed', 'details' => $errors], 400);
                return;
            }
            
            // In a real application, this would insert into the database
            sendResponse([
                'success' => true,
                'message' => 'Doctor added successfully',
                'doctor' => $doctorData
            ]);
            
        } catch (Exception $e) {
            logError("Add doctor error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to add doctor'], 500);
        }
    }
    
    private function updateSettings() {
        try {
            // Check permissions
            if (!hasPermission($this->currentUser, 'manage_system')) {
                sendResponse(['error' => 'Insufficient permissions'], 403);
                return;
            }
            
            $settings = [
                'hospital_name' => sanitizeInput($_POST['hospital-name'] ?? ''),
                'hospital_address' => sanitizeInput($_POST['hospital-address'] ?? ''),
                'hospital_phone' => sanitizeInput($_POST['hospital-phone'] ?? ''),
                'hospital_email' => sanitizeInput($_POST['hospital-email'] ?? ''),
                'appointment_fee' => floatval($_POST['appointment-fee'] ?? 0),
                'booking_advance' => intval($_POST['booking-advance'] ?? 30)
            ];
            
            // Validate settings
            $errors = [];
            
            if (empty($settings['hospital_name'])) {
                $errors[] = 'Hospital name is required';
            }
            
            if (!validateEmail($settings['hospital_email'])) {
                $errors[] = 'Valid hospital email is required';
            }
            
            if (!validatePhone($settings['hospital_phone'])) {
                $errors[] = 'Valid hospital phone is required';
            }
            
            if ($settings['appointment_fee'] < 0) {
                $errors[] = 'Appointment fee must be non-negative';
            }
            
            if ($settings['booking_advance'] < 1) {
                $errors[] = 'Booking advance days must be at least 1';
            }
            
            if (!empty($errors)) {
                sendResponse(['error' => 'Validation failed', 'details' => $errors], 400);
                return;
            }
            
            // In a real application, this would update the settings in the database
            sendResponse([
                'success' => true,
                'message' => 'Settings updated successfully',
                'settings' => $settings
            ]);
            
        } catch (Exception $e) {
            logError("Update settings error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to update settings'], 500);
        }
    }
}

// Handle the request
$adminAPI = new AdminAPI($currentUser);
$adminAPI->handleRequest();
?>