<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function private_dir(): string {
    $directory = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.cloudempire-data';
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        respond(503, ['error' => 'Private storage is unavailable.']);
    }
    if (!is_writable($directory)) respond(503, ['error' => 'Private storage is not writable.']);
    return $directory;
}

function append_record(string $name, array $record): void {
    $path = private_dir() . DIRECTORY_SEPARATOR . $name . '.jsonl';
    $line = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE) . "\n";
    if (file_put_contents($path, $line, FILE_APPEND | LOCK_EX) === false) {
        respond(503, ['error' => 'Unable to save data.']);
    }
    @chmod($path, 0600);
}

function read_records(string $name): array {
    $path = private_dir() . DIRECTORY_SEPARATOR . $name . '.jsonl';
    if (!is_file($path)) return [];
    $result = [];
    $file = new SplFileObject($path, 'r');
    while (!$file->eof()) {
        $line = trim($file->fgets());
        if ($line === '') continue;
        $record = json_decode($line, true);
        if (is_array($record)) $result[] = $record;
    }
    return $result;
}
