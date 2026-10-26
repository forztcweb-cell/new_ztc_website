const data = window.POLICY_DATA;
const root = document.documentElement;
const body = document.body;
const policyBody = document.getElementById('policy-body');
const tocList = document.getElementById('toc-list');
const tocCount = document.getElementById('toc-count');
const searchInput = document.getElementById('policy-search');
const clearSearch = document.getElementById('clear-search');
const searchResults = document.getElementById('search-results');
const searchStatus = document.getElementById('search-status');
const themeToggle = document.getElementById('theme-toggle');
const toast = document.getElementById('toast');

const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const highlight = (value, query) => {
  let html = escapeHTML(value);
  if (!query) return html;
  const terms = query.split(/\s+/).filter(Boolean).sort((a,b) => b.length - a.length).map(escapeHTML);
  if (!terms.length) return html;
  return html.replace(new RegExp(`(${terms.join('|')})`, 'gi'), '<mark>$1</mark>');
};
const richText = (value, query = '') => {
  let html = highlight(value, query);
  html = html.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, (email) => `<a href="mailto:${email}">${email}</a>`);
  return html;
};
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function renderTable(table, query = '') {
  const tableEl = document.createElement('div');
  tableEl.className = 'table-scroll';
  const tableNode = document.createElement('table');
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  table.headers.forEach((header) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = header;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  tableNode.appendChild(thead);
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
  tableNode.appendChild(tbody);
  tableEl.appendChild(tableNode);
  return tableEl;
}

function renderPolicy(query = '') {
  policyBody.replaceChildren();
  let currentSection = null;
  data.blocks.forEach((block) => {
    if (block.type === 'section') {
      const section = document.createElement('section');
      section.className = 'policy-section';
      section.id = block.id;
      section.dataset.number = block.number;
      const heading = document.createElement('h2');
      heading.id = `${block.id}-heading`;
      heading.innerHTML = `<span class="heading-number">${escapeHTML(block.number)}.</span> ${escapeHTML(block.title)}`;
      section.appendChild(heading);
      policyBody.appendChild(section);
      currentSection = section;
    } else if (block.type === 'subsection') {
      const heading = document.createElement('h3');
      heading.id = block.id;
      heading.dataset.number = block.number;
      heading.innerHTML = `<span class="heading-number">${escapeHTML(block.number)}</span> ${escapeHTML(block.title)}`;
      (currentSection || policyBody).appendChild(heading);
    } else if (block.type === 'paragraph') {
      const p = document.createElement('p');
      p.innerHTML = richText(block.text, query);
      (currentSection || policyBody).appendChild(p);
    } else if (block.type === 'table') {
      (currentSection || policyBody).appendChild(renderTable(block, query));
    }
  });
}

function renderTOC() {
  tocList.replaceChildren();
  tocCount.textContent = `${data.sections.length}`;
  data.sections.forEach((section) => {
    const item = document.createElement('div');
    item.className = 'toc-section';
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.dataset.target = section.id;
    link.innerHTML = `<span class="toc-number">${escapeHTML(section.number)}.</span><span>${escapeHTML(section.title)}</span>`;
    item.appendChild(link);
    if (section.subsections.length) {
      const sublist = document.createElement('div');
      sublist.className = 'toc-subsections';
      section.subsections.forEach((sub) => {
        const subLink = document.createElement('a');
        subLink.href = `#${sub.id}`;
        subLink.dataset.target = sub.id;
        subLink.innerHTML = `<span class="toc-number">${escapeHTML(sub.number)}</span><span>${escapeHTML(sub.title)}</span>`;
        sublist.appendChild(subLink);
      });
      item.appendChild(sublist);
    }
    tocList.appendChild(item);
  });
}

const searchItems = data.blocks.map((block, index) => {
  const text = block.type === 'table' ? [block.headers.join(' '), ...block.rows.flat()].join(' ') : `${block.number || ''} ${block.title || ''} ${block.text || ''}`;
  const section = block.number ? block.number.split('.')[0] : '';
  return { block, index, text, section };
});

function excerpt(text, query) {
  const lower = text.toLowerCase();
  const first = query.toLowerCase().split(/\s+/).filter(Boolean).map((term) => lower.indexOf(term)).filter((index) => index >= 0).sort((a,b) => a-b)[0] ?? 0;
  const start = Math.max(0, first - 88);
  const end = Math.min(text.length, first + 170);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

function targetId(block) {
  if (block.type === 'section' || block.type === 'subsection') return block.id;
  return block.sectionId || data.sections[0]?.id;
}

function showSearchResults(query) {
  const normalized = query.trim().toLowerCase();
  clearSearch.hidden = !normalized;
  if (!normalized) {
    searchResults.hidden = true;
    searchResults.replaceChildren();
    searchStatus.textContent = `${data.sections.length} sections · 2.0`;
    renderPolicy();
    return;
  }
  const terms = normalized.split(/\s+/).filter(Boolean);
  const matches = searchItems.filter((item) => terms.every((term) => item.text.toLowerCase().includes(term))).slice(0, 12);
  searchResults.hidden = false;
  searchResults.replaceChildren();
  searchStatus.textContent = `${matches.length} ${matches.length === 1 ? 'result' : 'results'}`;
  renderPolicy(query);
  if (!matches.length) {
    const empty = document.createElement('div');
    empty.className = 'search-empty';
    empty.innerHTML = `<span class="empty-mark">/</span><strong>No matches found</strong><p>Try a different term, such as “AI”, “deletion”, or “cookies”.</p>`;
    searchResults.appendChild(empty);
    return;
  }
  const list = document.createElement('div');
  list.className = 'search-result-list';
  matches.forEach((match, resultIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search-result';
    button.dataset.target = targetId(match.block);
    button.dataset.resultIndex = resultIndex;
    const label = match.block.type === 'table' ? 'Table' : `${match.block.number ? `${match.block.number} ` : ''}${match.block.title || 'Policy text'}`;
    button.innerHTML = `<span class="result-label">${highlight(label, query)}</span><span class="result-excerpt">${highlight(excerpt(match.text, query), query)}</span><span class="result-arrow" aria-hidden="true">↗</span>`;
    button.addEventListener('click', () => navigateTo(button.dataset.target));
    list.appendChild(button);
  });
  searchResults.appendChild(list);
}

function navigateTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({behavior: 'smooth', block: 'start'});
  window.history.replaceState(null, '', `#${id}`);
  if (target.matches('h2,h3')) {
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  }
  const navLink = document.querySelector(`[data-target="${id}"]`);
  navLink?.classList.add('just-visited');
  window.setTimeout(() => navLink?.classList.remove('just-visited'), 900);
}

function applyTheme(theme, persist = true) {
  root.dataset.theme = theme;
  if (persist) localStorage.setItem('zatics-theme', theme);
  const dark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#000000' : '#ffffff');
}

function setupObservers() {
  const headings = [...document.querySelectorAll('.policy-section')];
  const links = [...document.querySelectorAll('.toc a')];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.classList.toggle('active', link.dataset.target === entry.target.id));
    });
  }, {rootMargin: '-16% 0px -72% 0px', threshold: 0});
  headings.forEach((heading) => observer.observe(heading));
}

