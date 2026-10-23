<?php
declare(strict_types=1);
require __DIR__ . '/api/seo-pages-store.php';
header('Content-Type: text/html; charset=utf-8');
$db = seo_pages_database();
$path = trim(parse_url($_SERVER['REQUEST_URI'] ?? '/solutions/', PHP_URL_PATH) ?: '', '/');
$parts = explode('/', $path);
$isIndex = count($parts) === 1 && $parts[0] === 'solutions';
$page = !$isIndex && count($parts) === 2 && $parts[0] === 'solutions' && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $parts[1])
    ? published_seo_page($db, $parts[1]) : null;
if (!$isIndex && !$page) http_response_code(404);
$pages = $isIndex ? published_seo_pages($db) : [];
function h($value): string { return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function public_image($image): string {
    if (!is_string($image) || trim($image) === '') return '';
    if (preg_match('~^https://[a-z0-9.-]+/[^\s]*$~i', $image)) return $image;
    $path = ltrim($image, '/');
    return preg_match('~^(?:api/media\.php\?id=[a-f0-9]{32}|blog/[a-z0-9/_-]+\.(?:png|jpe?g|webp))$~i', $path) ? 'https://cloudempire.tech/' . $path : '';
}
$title = $page ? $page['seoTitle'] : ($isIndex ? 'Business Technology Solutions | CloudEmpire' : 'Page Not Found | CloudEmpire');
$description = $page ? $page['description'] : ($isIndex ? 'Explore practical CloudEmpire solutions for websites, apps, SEO, Salesforce, and business technology.' : 'The requested page is unavailable.');
$canonical = 'https://cloudempire.tech/solutions/' . ($page ? $page['slug'] . '/' : '');
$image = $page ? public_image($page['image'] ?? '') : '';
$crumbs = [
    ['name' => 'Home', 'url' => 'https://cloudempire.tech/'],
    ['name' => 'Solutions', 'url' => 'https://cloudempire.tech/solutions/'],
];
if ($page) $crumbs[] = ['name' => $page['title'], 'url' => $canonical];
$schema = [
    '@context' => 'https://schema.org',
    '@graph' => [
        ['@type' => 'Organization', '@id' => 'https://cloudempire.tech/#organization', 'name' => 'CloudEmpire', 'url' => 'https://cloudempire.tech/', 'logo' => 'https://cloudempire.tech/favicon-192.png'],
        ['@type' => 'WebPage', '@id' => $canonical . '#webpage', 'name' => $title, 'description' => $description, 'url' => $canonical, 'inLanguage' => 'en'],
        ['@type' => 'BreadcrumbList', 'itemListElement' => array_map(static function ($item, $index) { return ['@type' => 'ListItem', 'position' => $index + 1, 'name' => $item['name'], 'item' => $item['url']]; }, $crumbs, array_keys($crumbs))],
    ],
];
if ($page) {
    $schema['@graph'][] = ['@type' => 'Service', '@id' => $canonical . '#service', 'name' => $page['title'], 'description' => $description, 'url' => $canonical, 'provider' => ['@id' => 'https://cloudempire.tech/#organization']];
    if ($image) $schema['@graph'][1]['image'] = $image;
}
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#050810">
  <?php if (!$isIndex && !$page): ?><meta name="robots" content="noindex,follow"><?php endif; ?>
  <title><?=h($title)?></title>
  <meta name="description" content="<?=h($description)?>">
  <link rel="canonical" href="<?=h($canonical)?>">
  <link rel="icon" href="/favicon-32.png" sizes="32x32">
  <meta property="og:type" content="website">
  <meta property="og:title" content="<?=h($title)?>">
  <meta property="og:description" content="<?=h($description)?>">
  <meta property="og:url" content="<?=h($canonical)?>">
  <?php if ($image): ?><meta property="og:image" content="<?=h($image)?>"><?php endif; ?>
  <meta name="twitter:card" content="<?=$image ? 'summary_large_image' : 'summary'?>">
  <script type="application/ld+json"><?=json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_INVALID_UTF8_SUBSTITUTE)?></script>
  <link rel="stylesheet" href="/solutions.css?v=1">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="header"><a href="/" aria-label="CloudEmpire home"><img src="/logo-light.png" alt="CloudEmpire"></a><nav aria-label="Main navigation"><a href="/services/">Services</a><a href="/solutions/" aria-current="<?=$isIndex ? 'page' : 'false'?>">Solutions</a><a href="/blog/">Blog</a><a href="/contact/">Contact</a></nav><a class="header-cta" href="/contact/">Let's talk ↗</a></header>
  <main id="main">
  <?php if ($isIndex): ?>
    <section class="hero"><div class="wrap"><span class="kicker">CLOUDEMPIRE / SOLUTIONS</span><h1>Ideas made<br><em>practical.</em></h1><p>Explore focused solutions for the challenges behind modern websites, apps, business systems, and search visibility.</p></div></section>
    <section class="wrap listing"><div class="section-head"><span>EXPLORE SOLUTIONS</span><p><?=count($pages)?> practical guides</p></div><div class="cards">
      <?php foreach ($pages as $item): ?><a class="card" href="/solutions/<?=h($item['slug'])?>/"><span><?=h($item['eyebrow'] ?: 'SOLUTION')?></span><h2><?=h($item['title'])?></h2><p><?=h($item['description'])?></p><strong>Explore solution ↗</strong></a><?php endforeach; ?>
      <?php if (!$pages): ?><p>New solutions are being prepared. Explore our <a href="/services/">services</a> in the meantime.</p><?php endif; ?>
    </div></section>
  <?php elseif ($page): ?>
    <article><section class="hero"><div class="wrap"><div class="crumb"><a href="/solutions/">Solutions</a><span>→</span><?=h($page['title'])?></div><span class="kicker"><?=h($page['eyebrow'] ?: 'CLOUDEMPIRE SOLUTIONS')?></span><h1><?=h($page['title'])?></h1><p><?=h($page['intro'])?></p><a class="button" href="/contact/">Discuss your project ↗</a></div></section>
      <?php if ($image): ?><figure class="wrap feature"><img src="<?=h($image)?>" alt="<?=h($page['imageAlt'] ?: $page['title'])?>"></figure><?php endif; ?>
      <div class="wrap article-grid"><aside><span>ON THIS PAGE</span><?php foreach ($page['sections'] as $index => $section): ?><a href="#section-<?=$index+1?>"><?=h($section['heading'])?></a><?php endforeach; ?><?php if ($page['faqs']): ?><a href="#questions">Questions</a><?php endif; ?></aside><div class="content">
        <?php foreach ($page['sections'] as $index => $section): ?><section id="section-<?=$index+1?>"><h2><?=h($section['heading'])?></h2><?php foreach ($section['paragraphs'] as $paragraph): ?><p><?=h($paragraph)?></p><?php endforeach; ?></section><?php endforeach; ?>
        <?php if ($page['faqs']): ?><section id="questions"><h2>Common questions</h2><?php foreach ($page['faqs'] as $faq): ?><h3><?=h($faq['question'])?></h3><p><?=h($faq['answer'])?></p><?php endforeach; ?></section><?php endif; ?>
        <section class="next-links"><h2>Explore further</h2><?php if ($page['relatedService']): ?><a href="/services/<?=h($page['relatedService'])?>/">Explore the related service ↗</a><?php endif; ?><?php if ($page['relatedArticle']): ?><a href="/blog/<?=h($page['relatedArticle'])?>/">Read the related article ↗</a><?php endif; ?><a href="/contact/">Talk to CloudEmpire ↗</a></section>
      </div></div></article>
  <?php else: ?><section class="hero"><div class="wrap"><span class="kicker">PAGE NOT FOUND</span><h1>This page isn't here.</h1><p>Explore our published solutions or browse the CloudEmpire services.</p><a class="button" href="/solutions/">Explore solutions ↗</a></div></section><?php endif; ?>
  <section class="closing"><div class="wrap"><span class="kicker">READY WHEN YOU ARE</span><h2>Let's make<br><em>what's next.</em></h2><a class="button" href="/contact/">Start a conversation ↗</a></div></section>
  </main>
  <footer><div class="wrap footer-inner"><a href="/"><img src="/logo-light.png" alt="CloudEmpire"></a><div><a href="/services/">Services</a><a href="/solutions/">Solutions</a><a href="/blog/">Blog</a><a href="/contact/">Contact</a></div><p>© <?=date('Y')?> CloudEmpire. Kolkata, India · Working everywhere.</p></div></footer>
</body>
</html>
