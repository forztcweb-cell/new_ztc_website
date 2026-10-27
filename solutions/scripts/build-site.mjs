import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const editorialPath = path.join(root, 'src', 'content', 'editorial.txt');
const editorial = fs.readFileSync(editorialPath, 'utf8').replace(/\r/g, '');

const SITE_ORIGIN = 'https://zatics.tech';
const SITE_NAME = 'Zatics Intelligence';
const PUBLICATION_SLUG = 'building-intelligence-across-industries';
const PUBLICATION_PATH = `/publications/${PUBLICATION_SLUG}/`;
const sourceLines = editorial.split('\n');
const title = sourceLines[0].trim();
const deck = sourceLines[2].trim();
const bodySource = sourceLines.slice(4).join('\n');

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function parseBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'list', items: [...list] });
      list = [];
    }
  };
  const addHeading = (text, level, number = '') => {
    flushParagraph();
    flushList();
    blocks.push({ type: 'heading', level, number, text, id: slugify(text) });
  };

  const specialHeadings = [
    'One Intelligence Vision. Multiple Industry Systems.',
    'From AI That Answers to Intelligence That Executes',
    'Built in India. Designed for Global Operations.',
    'The Future: Organizations That Run With Less Operational Friction',
    'Have an operation worth transforming?'
  ];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === '---') {
      flushParagraph();
      flushList();
      continue;
    }

    const numbered = line.match(/^(\d+)\.\s+(.+)$/);
    if (numbered) {
      addHeading(numbered[2], 2, numbered[1].padStart(2, '0'));
      continue;
    }
    if (specialHeadings.includes(line)) {
      addHeading(line, 2);
      continue;
    }
    if (line === 'What can it do?' || line === 'The result' || line === 'AI-powered monitoring and public safety') {
      addHeading(line, 3);
      continue;
    }
    if (line.startsWith('- ')) {
      flushParagraph();
      list.push(line.slice(2));
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

const blocks = parseBlocks(bodySource);
const numberedSections = blocks.filter((block) => block.type === 'heading' && block.level === 2 && block.number);
const wordCount = editorial.split(/\s+/).filter(Boolean).length;
const readingTime = `${Math.max(12, Math.round(wordCount / 220))} min read`;
const publication = {
  slug: PUBLICATION_SLUG,
  title: 'Building Intelligence Across Industries',
  summary: 'An editorial overview of the intelligence systems Zatics Intelligence is exploring and building toward, from agentic infrastructure to industry-specific operations.',
  date: 'August 6, 2026',
  type: 'Editorial overview',
  category: 'Editorial overview',
  readingTime,
  tags: ['agentic intelligence', 'industry systems', 'operational intelligence', 'editorial'],
  blocks,
  sections: numberedSections.map(({ number, text, id }) => ({ number, title: text, id })),
  indexedText: [title, deck, ...blocks.map((block) => block.text ?? block.items?.join(' ') ?? '')].join(' ')
};

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(value = '') {
  return esc(value)
    .replace(/\b(What can it do\?|The result)\b/g, '<strong>$1</strong>');
}

function renderBlocks(items, { includeDomainIndex = false } = {}) {
  return items.map((block) => {
    if (block.type === 'paragraph') return `<p>${inline(block.text)}</p>`;
    if (block.type === 'list') return `<ul>${block.items.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`;
    const label = block.number ? `<span class="section-number">${block.number} /</span>` : '';
    const tag = block.level === 3 ? 'h3' : 'h2';
    return `<${tag} id="${esc(block.id)}">${label}${inline(block.text)}</${tag}>`;
  }).join('\n');
}

function logoMarkup() {
  return `<img class="brand-mark" data-logo-light src="/static/logo-black.png" alt="Zatics Intelligence mark" style="display:none"><img class="brand-mark" data-logo-dark src="/static/logo-white.png" alt="Zatics Intelligence mark">`;
}

function header(active = '') {
  const links = [
    ['Intelligence', '/intelligence/', 'intelligence'],
    ['Research', '/research/', 'research'],
    ['Industries', '/industries/', 'industries'],
    ['Engineering', '/engineering/', 'engineering']
  ];
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="Zatics Intelligence home">${logoMarkup()}<span class="brand-copy"><strong>ZATICS</strong><small>INTELLIGENCE</small></span></a>
    <nav class="primary-nav" id="primary-nav" aria-label="Primary navigation">
      ${links.map(([label, href, key]) => `<a class="${active === key ? 'is-active' : ''}" href="${href}">${label}</a>`).join('')}
      <a class="publication-nav ${active === 'publications' ? 'is-active' : ''}" href="/publications/">Publications <span aria-hidden="true">↗</span></a>
    </nav>
    <div class="header-actions">
      <button class="icon-button search-trigger" type="button" data-search-open aria-label="Open document search"><span aria-hidden="true">⌕</span><span class="search-label">Search</span><kbd>/</kbd></button>
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch theme"><span class="theme-icon" aria-hidden="true">◐</span><span class="theme-label">Theme</span></button>
      <button class="menu-toggle" type="button" data-menu-toggle aria-controls="primary-nav" aria-expanded="false" aria-label="Open navigation"><span></span><span></span></button>
    </div>
  </header>`;
}

function searchOverlay() {
  return `<div class="search-overlay" data-search-overlay hidden aria-hidden="true">
    <div class="search-backdrop" data-search-close></div>
    <section class="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div class="search-panel-head"><div><span class="eyebrow">ZATICS / DOCUMENT SEARCH</span><h2 id="search-title">Find an intelligence note.</h2></div><button class="close-button" type="button" data-search-close aria-label="Close search">×</button></div>
      <form class="search-form" data-search-form><label class="sr-only" for="global-search">Search publications</label><span aria-hidden="true">⌕</span><input id="global-search" name="q" type="search" autocomplete="off" placeholder="Search title, topic, or domain" /><button type="submit">Search</button></form>
      <div class="search-filters" data-search-filters></div>
      <div class="search-results" data-search-results aria-live="polite"></div>
      <div class="search-hint"><span>Search across titles, categories, tags, and article text.</span><kbd>ESC</kbd></div>
    </section>
  </div>`;
}

function basePage({ title: pageTitle, description, path: pagePath, body, active = '', noindex = false }) {
  const canonical = `${SITE_ORIGIN}${pagePath}`;
  const metaRobots = noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow">';
  const indexJson = JSON.stringify([{ ...publication, blocks: undefined }]).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(description)}">
  ${metaRobots}
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_ORIGIN}/static/og-publication.svg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${SITE_ORIGIN}/static/og-publication.svg">
  <meta name="theme-color" content="#000000">
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
  <script>(function(){try{var t=localStorage.getItem('zatics-theme');if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t}catch(e){}}());document.addEventListener('DOMContentLoaded',function(){var t=document.documentElement.dataset.theme||'dark';document.querySelectorAll('[data-logo-light]').forEach(function(i){i.style.display=t==='light'?'':'none'});document.querySelectorAll('[data-logo-dark]').forEach(function(i){i.style.display=t==='dark'?'':'none'})});</script>
  <link rel="stylesheet" href="/static/main.css">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${header(active)}
  <main id="main-content">${body}</main>
  <footer class="site-footer"><div class="footer-rule"></div><div class="footer-grid"><div><a class="brand footer-brand" href="/">${logoMarkup()}<span class="brand-copy"><strong>ZATICS</strong><small>INTELLIGENCE</small></span></a><p class="footer-note">Autonomous systems.<br>Real-world intelligence.</p></div><div class="footer-links"><div><span class="eyebrow">Explore</span><a href="/publications/">Publications</a><a href="/industries/">Industries</a><a href="https://zatics.tech">Main website ↗</a></div><div><span class="eyebrow">Editorial</span><a href="/research/">Research framing</a><a href="/engineering/">Engineering principles</a><a href="${PUBLICATION_PATH}">Featured essay</a></div></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Zatics Intelligence</span><span>Built in India. Designed for global operations.</span></div></footer>
  ${searchOverlay()}
  <script>window.__ZATICS_INDEX__=${indexJson};</script>
  <script src="/static/app.js" defer></script>
</body>
</html>`;
}

function diagram() {
  return `<div class="system-diagram" role="img" aria-label="A five-stage intelligence flow from understand to execute, with human oversight at critical points."><div class="diagram-topline"><span>ZATICS / SYSTEM ARCHITECTURE</span><span>ILLUSTRATIVE MODEL</span></div><div class="diagram-flow">${['Understand', 'Reason', 'Decide', 'Coordinate', 'Execute'].map((label, index) => `<div class="diagram-node"><span class="node-index">0${index + 1}</span><strong>${label}</strong><small>${['Contextualise', 'Analyse & plan', 'Evaluate', 'Delegate', 'Act & verify'][index]}</small></div>`).join('<span class="diagram-arrow" aria-hidden="true">→</span>')}</div><div class="diagram-foot"><span><i class="signal-dot"></i> Human oversight at every critical point</span><span>Every decision grounded. Every action traceable.</span></div></div>`;
}

function publicationCard({ compact = false } = {}) {
  return `<article class="publication-card ${compact ? 'is-compact' : ''}"><div class="publication-card-meta"><span>${esc(publication.type)}</span><span>${esc(publication.date)}</span><span>${esc(publication.readingTime)}</span></div><h3><a href="${PUBLICATION_PATH}">${esc(publication.title)}</a></h3><p>${esc(publication.summary)}</p><div class="card-footer"><span class="tag">${esc(publication.category)}</span><a class="text-link" href="${PUBLICATION_PATH}">Read essay <span aria-hidden="true">↗</span></a></div></article>`;
}

function homePage() {
  const domainList = publication.sections.map((section) => `<a href="${PUBLICATION_PATH}#${section.id}" class="domain-row"><span class="domain-index">${section.number}</span><span>${esc(section.title.replace(/^[^:]+:\s*/, ''))}</span><span aria-hidden="true">↗</span></a>`).join('');
  return basePage({
    title: 'Zatics Intelligence — The Intelligence Behind What Comes Next',
    description: 'Explore the systems, research directions, and engineering principles shaping autonomous intelligence across industries.',
    path: '/',
    body: `<section class="hero page-wrap"><div class="hero-kicker"><span class="signal-dot"></span><span>ZATICS INTELLIGENCE / PUBLICATION</span><span>01 — 2026</span></div><div class="hero-grid"><div><h1>The Intelligence<br><em>Behind What Comes Next.</em></h1></div><div class="hero-aside"><p>Explore the systems, research directions, and engineering principles shaping autonomous intelligence across industries.</p><a class="button-link" href="${PUBLICATION_PATH}">Read the featured essay <span aria-hidden="true">↗</span></a></div></div><div class="hero-bottom"><span>Intelligence that moves from information to action.</span><span>Scroll to explore ↓</span></div></section>
    <section class="feature-section page-wrap"><div class="section-label"><span>01 / FEATURED PUBLICATION</span><span>EDITORIAL OVERVIEW</span></div><div class="feature-grid"><div><span class="date-label">${esc(publication.date)} · ${esc(publication.readingTime)}</span><h2>${esc(publication.title)}</h2><p class="feature-dek">${esc(publication.summary)}</p><a class="text-link" href="${PUBLICATION_PATH}">Open publication <span aria-hidden="true">↗</span></a></div><div class="feature-note"><span class="eyebrow">A note on this edition</span><p>This is a Zatics Intelligence editorial overview of the systems and domains we are exploring, designing, or building toward. It does not present every described capability as deployed or independently verified.</p></div></div></section>
    <section class="architecture-section page-wrap"><div class="section-label"><span>02 / THE INTELLIGENCE LAYER</span><span>FROM INFORMATION TO ACTION</span></div><div class="architecture-intro"><h2>Not just artificial intelligence.<br><em>Operational intelligence.</em></h2><p>Software becomes consequential when it can understand context, reason through a task, coordinate the work around it, and act within defined boundaries.</p></div>${diagram()}</section>
    <section class="domains-section page-wrap"><div class="section-label"><span>03 / INDUSTRY INDEX</span><span>19 DOMAINS · ONE DIRECTION</span></div><div class="domains-intro"><h2>Different operations.<br><em>A shared intelligence vision.</em></h2><p>Every industry has its own workflows, risks, terminology, and constraints. The index below is the scope of the featured essay, not a claim that one generic agent can solve every operational problem.</p></div><div class="domain-list">${domainList}</div><div class="section-cta"><a class="button-link" href="/industries/">Explore the full industry index <span aria-hidden="true">↗</span></a></div></section>
    <section class="library-section page-wrap"><div class="section-label"><span>04 / PUBLICATION LIBRARY</span><span>VERIFIED EDITORIAL</span></div><div class="library-head"><div><h2>Read the work as it exists.</h2><p>Only genuine available publications appear here. Search the editorial record by title, topic, category, tags, or indexed text.</p></div><a class="text-link" href="/publications/">Open library <span aria-hidden="true">↗</span></a></div><div class="library-grid">${publicationCard()}</div></section>
    <section class="scope-section page-wrap"><div class="scope-rule"></div><div class="scope-grid"><span class="eyebrow">A NOTE ON OUR SCOPE</span><p>Zatics Intelligence is building toward a broader vision of intelligence infrastructure across the industries and systems outlined in this publication. These areas represent our intended scope of development and the domains we are exploring, designing, or building toward. Development stages, capabilities, and availability may differ by system. Inclusion in this publication does not imply that a system is complete, commercially available, or deployed. We will publish updates as our work progresses.</p></div></section>`
  });
}

function libraryPage() {
  return basePage({
    title: 'Publications — Zatics Intelligence',
    description: 'Search the verified Zatics Intelligence publication library across titles, topics, categories, tags, and article content.',
    path: '/publications/',
    active: 'publications',
    body: `<section class="subhero page-wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><span>Publications</span></div><div class="subhero-grid"><div><span class="eyebrow">ZATICS / PUBLICATIONS</span><h1>Ideas for systems<br><em>that do the work.</em></h1></div><p>Long-form editorial thinking on the intelligence layer behind consequential operations. The library contains only published material with a clear editorial status.</p></div></section><section class="library-page-section page-wrap"><div class="library-toolbar"><div><span class="eyebrow">PUBLICATION LIBRARY</span><h2>One record. No filler.</h2></div><form class="library-search" data-library-form><label class="sr-only" for="library-query">Search publications</label><span aria-hidden="true">⌕</span><input id="library-query" name="q" type="search" placeholder="Search the library" autocomplete="off"><button type="button" data-library-clear aria-label="Clear search">Clear</button></form></div><div class="category-bar" data-library-categories><button class="filter-chip is-selected" type="button" data-category="">All publications</button><button class="filter-chip" type="button" data-category="Editorial overview">Editorial overview</button></div><div class="library-results" data-library-results>${publicationCard()}</div><div class="empty-state" data-library-empty hidden><span class="eyebrow">NO MATCHES</span><h2>Nothing in the record yet.</h2><p>Try a broader term or clear the active category filter. The library is intentionally limited to genuine available publications.</p><button class="button-link" type="button" data-library-reset>Clear search <span aria-hidden="true">×</span></button></div></section>`
  });
}

function articlePage() {
  const toc = publication.sections.map((section) => `<a href="#${section.id}"><span>${section.number}</span>${esc(section.title.replace(/^[^:]+:\s*/, ''))}</a>`).join('');
  return basePage({
    title: `${publication.title} — Zatics Intelligence`,
    description: publication.summary,
    path: PUBLICATION_PATH,
    active: 'publications',
    body: `<article class="article-page page-wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/publications/">Publications</a><span>/</span><span>${esc(publication.title)}</span></div><header class="article-header"><div class="article-meta"><span>${esc(publication.type)}</span><span>${esc(publication.date)}</span><span>${esc(publication.readingTime)}</span></div><h1>${esc(publication.title)}</h1><p class="article-summary">${esc(publication.summary)}</p><div class="article-actions"><a class="button-link" href="/publications/">Back to library <span aria-hidden="true">↗</span></a><button class="quiet-button" type="button" data-share>Copy link <span aria-hidden="true">↗</span></button></div></header><div class="article-layout"><aside class="article-aside"><div class="toc"><span class="eyebrow">IN THIS ESSAY</span><nav aria-label="Table of contents">${toc}</nav></div></aside><div class="article-content"><p class="article-lede">${inline(deck)}</p>${renderBlocks(blocks)}<div class="article-scope"><span class="eyebrow">A NOTE ON OUR SCOPE</span><p>Zatics Intelligence is building toward a broader vision of intelligence infrastructure across the industries and systems outlined in this publication. These areas represent our intended scope of development and the domains we are exploring, designing, or building toward. Development stages, capabilities, and availability may differ by system. Inclusion in this publication does not imply that a system is complete, commercially available, or deployed. We will publish updates as our work progresses.</p></div><div class="related-publications"><div class="section-label"><span>RELATED PUBLICATIONS</span><span>THE RECORD SO FAR</span></div><p>There are no additional genuine publications in the supplied editorial record. New essays will appear here when they are available.</p><a class="text-link" href="/publications/">Return to the publication library <span aria-hidden="true">↗</span></a></div></div></div></article>`
  });
}

function focusPage(kind) {
  const configs = {
    intelligence: {
      title: 'Intelligence — Zatics Intelligence',
      description: 'The shared agentic foundation behind Zatics Intelligence editorial work.',
      kicker: 'ZATICS / INTELLIGENCE',
      heading: 'From information.<br><em>To autonomous action.</em>',
      intro: 'The intelligence layer is not a single model. It is the coordinated system around the model: context, reasoning, permissions, integrations, observability, and the human boundaries that make action accountable.',
      body: `<div class="principle-grid"><div><span class="principle-number">01</span><h3>Reasoning and planning</h3><p>Interpreting objectives, evaluating options, and organizing work into actionable steps.</p></div><div><span class="principle-number">02</span><h3>Agent orchestration</h3><p>Coordinating specialized agents and assigning tasks according to their capabilities.</p></div><div><span class="principle-number">03</span><h3>Organizational memory</h3><p>Using authorized business context, records, and operating procedures to make workflows more consistent.</p></div><div><span class="principle-number">04</span><h3>Permissions and governance</h3><p>Defining what a system can do independently, what requires approval, and what is prohibited.</p></div></div>`
    },
    research: {
      title: 'Research — Zatics Intelligence',
      description: 'Editorial framing for Zatics Intelligence research directions and future-facing systems work.',
      kicker: 'ZATICS / RESEARCH',
      heading: 'A publication for<br><em>directions in progress.</em>',
      intro: 'This is an editorial publication, not an independent research archive. It describes the systems, questions, and directions Zatics Intelligence is exploring, designing, or building toward, with their boundaries stated alongside their ambition.',
      body: `<div class="quote-panel"><span class="eyebrow">EDITORIAL STATUS</span><blockquote>Clear ambition should come with clear boundaries.</blockquote><p>We distinguish operational capability from research direction, experiment, plan, and future possibility. The featured essay is dated August 6, 2026; that date is not assigned to any other material in the library.</p></div>`
    },
    industries: {
      title: 'Industries — Zatics Intelligence',
      description: 'A structured index of the 19 intelligence domains described in the Zatics Intelligence editorial.',
      kicker: 'ZATICS / INDUSTRIES',
      heading: 'One intelligence vision.<br><em>Multiple industry systems.</em>',
      intro: 'The same operational foundation must adapt to the workflows, risks, terminology, regulations, and accountability requirements of each sector. Explore the 19 domains as a structured index into the featured essay.',
      body: `<div class="industry-index-page">${publication.sections.map((section) => `<a href="${PUBLICATION_PATH}#${section.id}"><span>${section.number}</span><strong>${esc(section.title)}</strong><i aria-hidden="true">↗</i></a>`).join('')}</div>`
    },
    engineering: {
      title: 'Engineering — Zatics Intelligence',
      description: 'Engineering principles for context-aware, observable, governed intelligence systems.',
      kicker: 'ZATICS / ENGINEERING',
      heading: 'The model is only<br><em>the beginning.</em>',
      intro: 'Production intelligence depends on the system around the model: the context it can access, the work it can coordinate, the actions it is permitted to take, and the evidence available when something goes wrong.',
      body: diagram()
    }
  };
  const config = configs[kind];
  return basePage({
    title: config.title,
    description: config.description,
    path: `/${kind}/`,
    active: kind,
    body: `<section class="subhero focus-page page-wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><span>${esc(kind)}</span></div><div class="subhero-grid"><div><span class="eyebrow">${config.kicker}</span><h1>${config.heading}</h1></div><p>${config.intro}</p></div></section><section class="focus-content page-wrap">${config.body}<div class="focus-footer"><a class="button-link" href="${PUBLICATION_PATH}">Read the featured essay <span aria-hidden="true">↗</span></a></div></section>`
  });
}

function notFoundPage() {
  return basePage({
    title: 'Page not found — Zatics Intelligence',
    description: 'The requested Zatics Intelligence publication page could not be found.',
    path: '/404.html',
    noindex: true,
    body: `<section class="not-found page-wrap"><span class="eyebrow">404 / NOT IN THE RECORD</span><h1>This page<br><em>does not exist.</em></h1><p>The requested route is not part of the current publication record.</p><a class="button-link" href="/">Return to the publication home <span aria-hidden="true">↗</span></a></section>`
  });
}

function write(rel, content) {
  const target = path.join(dist, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
write('index.html', homePage());
write('publications/index.html', libraryPage());
write(`${PUBLICATION_PATH.slice(1)}index.html`, articlePage());
write('intelligence/index.html', focusPage('intelligence'));
write('research/index.html', focusPage('research'));
write('industries/index.html', focusPage('industries'));
write('engineering/index.html', focusPage('engineering'));
write('404.html', notFoundPage());
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/publications/', PUBLICATION_PATH, '/intelligence/', '/research/', '/industries/', '/engineering/'].map((route) => `<url><loc>${SITE_ORIGIN}${route}</loc></url>`).join('')}</urlset>`);
write('static/main.css', fs.readFileSync(path.join(root, 'src', 'styles', 'main.css')));
write('static/app.js', fs.readFileSync(path.join(root, 'src', 'client', 'app.js')));
write('static/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#000"/><path d="M10 14h44L18 50h36" fill="none" stroke="#fff" stroke-width="6"/><path d="M10 50 46 14" fill="none" stroke="#7FAF8D" stroke-width="2"/></svg>`);
write('static/og-publication.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#050505"/><path d="M86 116h310L144 482h252" fill="none" stroke="#fff" stroke-width="18"/><path d="M86 482 350 116" fill="none" stroke="#7FAF8D" stroke-width="4"/><text x="86" y="548" fill="#fff" font-family="Arial, sans-serif" font-size="28" letter-spacing="5">ZATICS / INTELLIGENCE</text><text x="520" y="245" fill="#fff" font-family="Georgia, serif" font-size="66">The Intelligence</text><text x="520" y="325" fill="#fff" font-family="Georgia, serif" font-size="66">Behind What Comes Next.</text><text x="520" y="395" fill="#a3a3a3" font-family="Arial, sans-serif" font-size="22">Building Intelligence Across Industries</text></svg>`);
write('static/logo-black.png', fs.readFileSync(path.join(root, 'src', 'assets', 'logo-black.png')));
write('static/logo-white.png', fs.readFileSync(path.join(root, 'src', 'assets', 'logo-white.png')));

console.log(`Built ${Object.keys(publication).length} publication fields and ${numberedSections.length} industry sections into ${dist}`);
