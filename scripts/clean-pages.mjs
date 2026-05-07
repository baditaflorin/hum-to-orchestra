import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const generatedPaths = [
  'docs/assets',
  'docs/icons',
  'docs/index.html',
  'docs/404.html',
  'docs/manifest.webmanifest',
  'docs/sw.js'
];

for (const path of generatedPaths) {
  rmSync(resolve(path), { force: true, recursive: true });
}
