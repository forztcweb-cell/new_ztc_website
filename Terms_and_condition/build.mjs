import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const out = join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js']) await cp(join(root, file), join(out, file));
await cp(join(root, 'public'), out, { recursive: true });
console.log(`Built static site in ${out}`);
