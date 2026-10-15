<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

function content_database(): PDO {
    $db=database();
    if ($db===null) respond(503,['error'=>'Connect the Hostinger MySQL database first.']);
    $db->exec('CREATE TABLE IF NOT EXISTS ce_site_content (id TINYINT UNSIGNED PRIMARY KEY, revision INT UNSIGNED NOT NULL DEFAULT 1, content_json LONGTEXT NOT NULL, updated_at DATETIME NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    if (!$db->query('SELECT id FROM ce_site_content WHERE id=1')->fetchColumn()) {
        $seed=file_get_contents(dirname(__DIR__).'/src/content.json');
        if ($seed===false || !is_array(json_decode($seed,true))) respond(503,['error'=>'Initial site content is unavailable.']);
        $insert=$db->prepare('INSERT IGNORE INTO ce_site_content (id,revision,content_json,updated_at) VALUES (1,1,?,?)');
        $insert->execute([$seed,gmdate('Y-m-d H:i:s')]);
    }
    apply_blog_cover_migration($db);
    return $db;
}

function apply_blog_cover_migration(PDO $db): void {
    $migration='blog-covers-2026-10-15';
    $db->exec('CREATE TABLE IF NOT EXISTS ce_content_migrations (name VARCHAR(100) PRIMARY KEY, applied_at DATETIME NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    $check=$db->prepare('SELECT name FROM ce_content_migrations WHERE name=?');
    $check->execute([$migration]);
    if ($check->fetchColumn()) return;

    $seed=json_decode((string)file_get_contents(dirname(__DIR__).'/src/content.json'),true);
    if (!is_array($seed) || !isset($seed['articles']) || !is_array($seed['articles'])) return;
    $covers=[];
    foreach ($seed['articles'] as $article) {
        if (!empty($article['slug']) && !empty($article['image'])) $covers[$article['slug']]=[$article['image'],$article['imageAlt'] ?? $article['title'] ?? ''];
    }

    $db->beginTransaction();
    try {
        $row=$db->query('SELECT revision,content_json FROM ce_site_content WHERE id=1 FOR UPDATE')->fetch();
        $content=$row ? json_decode($row['content_json'],true) : null;
        if (is_array($content) && isset($content['articles']) && is_array($content['articles'])) {
            $changed=false;
            foreach ($content['articles'] as &$article) {
                if (!is_array($article) || !empty($article['image']) || empty($article['slug']) || !isset($covers[$article['slug']])) continue;
                [$article['image'],$article['imageAlt']]=$covers[$article['slug']];
                $changed=true;
            }
            unset($article);
            if ($changed) {
                $update=$db->prepare('UPDATE ce_site_content SET revision=?,content_json=?,updated_at=? WHERE id=1');
                $update->execute([(int)$row['revision']+1,json_encode($content,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),gmdate('Y-m-d H:i:s')]);
            }
        }
        $record=$db->prepare('INSERT IGNORE INTO ce_content_migrations (name,applied_at) VALUES (?,?)');
        $record->execute([$migration,gmdate('Y-m-d H:i:s')]);
        $db->commit();
    } catch (Throwable $error) {
        $db->rollBack();
        throw $error;
    }
}

function load_site_content(PDO $db): array {
    $row=$db->query('SELECT revision,content_json FROM ce_site_content WHERE id=1')->fetch();
    $content=$row ? json_decode($row['content_json'],true) : null;
    if (!is_array($content)) respond(503,['error'=>'Site content could not be loaded.']);
    return ['revision'=>(int)$row['revision'],'content'=>$content];
}
