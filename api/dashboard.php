<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') respond(405, ['error' => 'Method not allowed.']);
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
if ($status !== 200 || !is_array($repo) || ($repo['full_name'] ?? '') !== 'cloudempireTech/cloudempire' || empty($repo['permissions']['push'])) {
    respond(403, ['error' => 'Repository write access required.']);
}
$since = gmdate('Y-m-d', strtotime('-29 days'));
$today = gmdate('Y-m-d');
$views = 0;
$todayViews = 0;
$pages = [];
foreach (read_records('views') as $row) {
    if (($row['date'] ?? '') < $since) continue;
    $views++;
    if (($row['date'] ?? '') === $today) $todayViews++;
    $path = (string)($row['path'] ?? '/');
    $pages[$path] = ($pages[$path] ?? 0) + 1;
}
arsort($pages);
$pageRows = [];
foreach (array_slice($pages, 0, 15, true) as $path => $count) $pageRows[] = ['path' => $path, 'count' => $count];
$messages = array_slice(array_reverse(read_records('messages')), 0, 100);
respond(200, ['views' => $views, 'today' => $todayViews, 'pages' => $pageRows, 'messages' => $messages]);
