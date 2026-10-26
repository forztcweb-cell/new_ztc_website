import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const out = path.join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html','styles.css','app.js','policy-data.js','app.config.ts','logo-light.png','logo-dark.png']) await cp(path.join(root, file), path.join(out, file));
await cp(path.join(root, 'public'), path.join(out, 'public'), { recursive: true });
console.log(`Built static site to ${out}`);
