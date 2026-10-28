import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('--- Starting Terms and Conditions integration ---');

// 1. Copy assets from Terms_and_condition
const termsDir = path.join(root, 'Terms_and_condition');
const publicDir = path.join(root, 'public');
const staticDir = path.join(publicDir, 'static');

fs.mkdirSync(staticDir, { recursive: true });

// Copy styles.css -> public/static/terms.css
const stylesContent = fs.readFileSync(path.join(termsDir, 'styles.css'), 'utf8');
fs.writeFileSync(path.join(staticDir, 'terms.css'), stylesContent);
console.log('✓ Copied public/static/terms.css');

// Copy app.js -> public/static/terms-app.js
const appJsContent = fs.readFileSync(path.join(termsDir, 'app.js'), 'utf8');
fs.writeFileSync(path.join(staticDir, 'terms-app.js'), appJsContent);
console.log('✓ Copied public/static/terms-app.js');

// Copy public assets from Terms_and_condition
const filesToCopy = [
  'legal-content.json',
  'zatics-logo-black.png',
  'zatics-logo-white.png',
  'zatics-mark.svg'
];

for (const file of filesToCopy) {
  const src = path.join(termsDir, 'public', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    fs.copyFileSync(src, path.join(staticDir, file));
    console.log(`✓ Copied ${file} to public/ and public/static/`);
  }
}

// 2. Prepare terms-and-conditions/index.html
let termsHtml = fs.readFileSync(path.join(termsDir, 'index.html'), 'utf8');

// Replace stylesheet and favicon
termsHtml = termsHtml.replace(
  '<link rel="stylesheet" href="/styles.css">',
  `<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/static/terms.css">`
);

// Replace script
termsHtml = termsHtml.replace(
  '<script src="/app.js" defer></script>',
  '<script src="/static/terms-app.js" defer></script>'
);

// Replace header
const oldHeader = `<header class="site-header">
    <div class="header-inner">
      <a class="wordmark" href="https://zatics.tech" aria-label="Zatics Intelligence home"><img class="wordmark-logo wordmark-logo-light" src="/zatics-logo-black.png" alt="Zatics Intelligence logo" width="25" height="25"><img class="wordmark-logo wordmark-logo-dark" src="/zatics-logo-white.png" alt="Zatics Intelligence logo" width="25" height="25"><span>Zatics <em>Intelligence</em></span></a>
      <div class="header-actions">
        <a class="header-link" href="https://zatics.tech">Website <span aria-hidden="true">↗</span></a>
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark mode" aria-pressed="false"><span class="theme-icon" aria-hidden="true">◐</span><span class="theme-label">Dark mode</span></button>
      </div>
    </div>
  </header>`;

const newHeader = `<header class="site-header">
    <div class="header-inner">
      <a class="wordmark" href="/" aria-label="Zatics Intelligence home"><img class="wordmark-logo wordmark-logo-light" src="/static/zatics-logo-black.png" alt="Zatics Intelligence logo" width="25" height="25"><img class="wordmark-logo wordmark-logo-dark" src="/static/zatics-logo-white.png" alt="Zatics Intelligence logo" width="25" height="25"><span>Zatics <em>Intelligence</em></span></a>
      <div class="header-actions">
        <a class="header-link" href="/#what-we-build">What we build</a>
        <a class="header-link" href="/solutions/">Solutions</a>
        <a class="header-link" href="/privacy-policy/">Privacy Policy</a>
        <a class="header-link" href="/">Back to site <span aria-hidden="true">↗</span></a>
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark mode" aria-pressed="false"><span class="theme-icon" aria-hidden="true">◐</span><span class="theme-label">Dark mode</span></button>
      </div>
    </div>
  </header>`;

if (termsHtml.includes(oldHeader)) {
  termsHtml = termsHtml.replace(oldHeader, newHeader);
  console.log('✓ Updated header in terms HTML');
} else {
  console.warn('⚠️ Old header exact match not found, checking fallback replace');
  termsHtml = termsHtml.replace(/<header class="site-header">[\s\S]*?<\/header>/, newHeader);
  console.log('✓ Fallback replaced header in terms HTML');
}

