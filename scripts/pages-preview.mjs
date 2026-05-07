import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve('docs');
const base = '/hum-to-orchestra/';
const port = Number.parseInt(process.env.PORT ?? '4174', 10);
const host = process.env.HOST ?? '127.0.0.1';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`);

  if (!url.pathname.startsWith(base)) {
    response.writeHead(302, { Location: base });
    response.end();
    return;
  }

  const relativePath = decodeURIComponent(url.pathname.slice(base.length)) || 'index.html';
  const safePath = normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(root, safePath);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  if (!existsSync(filePath)) {
    filePath = join(root, '404.html');
  }

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream'
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  const script = fileURLToPath(import.meta.url);
  console.log(`${script} serving ${root} at http://${host}:${port}${base}`);
});
