import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT || 3000);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const safePath = (pathname) => {
  const decoded = decodeURIComponent(pathname);
  const normalized = path.posix.normalize(decoded).replace(/^\/+/, '');
  const resolved = path.resolve(root, normalized);
  return resolved.startsWith(root) ? resolved : null;
};

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname;
  let filePath = safePath(pathname);
  let status = 200;
  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(root, '404.html');
    status = 404;
  }
  const extension = path.extname(filePath);
  response.writeHead(status, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Zatics static preview listening on http://0.0.0.0:${port}`);
});
