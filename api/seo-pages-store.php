<?php
declare(strict_types=1);
require_once __DIR__ . '/content-store.php';

function seo_pages_database(): PDO {
    $db = content_database();
    $db->exec('CREATE TABLE IF NOT EXISTS ce_seo_pages (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(160) NOT NULL UNIQUE,
        status VARCHAR(12) NOT NULL DEFAULT \'draft\',
        revision INT UNSIGNED NOT NULL DEFAULT 1,
        content_json LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        published_at DATETIME NULL,
        INDEX ce_seo_pages_status_slug (status, slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    return $db;
}

function seo_page_record(array $row): array {
    $content = json_decode((string)$row['content_json'], true);
    if (!is_array($content)) $content = [];
    return array_merge([
        'id' => (int)$row['id'],
        'revision' => (int)$row['revision'],
        'status' => (string)$row['status'],
        'createdAt' => (string)$row['created_at'],
        'updatedAt' => (string)$row['updated_at'],
        'publishedAt' => $row['published_at'],
    ], $content, ['slug' => (string)$row['slug']]);
}

function published_seo_page(PDO $db, string $slug): ?array {
    $query = $db->prepare("SELECT * FROM ce_seo_pages WHERE slug=? AND status='published' LIMIT 1");
    $query->execute([$slug]);
    $row = $query->fetch();
    return $row ? seo_page_record($row) : null;
}

function published_seo_pages(PDO $db): array {
    $query = $db->query("SELECT * FROM ce_seo_pages WHERE status='published' ORDER BY published_at DESC, id DESC");
    return array_map('seo_page_record', $query->fetchAll());
}
