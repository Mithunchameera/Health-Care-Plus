<?php
/**
 * Database and Application Configuration
 * HealthCare+ E-Channelling System
 */

// Error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database Configuration - Disabled for static demo
// define('DB_HOST', $_ENV['PGHOST'] ?? 'localhost');
// define('DB_NAME', $_ENV['PGDATABASE'] ?? 'healthcare_plus');
// define('DB_USER', $_ENV['PGUSER'] ?? 'postgres');
// define('DB_PASS', $_ENV['PGPASSWORD'] ?? '');
// define('DB_PORT', $_ENV['PGPORT'] ?? '5432');
// define('DB_CHARSET', 'utf8');

// Application Configuration
define('APP_NAME', 'HealthCare+');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost:5000');

// Security Configuration
define('SESSION_LIFETIME', 3600); // 1 hour
define('PASSWORD_MIN_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes

// Email Configuration (for notifications)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', '');
define('SMTP_PASSWORD', '');
define('FROM_EMAIL', 'noreply@healthcareplus.com');
define('FROM_NAME', 'HealthCare+');

// File Upload Configuration
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_DIR', 'uploads/');

// Timezone Configuration
date_default_timezone_set('America/New_York');

// CORS Headers for API requests
function setCORSHeaders() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json");
}

// Mock Data Storage Class (Static Demo Mode)
class MockDataStorage {
    private static $instance = null;
    private $doctors = [];
    private $appointments = [];
    private $users = [];
    private $sessions = [];
    
