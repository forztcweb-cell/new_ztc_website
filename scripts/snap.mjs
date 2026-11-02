import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const dist = 'D:/1/new_ztc_website/dist';
const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let p = path.join(dist, req.url.split('?')[0]);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (fs.existsSync(p) && fs.statSync(p).isFile()) {
    res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'text/plain' });
    fs.createReadStream(p).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8089, () => {
  console.log('Server running on 8089');
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  try {
    execSync(`"${edge}" --headless --disable-gpu --window-size=1280,900 --screenshot=D:\\1\\privacy-preview.png http://localhost:8089/privacy-policy/`);
    console.log('Privacy screenshot taken');
    execSync(`"${edge}" --headless --disable-gpu --window-size=1280,900 --screenshot=D:\\1\\terms-preview.png http://localhost:8089/terms-and-conditions/`);
    console.log('Terms screenshot taken');
  } catch (e) {
    console.error(e);
  }
  server.close();
});

