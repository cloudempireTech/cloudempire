import { cp, copyFile, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { articles, services } from '../src/content.mjs';

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
  {path:'',title:'CloudEmpire — AI, Websites, Android & iOS Development',description:'CloudEmpire builds AI solutions, high-performance websites, and Android and iOS apps, supported by cloud and enterprise expertise.'},
  {path:'about/',title:'About CloudEmpire — Global Technology Partner',description:'Meet CloudEmpire, a global technology partner combining strategy, design, AI, cloud, and engineering to create useful digital experiences.'},
  {path:'services/',title:'Technology Services — AI, Web, Apps, Cloud & More | CloudEmpire',description:'Explore all 13 CloudEmpire services, including AI analytics, web and mobile development, Salesforce, cloud migration, security, SEO, and support.'},
  ...services.map(service=>({path:`services/${service.slug}/`,title:`${service.title} | CloudEmpire Services`,description:service.description,service})),
  {path:'work/',title:'Selected Work — CloudEmpire Portfolio',description:'Explore CloudEmpire projects across web platforms, Salesforce applications, education, and financial services.'},
  {path:'process/',title:'Our Process — From Discovery to Support | CloudEmpire',description:'See CloudEmpire’s six-step process for digital projects: discovery, strategy, development, testing, launch, and support.'},
  {path:'blog/',title:'CloudEmpire Blog — AI, Web, Mobile & Cloud Insights',description:'Read practical CloudEmpire guides on AI, websites, Android, iOS, Salesforce, cloud migration, automation, SEO, and UX.'},
  ...articles.map(article=>({path:`blog/${article.slug}/`,title:`${article.title} | CloudEmpire Blog`,description:article.description,article})),
  {path:'contact/',title:'Contact CloudEmpire — Start a Technology Project',description:'Contact CloudEmpire about AI, website, Android, iOS, Salesforce, cloud, or digital transformation projects.'},
];

function staticBody(route) {
  if (route.article) {
    const article = route.article;
    const image = article.image ? `<figure><img src="${escapeHtml(mediaUrl(article.image))}" alt="${escapeHtml(article.imageAlt || article.title)}" /></figure>` : '';
    return `<main class="prerender"><article><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.intro)}</p>${image}${article.sections.map(section=>`<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('')}<p><a href="${siteBase}services/${article.relatedService}/">Explore the related CloudEmpire service</a></p></article></main>`;
  }
  if (route.service) {
    const service = route.service;
    return `<main class="prerender"><h1>${escapeHtml(service.title)}</h1><p>${escapeHtml(service.description)}</p><h2>What you get</h2><ul>${service.deliverables.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul><p>${escapeHtml(service.outcome)}</p></main>`;
  }
  if (route.path === 'blog/') return `<main class="prerender"><h1>CloudEmpire Blog</h1><p>Practical guides on AI, websites, apps, cloud, design, and digital growth.</p><ul>${articles.map(article=>`<li><a href="${siteBase}blog/${article.slug}/">${escapeHtml(article.title)}</a> — ${escapeHtml(article.description)}</li>`).join('')}</ul></main>`;
  if (route.path === 'services/') return `<main class="prerender"><h1>CloudEmpire Services</h1><ul>${services.map(service=>`<li><a href="${siteBase}services/${service.slug}/">${escapeHtml(service.title)}</a> — ${escapeHtml(service.description)}</li>`).join('')}</ul></main>`;
  return `<main class="prerender"><h1>${escapeHtml(route.title.split(' — ')[0])}</h1><p>${escapeHtml(route.description)}</p></main>`;
}

function structuredData(route) {
  if (route.article) return {
    '@context':'https://schema.org', '@type':'BlogPosting',
    headline:route.article.title, description:route.article.description,
    datePublished:route.article.date, dateModified:route.article.date,
    mainEntityOfPage:`${siteUrl}${route.path}`,
    author:{'@type':'Organization',name:'CloudEmpire'},
    publisher:{'@type':'Organization',name:'CloudEmpire',url:siteUrl},
    ...(route.article.image ? {image:mediaUrl(route.article.image)} : {}),
  };
  if (route.service) return {
    '@context':'https://schema.org', '@type':'Service',
    name:route.service.title,description:route.service.description,
    provider:{'@type':'Organization',name:'CloudEmpire',url:siteUrl},
    url:`${siteUrl}${route.path}`,
  };
  return {'@context':'https://schema.org','@type':'WebPage',name:route.title,description:route.description,url:`${siteUrl}${route.path}`};
}

for (const route of routes) {
  const canonical = `${siteUrl}${route.path}`;
  const data = JSON.stringify(structuredData(route)).replace(/</g,'\\u003c');
  const coverUrl = route.article?.image ? mediaUrl(route.article.image) : route.path === 'blog/' ? blogCoverUrl : '';
  const metadata = `<link rel="canonical" href="${escapeHtml(canonical)}" />\n    <meta property="og:type" content="${route.article?'article':'website'}" />\n    <meta property="og:title" content="${escapeHtml(route.title)}" />\n    <meta property="og:description" content="${escapeHtml(route.description)}" />\n    <meta property="og:url" content="${escapeHtml(canonical)}" />${coverUrl?`\n    <meta property="og:image" content="${escapeHtml(coverUrl)}" />\n    <meta name="twitter:card" content="summary_large_image" />`:''}\n    <script type="application/ld+json">${data}</script>`;
  const html = template
    .replace('<head>', `<head>\n    <base href="${siteBase}" />`)
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
  await cp(resolve(dist,'admin'),resolve(root,'admin'),{recursive:true,force:true});
}

console.log(`Published ${routes.length} pages and a sitemap${publishRoot ? ' to the repository root' : ' to dist'}.`);
