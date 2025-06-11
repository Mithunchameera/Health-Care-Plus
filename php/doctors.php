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
            $limit = min((int)($_GET['limit'] ?? 50), 100);
            $offset = max((int)($_GET['offset'] ?? 0), 0);
            
            $doctors = $this->mockStorage->getDoctors();
            $filteredDoctors = [];
            
            foreach ($doctors as $doctor) {
                // Filter by specialty
                if (!empty($specialty) && strcasecmp($doctor['specialty'], $specialty) !== 0) {
                    continue;
                }
                
                // Search in name or specialty
                if (!empty($search)) {
                    $searchLower = strtolower($search);
                    if (strpos(strtolower($doctor['name']), $searchLower) === false && 
                        strpos(strtolower($doctor['specialty']), $searchLower) === false) {
                        continue;
                    }
                }
                
                // Filter by availability
                if ($available !== '' && $doctor['available'] != (bool)$available) {
                    continue;
                }
                
                $filteredDoctors[] = $this->processDoctorData($doctor);
            }
            
            // Sort by rating desc, then name asc
            usort($filteredDoctors, function($a, $b) {
                if ($a['rating'] == $b['rating']) {
                    return strcmp($a['name'], $b['name']);
                }
                return $b['rating'] <=> $a['rating'];
            });
            
            $totalCount = count($filteredDoctors);
            $paginatedDoctors = array_slice($filteredDoctors, $offset, $limit);
            
            sendResponse([
                'success' => true,
                'doctors' => $paginatedDoctors,
                'pagination' => [
                    'total' => $totalCount,
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
            
            $doctor = $this->mockStorage->getDoctorById($doctorId);
            
            if (!$doctor) {
                sendResponse(['error' => 'Doctor not found'], 404);
            }
            
            $processedDoctor = $this->processDoctorData($doctor);
            
            // Add mock additional data
            $processedDoctor['appointmentsCompleted'] = rand(50, 500);
            
            // Generate available dates (next 7 days)
            $availableDates = [];
            for ($i = 1; $i <= 7; $i++) {
                $availableDates[] = date('Y-m-d', strtotime("+{$i} days"));
            }
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
            
            $doctors = $this->mockStorage->getDoctors();
            $results = [];
            
            foreach ($doctors as $doctor) {
                $relevanceScore = 0;
                $queryLower = strtolower($query);
                
                // Calculate relevance score
                if (strpos(strtolower($doctor['name']), $queryLower) !== false) {
                    $relevanceScore += 3;
                }
                if (strpos(strtolower($doctor['specialty']), $queryLower) !== false) {
                    $relevanceScore += 2;
                }
                if (strpos(strtolower($doctor['about']), $queryLower) !== false) {
                    $relevanceScore += 1;
                }
                
                if ($relevanceScore > 0) {
                    $doctor['relevance_score'] = $relevanceScore;
                    
                    // Apply filters
                    $matchesFilters = true;
                    
                    if (!empty($filters['specialty']) && strcasecmp($doctor['specialty'], $filters['specialty']) !== 0) {
                        $matchesFilters = false;
                    }
                    
                    if (!empty($filters['experience'])) {
                        $minExperience = (int)str_replace('+', '', $filters['experience']);
                        if ($doctor['experience'] < $minExperience) {
                            $matchesFilters = false;
                        }
                    }
                    
                    if (!empty($filters['rating'])) {
                        $minRating = (float)str_replace('+', '', $filters['rating']);
                        if ($doctor['rating'] < $minRating) {
                            $matchesFilters = false;
                        }
                    }
                    
                    if (isset($filters['available']) && $filters['available'] !== '' && $doctor['available'] != (bool)$filters['available']) {
                        $matchesFilters = false;
                    }
                    
                    if ($matchesFilters) {
                        $results[] = $this->processDoctorData($doctor);
                    }
                }
            }
            
            // Sort by relevance score, then rating
            usort($results, function($a, $b) {
                if ($a['relevance_score'] == $b['relevance_score']) {
                    return $b['rating'] <=> $a['rating'];
                }
                return $b['relevance_score'] <=> $a['relevance_score'];
            });
            
            $results = array_slice($results, 0, 20);
            
            sendResponse([
                'success' => true,
                'query' => $query,
                'results' => $results,
                'count' => count($results)
            ]);
            
        } catch (Exception $e) {
            logError("Error searching doctors: " . $e->getMessage());
            sendResponse(['error' => 'Search failed'], 500);
        }
    }
    
    private function filterDoctors() {
        try {
            $filters = $_POST['filters'] ?? [];
            
            $doctors = $this->mockStorage->getDoctors();
            $results = [];
            
            foreach ($doctors as $doctor) {
                $matchesFilters = true;
                
                foreach ($filters as $key => $value) {
                    if (empty($value)) continue;
                    
                    switch ($key) {
                        case 'specialty':
                            if (strcasecmp($doctor['specialty'], $value) !== 0) {
                                $matchesFilters = false;
                            }
                            break;
                            
                        case 'experience':
                            $minExperience = (int)str_replace('+', '', $value);
                            if ($doctor['experience'] < $minExperience) {
                                $matchesFilters = false;
                            }
                            break;
                            
                        case 'rating':
                            $minRating = (float)str_replace('+', '', $value);
                            if ($doctor['rating'] < $minRating) {
                                $matchesFilters = false;
                            }
                            break;
                            
                        case 'location':
                            if (strpos(strtolower($doctor['location']), strtolower($value)) === false) {
                                $matchesFilters = false;
                            }
                            break;
                            
                        case 'available':
                            if ($doctor['available'] != (bool)$value) {
                                $matchesFilters = false;
                            }
                            break;
                            
                        case 'fee_max':
                            if ($doctor['fee'] > (float)$value) {
                                $matchesFilters = false;
                            }
                            break;
                            
                        case 'fee_min':
                            if ($doctor['fee'] < (float)$value) {
                                $matchesFilters = false;
                            }
                            break;
                    }
                    
                    if (!$matchesFilters) break;
                }
                
                if ($matchesFilters) {
                    $results[] = $this->processDoctorData($doctor);
                }
            }
            
            // Sort by rating desc, then name asc
            usort($results, function($a, $b) {
                if ($a['rating'] == $b['rating']) {
                    return strcmp($a['name'], $b['name']);
                }
                return $b['rating'] <=> $a['rating'];
            });
            
            $results = array_slice($results, 0, 50);
            
            sendResponse([
                'success' => true,
                'filters' => $filters,
                'results' => $results,
                'count' => count($results)
            ]);
            
        } catch (Exception $e) {
            logError("Error filtering doctors: " . $e->getMessage());
            sendResponse(['error' => 'Filter failed'], 500);
        }
    }
    
    private function processDoctorData($doctor) {
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
        $doctors = $this->mockStorage->getDoctors();
        $specialties = array_unique(array_column($doctors, 'specialty'));
        sort($specialties);
        return $specialties;
    }
}

// Handle the request
$doctorsHandler = new DoctorsHandler();
$doctorsHandler->handleRequest();
?>