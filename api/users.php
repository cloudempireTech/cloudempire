<?php
declare(strict_types=1);
require __DIR__.'/common.php';
$method=$_SERVER['REQUEST_METHOD'] ?? 'GET';
verify_owner($method!=='GET');
$db=database();
if ($db===null) respond(503,['error'=>'MySQL is unavailable.']);
$db->exec('CREATE TABLE IF NOT EXISTS ce_admin_invites (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,email VARCHAR(254) NOT NULL,token_hash CHAR(64) NOT NULL UNIQUE,created_at DATETIME NOT NULL,expires_at DATETIME NOT NULL,accepted_at DATETIME NULL,revoked_at DATETIME NULL,created_by INT UNSIGNED NOT NULL,INDEX (email),INDEX (expires_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
$column=$db->query("SHOW COLUMNS FROM ce_admin_users LIKE 'id'")->fetch();
if ($column && !str_contains((string)$column['Extra'],'auto_increment')) $db->exec('ALTER TABLE ce_admin_users MODIFY COLUMN id INT UNSIGNED NOT NULL AUTO_INCREMENT');

if ($method==='GET') {
    $users=$db->query('SELECT id,email,created_at FROM ce_admin_users ORDER BY id')->fetchAll();
    $q=$db->prepare('SELECT id,email,created_at,expires_at FROM ce_admin_invites WHERE accepted_at IS NULL AND revoked_at IS NULL AND expires_at>? ORDER BY created_at DESC LIMIT 30');
    $q->execute([gmdate('Y-m-d H:i:s')]);
    respond(200,['users'=>$users,'invites'=>$q->fetchAll()]);
}
if (!in_array($method,['POST','DELETE'],true)) respond(405,['error'=>'Method not allowed.']);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>12000) respond(413,['error'=>'Request is too large.']);
$input=json_decode(file_get_contents('php://input') ?: '',true);
if (!is_array($input)) respond(400,['error'=>'Invalid request.']);

if ($method==='POST') {
    $email=strtolower(trim((string)($input['email'] ?? '')));
    if (!filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>254) respond(400,['error'=>'Enter a valid email address.']);
    $q=$db->prepare('SELECT id FROM ce_admin_users WHERE email=?');
    $q->execute([$email]);
    if ($q->fetchColumn()) respond(409,['error'=>'This email already has an admin account.']);
    $token=bin2hex(random_bytes(32));
    $now=gmdate('Y-m-d H:i:s');
    $expires=gmdate('Y-m-d H:i:s',time()+7*86400);
    $q=$db->prepare('UPDATE ce_admin_invites SET revoked_at=? WHERE email=? AND accepted_at IS NULL AND revoked_at IS NULL');
    $q->execute([$now,$email]);
    $q=$db->prepare('INSERT INTO ce_admin_invites (email,token_hash,created_at,expires_at,created_by) VALUES (?,?,?,?,1)');
    $q->execute([$email,hash('sha256',$token),$now,$expires]);
    respond(200,['email'=>$email,'expiresAt'=>$expires,'inviteUrl'=>'https://cloudempire.tech/admin/#invite='.$token]);
}

$id=$input['id'] ?? null;
if (!is_int($id) || $id<1) respond(400,['error'=>'Invalid account or invitation.']);
if (($input['kind'] ?? '')==='invite') {
    $q=$db->prepare('UPDATE ce_admin_invites SET revoked_at=? WHERE id=? AND accepted_at IS NULL AND revoked_at IS NULL');
    $q->execute([gmdate('Y-m-d H:i:s'),$id]);
    respond(200,['revoked'=>$q->rowCount()===1]);
}
if (($input['kind'] ?? '')==='user') {
    if ($id===1) respond(403,['error'=>'The account owner cannot be removed.']);
    $q=$db->prepare('DELETE FROM ce_admin_users WHERE id=?');
    $q->execute([$id]);
    respond(200,['removed'=>$q->rowCount()===1]);
}
respond(400,['error'=>'Unknown action.']);
