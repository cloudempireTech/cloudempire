<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
function media_dir(): string {
    $path=private_dir().DIRECTORY_SEPARATOR.'media';
    if (!is_dir($path) && !@mkdir($path,0700,true) && !is_dir($path)) respond(503,['error'=>'Media storage is unavailable.']);
    return $path;
}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id=$_GET['id'] ?? '';
    if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/',$id)) respond(404,['error'=>'Image not found.']);
    $db=database(); if ($db===null) respond(404,['error'=>'Image not found.']);
    $q=$db->prepare('SELECT mime,extension FROM ce_media WHERE id=?'); $q->execute([$id]); $image=$q->fetch();
    if (!$image) respond(404,['error'=>'Image not found.']);
    $path=media_dir().DIRECTORY_SEPARATOR.$id.'.'.$image['extension'];
    if (!is_file($path)) respond(404,['error'=>'Image not found.']);
    header('Content-Type: '.$image['mime']); header('Content-Length: '.filesize($path));
    header('Cache-Control: public, max-age=31536000, immutable'); header('X-Content-Type-Options: nosniff');
    readfile($path); exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405,['error'=>'Method not allowed.']);
verify_admin(true);
$db=database(); if ($db===null) respond(409,['error'=>'Connect MySQL in Admin → Database before uploading images.']);
$file=$_FILES['image'] ?? null;
if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE)!==UPLOAD_ERR_OK || ($file['size'] ?? 0)>3*1024*1024) respond(400,['error'=>'Choose an image under 3 MB.']);
$mime=(new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
$extensions=['image/png'=>'png','image/jpeg'=>'jpg','image/webp'=>'webp'];
if (!isset($extensions[$mime])) respond(400,['error'=>'Only PNG, JPEG and WebP images are supported.']);
$id=bin2hex(random_bytes(16)); $extension=$extensions[$mime];
$path=media_dir().DIRECTORY_SEPARATOR.$id.'.'.$extension;
if (!move_uploaded_file($file['tmp_name'],$path)) respond(503,['error'=>'Could not store the image.']);
@chmod($path,0600);
try {
    $q=$db->prepare('INSERT INTO ce_media (id,mime,extension,name,bytes,created_at) VALUES (?,?,?,?,?,?)');
    $q->execute([$id,$mime,$extension,substr((string)($file['name'] ?? 'image'),0,255),(int)$file['size'],gmdate('Y-m-d H:i:s')]);
} catch (Throwable $error) {
    @unlink($path); error_log('CloudEmpire media insert failed: '.$error->getMessage());
    respond(503,['error'=>'Could not save image metadata.']);
}
respond(201,['path'=>'api/media.php?id='.$id]);