    private function __construct() {
        $this->initializeMockData();
        $this->initializeUsers();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function initializeMockData() {
        $this->doctors = [
            [
                'id' => 1,
                'name' => 'Sarah Johnson',
                'specialty' => 'Cardiology',
                'subspecialties' => ['Interventional Cardiology', 'Heart Failure'],
                'education' => 'Harvard Medical School',
                'experience' => 15,
                'location' => 'Medical Center, Downtown',
                'phone' => '+1 (555) 123-4567',
                'email' => 'dr.johnson@healthcareplus.com',
                'fee' => 250.00,
                'rating' => 4.8,
                'reviews' => 156,
                'about' => 'Dr. Johnson is a board-certified cardiologist with extensive experience in treating heart conditions.',
                'services' => ['Cardiac Consultation', 'ECG', 'Stress Testing', 'Heart Surgery'],
                'certifications' => ['Board Certified Cardiologist', 'Advanced Cardiac Life Support'],
                'languages' => ['English', 'Spanish'],
                'available' => true,
                'patients_treated' => 2500
            ],
            [
                'id' => 2,
                'name' => 'Michael Chen',
                'specialty' => 'Neurology',
                'subspecialties' => ['Stroke Medicine', 'Epilepsy'],
                'education' => 'Johns Hopkins Medical School',
                'experience' => 12,
                'location' => 'Neurological Institute, Uptown',
                'phone' => '+1 (555) 234-5678',
                'email' => 'dr.chen@healthcareplus.com',
                'fee' => 300.00,
                'rating' => 4.9,
                'reviews' => 203,
                'about' => 'Dr. Chen specializes in neurological disorders with a focus on stroke prevention and treatment.',
                'services' => ['Neurological Consultation', 'EEG', 'Brain Imaging', 'Stroke Treatment'],
                'certifications' => ['Board Certified Neurologist', 'Stroke Specialist'],
                'languages' => ['English', 'Mandarin'],
                'available' => true,
                'patients_treated' => 1800
            ],
            [
                'id' => 3,
                'name' => 'Emily Rodriguez',
                'specialty' => 'Pediatrics',
                'subspecialties' => ['Pediatric Emergency Medicine', 'Child Development'],
                'education' => 'Stanford Medical School',
                'experience' => 8,
                'location' => 'Children\'s Hospital, Westside',
                'phone' => '+1 (555) 345-6789',
                'email' => 'dr.rodriguez@healthcareplus.com',
                'fee' => 180.00,
                'rating' => 4.7,
                'reviews' => 89,
                'about' => 'Dr. Rodriguez is dedicated to providing comprehensive pediatric care for children of all ages.',
                'services' => ['Child Health Checkups', 'Vaccinations', 'Developmental Assessment'],
                'certifications' => ['Board Certified Pediatrician', 'Pediatric Advanced Life Support'],
                'languages' => ['English', 'Spanish'],
                'available' => true,
                'patients_treated' => 1200
            ],
            [
                'id' => 4,
                'name' => 'David Thompson',
                'specialty' => 'Orthopedics',
                'subspecialties' => ['Sports Medicine', 'Joint Replacement'],
                'education' => 'Mayo Clinic Medical School',
                'experience' => 20,
                'location' => 'Orthopedic Center, Central',
                'phone' => '+1 (555) 456-7890',
                'email' => 'dr.thompson@healthcareplus.com',
                'fee' => 275.00,
                'rating' => 4.6,
                'reviews' => 134,
                'about' => 'Dr. Thompson is an experienced orthopedic surgeon specializing in sports injuries and joint replacement.',
                'services' => ['Joint Surgery', 'Sports Injury Treatment', 'Physical Therapy'],
                'certifications' => ['Board Certified Orthopedic Surgeon', 'Sports Medicine Specialist'],
                'languages' => ['English'],
                'available' => false,
                'patients_treated' => 3200
            ],
            [
                'id' => 5,
                'name' => 'Lisa Park',
                'specialty' => 'Dermatology',
                'subspecialties' => ['Cosmetic Dermatology', 'Skin Cancer'],
                'education' => 'Yale Medical School',
                'experience' => 10,
                'location' => 'Dermatology Clinic, Eastside',
                'phone' => '+1 (555) 567-8901',
                'email' => 'dr.park@healthcareplus.com',
                'fee' => 220.00,
                'rating' => 4.5,
                'reviews' => 76,
                'about' => 'Dr. Park provides comprehensive dermatological care including cosmetic and medical treatments.',
                'services' => ['Skin Examination', 'Acne Treatment', 'Cosmetic Procedures'],
                'certifications' => ['Board Certified Dermatologist', 'Cosmetic Surgery Certified'],
                'languages' => ['English', 'Korean'],
                'available' => true,
                'patients_treated' => 950
            ]
        ];
    }
    
    private function initializeUsers() {
        $this->users = [
            // Patients
            [
                'id' => 1,
                'username' => 'patient1',
                'email' => 'john.doe@email.com',
                'password' => password_hash('password123', PASSWORD_DEFAULT),
                'role' => 'patient',
                'full_name' => 'John Doe',
                'phone' => '+1 (555) 111-1111',
                'date_of_birth' => '1990-05-15',
                'address' => '123 Main St, New York, NY 10001',
                'emergency_contact' => '+1 (555) 111-2222',
                'insurance_number' => 'INS123456789',
                'created_at' => '2024-01-15 10:30:00',
                'last_login' => '2025-06-10 14:20:00'
            ],
            [
                'id' => 2,
                'username' => 'patient2',
                'email' => 'maria.garcia@email.com',
                'password' => password_hash('password123', PASSWORD_DEFAULT),
                'role' => 'patient',
                'full_name' => 'Maria Garcia',
                'phone' => '+1 (555) 222-2222',
                'date_of_birth' => '1985-08-20',
                'address' => '456 Oak Ave, Los Angeles, CA 90210',
                'emergency_contact' => '+1 (555) 222-3333',
                'insurance_number' => 'INS987654321',
                'created_at' => '2024-02-20 09:15:00',
                'last_login' => '2025-06-09 16:45:00'
            ],
            // Doctors
            [
                'id' => 3,
                'username' => 'dr.johnson',
                'email' => 'dr.johnson@healthcareplus.com',
                'password' => password_hash('doctor123', PASSWORD_DEFAULT),
                'role' => 'doctor',
                'full_name' => 'Dr. Sarah Johnson',
                'phone' => '+1 (555) 123-4567',
                'doctor_id' => 1,
                'license_number' => 'MD123456',
                'department' => 'Cardiology',
                'created_at' => '2023-06-01 08:00:00',
                'last_login' => '2025-06-11 07:30:00'
            ],
            [
                'id' => 4,
                'username' => 'dr.chen',
                'email' => 'dr.chen@healthcareplus.com',
                'password' => password_hash('doctor123', PASSWORD_DEFAULT),
                'role' => 'doctor',
                'full_name' => 'Dr. Michael Chen',
                'phone' => '+1 (555) 234-5678',
                'doctor_id' => 2,
                'license_number' => 'MD234567',
                'department' => 'Neurology',
                'created_at' => '2023-07-15 08:00:00',
                'last_login' => '2025-06-10 18:20:00'
            ],
            [
                'id' => 5,
                'username' => 'dr.rodriguez',
                'email' => 'dr.rodriguez@healthcareplus.com',
                'password' => password_hash('doctor123', PASSWORD_DEFAULT),
                'role' => 'doctor',
                'full_name' => 'Dr. Emily Rodriguez',
                'phone' => '+1 (555) 345-6789',
                'doctor_id' => 3,
                'license_number' => 'MD345678',
                'department' => 'Pediatrics',
                'created_at' => '2023-08-20 08:00:00',
                'last_login' => '2025-06-11 09:15:00'
            ],
            // Admin/Hospital Staff
            [
                'id' => 6,
                'username' => 'admin',
                'email' => 'admin@healthcareplus.com',
                'password' => password_hash('admin123', PASSWORD_DEFAULT),
                'role' => 'admin',
                'full_name' => 'Hospital Administrator',
                'phone' => '+1 (555) 999-0000',
                'department' => 'Administration',
                'permissions' => ['manage_doctors', 'manage_appointments', 'view_reports', 'manage_users'],
                'created_at' => '2023-01-01 00:00:00',
                'last_login' => '2025-06-11 08:00:00'
            ],
            [
                'id' => 7,
                'username' => 'staff1',
                'email' => 'reception@healthcareplus.com',
                'password' => password_hash('staff123', PASSWORD_DEFAULT),
                'role' => 'staff',
                'full_name' => 'Reception Staff',
                'phone' => '+1 (555) 888-0000',
                'department' => 'Reception',
                'permissions' => ['manage_appointments', 'view_patients'],
                'created_at' => '2023-03-15 09:00:00',
                'last_login' => '2025-06-10 17:30:00'
            ]
        ];
    }
    
    public function getDoctors() {
        return $this->doctors;
    }
    
    public function getDoctorById($id) {
        foreach ($this->doctors as $doctor) {
            if ($doctor['id'] == $id) {
                return $doctor;
            }
        }
        return null;
    }
    
    public function getAvailableTimeSlots($doctorId, $date) {
        $workingHours = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30'
        ];
        
        return $workingHours;
    }
    
