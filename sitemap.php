<?php
declare(strict_types=1);
require __DIR__.'/api/content-store.php';
header('Content-Type: application/xml; charset=utf-8');
$content=load_site_content(content_database())['content'];
$paths=['','about/','services/','work/','process/','blog/','contact/'];
foreach (['services','articles'] as $kind) foreach ($content[$kind] ?? [] as $item) {
    if (isset($item['slug']) && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/',$item['slug'])) $paths[]=($kind==='articles' ? 'blog/' : 'services/').$item['slug'].'/';
}
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($paths as $path) echo '<url><loc>https://cloudempire.tech/'.htmlspecialchars($path,ENT_XML1,'UTF-8').'</loc></url>' . "\n";
echo '</urlset>';
