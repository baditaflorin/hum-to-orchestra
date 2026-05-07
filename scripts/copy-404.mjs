import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const indexPath = resolve('docs/index.html');
const notFoundPath = resolve('docs/404.html');

if (!existsSync(indexPath)) {
  throw new Error('docs/index.html does not exist. Run the Vite build first.');
}

copyFileSync(indexPath, notFoundPath);
