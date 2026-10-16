<?php
declare(strict_types=1);
require __DIR__.'/api/content-store.php';
header('Content-Type: text/html; charset=utf-8');
$data=load_site_content(content_database())['content'];
$seoPages=json_decode((string)file_get_contents(__DIR__.'/src/seo-pages.json'),true) ?: [];
$offerFile=__DIR__.'/src/offer.json';
$offer=is_file($offerFile) ? json_decode((string)file_get_contents($offerFile),true) : null;
if (!is_array($offer)) $offer=['label'=>'FESTIVE OFFER','headline'=>'Websites starting at ₹2,999','price'=>2999,'currency'=>'INR'];
$offerLabel=(string)($offer['label'] ?? 'FESTIVE OFFER');
$offerHeadline=(string)($offer['headline'] ?? 'Websites starting at ₹2,999');
$offerPrice=(int)($offer['price'] ?? 2999);
$offerCurrency=(string)($offer['currency'] ?? 'INR');
$offerPriceText='₹'.number_format($offerPrice);
$path=trim(parse_url($_SERVER['REQUEST_URI'] ?? '/',PHP_URL_PATH) ?: '/','/');
if ($path==='index.html' || $path==='app.html') $path='';
$parts=$path==='' ? [] : explode('/',$path);
$article=null; $service=null;
if (count($parts)===2 && $parts[0]==='blog') foreach ($data['articles'] as $item) if (($item['slug'] ?? '')===$parts[1]) $article=$item;
if (count($parts)===2 && $parts[0]==='services') foreach ($data['services'] as $item) if (($item['slug'] ?? '')===$parts[1]) $service=$item;
$known=$path==='' || in_array($path,['about','services','work','process','blog','contact'],true) || $article || $service;
if (!$known) http_response_code(404);
function e($value): string { return htmlspecialchars((string)$value,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'); }
$title=$article ? ($article['title'] ?? 'Article').' | CloudEmpire Blog' : ($service ? ($service['seoTitle'] ?? (($service['title'] ?? 'Service').' | CloudEmpire Services')) : ($seoPages[$path]['title'] ?? 'CloudEmpire'));
$description=$article['description'] ?? $service['seoDescription'] ?? $service['description'] ?? $seoPages[$path]['description'] ?? 'CloudEmpire builds websites, software, AI solutions, and mobile apps.';
$canonical='https://cloudempire.tech/'.($path!=='' ? $path.'/' : '');
$cover=isset($article['image']) && is_string($article['image']) && $article['image']!=='' ? (preg_match('~^https?://~i',$article['image']) ? $article['image'] : 'https://cloudempire.tech/'.ltrim($article['image'],'/')) : null;
$body='<main class="prerender"><h1>'.e($title).'</h1><p>'.e($description).'</p>';
if ($path==='') $body='<main class="prerender"><h1>CloudEmpire: software, websites, AI, Android and iOS apps</h1><p>'.e($description).'</p><ul><li><a href="/services/custom-software-development/">Custom software development</a></li><li><a href="/services/web-development/">Website development</a></li><li><a href="/services/android-app-development/">Android app development</a></li><li><a href="/services/ios-app-development/">iOS app development</a></li><li><a href="/services/ai-analytics/">AI solutions</a></li></ul><p><a href="/services/web-development/">'.e($offerLabel).': '.e($offerHeadline).'</a></p>';
if ($article) {
    $body='<main class="prerender"><article><h1>'.e($article['title']).'</h1><p>'.e($article['intro'] ?? '').'</p>';
    if ($cover) $body.='<figure><img src="'.e($cover).'" alt="'.e($article['imageAlt'] ?? $article['title']).'"></figure>';
    foreach (($article['sections'] ?? []) as $section) {
        $body.='<section><h2>'.e($section['heading'] ?? '').'</h2>';
        foreach (($section['paragraphs'] ?? []) as $paragraph) $body.='<p>'.e($paragraph).'</p>';
        $body.='</section>';
    }
    if (!empty($article['relatedService']) && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/',$article['relatedService'])) $body.='<p><a href="/services/'.e($article['relatedService']).'/">Explore the related CloudEmpire service</a></p>';
    $body.='</article>';
} elseif ($service) {
    $body='<main class="prerender"><h1>'.e($service['title']).'</h1><p>'.e($service['description']).'</p>';
    if (($service['slug'] ?? '')==='web-development') $body.='<h2>'.e($offerLabel).': '.e($offerHeadline).'</h2><p>Tell us what you need for a tailored quote.</p>';
    $body.='<h2>What you get</h2><ul>';
    foreach (($service['deliverables'] ?? []) as $item) $body.='<li>'.e($item).'</li>';
    $body.='</ul><p>'.e($service['outcome'] ?? '').'</p>';
    foreach (($service['sections'] ?? []) as $section) {
        $body.='<section><h2>'.e($section['heading'] ?? '').'</h2>';
        foreach (($section['paragraphs'] ?? []) as $paragraph) $body.='<p>'.e($paragraph).'</p>';
        $body.='</section>';
    }
    if (!empty($service['faqs'])) {
        $body.='<section><h2>Frequently asked questions</h2>';
        foreach ($service['faqs'] as $item) $body.='<h3>'.e($item['question'] ?? '').'</h3><p>'.e($item['answer'] ?? '').'</p>';
        $body.='</section>';
    }
    $body.='<p><a href="/contact/">Discuss your project with CloudEmpire</a></p>';
} elseif ($path==='blog' || $path==='services') {
    foreach (($data[$path==='blog' ? 'articles' : 'services'] ?? []) as $item) {
        $body.='<p><a href="/'.$path.'/'.e($item['slug']).'/">'.e($item['title']).'</a> — '.e($item['description'] ?? '').'</p>';
    }
}
$body.='</main>';
$routeTemplate=preg_match('~^[a-z0-9]+(?:[-/][a-z0-9]+)*$~',$path) ? __DIR__.'/'.$path.'/index.html' : '';
$template=file_get_contents($routeTemplate && is_file($routeTemplate) ? $routeTemplate : __DIR__.'/index.html');
if ($template===false) { http_response_code(503); exit('Site template unavailable.'); }
$html=preg_replace('~<title\b[^>]*>.*?</title>~s','<title>'.e($title).'</title>',$template,1);
$html=preg_replace('~<meta name="description"[^>]*>~','<meta name="description" content="'.e($description).'"/>',$html,1);
$html=preg_replace('~<link rel="canonical"[^>]*>~','<link rel="canonical" href="'.e($canonical).'"/>',$html,1);
$openGraph=['og:type'=>$article ? 'article' : 'website','og:title'=>$title,'og:description'=>$description,'og:url'=>$canonical];
foreach ($openGraph as $key=>$value) {
    $html=preg_replace_callback('~<meta property="'.preg_quote($key,'~').'"[^>]*>~',static fn()=>'<meta property="'.$key.'" content="'.e($value).'"/>',$html,1);
}
if ($cover) {
    $html=preg_replace('~<meta name="twitter:card"[^>]*>~','<meta name="twitter:card" content="summary_large_image"/>',$html,1);
    $imageTag='<meta property="og:image" content="'.e($cover).'"/>';
    $html=preg_match('~<meta property="og:image"[^>]*>~',$html) ? preg_replace('~<meta property="og:image"[^>]*>~',$imageTag,$html,1) : str_replace('</head>',$imageTag.'</head>',$html);
}
$organizationId='https://cloudempire.tech/#organization';
$pageId=$canonical.'#webpage';
$graph=[
    ['@type'=>'Organization','@id'=>$organizationId,'name'=>'CloudEmpire','url'=>'https://cloudempire.tech/','logo'=>'https://cloudempire.tech/favicon-192.png','email'=>'contact@cloudempire.tech','telephone'=>'+91-94756-39634','address'=>['@type'=>'PostalAddress','streetAddress'=>'328, Sahapur Colony, New Alipore','addressLocality'=>'Kolkata','postalCode'=>'700053','addressRegion'=>'West Bengal','addressCountry'=>'IN'],'sameAs'=>['https://www.instagram.com/cloudempire.tech/','https://www.facebook.com/profile.php?id=61595421568280']],
    ['@type'=>'WebSite','@id'=>'https://cloudempire.tech/#website','name'=>'CloudEmpire','url'=>'https://cloudempire.tech/','publisher'=>['@id'=>$organizationId],'inLanguage'=>'en'],
    ['@type'=>'WebPage','@id'=>$pageId,'name'=>$title,'description'=>$description,'url'=>$canonical,'isPartOf'=>['@id'=>'https://cloudempire.tech/#website'],'inLanguage'=>'en'],
];
if ($path!=='') {
    $crumbs=[['name'=>'Home','item'=>'https://cloudempire.tech/']];
    if ($service) $crumbs[]=['name'=>'Services','item'=>'https://cloudempire.tech/services/'];
    if ($article) $crumbs[]=['name'=>'Blog','item'=>'https://cloudempire.tech/blog/'];
    $crumbs[]=['name'=>$service['title'] ?? $article['title'] ?? $title,'item'=>$canonical];
    $graph[]=['@type'=>'BreadcrumbList','@id'=>$canonical.'#breadcrumbs','itemListElement'=>array_map(static fn($item,$index)=>['@type'=>'ListItem','position'=>$index+1,'name'=>$item['name'],'item'=>$item['item']],$crumbs,array_keys($crumbs))];
}
if ($service) $graph[]=['@type'=>'Service','@id'=>$canonical.'#service','name'=>$service['title'],'description'=>$service['description'],'url'=>$canonical,'provider'=>['@id'=>$organizationId]];
if ($article) $graph[]=['@type'=>'BlogPosting','@id'=>$canonical.'#article','headline'=>$article['title'],'description'=>$description,'datePublished'=>$article['date'] ?? null,'dateModified'=>$article['date'] ?? null,'mainEntityOfPage'=>['@id'=>$pageId],'author'=>['@id'=>$organizationId],'publisher'=>['@id'=>$organizationId],...($cover ? ['image'=>$cover] : [])];
$schema=['@context'=>'https://schema.org','@graph'=>$graph];
$schemaJson=json_encode($schema,JSON_UNESCAPED_SLASHES|JSON_HEX_TAG|JSON_INVALID_UTF8_SUBSTITUTE);
$html=preg_replace_callback('~<script type="application/ld\+json"[^>]*>.*?</script>~s',static fn()=>'<script type="application/ld+json">'.$schemaJson.'</script>',$html,1);
$json=json_encode($data,JSON_UNESCAPED_SLASHES|JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_INVALID_UTF8_SUBSTITUTE);
$html=str_replace('</head>','<script>window.__CLOUDEMPIRE_CONTENT__='.$json.';</script></head>',$html);
echo $html;
