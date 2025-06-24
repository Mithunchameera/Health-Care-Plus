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
                // JOIN query to get complete doctor information
                $query = "SELECT d.id, d.specialty, d.subspecialties, d.license_number, d.experience_years, 
                         d.consultation_fee, d.rating, d.total_reviews, d.bio, d.languages, 
                         d.hospital_affiliations, d.is_available,
                         u.first_name, u.last_name, u.phone, u.email, u.city, u.country 
                         FROM doctors d 
                         JOIN users u ON d.user_id = u.id 
                         WHERE 1=1";
                
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
                    $query .= " AND u.city ILIKE ?";
                    $params[] = "%$hospital%";
                }
                
                $query .= " ORDER BY d.rating DESC, d.total_reviews DESC";
                
                $doctors = $this->database->fetchAll($query, $params);
                
                // Format the response to match frontend expectations
                $formattedDoctors = array_map(function($doctor) {
                    return [
                        'id' => $doctor['id'],
                        'name' => $doctor['first_name'] . ' ' . $doctor['last_name'],
                        'specialty' => $doctor['specialty'],
                        'subspecialties' => $doctor['subspecialties'] ? explode(', ', $doctor['subspecialties']) : [],
                        'education' => 'Medical Degree',
                        'experience' => $doctor['experience_years'],
                        'location' => $doctor['city'] . ', ' . $doctor['country'],
                        'phone' => $doctor['phone'],
                        'email' => $doctor['email'],
                        'fee' => floatval($doctor['consultation_fee']),
                        'rating' => floatval($doctor['rating']),
                        'reviews' => intval($doctor['total_reviews']),
                        'about' => $doctor['bio'],
                        'services' => [],
                        'certifications' => [],
                        'languages' => $doctor['languages'] ? json_decode($doctor['languages'], true) : ['English', 'Sinhala'],
                        'available' => $doctor['is_available'] == 1,
                        'patients_treated' => intval($doctor['total_reviews']) * 10
                    ];
                }, $doctors);
                
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'doctors' => $formattedDoctors]);
            } else {
                // Fall back to mock data
                $this->returnMockDoctors($specialty, $hospital);
            }
            
        } catch (Exception $e) {
            error_log("Database error in getDoctorsList: " . $e->getMessage());
            // Fallback to mock data
            $this->returnMockDoctors($specialty, $hospital);
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
            
            // First try to get from database
            if ($this->database) {
                $doctor = $this->database->fetchOne(
                    "SELECT * FROM doctors WHERE id = ?",
                    [$doctorId]
                );
                
                if ($doctor) {
                    // Format the response to match frontend expectations
                    $formattedDoctor = [
                        'id' => $doctor['id'],
                        'name' => $doctor['name'],
                        'specialty' => $doctor['specialty'],
                        'subspecialties' => isset($doctor['subspecialties']) ? json_decode($doctor['subspecialties'], true) : [],
                        'education' => $doctor['education'] ?? 'Medical Degree',
                        'experience' => $doctor['experience'] ?? 10,
                        'location' => $doctor['location'] ?? 'Various Hospitals',
                        'phone' => $doctor['phone'],
                        'email' => $doctor['email'],
                        'fee' => floatval($doctor['fee']),
                        'rating' => floatval($doctor['rating']),
                        'reviews' => intval($doctor['reviews']),
                        'about' => $doctor['about'],
                        'services' => isset($doctor['services']) ? json_decode($doctor['services'], true) : [],
                        'certifications' => isset($doctor['certifications']) ? json_decode($doctor['certifications'], true) : [],
                        'languages' => isset($doctor['languages']) ? json_decode($doctor['languages'], true) : [],
                        'available' => $doctor['available'] ?? true,
                        'patients_treated' => $doctor['patients_treated'] ?? 0
                    ];
                    
                    header('Content-Type: application/json');
                    echo json_encode($formattedDoctor);
                    return;
                }
            }
            
            // Fallback to mock data if database fails or doctor not found
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
    
    private function returnMockDoctors($specialty = null, $hospital = null) {
        $mockDoctors = $this->mockStorage->getDoctors();
        
        // Filter by specialty if provided
        if ($specialty && $specialty !== 'all') {
            $mockDoctors = array_filter($mockDoctors, function($doctor) use ($specialty) {
                return strcasecmp($doctor['specialty'], $specialty) === 0;
            });
        }
        
        // Filter by hospital if provided
        if ($hospital && $hospital !== 'all') {
            $mockDoctors = array_filter($mockDoctors, function($doctor) use ($hospital) {
                return isset($doctor['hospital']) && strcasecmp($doctor['hospital'], $hospital) === 0;
            });
        }
        
        // Reindex array
        $mockDoctors = array_values($mockDoctors);
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'doctors' => $mockDoctors]);
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