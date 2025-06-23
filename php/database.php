<?php
/**
 * Database connection and utility functions
 */

class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        $this->connect();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    private function connect() {
        try {
            // Try multiple ways to get database connection info
            $database_url = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
            
            if (!$database_url) {
                // Fall back to individual environment variables
                $host = $_ENV['PGHOST'] ?? getenv('PGHOST') ?? 'localhost';
                $port = $_ENV['PGPORT'] ?? getenv('PGPORT') ?? '5432';
                $dbname = $_ENV['PGDATABASE'] ?? getenv('PGDATABASE') ?? 'healthcare_plus';
                $user = $_ENV['PGUSER'] ?? getenv('PGUSER') ?? 'postgres';
                $password = $_ENV['PGPASSWORD'] ?? getenv('PGPASSWORD') ?? '';
                
                $database_url = "postgresql://$user:$password@$host:$port/$dbname";
            }
            
            // Parse the database URL
            $url_parts = parse_url($database_url);
            
            $host = $url_parts['host'];
            $port = $url_parts['port'] ?? 5432;
            $dbname = ltrim($url_parts['path'], '/');
            $user = $url_parts['user'];
            $password = $url_parts['pass'];
            
            $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
            
            $this->connection = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            
        } catch (Exception $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database query failed: " . $e->getMessage());
            throw new Exception("Database query failed");
        }
    }
    
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
    
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }
    
    public function insert($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $this->connection->lastInsertId();
    }
    
    public function update($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    public function commit() {
        return $this->connection->commit();
    }
    
    public function rollback() {
        return $this->connection->rollback();
    }
    
    public function generateBookingReference() {
        return 'HCP' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
    }
}