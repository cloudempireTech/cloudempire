import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { routePaths, siteUrl } from '../src/next-seo.mjs';

const root=resolve(import.meta.dirname,'..');
const out=resolve(root,'out');
const publishRoot=process.env.PUBLISH_ROOT!=='0';
const routes=['',...routePaths.map(parts=>parts.join('/')+'/')];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(path=>`  <url><loc>${siteUrl}${path}</loc></url>`).join('\n')}\n</urlset>\n`;
const robots=`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${siteUrl}sitemap.xml\n`;

await writeFile(resolve(out,'sitemap.xml'),sitemap);
await writeFile(resolve(out,'robots.txt'),robots);
if(publishRoot){
  const staticFolder=resolve(root,'_next');
  if(!staticFolder.startsWith(root+sep))throw new Error('Unsafe static asset path');
  await rm(staticFolder,{recursive:true,force:true});
  for(const entry of await readdir(out,{withFileTypes:true})){
    const from=resolve(out,entry.name);
    const to=resolve(root,entry.name);
    if(entry.isDirectory())await cp(from,to,{recursive:true,force:true});
    else await copyFile(from,to);
  }
}
const home=await readFile(resolve(out,'index.html'),'utf8');
if(!home.includes('Build what')||!home.includes('/_next/'))throw new Error('Next.js output is incomplete');
console.log(`Published ${routes.length} Next.js pages${publishRoot?' to the repository root':' to out'}.`);
