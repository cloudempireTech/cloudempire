<?php
declare(strict_types=1);
require __DIR__ . '/content-store.php';
header('Cache-Control: public, max-age=0, must-revalidate');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET')!=='GET') respond(405,['error'=>'Method not allowed.']);
$db=content_database();
respond(200,load_site_content($db));
