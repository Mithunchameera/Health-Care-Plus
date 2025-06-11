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
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
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
        $doctorId = $_GET['id'] ?? null;
        
        if ($doctorId) {
            $this->getDoctorProfile($doctorId);
        } else {
            $this->getDoctorsList();
        }
    }
    
    private function handlePostRequest() {
        $action = $_POST['action'] ?? '';
        
        switch ($action) {
            case 'search':
                $this->searchDoctors();
                break;
            case 'filter':
                $this->filterDoctors();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function getDoctorsList() {
        try {
            // Get query parameters for filtering
            $specialty = $_GET['specialty'] ?? '';
            $search = $_GET['search'] ?? '';
            $available = $_GET['available'] ?? '';
            $limit = min((int)($_GET['limit'] ?? 50), 100); // Max 100 results
            $offset = max((int)($_GET['offset'] ?? 0), 0);
            
            // Build query
            $sql = "SELECT * FROM doctors WHERE 1=1";
            $params = [];
            
            // Filter by specialty
            if (!empty($specialty)) {
                $sql .= " AND LOWER(specialty) = LOWER(?)";
                $params[] = $specialty;
            }
            
            // Search in name or specialty
            if (!empty($search)) {
                $sql .= " AND (LOWER(name) LIKE LOWER(?) OR LOWER(specialty) LIKE LOWER(?))";
                $searchParam = "%{$search}%";
                $params[] = $searchParam;
                $params[] = $searchParam;
            }
            
            // Filter by availability
            if ($available !== '') {
                $sql .= " AND available = ?";
                $params[] = (bool)$available;
            }
            
            // Add ordering
            $sql .= " ORDER BY rating DESC, name ASC";
            
            // Add pagination
            $sql .= " LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $doctors = $stmt->fetchAll();
            
            // Process doctors data
            $processedDoctors = array_map([$this, 'processDoctorData'], $doctors);
            
            // Get total count for pagination
            $countSql = "SELECT COUNT(*) FROM doctors WHERE 1=1";
            $countParams = [];
            
            if (!empty($specialty)) {
                $countSql .= " AND LOWER(specialty) = LOWER(?)";
                $countParams[] = $specialty;
            }
            
            if (!empty($search)) {
                $countSql .= " AND (LOWER(name) LIKE LOWER(?) OR LOWER(specialty) LIKE LOWER(?))";
                $searchParam = "%{$search}%";
                $countParams[] = $searchParam;
                $countParams[] = $searchParam;
            }
            
            if ($available !== '') {
                $countSql .= " AND available = ?";
                $countParams[] = (bool)$available;
            }
            
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($countParams);
            $totalCount = $countStmt->fetchColumn();
            
            sendResponse([
                'success' => true,
                'doctors' => $processedDoctors,
                'pagination' => [
                    'total' => (int)$totalCount,
                    'limit' => $limit,
                    'offset' => $offset,
                    'hasMore' => ($offset + $limit) < $totalCount
                ]
            ]);
            
        } catch (Exception $e) {
            logError("Error getting doctors list: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load doctors'], 500);
        }
    }
    
    private function getDoctorProfile($doctorId) {
        try {
            $doctorId = (int)$doctorId;
            
            if ($doctorId <= 0) {
                sendResponse(['error' => 'Invalid doctor ID'], 400);
            }
            
            $stmt = $this->db->prepare("SELECT * FROM doctors WHERE id = ?");
            $stmt->execute([$doctorId]);
            $doctor = $stmt->fetch();
            
            if (!$doctor) {
                sendResponse(['error' => 'Doctor not found'], 404);
            }
            
            // Process doctor data
            $processedDoctor = $this->processDoctorData($doctor);
            
            // Get recent appointments count
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as appointment_count 
                FROM appointments 
                WHERE doctor_id = ? AND status = 'completed'
            ");
            $stmt->execute([$doctorId]);
            $appointmentData = $stmt->fetch();
            $processedDoctor['appointmentsCompleted'] = (int)$appointmentData['appointment_count'];
            
            // Get available dates (next 30 days with available slots)
            $stmt = $this->db->prepare("
                SELECT DISTINCT date 
                FROM time_slots 
                WHERE doctor_id = ? AND date >= CURRENT_DATE AND date <= CURRENT_DATE + INTERVAL '30 days' 
                AND is_available = TRUE 
                ORDER BY date LIMIT 10
            ");
            $stmt->execute([$doctorId]);
            $availableDates = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $processedDoctor['availableDates'] = $availableDates;
            
            sendResponse($processedDoctor);
            
        } catch (Exception $e) {
            logError("Error getting doctor profile: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load doctor profile'], 500);
        }
    }
    
    private function searchDoctors() {
        try {
            $query = sanitizeInput($_POST['query'] ?? '');
            $filters = $_POST['filters'] ?? [];
            
            if (empty($query)) {
                sendResponse(['error' => 'Search query is required'], 400);
            }
            
            $sql = "
                SELECT *, 
                CASE 
                    WHEN LOWER(name) LIKE LOWER(?) THEN 3
                    WHEN LOWER(specialty) LIKE LOWER(?) THEN 2
                    WHEN LOWER(about) LIKE LOWER(?) THEN 1
                    ELSE 0
                END as relevance_score
                FROM doctors 
                WHERE (
                    LOWER(name) LIKE LOWER(?) OR 
                    LOWER(specialty) LIKE LOWER(?) OR 
                    LOWER(about) LIKE LOWER(?) OR
                    LOWER(subspecialties::text) LIKE LOWER(?) OR
                    LOWER(services::text) LIKE LOWER(?)
                )
            ";
            
            $searchParam = "%{$query}%";
            $params = array_fill(0, 8, $searchParam);
            
            // Apply filters
            if (isset($filters['specialty']) && !empty($filters['specialty'])) {
                $sql .= " AND LOWER(specialty) = LOWER(?)";
                $params[] = $filters['specialty'];
            }
            
            if (isset($filters['experience']) && !empty($filters['experience'])) {
                $minExperience = (int)str_replace('+', '', $filters['experience']);
                $sql .= " AND experience >= ?";
                $params[] = $minExperience;
            }
            
            if (isset($filters['rating']) && !empty($filters['rating'])) {
                $minRating = (float)str_replace('+', '', $filters['rating']);
                $sql .= " AND rating >= ?";
                $params[] = $minRating;
            }
            
            if (isset($filters['available']) && $filters['available'] !== '') {
                $sql .= " AND available = ?";
                $params[] = (bool)$filters['available'];
            }
            
            $sql .= " ORDER BY relevance_score DESC, rating DESC, name ASC LIMIT 20";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $doctors = $stmt->fetchAll();
            
            $processedDoctors = array_map([$this, 'processDoctorData'], $doctors);
            
            sendResponse([
                'success' => true,
                'query' => $query,
                'results' => $processedDoctors,
                'count' => count($processedDoctors)
            ]);
            
        } catch (Exception $e) {
            logError("Error searching doctors: " . $e->getMessage());
            sendResponse(['error' => 'Search failed'], 500);
        }
    }
    
    private function filterDoctors() {
        try {
            $filters = $_POST['filters'] ?? [];
            
            $sql = "SELECT * FROM doctors WHERE 1=1";
            $params = [];
            
            foreach ($filters as $key => $value) {
                if (empty($value)) continue;
                
                switch ($key) {
                    case 'specialty':
                        $sql .= " AND LOWER(specialty) = LOWER(?)";
                        $params[] = $value;
                        break;
                        
                    case 'experience':
                        $minExperience = (int)str_replace('+', '', $value);
                        $sql .= " AND experience >= ?";
                        $params[] = $minExperience;
                        break;
                        
                    case 'rating':
                        $minRating = (float)str_replace('+', '', $value);
                        $sql .= " AND rating >= ?";
                        $params[] = $minRating;
                        break;
                        
                    case 'location':
                        $sql .= " AND LOWER(location) LIKE LOWER(?)";
                        $params[] = "%{$value}%";
                        break;
                        
                    case 'available':
                        $sql .= " AND available = ?";
                        $params[] = (bool)$value;
                        break;
                        
                    case 'fee_max':
                        $sql .= " AND fee <= ?";
                        $params[] = (float)$value;
                        break;
                        
                    case 'fee_min':
                        $sql .= " AND fee >= ?";
                        $params[] = (float)$value;
                        break;
                }
            }
            
            $sql .= " ORDER BY rating DESC, name ASC LIMIT 50";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $doctors = $stmt->fetchAll();
            
            $processedDoctors = array_map([$this, 'processDoctorData'], $doctors);
            
            sendResponse([
                'success' => true,
                'filters' => $filters,
                'results' => $processedDoctors,
                'count' => count($processedDoctors)
            ]);
            
        } catch (Exception $e) {
            logError("Error filtering doctors: " . $e->getMessage());
            sendResponse(['error' => 'Filter failed'], 500);
        }
    }
    
    private function processDoctorData($doctor) {
        // Decode JSON fields
        $doctor['subspecialties'] = json_decode($doctor['subspecialties'] ?? '[]', true) ?: [];
        $doctor['services'] = json_decode($doctor['services'] ?? '[]', true) ?: [];
        $doctor['certifications'] = json_decode($doctor['certifications'] ?? '[]', true) ?: [];
        $doctor['languages'] = json_decode($doctor['languages'] ?? '[]', true) ?: [];
        $doctor['working_hours'] = json_decode($doctor['working_hours'] ?? '[]', true) ?: [];
        
        // Convert numeric fields
        $doctor['id'] = (int)$doctor['id'];
        $doctor['experience'] = (int)$doctor['experience'];
        $doctor['fee'] = (float)$doctor['fee'];
        $doctor['rating'] = (float)$doctor['rating'];
        $doctor['reviews'] = (int)$doctor['reviews'];
        $doctor['patients_treated'] = (int)$doctor['patients_treated'];
        $doctor['available'] = (bool)$doctor['available'];
        
        // Add computed fields
        $doctor['fullName'] = 'Dr. ' . $doctor['name'];
        $doctor['experienceText'] = $doctor['experience'] . ' years experience';
        $doctor['feeFormatted'] = '$' . number_format($doctor['fee'], 2);
        $doctor['ratingFormatted'] = number_format($doctor['rating'], 1);
        
        // Add profile URL
        $doctor['profileUrl'] = "profile.html?doctor={$doctor['id']}";
        
        // Add booking URL
        $doctor['bookingUrl'] = "booking.html?doctor={$doctor['id']}";
        
        return $doctor;
    }
    
    public function getSpecialties() {
        try {
            $stmt = $this->db->query("SELECT DISTINCT specialty FROM doctors ORDER BY specialty");
            $specialties = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            return $specialties;
        } catch (Exception $e) {
            logError("Error getting specialties: " . $e->getMessage());
            return [];
        }
    }
    
    public function getDoctorStats($doctorId) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
                    AVG(CASE WHEN status = 'completed' THEN 5 END) as avg_rating
                FROM appointments 
                WHERE doctor_id = ?
            ");
            $stmt->execute([$doctorId]);
            
            return $stmt->fetch();
        } catch (Exception $e) {
            logError("Error getting doctor stats: " . $e->getMessage());
            return null;
        }
    }
}

// Handle the request
$doctorsHandler = new DoctorsHandler();
$doctorsHandler->handleRequest();
?>
