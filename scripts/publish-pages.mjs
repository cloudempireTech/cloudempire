import { cp, copyFile, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { articles, services } from '../src/content.mjs';
import seoPages from '../src/seo-pages.json' with { type: 'json' };
import { festiveOffer } from '../src/offer.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const siteUrl = process.env.SITE_URL || 'https://cloudempire.tech/';
const siteBase = process.env.SITE_BASE || '/';
const publishRoot = process.env.PUBLISH_ROOT !== '0';
const blogCoverPath = 'blog/ai-project-cover.png';
const blogCoverUrl = `${siteUrl}${blogCoverPath}`;
const template = await readFile(resolve(dist, 'app.html'), 'utf8');
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const mediaUrl = path => /^https?:\/\//.test(path) ? path : path.startsWith('api/media.php?') ? `https://cloudempire.tech/${path}` : `${siteUrl}${path}`;

const routes = [
  {path:'',...seoPages['']},
  {path:'about/',...seoPages.about},
  {path:'services/',...seoPages.services},
  ...services.map(service=>({path:`services/${service.slug}/`,title:service.seoTitle || `${service.title} | CloudEmpire Services`,description:service.seoDescription || service.description,service})),
  {path:'work/',...seoPages.work},
  {path:'process/',...seoPages.process},
  {path:'blog/',...seoPages.blog},
  ...articles.map(article=>({path:`blog/${article.slug}/`,title:`${article.title} | CloudEmpire Blog`,description:article.description,article})),
  {path:'contact/',...seoPages.contact},
];

function staticBody(route) {
  if (route.article) {
    const article = route.article;
    const image = article.image ? `<figure><img src="${escapeHtml(mediaUrl(article.image))}" alt="${escapeHtml(article.imageAlt || article.title)}" /></figure>` : '';
    return `<main class="prerender"><article><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.intro)}</p>${image}${article.sections.map(section=>`<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('')}<p><a href="${siteBase}services/${article.relatedService}/">Explore the related CloudEmpire service</a></p></article></main>`;
  }
  if (route.service) {
    const service = route.service;
    const offer = service.slug === 'web-development' ? `<h2>${escapeHtml(festiveOffer.label)}: ${escapeHtml(festiveOffer.headline)}</h2><p>Tell us what you need for a tailored quote.</p>` : '';
    const sections = (service.sections || []).map(section=>`<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('');
    const faqs = (service.faqs || []).length ? `<section><h2>Frequently asked questions</h2>${service.faqs.map(item=>`<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`).join('')}</section>` : '';
    return `<main class="prerender"><h1>${escapeHtml(service.title)}</h1><p>${escapeHtml(service.description)}</p>${offer}<h2>What you get</h2><ul>${service.deliverables.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul><p>${escapeHtml(service.outcome)}</p>${sections}${faqs}<p><a href="${siteBase}contact/">Discuss your project with CloudEmpire</a></p></main>`;
  }
  if (route.path === 'blog/') return `<main class="prerender"><h1>CloudEmpire Blog</h1><p>Practical guides on AI, websites, apps, cloud, design, and digital growth.</p><ul>${articles.map(article=>`<li><a href="${siteBase}blog/${article.slug}/">${escapeHtml(article.title)}</a> — ${escapeHtml(article.description)}</li>`).join('')}</ul></main>`;
  if (route.path === 'services/') return `<main class="prerender"><h1>CloudEmpire Services</h1><ul>${services.map(service=>`<li><a href="${siteBase}services/${service.slug}/">${escapeHtml(service.title)}</a> — ${escapeHtml(service.description)}</li>`).join('')}</ul></main>`;
  if (route.path === '') return `<main class="prerender"><h1>CloudEmpire: software, websites, AI, Android and iOS apps</h1><p>${escapeHtml(route.description)}</p><ul>${['custom-software-development','web-development','android-app-development','ios-app-development','ai-analytics'].map(slug=>`<li><a href="${siteBase}services/${slug}/">${escapeHtml(services.find(service=>service.slug===slug)?.title || slug)}</a></li>`).join('')}</ul><p><a href="${siteBase}services/web-development/">${escapeHtml(festiveOffer.label)}: ${escapeHtml(festiveOffer.headline)}</a></p></main>`;
  return `<main class="prerender"><h1>${escapeHtml(route.title.split(' — ')[0])}</h1><p>${escapeHtml(route.description)}</p></main>`;
}

