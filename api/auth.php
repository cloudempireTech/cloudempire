<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$db=database();
if ($db===null) respond(503,['error'=>'Connect the Hostinger MySQL database before creating an admin login.']);
$db->exec('CREATE TABLE IF NOT EXISTS ce_admin_users (id TINYINT UNSIGNED PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
$user=$db->query('SELECT id,email,password_hash FROM ce_admin_users WHERE id=1')->fetch();
$method=$_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method==='GET') {
    $loggedIn=$user && admin_logged_in();
    respond(200,['loggedIn'=>(bool)$loggedIn,'setupRequired'=>!$user,'email'=>$loggedIn ? $user['email'] : null,'csrf'=>$loggedIn ? $_SESSION['csrf'] : null]);
}
if ($method!=='POST') respond(405,['error'=>'Method not allowed.']);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>12000) respond(413,['error'=>'Request is too large.']);
$origin=$_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin!=='' && $origin!=='https://'.($_SERVER['HTTP_HOST'] ?? '')) respond(403,['error'=>'Origin is not allowed.']);
$input=json_decode(file_get_contents('php://input') ?: '',true);
if (!is_array($input)) respond(400,['error'=>'Invalid request.']);
$action=(string)($_GET['action'] ?? '');

if ($action==='bootstrap') {
    if ($user) respond(409,['error'=>'An admin account already exists. Sign in instead.']);
    $email=strtolower(trim((string)($input['email'] ?? '')));
    $password=(string)($input['password'] ?? '');
    if (!filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>254) respond(400,['error'=>'Enter a valid email address.']);
    if (strlen($password)<12 || strlen($password)>72) respond(400,['error'=>'Use a password of 12 to 72 characters.']);
    try {
        $q=$db->prepare('INSERT INTO ce_admin_users (id,email,password_hash,created_at) VALUES (1,?,?,?)');
        $q->execute([$email,password_hash($password,PASSWORD_DEFAULT),gmdate('Y-m-d H:i:s')]);
    } catch (Throwable $error) {
        error_log('CloudEmpire admin setup failed: '.$error->getMessage());
        respond(409,['error'=>'Admin setup failed. Refresh and try again.']);
    }
    start_admin_session(); session_regenerate_id(true);
    $_SESSION=['admin_id'=>1,'signed_in_at'=>time(),'csrf'=>bin2hex(random_bytes(32))];
    respond(200,['loggedIn'=>true,'email'=>$email,'csrf'=>$_SESSION['csrf']]);
}

if ($action==='login') {
    if (!$user) respond(409,['error'=>'Create the admin account first.']);
    $key=hash('sha256',(string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $path=private_dir().DIRECTORY_SEPARATOR.'login-'.$key.'.json';
    $file=fopen($path,'c+');
    if (!$file || !flock($file,LOCK_EX)) respond(503,['error'=>'Login is temporarily unavailable.']);
    @chmod($path,0600);
    $attempts=json_decode(stream_get_contents($file) ?: '[]',true);
    if (!is_array($attempts)) $attempts=[];
    $attempts=array_values(array_filter($attempts,static fn($time)=>is_int($time) && $time>time()-900));
    if (count($attempts)>=8) { flock($file,LOCK_UN); fclose($file); respond(429,['error'=>'Too many attempts. Try again in 15 minutes.']); }
    $valid=hash_equals(strtolower($user['email']),strtolower(trim((string)($input['email'] ?? '')))) && password_verify((string)($input['password'] ?? ''),$user['password_hash']);
    if (!$valid) {
        $attempts[]=time(); ftruncate($file,0); rewind($file); fwrite($file,json_encode($attempts)); fflush($file); flock($file,LOCK_UN); fclose($file);
        respond(401,['error'=>'Incorrect email or password.']);
    }
    ftruncate($file,0); rewind($file); fwrite($file,'[]'); fflush($file); flock($file,LOCK_UN); fclose($file);
    start_admin_session(); session_regenerate_id(true);
    $_SESSION=['admin_id'=>1,'signed_in_at'=>time(),'csrf'=>bin2hex(random_bytes(32))];
    respond(200,['loggedIn'=>true,'email'=>$user['email'],'csrf'=>$_SESSION['csrf']]);
}

if ($action==='logout') {
    verify_admin(true);
    $_SESSION=[]; session_destroy();
    setcookie(session_name(),'', ['expires'=>time()-3600,'path'=>'/api/','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
    respond(200,['loggedIn'=>false]);
}
respond(400,['error'=>'Unknown action.']);
