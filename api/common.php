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

function verify_admin(): void {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($header === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) $header = $value;
        }
    }
    if (!preg_match('/^Bearer ([A-Za-z0-9_\-]+)$/', $header, $match)) respond(401, ['error' => 'Sign in required.']);
    if (!function_exists('curl_init')) respond(503, ['error' => 'PHP cURL is required.']);
    $request = curl_init('https://api.github.com/repos/cloudempireTech/cloudempire');
    curl_setopt_array($request, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => [
            'Accept: application/vnd.github+json',
            'Authorization: Bearer ' . $match[1],
            'User-Agent: CloudEmpire-Admin',
            'X-GitHub-Api-Version: 2022-11-28',
        ],
    ]);
    $response = curl_exec($request);
    $status = curl_getinfo($request, CURLINFO_HTTP_CODE);
    curl_close($request);
    $repo = is_string($response) ? json_decode($response, true) : null;
    if ($status !== 200 || !is_array($repo) ||
        strcasecmp((string)($repo['full_name'] ?? ''), 'cloudempireTech/cloudempire') !== 0 ||
        empty($repo['permissions']['push'])) {
        respond(403, ['error' => 'Repository write access required.']);
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
