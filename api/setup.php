<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
verify_admin();
if ($_SERVER['REQUEST_METHOD'] === 'GET') respond(200,['configured'=>is_file(config_path()),'database'=>DB_NAME,'user'=>DB_USER]);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405,['error'=>'Method not allowed.']);
verify_admin(true);
$payload=json_decode(file_get_contents('php://input') ?: '',true);
$password=is_array($payload) ? ($payload['password'] ?? null) : null;
if (!is_string($password) || $password === '' || strlen($password)>255) respond(400,['error'=>'Enter the MySQL user password.']);
try {
    $db=connect_database($password);
    $db->exec('CREATE TABLE IF NOT EXISTS ce_views (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, event_day DATE NOT NULL, path VARCHAR(255) NOT NULL, source_key CHAR(64) NULL UNIQUE, INDEX (event_day), INDEX (path)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    $db->exec('CREATE TABLE IF NOT EXISTS ce_inquiries (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(100) NOT NULL, service VARCHAR(255) NOT NULL, preferred_date VARCHAR(100) NOT NULL, preferred_time VARCHAR(100) NOT NULL, message TEXT NOT NULL, source_key CHAR(64) NULL UNIQUE, INDEX (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    $db->exec('CREATE TABLE IF NOT EXISTS ce_media (id CHAR(32) PRIMARY KEY, mime VARCHAR(32) NOT NULL, extension VARCHAR(5) NOT NULL, name VARCHAR(255) NOT NULL, bytes INT UNSIGNED NOT NULL, created_at DATETIME NOT NULL, INDEX (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    $q=$db->prepare('INSERT IGNORE INTO ce_views (event_day,path,source_key) VALUES (?,?,?)');
    foreach (legacy_records('views') as $row) if (preg_match('/^\d{4}-\d{2}-\d{2}$/',(string)($row['date'] ?? ''))) $q->execute([$row['date'],substr((string)($row['path'] ?? '/'),0,255),$row['_source_key']]);
    $q=$db->prepare('INSERT IGNORE INTO ce_inquiries (created_at,name,email,phone,service,preferred_date,preferred_time,message,source_key) VALUES (?,?,?,?,?,?,?,?,?)');
    foreach (legacy_records('messages') as $row) {
        $timestamp=strtotime((string)($row['date'] ?? ''));
        $q->execute([$timestamp ? gmdate('Y-m-d H:i:s',$timestamp) : gmdate('Y-m-d H:i:s'),substr((string)($row['name'] ?? ''),0,255),substr((string)($row['email'] ?? ''),0,255),substr((string)($row['phone'] ?? ''),0,100),substr((string)($row['service'] ?? ''),0,255),substr((string)($row['datePreferred'] ?? ''),0,100),substr((string)($row['timePreferred'] ?? ''),0,100),(string)($row['message'] ?? ''),$row['_source_key']]);
    }
    $path=config_path(); $temp=$path.'.'.bin2hex(random_bytes(6)).'.tmp';
    if (file_put_contents($temp,'<?php return '.var_export(['password'=>$password],true).';',LOCK_EX)===false) throw new RuntimeException('Could not save private database settings.');
    @chmod($temp,0600);
    if (!@rename($temp,$path)) { @unlink($temp); throw new RuntimeException('Could not activate private database settings.'); }
    respond(200,['configured'=>true,'database'=>DB_NAME,'importedViews'=>count(legacy_records('views')),'importedInquiries'=>count(legacy_records('messages'))]);
} catch (Throwable $error) {
    error_log('CloudEmpire database setup failed: '.$error->getMessage());
    respond(400,['error'=>'Database setup failed. Check the MySQL password and that the user can create tables.']);
}