// Replace footer
const oldFooter = `<footer class="site-footer">
    <div class="footer-inner">
      <div><a class="wordmark footer-wordmark" href="https://zatics.tech"><img class="wordmark-logo wordmark-logo-light" src="/zatics-logo-black.png" alt="Zatics Intelligence logo" width="25" height="25"><img class="wordmark-logo wordmark-logo-dark" src="/zatics-logo-white.png" alt="Zatics Intelligence logo" width="25" height="25"><span>Zatics <em>Intelligence</em></span></a><p class="footer-meta">Terms effective September 21, 2026 · Version 2.0</p></div>
      <nav class="footer-nav" aria-label="Footer navigation"><a href="https://zatics.tech/privacy-policy">Privacy Policy <span aria-hidden="true">↗</span></a></nav>
    </div>
    <div class="footer-bottom"><span>© 2026 Zatics Intelligence</span><span>Document reference ZI-TC-2026-09-21-V2</span></div>
  </footer>`;

const newFooter = `<footer class="site-footer">
    <div class="footer-inner">
      <div><a class="wordmark footer-wordmark" href="/"><img class="wordmark-logo wordmark-logo-light" src="/static/zatics-logo-black.png" alt="Zatics Intelligence logo" width="25" height="25"><img class="wordmark-logo wordmark-logo-dark" src="/static/zatics-logo-white.png" alt="Zatics Intelligence logo" width="25" height="25"><span>Zatics <em>Intelligence</em></span></a><p class="footer-meta">Terms effective September 21, 2026 · Version 2.0</p></div>
      <nav class="footer-nav" aria-label="Footer navigation">
        <a href="/">Home <span aria-hidden="true">↗</span></a>
        <a href="/solutions/">Solutions <span aria-hidden="true">↗</span></a>
        <a href="/privacy-policy/">Privacy Policy <span aria-hidden="true">↗</span></a>
        <a href="/terms-and-conditions/">Terms &amp; Conditions</a>
      </nav>
    </div>
    <div class="footer-bottom"><span>© 2026 Zatics Intelligence. All rights reserved.</span><span>Document reference ZI-TC-2026-09-21-V2</span></div>
  </footer>`;

if (termsHtml.includes(oldFooter)) {
  termsHtml = termsHtml.replace(oldFooter, newFooter);
  console.log('✓ Updated footer in terms HTML');
} else {
  console.warn('⚠️ Old footer exact match not found, checking fallback replace');
  termsHtml = termsHtml.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, newFooter);
  console.log('✓ Fallback replaced footer in terms HTML');
}

// Canonical and OG URL normalization
termsHtml = termsHtml.replace('https://zatics.tech/terms-and-conditions', 'https://zatics.tech/terms-and-conditions/');
termsHtml = termsHtml.replace('https://zatics.tech/terms-and-conditions', 'https://zatics.tech/terms-and-conditions/');

// Save to terms-and-conditions/index.html and public/terms-and-conditions/index.html
const targetDir1 = path.join(root, 'terms-and-conditions');
const targetDir2 = path.join(publicDir, 'terms-and-conditions');

fs.mkdirSync(targetDir1, { recursive: true });
fs.mkdirSync(targetDir2, { recursive: true });

fs.writeFileSync(path.join(targetDir1, 'index.html'), termsHtml, 'utf8');
fs.writeFileSync(path.join(targetDir2, 'index.html'), termsHtml, 'utf8');
console.log('✓ Created terms-and-conditions/index.html and public/terms-and-conditions/index.html');

// 3. Sitemap & robots.txt
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://zatics.tech/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://zatics.tech/solutions/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://zatics.tech/solutions/industries/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://zatics.tech/solutions/intelligence/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://zatics.tech/solutions/engineering/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://zatics.tech/solutions/research/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://zatics.tech/solutions/publications/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://zatics.tech/solutions/publications/building-intelligence-across-industries/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://zatics.tech/privacy-policy/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://zatics.tech/terms-and-conditions/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
`;
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);

const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://zatics.tech/sitemap.xml
`;
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
console.log('✓ Created public/sitemap.xml and public/robots.txt');

console.log('--- Asset and page creation complete ---');

