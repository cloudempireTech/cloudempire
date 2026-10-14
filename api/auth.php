<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$db=database();
if ($db===null) respond(503,['error'=>'Connect the Hostinger MySQL database before creating an admin login.']);
$db->exec('CREATE TABLE IF NOT EXISTS ce_admin_users (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
$user=$db->query('SELECT id,email,password_hash FROM ce_admin_users WHERE id=1')->fetch();
$method=$_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method==='GET') {
    $loggedIn=admin_logged_in();
    $current=null;
    if ($loggedIn) {
        $q=$db->prepare('SELECT id,email FROM ce_admin_users WHERE id=?');
        $q->execute([$_SESSION['admin_id']]);
        $current=$q->fetch();
    }
    respond(200,['loggedIn'=>(bool)$current,'setupRequired'=>!$user,'email'=>$current['email'] ?? null,'isOwner'=>(int)($current['id'] ?? 0)===1,'csrf'=>$current ? $_SESSION['csrf'] : null]);
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
    respond(200,['loggedIn'=>true,'email'=>$email,'isOwner'=>true,'csrf'=>$_SESSION['csrf']]);
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
    $q=$db->prepare('SELECT id,email,password_hash FROM ce_admin_users WHERE email=?');
    $q->execute([strtolower(trim((string)($input['email'] ?? '')))]);
    $candidate=$q->fetch();
    $valid=$candidate && password_verify((string)($input['password'] ?? ''),$candidate['password_hash']);
    if (!$valid) {
        $attempts[]=time(); ftruncate($file,0); rewind($file); fwrite($file,json_encode($attempts)); fflush($file); flock($file,LOCK_UN); fclose($file);
        respond(401,['error'=>'Incorrect email or password.']);
    }
    ftruncate($file,0); rewind($file); fwrite($file,'[]'); fflush($file); flock($file,LOCK_UN); fclose($file);
    start_admin_session(); session_regenerate_id(true);
    $_SESSION=['admin_id'=>(int)$candidate['id'],'signed_in_at'=>time(),'csrf'=>bin2hex(random_bytes(32))];
    respond(200,['loggedIn'=>true,'email'=>$candidate['email'],'isOwner'=>(int)$candidate['id']===1,'csrf'=>$_SESSION['csrf']]);
}

if ($action==='accept-invite') {
    $token=(string)($input['token'] ?? '');
    $password=(string)($input['password'] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/',$token) || strlen($password)<12 || strlen($password)>72) respond(400,['error'=>'Use a valid invitation and a password of 12 to 72 characters.']);
    try {
        $db->beginTransaction();
        $q=$db->prepare('SELECT id,email FROM ce_admin_invites WHERE token_hash=? AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at>? FOR UPDATE');
        $q->execute([hash('sha256',$token),gmdate('Y-m-d H:i:s')]);
        $invite=$q->fetch();
        if (!$invite) { $db->rollBack(); respond(400,['error'=>'This invitation has expired or has already been used.']); }
        $q=$db->prepare('INSERT INTO ce_admin_users (email,password_hash,created_at) VALUES (?,?,?)');
        $q->execute([$invite['email'],password_hash($password,PASSWORD_DEFAULT),gmdate('Y-m-d H:i:s')]);
        $id=(int)$db->lastInsertId();
        $q=$db->prepare('UPDATE ce_admin_invites SET accepted_at=? WHERE id=?');
        $q->execute([gmdate('Y-m-d H:i:s'),$invite['id']]);
        $db->commit();
    } catch (Throwable $error) {
        if ($db->inTransaction()) $db->rollBack();
        error_log('CloudEmpire invitation acceptance failed: '.$error->getMessage());
        respond(409,['error'=>'Invitation could not be accepted. Ask the account owner for a fresh link.']);
    }
    start_admin_session(); session_regenerate_id(true);
    $_SESSION=['admin_id'=>$id,'signed_in_at'=>time(),'csrf'=>bin2hex(random_bytes(32))];
    respond(200,['loggedIn'=>true,'email'=>$invite['email'],'isOwner'=>false,'csrf'=>$_SESSION['csrf']]);
}

if ($action==='logout') {
    verify_admin(true);
    $_SESSION=[]; session_destroy();
    setcookie(session_name(),'', ['expires'=>time()-3600,'path'=>'/api/','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
    respond(200,['loggedIn'=>false]);
}
respond(400,['error'=>'Unknown action.']);
