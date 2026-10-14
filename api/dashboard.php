<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') respond(405, ['error' => 'Method not allowed.']);
verify_admin();
$since = gmdate('Y-m-d', strtotime('-29 days'));
$today = gmdate('Y-m-d');
$db = database();
if ($db !== null) {
    $q = $db->prepare('SELECT COUNT(*) FROM ce_views WHERE event_day >= ?');
    $q->execute([$since]); $views = (int)$q->fetchColumn();
    $q = $db->prepare('SELECT COUNT(*) FROM ce_views WHERE event_day = ?');
    $q->execute([$today]); $todayViews = (int)$q->fetchColumn();
    $q = $db->prepare('SELECT path, COUNT(*) AS count FROM ce_views WHERE event_day >= ? GROUP BY path ORDER BY count DESC LIMIT 15');
    $q->execute([$since]); $pages = $q->fetchAll();
    $messages = $db->query('SELECT created_at AS date, name, email, phone, service, preferred_date AS datePreferred, preferred_time AS timePreferred, message FROM ce_inquiries ORDER BY created_at DESC, id DESC LIMIT 100')->fetchAll();
    respond(200, ['storage'=>'mysql','views'=>$views,'today'=>$todayViews,'pages'=>$pages,'messages'=>$messages]);
}
$views=0; $todayViews=0; $pages=[];
foreach (legacy_records('views') as $row) {
    if (($row['date'] ?? '') < $since) continue;
    $views++;
    if (($row['date'] ?? '') === $today) $todayViews++;
    $path = (string)($row['path'] ?? '/');
    $pages[$path] = ($pages[$path] ?? 0) + 1;
}
arsort($pages); $pageRows=[];
foreach (array_slice($pages,0,15,true) as $path=>$count) $pageRows[]=['path'=>$path,'count'=>$count];
$messages=array_slice(array_reverse(legacy_records('messages')),0,100);
respond(200,['storage'=>'file','views'=>$views,'today'=>$todayViews,'pages'=>$pageRows,'messages'=>$messages]);
