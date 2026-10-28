import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 3000);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/terms-and-conditions' || pathname === '/') pathname = '/index.html';
  const safePath = normalize(pathname).replace(/^\.\.(?:[\\/]|$)/, '');
  let filename = join(root, safePath);
  try {
    let info;
    try { info = await stat(filename); } catch { filename = join(root, 'public', safePath); info = await stat(filename); }
    if (!info.isFile()) throw new Error('not a file');
    const body = await readFile(filename);
    res.writeHead(200, { 'Content-Type': mime[extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => console.log(`Zatics Terms site listening on 0.0.0.0:${port}`));
