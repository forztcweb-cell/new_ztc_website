/* Privacy Policy renderer — Zatics Intelligence v2.0
   Adapted from the standalone policy app to integrate with the main site design system */
(function () {
  'use strict';

  const data = window.POLICY_DATA;
  if (!data) return;

  const policyBody   = document.getElementById('policy-body');
  const tocList      = document.getElementById('toc-list');
  const tocCount     = document.getElementById('toc-count');
  const searchInput  = document.getElementById('policy-search');
  const clearSearch  = document.getElementById('clear-search');
  const searchResults= document.getElementById('search-results');
  const searchStatus = document.getElementById('search-status');
  const toast        = document.getElementById('pp-toast');

  if (!policyBody || !tocList) return;

  /* ── Utilities ─────────────────────────────────────────────────── */
  const escapeHTML = (v) =>
    String(v).replace(/[&<>'"]/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])
    );

  const highlight = (value, query) => {
    let html = escapeHTML(value);
    if (!query) return html;
    const terms = query.split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length).map(escapeHTML);
    if (!terms.length) return html;
    return html.replace(new RegExp(`(${terms.join('|')})`, 'gi'), '<mark>$1</mark>');
  };

  const richText = (value, query = '') => {
    let html = highlight(value, query);
    html = html.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, (e) => `<a href="mailto:${e}">${e}</a>`);
    return html;
  };

  /* ── Table renderer ─────────────────────────────────────────────── */
  function renderTable(table, query = '') {
    const wrap = document.createElement('div');
    wrap.className = 'pp-table-scroll';
    const tbl   = document.createElement('table');
    const thead = document.createElement('thead');
    const tr    = document.createElement('tr');
    table.headers.forEach((h) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = h;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    tbl.appendChild(thead);
    const tbody = document.createElement('tbody');
    table.rows.forEach((row) => {
      const rowEl = document.createElement('tr');
      row.forEach((cell) => {
        const td = document.createElement('td');
        td.innerHTML = richText(cell, query);
        rowEl.appendChild(td);
      });
      tbody.appendChild(rowEl);
    });
    tbl.appendChild(tbody);
    wrap.appendChild(tbl);
    return wrap;
  }

  /* ── Policy body renderer ────────────────────────────────────────── */
  function renderPolicy(query = '') {
    policyBody.replaceChildren();
    let currentSection = null;
    data.blocks.forEach((block) => {
      if (block.type === 'section') {
        const section = document.createElement('section');
        section.className = 'pp-section';
        section.id = block.id;
        section.dataset.number = block.number;
        const h2 = document.createElement('h2');
        h2.id = `${block.id}-heading`;
        h2.innerHTML = `<span class="pp-num">${escapeHTML(block.number)}.</span> ${escapeHTML(block.title)}`;
        section.appendChild(h2);
        policyBody.appendChild(section);
        currentSection = section;
      } else if (block.type === 'subsection') {
        const h3 = document.createElement('h3');
        h3.id = block.id;
        h3.dataset.number = block.number;
        h3.innerHTML = `<span class="pp-num">${escapeHTML(block.number)}</span> ${escapeHTML(block.title)}`;
        (currentSection || policyBody).appendChild(h3);
      } else if (block.type === 'paragraph') {
        const p = document.createElement('p');
        p.innerHTML = richText(block.text, query);
        (currentSection || policyBody).appendChild(p);
      } else if (block.type === 'table') {
        (currentSection || policyBody).appendChild(renderTable(block, query));
      }
    });
  }

  /* ── TOC renderer ────────────────────────────────────────────────── */
  function renderTOC() {
    tocList.replaceChildren();
    if (tocCount) tocCount.textContent = `${data.sections.length}`;
    data.sections.forEach((section) => {
      const item = document.createElement('div');
      item.className = 'pp-toc-section';
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.dataset.target = section.id;
      link.innerHTML = `<span class="pp-toc-num">${escapeHTML(section.number)}.</span><span>${escapeHTML(section.title)}</span>`;
      item.appendChild(link);
      if (section.subsections && section.subsections.length) {
        const sublist = document.createElement('div');
        sublist.className = 'pp-toc-subsections';
        section.subsections.forEach((sub) => {
          const subLink = document.createElement('a');
          subLink.href = `#${sub.id}`;
          subLink.dataset.target = sub.id;
          subLink.innerHTML = `<span class="pp-toc-num">${escapeHTML(sub.number)}</span><span>${escapeHTML(sub.title)}</span>`;
          sublist.appendChild(subLink);
        });
        item.appendChild(sublist);
      }
      tocList.appendChild(item);
    });
  }

  /* ── Search ──────────────────────────────────────────────────────── */
  const searchItems = data.blocks.map((block, index) => {
    const text = block.type === 'table'
      ? [block.headers.join(' '), ...block.rows.flat()].join(' ')
      : `${block.number || ''} ${block.title || ''} ${block.text || ''}`;
    const section = block.number ? block.number.split('.')[0] : '';
    return { block, index, text, section };
  });

  function excerpt(text, query) {
    const lower = text.toLowerCase();
    const first = query.toLowerCase().split(/\s+/).filter(Boolean)
      .map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
    const start = Math.max(0, first - 88);
    const end   = Math.min(text.length, first + 170);
    return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
  }

  function targetId(block) {
    if (block.type === 'section' || block.type === 'subsection') return block.id;
    return block.sectionId || data.sections[0]?.id;
  }

  function showSearchResults(query) {
    const norm = query.trim().toLowerCase();
    if (clearSearch) clearSearch.hidden = !norm;
    if (!norm) {
      if (searchResults) { searchResults.hidden = true; searchResults.replaceChildren(); }
      if (searchStatus) searchStatus.textContent = `${data.sections.length} sections · v2.0`;
      renderPolicy();
      return;
    }
    const terms   = norm.split(/\s+/).filter(Boolean);
    const matches = searchItems.filter((item) => terms.every((t) => item.text.toLowerCase().includes(t))).slice(0, 12);
    if (searchResults) {
      searchResults.hidden = false;
      searchResults.replaceChildren();
    }
    if (searchStatus) searchStatus.textContent = `${matches.length} ${matches.length === 1 ? 'result' : 'results'}`;
    renderPolicy(query);
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'pp-search-empty';
      empty.innerHTML = `<span class="pp-empty-mark">/</span><strong>No matches found</strong><p>Try a different term — e.g. "AI", "deletion", or "cookies".</p>`;
      if (searchResults) searchResults.appendChild(empty);
      return;
    }
    const list = document.createElement('div');
    list.className = 'pp-search-result-list';
    matches.forEach((match, ri) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pp-search-result';
      btn.dataset.target = targetId(match.block);
      btn.dataset.resultIndex = ri;
      const label = match.block.type === 'table'
        ? 'Table'
        : `${match.block.number ? `${match.block.number} ` : ''}${match.block.title || 'Policy text'}`;
      btn.innerHTML = `<span class="pp-result-label">${highlight(label, query)}</span><span class="pp-result-excerpt">${highlight(excerpt(match.text, query), query)}</span><span class="pp-result-arrow" aria-hidden="true">↗</span>`;
      btn.addEventListener('click', () => navigateTo(btn.dataset.target));
      list.appendChild(btn);
    });
    if (searchResults) searchResults.appendChild(list);
  }

  /* ── Navigation ──────────────────────────────────────────────────── */
  function navigateTo(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
    if (target.matches('h2,h3')) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    const navLink = document.querySelector(`[data-target="${id}"]`);
    navLink?.classList.add('pp-just-visited');
    window.setTimeout(() => navLink?.classList.remove('pp-just-visited'), 900);
  }

  /* ── Intersection observer for active TOC link ───────────────────── */
  function setupObservers() {
    const sections = [...document.querySelectorAll('.pp-section')];
    const links    = [...document.querySelectorAll('.pp-toc-section a')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('pp-active', link.dataset.target === entry.target.id));
      });
    }, { rootMargin: '-16% 0px -72% 0px', threshold: 0 });
    sections.forEach((s) => observer.observe(s));
  }

  /* ── Keyboard shortcuts ──────────────────────────────────────────── */
  function setupKeyboard() {
    if (!searchInput) return;
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); searchInput.focus(); searchInput.select();
      }
    });
    searchInput.addEventListener('keydown', (e) => {
      const results = [...document.querySelectorAll('.pp-search-result')];
      if (e.key === 'ArrowDown' && results.length) { e.preventDefault(); results[0].focus(); }
    });
    if (searchResults) {
      searchResults.addEventListener('keydown', (e) => {
        const results = [...document.querySelectorAll('.pp-search-result')];
        const current = results.indexOf(document.activeElement);
        if (e.key === 'ArrowDown' && current >= 0) { e.preventDefault(); results[Math.min(results.length - 1, current + 1)].focus(); }
        if (e.key === 'ArrowUp'   && current >= 0) { e.preventDefault(); current === 0 ? searchInput.focus() : results[current - 1].focus(); }
        if (e.key === 'Escape') searchInput.focus();
      });
    }
  }

  /* ── TOC click delegation ────────────────────────────────────────── */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.pp-toc-section a');
    if (link) { e.preventDefault(); navigateTo(link.dataset.target); }
  });

  /* ── Wire up events ──────────────────────────────────────────────── */
  if (searchInput) searchInput.addEventListener('input', () => showSearchResults(searchInput.value));
  if (clearSearch) clearSearch.addEventListener('click', () => { searchInput.value = ''; showSearchResults(''); searchInput.focus(); });

  window.addEventListener('hashchange', () => {
    const id = window.location.hash.slice(1);
    if (id) navigateTo(id);
  });

  /* ── Init ────────────────────────────────────────────────────────── */
  renderTOC();
  renderPolicy();
  setupObservers();
  setupKeyboard();

  const initialHash = window.location.hash.slice(1);
  if (initialHash) window.setTimeout(() => navigateTo(initialHash), 80);
})();
