import html
import json
import re
from pathlib import Path

ROOT = Path('/home/ubuntu/zaticsterms')
data = json.loads((ROOT / 'public/legal-content.json').read_text(encoding='utf-8'))


def esc(s):
    return html.escape(s, quote=True)


def inline_text(s):
    return esc(s).replace('\n', '<br>')


def block_html(block):
    kind = block['type']
    bid = block.get('id') or ''
    number = block.get('number') or ''
    text = block.get('text', '')
    if kind == 'h1':
        return f'''<section class="legal-section" data-section="{esc(number)}" id="{esc(bid)}">
  <h2 class="section-heading legal-block" data-searchable data-search-text="{esc(number + ' ' + text)}"><span class="section-number">{esc(number)}</span><span>{inline_text(text)}</span><a class="anchor-link" href="#{esc(bid)}" aria-label="Copy link to Section {esc(number)}">#</a></h2>'''
    if kind == 'h2':
        return f'''  <h3 class="subsection-heading legal-block" data-searchable data-search-text="{esc(number + ' ' + text)}" id="{esc(bid)}"><span class="subsection-number">{esc(number)}</span><span>{inline_text(text)}</span><a class="anchor-link" href="#{esc(bid)}" aria-label="Copy link to Section {esc(number)}">#</a></h3>'''
    if kind == 'clause':
        cls = 'clause paragraph-block'
        if re.match(r'^\([a-z]\)', text):
            cls += ' lettered-clause'
        number_html = f'<span class="clause-number">{esc(number)}</span>' if number else ''
        return f'''  <p class="{cls} legal-block" data-searchable data-search-text="{esc((number + ' ' + text).strip())}" id="{esc(bid)}">{number_html}<span>{inline_text(text)}</span></p>'''
    if kind == 'p':
        cls = 'paragraph-block legal-block'
        if re.match(r'^\([a-z]\)', text):
            cls += ' lettered-clause'
        return f'''  <p class="{cls}" data-searchable data-search-text="{esc(text)}">{inline_text(text)}</p>'''
    if kind == 'table':
        rows = block['rows']
        if not rows:
            return ''
        head = rows[0]
        body = rows[1:]
        head_html = ''.join(f'<th scope="col">{inline_text(cell)}</th>' for cell in head)
        body_html = ''.join('<tr>' + ''.join(f'<td>{inline_text(cell)}</td>' for cell in row) + '</tr>' for row in body)
        return f'''  <div class="legal-table-wrap" data-searchable data-search-text="{esc(' '.join(' '.join(r) for r in rows))}"><table class="legal-table"><thead><tr>{head_html}</tr></thead><tbody>{body_html}</tbody></table></div>'''
    return ''


blocks = data['blocks']
sections = [b for b in blocks if b['type'] == 'h1']
subsections = [b for b in blocks if b['type'] == 'h2']
metadata = data['metadata']
legal_html = '\n'.join(block_html(b) for b in blocks)

toc_html = []
for b in blocks:
    if b['type'] == 'h1':
        toc_html.append(f'<li class="toc-section"><a href="#{esc(b["id"])}"><span>{esc(b["number"])}</span>{inline_text(b["text"])}</a></li>')
    elif b['type'] == 'h2':
        toc_html.append(f'<li class="toc-subsection"><a href="#{esc(b["id"])}"><span>{esc(b["number"])}</span>{inline_text(b["text"])}</a></li>')
toc_html = '\n'.join(toc_html)

meta_chips = f'''<div class="meta-row" aria-label="Document metadata">
  <span class="meta-chip"><span class="meta-label">Version</span> {esc(metadata.get('Version', ''))}</span>
  <span class="meta-chip"><span class="meta-label">Effective</span> {esc(metadata.get('Terms Effective Date', ''))}</span>
  <span class="meta-chip"><span class="meta-label">Reference</span> {esc(metadata.get('Document reference', ''))}</span>
</div>'''

