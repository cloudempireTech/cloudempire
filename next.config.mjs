import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const basePath = (process.env.SITE_BASE || '/').replace(/\/$/, '') || '';

function stableBuildId(){
  const hash=createHash('sha256');
  const content=file=>{
    const bytes=readFileSync(file);
    return /\.(?:png|jpe?g|webp|gif|ico|woff2?)$/i.test(file)
      ? bytes
      : Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n'));
  };
  const visit=path=>{
    for(const name of readdirSync(path).sort()){
      const file=resolve(path,name);
      if(statSync(file).isDirectory())visit(file);
      else {hash.update(relative(process.cwd(),file).replaceAll('\\','/'));hash.update(content(file));}
    }
  };
  for(const folder of ['src','pages','public'])visit(resolve(folder));
  for(const file of ['package-lock.json','next.config.mjs'])hash.update(content(file));
  hash.update(basePath);
  return hash.digest('hex').slice(0,20);
}

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  trailingSlash: true,
  basePath,
  reactStrictMode: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_SITE_BASE: basePath ? `${basePath}/` : '/' },
  generateBuildId: stableBuildId,
  agentRules: false,
};

export default config;
