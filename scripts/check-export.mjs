import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { routePaths } from '../src/next-seo.mjs';

const root=resolve(import.meta.dirname,'..',process.argv[2]||'out');
const paths=['',...routePaths.map(parts=>parts.join('/')+'/')];
const titles=new Set();
const fail=message=>{throw new Error(message);};
for(const path of paths){
  const html=await readFile(resolve(root,path,'index.html'),'utf8');
  const title=html.match(/<title\b[^>]*>(.*?)<\/title>/s)?.[1];
  const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const schemaText=html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)?.[1];
  if(!title||titles.has(title))fail(`Missing or duplicate title: ${path}`);
  if(!canonical?.endsWith(`/${path}`))fail(`Wrong canonical: ${path}`);
  if(!html.includes('<h1')||!html.includes('name="description"'))fail(`Missing content or description: ${path}`);
  if(!html.includes('id="__next"')||!html.includes('/_next/'))fail(`Not a Next.js export: ${path}`);
  if(html.includes('googletagmanager.com/gtag/js'))fail(`Google Analytics must load after the initial render: ${path}`);
  const schema=JSON.parse(schemaText||'null');
  if(!schema?.['@graph']?.length)fail(`Missing structured data: ${path}`);
  titles.add(title);
}
const admin=await readFile(resolve(root,'admin','index.html'),'utf8');
if(!admin.includes('id="login-form"')||!admin.includes('admin/app.js')||!admin.includes('noindex,nofollow'))fail('Admin export is incomplete');
const telemetry=await readFile(resolve(import.meta.dirname,'..','src','telemetry.js'),'utf8');
if(!telemetry.includes('G-93JQKBW9X3')||!telemetry.includes('loadGoogleAnalytics'))fail('Deferred Analytics setup is missing');
console.log(`${paths.length} unique Next.js public pages plus the admin login export verified.`);