function structuredData(route) {
  const canonical = `${siteUrl}${route.path}`;
  const organizationId = `${siteUrl}#organization`;
  const pageId = `${canonical}#webpage`;
  const graph = [
    {'@type':'Organization','@id':organizationId,name:'CloudEmpire',url:siteUrl,logo:`${siteUrl}favicon-192.png`,email:'contact@cloudempire.tech',telephone:'+91-94756-39634',address:{'@type':'PostalAddress',streetAddress:'328, Sahapur Colony, New Alipore',addressLocality:'Kolkata',postalCode:'700053',addressRegion:'West Bengal',addressCountry:'IN'},sameAs:['https://www.instagram.com/cloudempire.tech/','https://www.facebook.com/profile.php?id=61595421568280']},
    {'@type':'WebSite','@id':`${siteUrl}#website`,name:'CloudEmpire',url:siteUrl,publisher:{'@id':organizationId},inLanguage:'en'},
    {'@type':'WebPage','@id':pageId,name:route.title,description:route.description,url:canonical,isPartOf:{'@id':`${siteUrl}#website`},inLanguage:'en'},
  ];
  if (route.path) {
    const items=[{name:'Home',item:siteUrl}];
    if (route.service) items.push({name:'Services',item:`${siteUrl}services/`});
    if (route.article) items.push({name:'Blog',item:`${siteUrl}blog/`});
    items.push({name:route.service?.title || route.article?.title || route.title,item:canonical});
    graph.push({'@type':'BreadcrumbList','@id':`${canonical}#breadcrumbs`,itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))});
  }
  if (route.service) graph.push({'@type':'Service','@id':`${canonical}#service`,name:route.service.title,description:route.service.description,url:canonical,provider:{'@id':organizationId}});
  if (route.article) graph.push({'@type':'BlogPosting','@id':`${canonical}#article`,headline:route.article.title,description:route.article.description,datePublished:route.article.date,dateModified:route.article.date,mainEntityOfPage:{'@id':pageId},author:{'@id':organizationId},publisher:{'@id':organizationId},...(route.article.image ? {image:mediaUrl(route.article.image)} : {})});
  return {'@context':'https://schema.org','@graph':graph};
}

for (const route of routes) {
  const canonical = `${siteUrl}${route.path}`;
  const data = JSON.stringify(structuredData(route)).replace(/</g,'\\u003c');
  const coverUrl = route.article?.image ? mediaUrl(route.article.image) : route.path === 'blog/' ? blogCoverUrl : '';
  const metadata = `<link rel="canonical" href="${escapeHtml(canonical)}" />\n    ${siteBase!=='/' ? '<meta name="robots" content="noindex, follow" />\n    ' : ''}<meta property="og:type" content="${route.article?'article':'website'}" />\n    <meta property="og:title" content="${escapeHtml(route.title)}" />\n    <meta property="og:description" content="${escapeHtml(route.description)}" />\n    <meta property="og:url" content="${escapeHtml(canonical)}" />\n    <meta name="twitter:card" content="${coverUrl?'summary_large_image':'summary'}" />${coverUrl?`\n    <meta property="og:image" content="${escapeHtml(coverUrl)}" />`:''}\n    <script type="application/ld+json">${data}</script>`;
  const html = template
    .replace('<base href="/" />', `<base href="${siteBase}" />`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace('</head>', `    ${metadata}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${staticBody(route)}</div>`);
  const output = resolve(dist, route.path, 'index.html');
  await mkdir(resolve(dist, route.path), {recursive:true});
  await writeFile(output, html, 'utf8');
  if (publishRoot) {
    const published = resolve(root, route.path, 'index.html');
    await mkdir(resolve(root, route.path), {recursive:true});
    await copyFile(output, published);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route=>`  <url><loc>${siteUrl}${route.path}</loc></url>`).join('\n')}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`;
await writeFile(resolve(dist,'sitemap.xml'),sitemap);
await writeFile(resolve(dist,'robots.txt'),robots);
if (publishRoot) {
  await writeFile(resolve(root,'sitemap.xml'),sitemap);
  await writeFile(resolve(root,'robots.txt'),robots);
  await mkdir(resolve(root,'assets'),{recursive:true});
  const currentAssets = new Set(await readdir(resolve(dist,'assets')));
  for (const name of await readdir(resolve(root,'assets'))) {
    if (/^app-.*\.(css|js)$/.test(name) && !currentAssets.has(name)) await unlink(resolve(root,'assets',name));
  }
  await cp(resolve(dist,'assets'),resolve(root,'assets'),{recursive:true,force:true});
  for(const name of ['favicon-32.png','favicon-192.png','logo-light.png'])await copyFile(resolve(dist,name),resolve(root,name));
  await cp(resolve(dist,'blog'),resolve(root,'blog'),{recursive:true,force:true});
  if (existsSync(resolve(dist,'media'))) {
    await cp(resolve(dist,'media'),resolve(root,'media'),{recursive:true,force:true});
  }
  await cp(resolve(dist,'admin'),resolve(root,'admin'),{recursive:true,force:true});
}

console.log(`Published ${routes.length} pages and a sitemap${publishRoot ? ' to the repository root' : ' to dist'}.`);
