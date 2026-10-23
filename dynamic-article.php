<?php
declare(strict_types=1);
// Included from site.php only for admin-created articles without a static export.
$articleSchema = [
    '@context' => 'https://schema.org',
    '@type' => 'BlogPosting',
    'headline' => $article['title'],
    'description' => $description,
    'datePublished' => $article['date'] ?? null,
    'dateModified' => $article['date'] ?? null,
    'mainEntityOfPage' => $canonical,
    'author' => ['@type' => 'Organization', 'name' => 'CloudEmpire', 'url' => 'https://cloudempire.tech/'],
    'publisher' => ['@type' => 'Organization', 'name' => 'CloudEmpire', 'logo' => ['@type' => 'ImageObject', 'url' => 'https://cloudempire.tech/favicon-192.png']],
];
if ($cover) $articleSchema['image'] = $cover;
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#050810">
  <title><?=e($title)?></title>
  <meta name="description" content="<?=e($description)?>">
  <link rel="canonical" href="<?=e($canonical)?>">
  <link rel="icon" href="/favicon-32.png" sizes="32x32">
  <meta property="og:type" content="article">
  <meta property="og:title" content="<?=e($title)?>">
  <meta property="og:description" content="<?=e($description)?>">
  <meta property="og:url" content="<?=e($canonical)?>">
  <?php if ($cover): ?><meta property="og:image" content="<?=e($cover)?>"><?php endif; ?>
  <meta name="twitter:card" content="<?=$cover ? 'summary_large_image' : 'summary'?>">
  <script type="application/ld+json"><?=json_encode($articleSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_INVALID_UTF8_SUBSTITUTE)?></script>
  <link rel="stylesheet" href="/solutions.css?v=2">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="header"><a href="/" aria-label="CloudEmpire home"><img src="/logo-light.png" alt="CloudEmpire"></a><nav aria-label="Main navigation"><a href="/services/">Services</a><a href="/solutions/">Solutions</a><a href="/blog/">Blog</a><a href="/contact/">Contact</a></nav><a class="header-cta" href="/contact/">Let's talk ↗</a></header>
  <main id="main"><article>
    <section class="hero"><div class="wrap"><div class="crumb"><a href="/blog/">Blog</a><span>→</span><?=e($article['category'] ?? 'Insights')?></div><span class="kicker"><?=e($article['category'] ?? 'CLOUDEMPIRE JOURNAL')?></span><h1><?=e($article['title'])?></h1><p><?=e($article['intro'] ?? $description)?></p><span class="byline">CLOUDEMPIRE TEAM · <?=e($article['date'] ?? '')?></span></div></section>
    <?php if ($cover): ?><figure class="wrap feature"><img src="<?=e($cover)?>" alt="<?=e($article['imageAlt'] ?? $article['title'])?>"></figure><?php endif; ?>
    <div class="wrap article-grid"><aside><span>IN THIS ARTICLE</span><?php foreach (($article['sections'] ?? []) as $index => $section): ?><a href="#section-<?=$index+1?>"><?=e($section['heading'] ?? '')?></a><?php endforeach; ?></aside><div class="content">
      <?php foreach (($article['sections'] ?? []) as $index => $section): ?><section id="section-<?=$index+1?>"><h2><?=e($section['heading'] ?? '')?></h2><?php foreach (($section['paragraphs'] ?? []) as $paragraph): ?><p><?=e($paragraph)?></p><?php endforeach; ?></section><?php endforeach; ?>
      <?php if (!empty($article['takeaways'])): ?><section><h2>Key takeaways</h2><ul><?php foreach ($article['takeaways'] as $takeaway): ?><li><?=e($takeaway)?></li><?php endforeach; ?></ul></section><?php endif; ?>
      <section class="next-links"><h2>Explore further</h2><?php if (!empty($article['relatedSeoPage']) && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $article['relatedSeoPage'])): ?><a href="/solutions/<?=e($article['relatedSeoPage'])?>/">Explore the related solution ↗</a><?php endif; ?><?php if (!empty($article['relatedService']) && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $article['relatedService'])): ?><a href="/services/<?=e($article['relatedService'])?>/">Explore the related service ↗</a><?php endif; ?><a href="/contact/">Talk to CloudEmpire ↗</a></section>
    </div></div>
  </article><section class="closing"><div class="wrap"><span class="kicker">READY WHEN YOU ARE</span><h2>Let's make<br><em>what's next.</em></h2><a class="button" href="/contact/">Start a conversation ↗</a></div></section></main>
  <footer><div class="wrap footer-inner"><a href="/"><img src="/logo-light.png" alt="CloudEmpire"></a><div><a href="/services/">Services</a><a href="/solutions/">Solutions</a><a href="/blog/">Blog</a><a href="/contact/">Contact</a></div><p>© <?=date('Y')?> CloudEmpire. Kolkata, India · Working everywhere.</p></div></footer>
</body>
</html>
