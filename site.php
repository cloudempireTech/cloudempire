<?php
declare(strict_types=1);
require __DIR__.'/api/content-store.php';
header('Content-Type: text/html; charset=utf-8');
$data=load_site_content(content_database())['content'];
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
if ($path==='') {
    $title='CloudEmpire | AI, Apps & Website Development from '.$offerPriceText;
    $description='Build with CloudEmpire: AI solutions, websites, and Android and iOS apps. Festive offer: '.$offerHeadline.'. Explore our services.';
} elseif ($service && ($service['slug'] ?? '')==='web-development') {
    $title='Website Development from '.$offerPriceText.' | CloudEmpire Festive Offer';
    $description='CloudEmpire builds fast, modern websites and web apps. Festive offer: '.$offerHeadline.'. Tell us what you need for a tailored quote.';
}
$canonical='https://cloudempire.tech/'.($path!=='' ? $path.'/' : '');
$cover=isset($article['image']) && is_string($article['image']) && $article['image']!=='' ? (preg_match('~^https?://~i',$article['image']) ? $article['image'] : 'https://cloudempire.tech/'.ltrim($article['image'],'/')) : null;
$body='<main class="prerender"><h1>'.e($title).'</h1><p>'.e($description).'</p>';
if ($path==='') $body='<main class="prerender"><h1>CloudEmpire: AI, Websites, Android &amp; iOS</h1><p>'.e($description).'</p><p><a href="/services/web-development/">'.e($offerLabel).': '.e($offerHeadline).'</a></p>';
if ($article) {
    $body='<main class="prerender"><article><h1>'.e($article['title']).'</h1><p>'.e($article['intro'] ?? '').'</p>';
    if ($cover) $body.='<figure><img src="'.e($cover).'" alt="'.e($article['imageAlt'] ?? $article['title']).'"></figure>';
    foreach (($article['sections'] ?? []) as $section) {
        $body.='<section><h2>'.e($section['heading'] ?? '').'</h2>';
        foreach (($section['paragraphs'] ?? []) as $paragraph) $body.='<p>'.e($paragraph).'</p>';
        $body.='</section>';
    }
    $body.='</article>';
} elseif ($service) {
    if (($service['slug'] ?? '')==='web-development') $body.='<h2>'.e($offerLabel).': '.e($offerHeadline).'</h2><p>Tell us what you need for a tailored quote.</p>';
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
$openGraph=['og:type'=>$article ? 'article' : 'website','og:title'=>$title,'og:description'=>$description,'og:url'=>$canonical];
foreach ($openGraph as $key=>$value) {
    $html=preg_replace_callback('~<meta property="'.preg_quote($key,'~').'" content="[^"]*"\s*/?>~',static fn()=>'<meta property="'.$key.'" content="'.e($value).'" />',$html,1);
}
if ($cover) $html=str_replace('</head>','<meta property="og:image" content="'.e($cover).'" /><meta name="twitter:card" content="summary_large_image" /></head>',$html);
$schema=$article ? [
    '@context'=>'https://schema.org','@type'=>'BlogPosting','headline'=>$article['title'],'description'=>$description,
    'datePublished'=>$article['date'] ?? null,'dateModified'=>$article['date'] ?? null,'mainEntityOfPage'=>$canonical,
    'author'=>['@type'=>'Organization','name'=>'CloudEmpire'],'publisher'=>['@type'=>'Organization','name'=>'CloudEmpire'],
    'image'=>$cover,
] : ($service ? [
    '@context'=>'https://schema.org','@type'=>'Service','name'=>$service['title'],'description'=>$description,
    'provider'=>['@type'=>'Organization','name'=>'CloudEmpire'],'url'=>$canonical,
] : ['@context'=>'https://schema.org','@type'=>'WebPage','name'=>$title,'description'=>$description,'url'=>$canonical]);
if ($service && ($service['slug'] ?? '')==='web-development') $schema['offers']=['@type'=>'Offer','url'=>$canonical,'description'=>$offerLabel.': '.$offerHeadline.'. Final quote depends on project scope.','priceSpecification'=>['@type'=>'PriceSpecification','minPrice'=>$offerPrice,'priceCurrency'=>$offerCurrency]];
$schemaJson=json_encode($schema,JSON_UNESCAPED_SLASHES|JSON_HEX_TAG|JSON_INVALID_UTF8_SUBSTITUTE);
$html=preg_replace_callback('~<script type="application/ld\+json">.*?</script>~s',static fn()=>'<script type="application/ld+json">'.$schemaJson.'</script>',$html,1);
$html=preg_replace_callback('~<div id="root">.*?</div>~s',static fn()=>'<div id="root">'.$body.'</div>',$html,1);
$json=json_encode($data,JSON_UNESCAPED_SLASHES|JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_INVALID_UTF8_SUBSTITUTE);
$html=str_replace('</head>','<script>window.__CLOUDEMPIRE_CONTENT__='.$json.';</script></head>',$html);
echo $html;
