(() => {
  const searchForm = document.querySelector('[data-search-form]');
  const searchInput = document.querySelector('#document-search');
  const searchResults = document.querySelector('#search-results');
  const clearSearch = document.querySelector('[data-clear-search]');
  const searchable = [...document.querySelectorAll('[data-searchable]')];
  const tocLinks = [...document.querySelectorAll('.toc-list a')];
  const mobileTocToggle = document.querySelector('.toc-mobile-toggle');
  const tocInner = document.querySelector('.toc-inner');
  let currentResults = [];
  let activeResult = -1;

  function plainText(element) {
    return (element.dataset.searchText || element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightText(text, query) {
    const fragment = document.createDocumentFragment();
    if (!query) { fragment.append(document.createTextNode(text)); return fragment; }
    const pattern = new RegExp(`(${escapeRegExp(query)})`, 'ig');
    let last = 0;
    text.replace(pattern, (match, _capture, offset) => {
      fragment.append(document.createTextNode(text.slice(last, offset)));
      const mark = document.createElement('mark');
      mark.textContent = match;
      fragment.append(mark);
      last = offset + match.length;
      return match;
    });
    fragment.append(document.createTextNode(text.slice(last)));
    return fragment;
  }

  function getTarget(element) {
    if (element.id) return element.id;
    const section = element.closest('.legal-section');
    return section?.id || 'legal-document';
  }

  function makeExcerpt(text, query) {
    const lower = text.toLowerCase();
    const index = lower.indexOf(query.toLowerCase());
    if (index < 0) return text.slice(0, 150) + (text.length > 150 ? '…' : '');
    const start = Math.max(0, index - 60);
    const end = Math.min(text.length, index + query.length + 95);
    return (start ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  }

  function closeResults() {
    searchResults.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    activeResult = -1;
  }

  function renderResults(query) {
    searchResults.replaceChildren();
    currentResults = [];
    activeResult = -1;
    if (!query.trim()) { closeResults(); return; }
    const normalized = query.trim().toLowerCase();
    currentResults = searchable.filter((element) => plainText(element).toLowerCase().includes(normalized)).slice(0, 12);
    if (!currentResults.length) {
      const empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.innerHTML = '<strong>No matching clauses</strong><span>Try a different term, section number, or definition.</span>';
      searchResults.append(empty);
    } else {
      currentResults.forEach((element, index) => {
        const target = getTarget(element);
        const item = document.createElement('a');
        item.className = 'search-result';
        item.href = `#${target}`;
        item.setAttribute('role', 'option');
        item.dataset.index = String(index);
        const label = element.dataset.searchText || plainText(element);
        const number = element.dataset.searchText?.match(/^\d+(?:\.\d+){0,2}/)?.[0] || '';
        const heading = number ? `${number} · ${label.slice(number.length).trim()}` : label;
        const title = document.createElement('strong');
        title.append(highlightText(heading.slice(0, 100), query));
        const excerpt = document.createElement('span');
        excerpt.append(highlightText(makeExcerpt(plainText(element), query), query));
        item.append(title, excerpt);
        item.addEventListener('click', (event) => {
          event.preventDefault();
          document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', `#${target}`);
          closeResults();
          searchInput.blur();
        });
        searchResults.append(item);
      });
    }
    searchResults.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
  }

  searchInput?.addEventListener('input', () => {
    clearSearch.hidden = !searchInput.value;
    renderResults(searchInput.value);
  });
  clearSearch?.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.hidden = true;
    renderResults('');
    searchInput.focus();
  });
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeResults(); return; }
    if (!currentResults.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      activeResult = event.key === 'ArrowDown' ? (activeResult + 1) % currentResults.length : (activeResult - 1 + currentResults.length) % currentResults.length;
      document.querySelectorAll('.search-result').forEach((result, index) => result.classList.toggle('is-active', index === activeResult));
    }
    if (event.key === 'Enter' && activeResult >= 0) {
      event.preventDefault();
      document.querySelector(`.search-result[data-index="${activeResult}"]`)?.click();
    }
  });
  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (currentResults[0]) {
      const target = getTarget(currentResults[0]);
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${target}`);
      closeResults();
    }
  });
  document.addEventListener('click', (event) => {
    if (!searchForm?.contains(event.target)) closeResults();
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); searchInput?.focus(); searchInput?.select();
    }
  });

  // Keep the current section visible in the table of contents as the reader moves.
  const headings = [...document.querySelectorAll('.legal-section > .section-heading')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((link) => link.classList.toggle('is-current', link.getAttribute('href') === `#${entry.target.closest('.legal-section')?.id}`));
      });
    }, { rootMargin: '-16% 0px -72% 0px', threshold: 0 });
    headings.forEach((heading) => observer.observe(heading));
  }

  mobileTocToggle?.addEventListener('click', () => {
    const isOpen = tocInner.classList.toggle('is-open');
    mobileTocToggle.setAttribute('aria-expanded', String(isOpen));
    mobileTocToggle.textContent = isOpen ? 'Close' : 'Open';
  });
  tocLinks.forEach((link) => link.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 860px)').matches) {
      tocInner.classList.remove('is-open');
      mobileTocToggle?.setAttribute('aria-expanded', 'false');
      if (mobileTocToggle) mobileTocToggle.textContent = 'Open';
    }
  }));

  // Give hash navigation a comfortable offset below the fixed header.
  if (location.hash) {
    requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ block: 'start' }));
  }
})();
