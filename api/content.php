<?php
declare(strict_types=1);
require __DIR__ . '/content-store.php';
$method=$_SERVER['REQUEST_METHOD'] ?? 'GET';
verify_admin($method!=='GET');
$db=content_database();
if ($method==='GET') respond(200,load_site_content($db));
if ($method!=='PUT') respond(405,['error'=>'Method not allowed.']);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>600000) respond(413,['error'=>'Content is too large.']);
$input=json_decode(file_get_contents('php://input') ?: '',true);
$content=$input['content'] ?? null;
$revision=$input['revision'] ?? null;
if (!is_array($content) || !is_int($revision) || $revision<1) respond(400,['error'=>'Invalid content update.']);
foreach (['articles','services','projects','processSteps'] as $key) {
    if (!isset($content[$key]) || !is_array($content[$key]) || array_values($content[$key])!==$content[$key]) respond(400,['error'=>'Content structure is invalid.']);
}
if (isset($content['siteCopy']) && !is_array($content['siteCopy'])) respond(400,['error'=>'Site copy is invalid.']);
$json=json_encode($content,JSON_UNESCAPED_SLASHES|JSON_INVALID_UTF8_SUBSTITUTE);
if (!is_string($json) || strlen($json)>500000) respond(413,['error'=>'Content is too large.']);
$update=$db->prepare('UPDATE ce_site_content SET content_json=?,revision=revision+1,updated_at=? WHERE id=1 AND revision=?');
$update->execute([$json,gmdate('Y-m-d H:i:s'),$revision]);
if ($update->rowCount()!==1) respond(409,['error'=>'Content changed elsewhere. Refresh the admin page before saving.']);
respond(200,['revision'=>$revision+1]);