function setupKeyboard() {
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); searchInput.focus(); searchInput.select();
    }
  });
  searchInput.addEventListener('keydown', (event) => {
    const results = [...document.querySelectorAll('.search-result')];
    if (event.key === 'ArrowDown' && results.length) { event.preventDefault(); results[0].focus(); }
  });
  searchResults.addEventListener('keydown', (event) => {
    const results = [...document.querySelectorAll('.search-result')];
    const current = results.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && current >= 0) { event.preventDefault(); results[Math.min(results.length - 1, current + 1)].focus(); }
    if (event.key === 'ArrowUp' && current >= 0) { event.preventDefault(); current === 0 ? searchInput.focus() : results[current - 1].focus(); }
    if (event.key === 'Escape') searchInput.focus();
  });
}

searchInput.addEventListener('input', () => showSearchResults(searchInput.value));
clearSearch.addEventListener('click', () => { searchInput.value = ''; showSearchResults(''); searchInput.focus(); });
themeToggle.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
window.addEventListener('hashchange', () => { const id = window.location.hash.slice(1); if (id) navigateTo(id); });

document.addEventListener('click', (event) => {
  const link = event.target.closest('.toc a');
  if (link) { event.preventDefault(); navigateTo(link.dataset.target); }
});

renderTOC();
renderPolicy();
applyTheme(root.dataset.theme, false);
setupObservers();
setupKeyboard();
const initialHash = window.location.hash.slice(1);
if (initialHash) window.setTimeout(() => navigateTo(initialHash), 80);
