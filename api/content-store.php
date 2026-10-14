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
    return $db;
}

function load_site_content(PDO $db): array {
    $row=$db->query('SELECT revision,content_json FROM ce_site_content WHERE id=1')->fetch();
    $content=$row ? json_decode($row['content_json'],true) : null;
    if (!is_array($content)) respond(503,['error'=>'Site content could not be loaded.']);
    return ['revision'=>(int)$row['revision'],'content'=>$content];
}
