<?php
/**
 * Doctors API Handler
 * Manages doctor listings, profiles, and related operations
 */

require_once 'config.php';
require_once 'database.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class DoctorsHandler {
    private $mockStorage;
    private $database;
    
    public function __construct() {
        $this->mockStorage = MockDataStorage::getInstance();
        try {
            $this->database = Database::getInstance();
        } catch (Exception $e) {
            error_log("Database connection failed in DoctorsHandler: " . $e->getMessage());
            $this->database = null;
        }
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            $this->handleGetRequest();
        } elseif ($method === 'POST') {
            $this->handlePostRequest();
        } else {
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Method not allowed']);
        }
    }
    
    private function handleGetRequest() {
        $doctorId = $_GET['id'] ?? null;
        $hospital = $_GET['hospital'] ?? null;
        $specialty = $_GET['specialty'] ?? null;
        
        if ($doctorId) {
            $this->getDoctorProfile($doctorId);
        } else {
            $this->getDoctorsList();
        }
    }
    
    private function handlePostRequest() {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'POST not implemented']);
    }
    
    private function getDoctorsList() {
        try {
            $specialty = $_GET['specialty'] ?? '';
            $search = $_GET['search'] ?? '';
            $hospital = $_GET['hospital'] ?? '';
            
            if ($this->database) {
                // Base query to get doctors with user information
                $query = "SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.profile_picture 
                          FROM doctors d 
                          JOIN users u ON d.user_id = u.id 
                          WHERE u.is_active = true";
                
                $params = [];
                
                // Add filters
                if (!empty($specialty)) {
                    $query .= " AND d.specialty ILIKE ?";
                    $params[] = "%$specialty%";
                }
                
                if (!empty($search)) {
                    $query .= " AND (u.first_name ILIKE ? OR u.last_name ILIKE ? OR d.specialty ILIKE ?)";
                    $params[] = "%$search%";
                    $params[] = "%$search%";
                    $params[] = "%$search%";
                }
                
                if (!empty($hospital)) {
                    $query .= " AND ? = ANY(d.hospital_affiliations)";
                    $params[] = $hospital;
                }
                
                $query .= " ORDER BY d.rating DESC, d.total_reviews DESC";
                
                $doctors = $this->database->fetchAll($query, $params);
                
                // Format the response to match frontend expectations
                $formattedDoctors = array_map(function($doctor) {
                    return [
                        'id' => $doctor['user_id'],
                        'name' => $doctor['first_name'] . ' ' . $doctor['last_name'],
                        'specialty' => $doctor['specialty'],
                        'subspecialties' => [],
                        'education' => $doctor['education'] ?? 'Medical Degree',
                        'experience' => $doctor['experience_years'] ?? 10,
                        'location' => 'Various Hospitals',
                        'phone' => $doctor['phone'],
                        'email' => $doctor['email'],
                        'fee' => floatval($doctor['consultation_fee']),
                        'rating' => floatval($doctor['rating']),
                        'reviews' => intval($doctor['total_reviews']),
                        'about' => $doctor['bio'],
                        'services' => ['Board Certified'],
                        'certifications' => ['Board Certified'],
                        'languages' => ['English'],
                        'available' => $doctor['is_available'] ?? true,
                        'patients_treated' => $doctor['total_reviews'] * 10
                    ];
                }, $doctors);
                
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'doctors' => $formattedDoctors]);
            } else {
                // Fall back to mock data
                $this->getMockDoctors($specialty, $hospital);
            }
            
        } catch (Exception $e) {
            error_log("Database error in getDoctorsList: " . $e->getMessage());
            // Fallback to mock data
            $this->getMockDoctors($specialty, $hospital);
        }
    }
    
    private function getDoctorProfile($doctorId) {
        try {
            $doctorId = (int)$doctorId;
            
            if ($doctorId <= 0) {
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Invalid doctor ID']);
                return;
            }
            
            $doctor = $this->mockStorage->getDoctorById($doctorId);
            
            if (!$doctor) {
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Doctor not found']);
                return;
            }
            
            header('Content-Type: application/json');
            echo json_encode($doctor);
            
        } catch (Exception $e) {
            error_log("Error getting doctor profile: " . $e->getMessage());
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Failed to load doctor profile']);
        }
    }
}

// Initialize and handle the request
try {
    $handler = new DoctorsHandler();
    $handler->handleRequest();
} catch (Exception $e) {
    error_log("Fatal error in doctors.php: " . $e->getMessage());
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>