<?php
declare(strict_types=1);
require __DIR__ . '/seo-pages-store.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
verify_admin($method !== 'GET');
$db = seo_pages_database();

if ($method === 'GET') {
    $rows = $db->query('SELECT * FROM ce_seo_pages ORDER BY updated_at DESC, id DESC')->fetchAll();
    respond(200, ['pages' => array_map('seo_page_record', $rows)]);
}
if (!in_array($method, ['POST', 'PUT'], true)) respond(405, ['error' => 'Method not allowed.']);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 120000) respond(413, ['error' => 'SEO page is too large.']);
$input = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($input) || !is_array($input['page'] ?? null)) respond(400, ['error' => 'Invalid SEO page.']);
$page = $input['page'];
$slug = trim((string)($page['slug'] ?? ''));
$status = (string)($page['status'] ?? 'draft');
if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug) || strlen($slug) > 160) respond(400, ['error' => 'Use a lowercase URL slug.']);
if (!in_array($status, ['draft', 'published'], true)) respond(400, ['error' => 'Choose draft or published.']);
foreach (['title', 'seoTitle', 'description', 'intro'] as $field) {
    if (!is_string($page[$field] ?? null) || trim($page[$field]) === '') respond(400, ['error' => $field . ' is required.']);
}
if (strlen($page['title']) > 250 || strlen($page['seoTitle']) > 250 || strlen($page['description']) > 500) respond(400, ['error' => 'A title or description is too long.']);
if (!is_array($page['sections'] ?? null) || ($status === 'published' && count($page['sections']) === 0)) respond(400, ['error' => 'Published pages need useful sections.']);
foreach ($page['sections'] as $section) {
    if (!is_array($section) || !is_string($section['heading'] ?? null) || trim($section['heading']) === '' || !is_array($section['paragraphs'] ?? null) || count($section['paragraphs']) === 0) respond(400, ['error' => 'Each section needs a heading and paragraphs.']);
    foreach ($section['paragraphs'] as $paragraph) if (!is_string($paragraph) || trim($paragraph) === '') respond(400, ['error' => 'Section paragraphs cannot be empty.']);
}
if (!is_array($page['faqs'] ?? null)) respond(400, ['error' => 'FAQs must be a list.']);
foreach ($page['faqs'] as $faq) if (!is_array($faq) || !is_string($faq['question'] ?? null) || trim($faq['question']) === '' || !is_string($faq['answer'] ?? null) || trim($faq['answer']) === '') respond(400, ['error' => 'Each FAQ needs a question and answer.']);
foreach (['relatedService', 'relatedArticle'] as $field) if (!empty($page[$field]) && (!is_string($page[$field]) || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $page[$field]))) respond(400, ['error' => 'Invalid related page slug.']);
$site = load_site_content($db)['content'];
foreach (['relatedService' => 'services', 'relatedArticle' => 'articles'] as $field => $list) {
    if (empty($page[$field])) continue;
    if (!in_array($page[$field], array_column($site[$list] ?? [], 'slug'), true)) respond(400, ['error' => 'Related ' . $list . ' page does not exist.']);
}
$content = [
    'title' => trim($page['title']),
    'seoTitle' => trim($page['seoTitle']),
    'description' => trim($page['description']),
    'eyebrow' => trim((string)($page['eyebrow'] ?? 'CLOUDEMPIRE SOLUTIONS')),
    'intro' => trim($page['intro']),
    'sections' => $page['sections'],
    'faqs' => $page['faqs'],
    'relatedService' => (string)($page['relatedService'] ?? ''),
    'relatedArticle' => (string)($page['relatedArticle'] ?? ''),
    'image' => trim((string)($page['image'] ?? '')),
    'imageAlt' => trim((string)($page['imageAlt'] ?? '')),
];
$json = json_encode($content, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
if (strlen($json) > 100000) respond(413, ['error' => 'SEO page is too large.']);
$now = gmdate('Y-m-d H:i:s');
try {
    if ($method === 'POST') {
        $insert = $db->prepare('INSERT INTO ce_seo_pages (slug,status,revision,content_json,created_at,updated_at,published_at) VALUES (?,?,1,?,?,?,?)');
        $insert->execute([$slug, $status, $json, $now, $now, $status === 'published' ? $now : null]);
        $id = (int)$db->lastInsertId();
    } else {
        $id = (int)($input['id'] ?? 0);
        $revision = (int)($input['revision'] ?? 0);
        if ($id < 1 || $revision < 1) respond(400, ['error' => 'Invalid page revision.']);
        $update = $db->prepare("UPDATE ce_seo_pages SET slug=?,status=?,content_json=?,revision=revision+1,updated_at=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,?) ELSE NULL END WHERE id=? AND revision=?");
        $update->execute([$slug, $status, $json, $now, $status, $now, $id, $revision]);
        if ($update->rowCount() !== 1) respond(409, ['error' => 'Page changed elsewhere. Refresh before saving.']);
    }
} catch (PDOException $error) {
    if ($error->getCode() === '23000') respond(409, ['error' => 'This SEO page slug already exists.']);
    throw $error;
}
$select = $db->prepare('SELECT * FROM ce_seo_pages WHERE id=?');
$select->execute([$id]);
respond($method === 'POST' ? 201 : 200, ['page' => seo_page_record($select->fetch())]);