html_doc = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="Terms and Conditions for Zatics Intelligence custom solutions, existing solutions, software licensing, AI systems, and automation.">
  <meta name="keywords" content="Zatics Intelligence, Terms and Conditions, software licensing, AI systems, automation">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Terms and Conditions — Zatics Intelligence">
  <meta property="og:description" content="The Terms and Conditions governing Zatics Intelligence services, software, systems, AI, and automation arrangements.">
  <meta property="og:url" content="https://zatics.tech/terms-and-conditions">
  <meta property="og:site_name" content="Zatics Intelligence">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Terms and Conditions — Zatics Intelligence">
  <meta name="twitter:description" content="The Terms and Conditions governing Zatics Intelligence services, software, systems, AI, and automation arrangements.">
  <link rel="canonical" href="https://zatics.tech/terms-and-conditions">
  <title>Terms and Conditions — Zatics Intelligence</title>
  <script>try{{const saved=localStorage.getItem('zatics-theme');const system=matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=saved || (system?'dark':'light');}}catch{{}}</script>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to legal content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="wordmark" href="https://zatics.tech" aria-label="Zatics Intelligence home"><img class="wordmark-logo wordmark-logo-light" src="/zatics-logo-black.png" alt="Zatics Intelligence logo" width="25" height="25"><img class="wordmark-logo wordmark-logo-dark" src="/zatics-logo-white.png" alt="Zatics Intelligence logo" width="25" height="25"><span>Zatics <em>Intelligence</em></span></a>
      <div class="header-actions">
        <a class="header-link" href="https://zatics.tech">Website <span aria-hidden="true">↗</span></a>
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark mode" aria-pressed="false"><span class="theme-icon" aria-hidden="true">◐</span><span class="theme-label">Dark mode</span></button>
      </div>
    </div>
  </header>

  <main id="main-content">
    <section class="hero-shell" aria-labelledby="page-title">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow"><span class="eyebrow-dot"></span> Zatics Intelligence / Legal</p>
          <h1 id="page-title">Terms <span class="amp">&amp;</span><br>Conditions</h1>
          <p class="hero-lede">The legal framework for Zatics Intelligence custom solutions, existing solutions, software licensing, AI systems, and automation arrangements.</p>
          {meta_chips}
        </div>
        <div class="hero-aside" aria-label="Document summary">
          <p class="aside-kicker">Publication copy</p>
          <p class="aside-title">Clear terms for intelligent work.</p>
          <p class="aside-copy">This document sets the framework for how scope, fees, ownership, data, timelines, approvals, and risk are managed between Zatics Intelligence and its business clients.</p>
          <a class="text-link" href="#section-1-introduction">Read from the beginning <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>

    <section class="utility-shell" aria-label="Document tools">
      <div class="utility-inner">
        <form class="search-form" role="search" data-search-form>
          <label class="sr-only" for="document-search">Search the Terms and Conditions</label>
          <span class="search-icon" aria-hidden="true">⌕</span>
          <input id="document-search" name="q" type="search" autocomplete="off" placeholder="Search the document" aria-controls="search-results" aria-expanded="false" aria-describedby="search-hint">
          <span id="search-hint" class="search-hint">⌘ K</span>
          <button class="clear-search" type="button" data-clear-search aria-label="Clear search" hidden>×</button>
          <div class="search-results" id="search-results" role="listbox" aria-label="Search results" hidden></div>
        </form>
        <p class="utility-note">{len(sections)} sections <span class="utility-separator">·</span> searchable full text</p>
      </div>
    </section>

    <div class="content-layout">
      <aside class="toc-panel" aria-label="Table of contents">
        <div class="toc-mobile-heading"><span>Contents</span><button type="button" class="toc-mobile-toggle" aria-expanded="false" aria-controls="toc-list">Open</button></div>
        <div class="toc-inner" id="toc-list">
          <p class="toc-kicker">On this page</p>
          <nav><ol class="toc-list">{toc_html}</ol></nav>
        </div>
      </aside>
      <article class="legal-document" id="legal-document" aria-labelledby="document-heading">
        <div class="document-intro">
          <p class="eyebrow">Terms and Conditions</p>
          <h2 id="document-heading">The agreement, in full.</h2>
          <p>These Terms are effective as of <strong>{esc(metadata.get('Terms Effective Date', ''))}</strong>. They apply to the business relationships and arrangements described in the source document.</p>
        </div>
        <div class="legal-body">{legal_html}</div>
      </article>
    </div>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div><a class="wordmark footer-wordmark" href="https://zatics.tech"><img class="wordmark-logo wordmark-logo-light" src="/zatics-logo-black.png" alt="Zatics Intelligence logo" width="25" height="25"><img class="wordmark-logo wordmark-logo-dark" src="/zatics-logo-white.png" alt="Zatics Intelligence logo" width="25" height="25"><span>Zatics <em>Intelligence</em></span></a><p class="footer-meta">Terms effective {esc(metadata.get('Terms Effective Date', ''))} · Version {esc(metadata.get('Version', ''))}</p></div>
      <nav class="footer-nav" aria-label="Footer navigation"><a href="https://zatics.tech/privacy-policy">Privacy Policy <span aria-hidden="true">↗</span></a></nav>
    </div>
    <div class="footer-bottom"><span>© {esc(metadata.get('Terms Effective Date', '')[-4:])} Zatics Intelligence</span><span>Document reference {esc(metadata.get('Document reference', ''))}</span></div>
  </footer>
  <script src="/app.js" defer></script>
</body>
</html>
'''
(ROOT / 'index.html').write_text(html_doc, encoding='utf-8')
print(f'generated index.html with {len(blocks)} legal blocks and {len(sections)} sections')
