<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const DB_NAME = 'u769677815_cloudempiredb';
const DB_USER = 'u769677815_cloudempiredb';

function respond(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function private_dir(): string {
    // This resolves beside public_html on both Hostinger directory layouts.
    $directory = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.cloudempire-data';
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        respond(503, ['error' => 'Private storage is unavailable.']);
    }
    if (!is_writable($directory)) respond(503, ['error' => 'Private storage is not writable.']);
    return $directory;
}

function config_path(): string {
    return private_dir() . DIRECTORY_SEPARATOR . 'database.php';
}

function connect_database(string $password): PDO {
    return new PDO(
        'mysql:host=localhost;dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => true,
        ]
    );
}

function database(): ?PDO {
    static $connection = false;
    if ($connection !== false) return $connection;
    $path = config_path();
    if (!is_file($path)) return $connection = null;
    $settings = require $path;
    if (!is_array($settings) || !isset($settings['password'])) {
        respond(503, ['error' => 'Database configuration is invalid.']);
    }
    try {
        return $connection = connect_database((string)$settings['password']);
    } catch (Throwable $error) {
        error_log('CloudEmpire database connection failed: ' . $error->getMessage());
        respond(503, ['error' => 'Database connection failed. Update the password in Admin → Database.']);
    }
}

function start_admin_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $sessions = private_dir() . DIRECTORY_SEPARATOR . 'sessions';
    if (!is_dir($sessions) && !@mkdir($sessions,0700,true) && !is_dir($sessions)) respond(503,['error'=>'Private session storage is unavailable.']);
    session_save_path($sessions);
    session_name('cloudempire_admin');
    session_set_cookie_params(['lifetime'=>0,'path'=>'/api/','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
    ini_set('session.use_strict_mode','1');
    if (!session_start()) respond(503,['error'=>'Admin session could not start.']);
}

function admin_logged_in(): bool {
    start_admin_session();
    $id=$_SESSION['admin_id'] ?? null;
    if (!is_int($id) || $id<1 || ($_SESSION['signed_in_at'] ?? 0) <= time()-28800) return false;
    $db=database();
    if ($db===null) return false;
    $q=$db->prepare('SELECT 1 FROM ce_admin_users WHERE id=?');
    $q->execute([$id]);
    return (bool)$q->fetchColumn();
}

function verify_owner(bool $write=false): void {
    verify_admin($write);
    if (($_SESSION['admin_id'] ?? null)!==1) respond(403,['error'=>'Only the account owner can manage this setting.']);
}

function verify_admin(bool $write = false): void {
    if (!admin_logged_in()) respond(401, ['error'=>'Sign in required.']);
    if ($write) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $expected = 'https://' . ($_SERVER['HTTP_HOST'] ?? '');
        if ($origin !== '' && $origin !== $expected) respond(403,['error'=>'Origin is not allowed.']);
        $given = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!is_string($given) || !hash_equals((string)($_SESSION['csrf'] ?? ''),$given)) respond(403,['error'=>'Session check failed. Refresh the admin page.']);
    }
}

function append_legacy(string $name, array $record): void {
    // Preserve events until database setup succeeds, then import them once.
    $path = private_dir() . DIRECTORY_SEPARATOR . $name . '.jsonl';
    $line = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE) . "\n";
    if (file_put_contents($path, $line, FILE_APPEND | LOCK_EX) === false) respond(503, ['error' => 'Unable to save data.']);
    @chmod($path, 0600);
}

function legacy_records(string $name): array {
    $path = private_dir() . DIRECTORY_SEPARATOR . $name . '.jsonl';
    if (!is_file($path)) return [];
    $result = [];
    $file = new SplFileObject($path, 'r');
    $index = 0;
    while (!$file->eof()) {
        $line = trim($file->fgets());
        if ($line === '') continue;
        $record = json_decode($line, true);
        if (is_array($record)) {
            $record['_source_key'] = hash('sha256', $name . ':' . $index . ':' . $line);
            $result[] = $record;
        }
        $index++;
    }
    return $result;
}

function append_record(string $name, array $record): void {
    $db = database();
    if ($db === null) {
        append_legacy($name, $record);
        return;
    }
    try {
        if ($name === 'views') {
            $statement = $db->prepare('INSERT INTO ce_views (event_day, path) VALUES (?, ?)');
            $statement->execute([$record['date'], $record['path']]);
            if (!empty($record['utm_source']) || !empty($record['utm_medium']) || !empty($record['utm_campaign']) || !empty($record['utm_content']) || !empty($record['utm_term'])) {
                ensure_utm_table($db);
                $statement=$db->prepare('INSERT INTO ce_utm_views (event_day,path,utm_source,utm_medium,utm_campaign,utm_content,utm_term) VALUES (?,?,?,?,?,?,?)');
                $statement->execute([$record['date'],$record['path'],$record['utm_source'] ?? '',$record['utm_medium'] ?? '',$record['utm_campaign'] ?? '',$record['utm_content'] ?? '',$record['utm_term'] ?? '']);
            }
        } elseif ($name === 'messages') {
            $statement = $db->prepare('INSERT INTO ce_inquiries (created_at, name, email, phone, service, preferred_date, preferred_time, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            $statement->execute([
                gmdate('Y-m-d H:i:s'),
                $record['name'] ?? '',
                $record['email'] ?? '',
                $record['phone'] ?? '',
                $record['service'] ?? '',
                $record['datePreferred'] ?? '',
                $record['timePreferred'] ?? '',
                $record['message'] ?? '',
            ]);
        }
    } catch (Throwable $error) {
        error_log('CloudEmpire event insert failed: ' . $error->getMessage());
        respond(503, ['error' => 'Unable to save data in MySQL.']);
    }
}

function ensure_utm_table(PDO $db): void {
    $db->exec('CREATE TABLE IF NOT EXISTS ce_utm_views (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,event_day DATE NOT NULL,path VARCHAR(255) NOT NULL,utm_source VARCHAR(100) NOT NULL DEFAULT \'\',utm_medium VARCHAR(100) NOT NULL DEFAULT \'\',utm_campaign VARCHAR(150) NOT NULL DEFAULT \'\',utm_content VARCHAR(150) NOT NULL DEFAULT \'\',utm_term VARCHAR(150) NOT NULL DEFAULT \'\',INDEX (event_day),INDEX (utm_source),INDEX (utm_campaign)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
}