    public function saveAppointment($data) {
        $bookingId = 'BK' . date('Ymd') . sprintf('%06d', rand(100000, 999999));
        $appointment = array_merge($data, [
            'id' => count($this->appointments) + 1,
            'booking_id' => $bookingId,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        $this->appointments[] = $appointment;
        return $appointment;
    }
    
    public function getUsers() {
        return $this->users;
    }
    
    public function getUserByUsername($username) {
        foreach ($this->users as $user) {
            if ($user['username'] === $username) {
                return $user;
            }
        }
        return null;
    }
    
    public function getUserByEmail($email) {
        foreach ($this->users as $user) {
            if ($user['email'] === $email) {
                return $user;
            }
        }
        return null;
    }
    
    public function getUserById($id) {
        foreach ($this->users as $user) {
            if ($user['id'] == $id) {
                return $user;
            }
        }
        return null;
    }
    
    public function authenticateUser($username, $password) {
        $user = $this->getUserByUsername($username);
        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        return false;
    }
    
    public function createSession($userId) {
        $sessionId = bin2hex(random_bytes(32));
        $sessionData = [
            'user_id' => $userId,
            'created_at' => time(),
            'expires_at' => time() + SESSION_LIFETIME
        ];
        
        // Store session in file for persistence
        $sessionFile = sys_get_temp_dir() . '/healthcare_session_' . $sessionId;
        file_put_contents($sessionFile, json_encode($sessionData));
        
        return $sessionId;
    }
    
    public function getSession($sessionId) {
        $sessionFile = sys_get_temp_dir() . '/healthcare_session_' . $sessionId;
        
        if (file_exists($sessionFile)) {
            $sessionData = json_decode(file_get_contents($sessionFile), true);
            if ($sessionData && $sessionData['expires_at'] > time()) {
                return $sessionData;
            } else {
                // Session expired, clean up
                unlink($sessionFile);
            }
        }
        return null;
    }
    
    public function destroySession($sessionId) {
        $sessionFile = sys_get_temp_dir() . '/healthcare_session_' . $sessionId;
        if (file_exists($sessionFile)) {
            unlink($sessionFile);
            return true;
        }
        return false;
    }
    
    public function getAppointments() {
        return $this->appointments;
    }
    
    public function getAppointmentsByPatient($patientId) {
        return array_filter($this->appointments, function($appointment) use ($patientId) {
            return $appointment['patient_id'] == $patientId;
        });
    }
    
    public function getAppointmentsByDoctor($doctorId) {
        return array_filter($this->appointments, function($appointment) use ($doctorId) {
            return $appointment['doctor_id'] == $doctorId;
        });
    }

}

// Utility Functions
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePhone($phone) {
    $phone = preg_replace('/\D/', '', $phone);
    return strlen($phone) >= 10 && strlen($phone) <= 15;
}

function generateBookingId() {
    return 'HC' . date('Ymd') . rand(1000, 9999);
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    setCORSHeaders();
    echo json_encode($data);
    exit;
}

function logError($message, $context = []) {
    $logMessage = date('Y-m-d H:i:s') . " - " . $message;
    if (!empty($context)) {
        $logMessage .= " - Context: " . json_encode($context);
    }
    error_log($logMessage);
}

// Global authentication function
function checkUserAuth($allowedRoles = []) {
    $sessionId = $_COOKIE['session_id'] ?? '';
    
    if (empty($sessionId)) {
        return null;
    }
    
    $mockStorage = MockDataStorage::getInstance();
    $session = $mockStorage->getSession($sessionId);
    
    if ($session) {
        $user = $mockStorage->getUserById($session['user_id']);
        if ($user && (empty($allowedRoles) || in_array($user['role'], $allowedRoles))) {
            return $user;
        }
    }
    
    return null;
}

// Initialize mock data storage (static demo mode)
try {
    $mockStorage = MockDataStorage::getInstance();
} catch (Exception $e) {
    logError("Mock storage initialization failed: " . $e->getMessage());
}
?>
