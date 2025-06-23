<?php
/**
 * Doctors API Handler
 * Manages doctor listings, profiles, and related operations
 */

require_once 'config.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class DoctorsHandler {
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
            require_once 'database.php';
            $db = Database::getInstance();
            $conn = $db->getConnection();
            
            $specialty = $_GET['specialty'] ?? '';
            $search = $_GET['search'] ?? '';
            $hospital = $_GET['hospital'] ?? '';
            
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
            
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $doctors = $stmt->fetchAll();
            
            // Format the response to match frontend expectations
            $formattedDoctors = array_map(function($doctor) {
                return [
                    'id' => $doctor['id'],
                    'name' => $doctor['first_name'] . ' ' . $doctor['last_name'],
                    'specialty' => $doctor['specialty'],
                    'subspecialities' => is_array($doctor['certifications']) ? $doctor['certifications'] : (is_string($doctor['certifications']) ? explode(',', str_replace(['{', '}', '"'], '', $doctor['certifications'])) : []),
                    'education' => $doctor['education'] ?? 'Medical Degree',
                    'experience' => $doctor['experience_years'],
                    'location' => is_array($doctor['hospital_affiliations']) ? implode(', ', $doctor['hospital_affiliations']) : (is_string($doctor['hospital_affiliations']) ? str_replace(['{', '}', '"'], '', $doctor['hospital_affiliations']) : 'Various Hospitals'),
                    'phone' => $doctor['phone'],
                    'email' => $doctor['email'],
                    'fee' => floatval($doctor['consultation_fee']),
                    'rating' => floatval($doctor['rating']),
                    'reviews' => intval($doctor['total_reviews']),
                    'about' => $doctor['bio'],
                    'services' => is_array($doctor['certifications']) ? $doctor['certifications'] : (is_string($doctor['certifications']) ? explode(',', str_replace(['{', '}', '"'], '', $doctor['certifications'])) : []),
                    'certifications' => is_array($doctor['certifications']) ? $doctor['certifications'] : (is_string($doctor['certifications']) ? explode(',', str_replace(['{', '}', '"'], '', $doctor['certifications'])) : []),
                    'languages' => is_array($doctor['languages']) ? $doctor['languages'] : (is_string($doctor['languages']) ? explode(',', str_replace(['{', '}', '"'], '', $doctor['languages'])) : ['English']),
                    'available' => $doctor['is_available'],
                    'patients_treated' => $doctor['total_reviews'] * 10
                ];
            }, $doctors);
            
            header('Content-Type: application/json');
            echo json_encode($formattedDoctors);
            
        } catch (Exception $e) {
            error_log("Database error in getDoctorsList: " . $e->getMessage());
            // Fallback to mock data
            $doctors = $this->mockStorage->getDoctors();
            
            if (!empty($specialty)) {
                $doctors = array_filter($doctors, function($doctor) use ($specialty) {
                    return stripos($doctor['specialty'], $specialty) !== false;
                });
            }
            
            $doctors = array_values($doctors);
            header('Content-Type: application/json');
            echo json_encode($doctors);
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