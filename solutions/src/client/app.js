(() => {
  const index = Array.isArray(window.__ZATICS_INDEX__) ? window.__ZATICS_INDEX__ : [];
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setTheme = (theme) => {
    const next = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('zatics-theme', next); } catch (_) {}
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      button.setAttribute('aria-pressed', String(next === 'dark'));
    });
    document.querySelectorAll('[data-logo-light]').forEach((img) => { img.style.display = next === 'light' ? '' : 'none'; });
    document.querySelectorAll('[data-logo-dark]').forEach((img) => { img.style.display = next === 'dark' ? '' : 'none'; });
  };

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  });
  setTheme(root.dataset.theme || 'dark');

  const menuToggle = document.querySelector('[data-menu-toggle]');
  const primaryNav = document.querySelector('#primary-nav');
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const open = primaryNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      primaryNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    }));
  }

  const overlay = document.querySelector('[data-search-overlay]');
  const globalInput = document.querySelector('#global-search');
  const resultBox = document.querySelector('[data-search-results]');
  const filterBox = document.querySelector('[data-search-filters]');
  let lastFocused = null;
  let activeOverlayCategory = '';

  const normalize = (value) => String(value || '').toLowerCase().trim();
  const getSearchText = (item) => normalize([item.title, item.summary, item.category, ...(item.tags || []), item.indexedText].join(' '));
  const matches = (item, query, category = '') => {
    const categoryMatch = !category || item.category === category;
    const queryMatch = !query || getSearchText(item).includes(normalize(query));
    return categoryMatch && queryMatch;
  };
  const relevance = (item, query) => {
    const q = normalize(query);
    if (!q) return 0;
    const title = normalize(item.title);
    const tags = normalize((item.tags || []).join(' '));
    return (title.includes(q) ? 8 : 0) + (tags.includes(q) ? 4 : 0) + (normalize(item.category).includes(q) ? 2 : 0) + (getSearchText(item).includes(q) ? 1 : 0);
  };
  const resultMarkup = (item) => `<a class="search-result" href="/publications/${item.slug}/"><div class="search-result-meta">${item.type} · ${item.date} · ${item.readingTime}</div><h3>${item.title}</h3><p>${item.summary}</p></a>`;

  const renderSearchResults = (query = '', category = '') => {
    if (!resultBox) return;
    let results = index.filter((item) => matches(item, query, category));
    results.sort((a, b) => relevance(b, query) - relevance(a, query));
    if (!query && !category) {
      resultBox.innerHTML = '<p class="search-empty">Start typing to search the publication record.</p>';
    } else if (!results.length) {
      resultBox.innerHTML = '<p class="search-empty">No publications match that search. Try a broader term or clear the filter.</p>';
    } else {
      resultBox.innerHTML = results.map(resultMarkup).join('');
    }
  };

  const categories = [...new Set(index.map((item) => item.category).filter(Boolean))];
  if (filterBox) {
    filterBox.innerHTML = categories.map((category) => `<button type="button" class="filter-chip" data-overlay-category="${category}">${category}</button>`).join('');
    filterBox.addEventListener('click', (event) => {
      const button = event.target.closest('[data-overlay-category]');
      if (!button) return;
      filterBox.querySelectorAll('.filter-chip').forEach((chip) => chip.classList.remove('is-selected'));
      button.classList.add('is-selected');
      activeOverlayCategory = button.dataset.overlayCategory || '';
      renderSearchResults(globalInput?.value || '', activeOverlayCategory);
    });
  }

  const openSearch = (query = '') => {
    if (!overlay) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    body.classList.add('search-is-open');
    if (globalInput) {
      globalInput.value = query;
      window.setTimeout(() => globalInput.focus(), reduceMotion ? 0 : 30);
    }
    activeOverlayCategory = '';
    if (filterBox) filterBox.querySelectorAll('.filter-chip').forEach((chip) => chip.classList.remove('is-selected'));
    renderSearchResults(query, activeOverlayCategory);
  };
  const closeSearch = () => {
    if (!overlay) return;
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    body.classList.remove('search-is-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };
  document.querySelectorAll('[data-search-open]').forEach((button) => button.addEventListener('click', () => openSearch()));
  document.querySelectorAll('[data-search-close]').forEach((button) => button.addEventListener('click', closeSearch));
  globalInput?.addEventListener('input', () => renderSearchResults(globalInput.value, activeOverlayCategory));
  document.querySelector('[data-search-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = globalInput?.value.trim();
    if (query) window.location.href = `/publications/?q=${encodeURIComponent(query)}`;
  });
  resultBox?.addEventListener('click', closeSearch);

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing = target && (target.matches('input, textarea, select') || target.isContentEditable);
    if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      openSearch();
    }
    if (event.key === 'Escape' && overlay && !overlay.hidden) closeSearch();
  });

  const libraryForm = document.querySelector('[data-library-form]');
  const libraryInput = document.querySelector('#library-query');
  const libraryResults = document.querySelector('[data-library-results]');
  const libraryEmpty = document.querySelector('[data-library-empty]');
  const libraryCategories = document.querySelector('[data-library-categories]');
  let activeCategory = new URLSearchParams(window.location.search).get('category') || '';
  let activeQuery = new URLSearchParams(window.location.search).get('q') || '';
  if (libraryInput) libraryInput.value = activeQuery;

  const renderLibrary = () => {
    if (!libraryResults) return;
    const results = index.filter((item) => matches(item, activeQuery, activeCategory));
    libraryResults.innerHTML = results.map((item) => `<article class="publication-card"><div class="publication-card-meta"><span>${item.type}</span><span>${item.date}</span><span>${item.readingTime}</span></div><h3><a href="/publications/${item.slug}/">${item.title}</a></h3><p>${item.summary}</p><div class="card-footer"><span class="tag">${item.category}</span><a class="text-link" href="/publications/${item.slug}/">Read essay <span aria-hidden="true">↗</span></a></div></article>`).join('');
    if (libraryEmpty) libraryEmpty.hidden = results.length > 0;
    if (libraryCategories) libraryCategories.querySelectorAll('[data-category]').forEach((chip) => chip.classList.toggle('is-selected', chip.dataset.category === activeCategory));
  };
  const updateLibraryUrl = () => {
    const params = new URLSearchParams();
    if (activeQuery) params.set('q', activeQuery);
    if (activeCategory) params.set('category', activeCategory);
    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', next);
  };
  libraryInput?.addEventListener('input', () => { activeQuery = libraryInput.value.trim(); updateLibraryUrl(); renderLibrary(); });
  libraryForm?.addEventListener('submit', (event) => { event.preventDefault(); activeQuery = libraryInput.value.trim(); updateLibraryUrl(); renderLibrary(); });
  document.querySelector('[data-library-clear]')?.addEventListener('click', () => { activeQuery = ''; if (libraryInput) libraryInput.value = ''; updateLibraryUrl(); renderLibrary(); libraryInput?.focus(); });
  document.querySelector('[data-library-reset]')?.addEventListener('click', () => { activeQuery = ''; activeCategory = ''; if (libraryInput) libraryInput.value = ''; updateLibraryUrl(); renderLibrary(); });
  libraryCategories?.addEventListener('click', (event) => { const chip = event.target.closest('[data-category]'); if (!chip) return; activeCategory = chip.dataset.category || ''; updateLibraryUrl(); renderLibrary(); });
  renderLibrary();

  document.querySelector('[data-share]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const original = button.innerHTML;
    try {
      await navigator.clipboard.writeText(window.location.href);
      button.innerHTML = 'Link copied <span aria-hidden="true">✓</span>';
    } catch (_) {
      button.innerHTML = 'Copy unavailable';
    }
    window.setTimeout(() => { button.innerHTML = original; }, 1800);
  });
})();
