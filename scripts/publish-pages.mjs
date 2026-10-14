import { cp, copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

await copyFile(resolve(dist, 'app.html'), resolve(root, 'index.html'));
await mkdir(resolve(root, 'assets'), { recursive: true });
await cp(resolve(dist, 'assets'), resolve(root, 'assets'), { recursive: true, force: true });

for (const name of ['favicon-32.png', 'favicon-192.png', 'logo-light.png']) {
  await copyFile(resolve(dist, name), resolve(root, name));
}

console.log('GitHub Pages files published to the repository root.');
