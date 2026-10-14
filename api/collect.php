<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['error' => 'Method not allowed.']);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000) respond(413, ['error' => 'Request is too large.']);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin !== '' && !in_array($origin, ['https://' . $host, 'http://' . $host], true)) {
    respond(403, ['error' => 'Origin is not allowed.']);
}
$input = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($input)) respond(400, ['error' => 'Invalid request.']);
$kind = $input['kind'] ?? '';
if ($kind === 'view') {
    $path = (string)($input['path'] ?? '/');
    if (!preg_match('~^/[a-z0-9/\-]*$~', $path) || strlen($path) > 180 || str_starts_with($path, '/admin')) {
        respond(400, ['error' => 'Invalid page.']);
    }
    append_record('views', ['date' => gmdate('Y-m-d'), 'path' => $path]);
    respond(200, ['ok' => true]);
}
if ($kind === 'message') {
    if (!empty($input['website'])) respond(200, ['ok' => true]);
    $email = trim((string)($input['email'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 200) respond(400, ['error' => 'Enter a valid email.']);
    $record = ['date' => gmdate('Y-m-d H:i:s') . ' UTC'];
    foreach (['name' => 120, 'phone' => 80, 'service' => 120, 'datePreferred' => 30, 'timePreferred' => 30, 'message' => 3000] as $field => $limit) {
        $value = trim((string)($input[$field] ?? ''));
        $record[$field] = function_exists('mb_substr') ? mb_substr($value, 0, $limit) : substr($value, 0, $limit);
    }
    $record['email'] = $email;
    append_record('messages', $record);
    respond(200, ['ok' => true]);
}
respond(400, ['error' => 'Unknown event.']);
