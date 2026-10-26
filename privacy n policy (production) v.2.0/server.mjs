import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};
const safePath = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  if (clean === '/' || clean === '/privacy-policy' || clean === '/privacy-policy/') return path.join(root, 'index.html');
  let candidate = path.normalize(path.join(root, clean));
  if (!existsSync(candidate) && existsSync(path.join(root, 'public', clean))) {
    candidate = path.join(root, 'public', clean);
  }
  return candidate.startsWith(root) ? candidate : null;
};
const server = http.createServer(async (req, res) => {
  try {
    const file = safePath(req.url || '/');
    if (!file || !existsSync(file)) { res.writeHead(404, {'content-type':'text/plain'}); res.end('Not found'); return; }
    const data = await readFile(file);
    res.writeHead(200, {'content-type': mime[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache'});
    res.end(data);
  } catch { res.writeHead(500); res.end('Server error'); }
});
server.listen(port, '0.0.0.0', () => console.log(`Zatics Privacy Policy listening on ${port}`));
