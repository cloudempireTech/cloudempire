<?php
declare(strict_types=1);
require __DIR__.'/api/content-store.php';
header('Content-Type: text/html; charset=utf-8');
$data=load_site_content(content_database())['content'];
$path=trim(parse_url($_SERVER['REQUEST_URI'] ?? '/',PHP_URL_PATH) ?: '/','/');
if ($path==='index.html' || $path==='app.html') $path='';
$parts=$path==='' ? [] : explode('/',$path);
$article=null; $service=null;
if (count($parts)===2 && $parts[0]==='blog') foreach ($data['articles'] as $item) if (($item['slug'] ?? '')===$parts[1]) $article=$item;
if (count($parts)===2 && $parts[0]==='services') foreach ($data['services'] as $item) if (($item['slug'] ?? '')===$parts[1]) $service=$item;
$known=$path==='' || in_array($path,['about','services','work','process','blog','contact'],true) || $article || $service;
if (!$known) http_response_code(404);
function e($value): string { return htmlspecialchars((string)$value,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'); }
$title=$article ? ($article['title'] ?? 'Article').' | CloudEmpire Blog' : ($service ? ($service['title'] ?? 'Service').' | CloudEmpire Services' : match($path) {
    'about'=>'About CloudEmpire — Global Technology Partner',
    'services'=>'Technology Services | CloudEmpire',
    'work'=>'Selected Work | CloudEmpire',
    'process'=>'Our Process | CloudEmpire',
    'blog'=>'CloudEmpire Blog — AI, Web, Mobile & Cloud Insights',
    'contact'=>'Contact CloudEmpire',
    default=>'CloudEmpire — AI, Websites, Android & iOS Development',
});
$description=$article['description'] ?? $service['description'] ?? 'CloudEmpire builds AI solutions, websites, Android and iOS apps, supported by cloud and enterprise expertise.';
$canonical='https://cloudempire.tech/'.($path!=='' ? $path.'/' : '');
$body='<main class="prerender"><h1>'.e($title).'</h1><p>'.e($description).'</p>';
if ($article) {
    $body='<main class="prerender"><article><h1>'.e($article['title']).'</h1><p>'.e($article['intro'] ?? '').'</p>';
    if (!empty($article['image'])) $body.='<figure><img src="/'.e($article['image']).'" alt="'.e($article['imageAlt'] ?? $article['title']).'"></figure>';
    foreach (($article['sections'] ?? []) as $section) {
        $body.='<section><h2>'.e($section['heading'] ?? '').'</h2>';
        foreach (($section['paragraphs'] ?? []) as $paragraph) $body.='<p>'.e($paragraph).'</p>';
        $body.='</section>';
    }
    $body.='</article>';
} elseif ($service) {
    $body.='<h2>What you get</h2><ul>';
    foreach (($service['deliverables'] ?? []) as $item) $body.='<li>'.e($item).'</li>';
    $body.='</ul><p>'.e($service['outcome'] ?? '').'</p>';
} elseif ($path==='blog' || $path==='services') {
    foreach (($data[$path==='blog' ? 'articles' : 'services'] ?? []) as $item) {
        $body.='<p><a href="/'.$path.'/'.e($item['slug']).'/">'.e($item['title']).'</a></p>';
    }
}
$body.='</main>';
$template=file_get_contents(__DIR__.'/index.html');
if ($template===false) { http_response_code(503); exit('Site template unavailable.'); }
$html=preg_replace('~<title>.*?</title>~s','<title>'.e($title).'</title>',$template,1);
$html=preg_replace('~<meta name="description" content="[^"]*"\s*/?>~','<meta name="description" content="'.e($description).'" />',$html,1);
$html=preg_replace('~<link rel="canonical" href="[^"]*"\s*/?>~','<link rel="canonical" href="'.e($canonical).'" />',$html,1);
$html=preg_replace_callback('~<div id="root">.*?</div>~s',static fn()=>'<div id="root">'.$body.'</div>',$html,1);
$json=json_encode($data,JSON_UNESCAPED_SLASHES|JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_INVALID_UTF8_SUBSTITUTE);
$html=str_replace('</head>','<script>window.__CLOUDEMPIRE_CONTENT__='.$json.';</script></head>',$html);
echo $html;
