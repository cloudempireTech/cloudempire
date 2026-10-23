<?php
declare(strict_types=1);
require __DIR__.'/api/seo-pages-store.php';
header('Content-Type: application/xml; charset=utf-8');
$db=seo_pages_database();
$content=load_site_content($db)['content'];
$paths=['','about/','services/','work/','process/','blog/','contact/','solutions/'];
foreach (['services','articles'] as $kind) foreach ($content[$kind] ?? [] as $item) {
    if (isset($item['slug']) && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/',$item['slug'])) $paths[]=($kind==='articles' ? 'blog/' : 'services/').$item['slug'].'/';
}
foreach (published_seo_pages($db) as $item) $paths[]='solutions/'.$item['slug'].'/';
$paths=array_unique($paths);
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($paths as $path) echo '<url><loc>https://cloudempire.tech/'.htmlspecialchars($path,ENT_XML1,'UTF-8').'</loc></url>' . "\n";
echo '</urlset>';
