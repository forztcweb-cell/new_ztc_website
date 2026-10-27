/* Zatics Intelligence — Solutions Interactive Controller */
(() => {
  const data = window.__SOLUTIONS_DATA__ || { solutions: [], essaySections: [] };
  const solutions = data.solutions || [];

  const archStages = [
    {
      id: '01',
      name: 'Understand',
      subtitle: 'Contextualise',
      desc: 'Ingests organizational knowledge, historical activity, operating procedures, and current enterprise objectives to ground every decision.',
      caps: ['Historical activity analysis', 'Knowledge base grounding', 'Operating constraint parsing', 'Multi-source data ingestion'],
      logs: [
        'INITIALIZE_CONTEXT: Connecting enterprise knowledge graph...',
        'PARSING_SOP: Loading certified standard operating procedures (v4.2)',
        'OBJECTIVE_ALIGNMENT: Verification complete. Confidence score: 0.994'
      ]
    },
    {
      id: '02',
      name: 'Reason',
      subtitle: 'Analyse & plan',
      desc: 'Synthesizes incoming events against objectives, evaluates trade-offs, and decomposes complex operations into verified, step-by-step action plans.',
      caps: ['Multi-agent task decomposition', 'Deterministic constraint checks', 'Risk boundary assessment', 'Dynamic path optimization'],
      logs: [
        'DECOMPOSE_TASK: Splitting operational trigger into 4 discrete actions',
        'CONSTRAINT_CHECK: Verifying SLA limits and priority rules',
        'PLAN_READY: Action sequence generated with fallback recovery branches'
      ]
    },
    {
      id: '03',
      name: 'Decide',
      subtitle: 'Evaluate & govern',
      desc: 'Evaluates planned actions against established authorization rules, organizational policies, and financial authority thresholds before dispatch.',
      caps: ['Policy compliance verification', 'Escalation trigger identification', 'Authority threshold verification', 'Traceable rationale logging'],
      logs: [
        'GOVERNANCE_GATE: Checking delegation thresholds against policy',
        'THRESHOLD_EVAL: Action within pre-authorized operational limit',
        'AUDIT_SIGNATURE: Hash generated and logged to immutable audit trail'
      ]
    },
    {
      id: '04',
      name: 'Coordinate',
      subtitle: 'Delegate & orchestrate',
      desc: 'Assigns specific sub-tasks to specialized domain agents (sales, finance, logistics, customer support, compliance) with defined scopes of work.',
      caps: ['Specialized agent dispatch', 'Cross-departmental handoffs', 'State synchronization', 'Deadlock prevention'],
      logs: [
        'ORCHESTRATOR: Dispatching task #4029 to LogisticsAgent & FinanceAgent',
        'HANDOFF_MONITOR: State synchronization confirmed across systems',
        'COLLABORATION_OK: Agent communication verified with zero latency'
      ]
    },
    {
      id: '05',
      name: 'Execute',
      subtitle: 'Act & verify',
      desc: 'Executes authorized actions directly through integrated APIs, databases, communications, and tools, then verifies completion and logs results.',
      caps: ['API & database transactions', 'External system updates', 'Real-time audit logging', 'Rollback on failure'],
      logs: [
        'DISPATCH_API: Invoking verified CRM webhook and inventory system',
        'TRANSACTION_COMMITTED: 2 records updated, 1 notification dispatched',
        'EXECUTION_VERIFIED: All steps completed within 214ms SLA'
      ]
    }
  ];

  // DOM Elements
  const searchInput = document.querySelector('#sol-search-input');
  const searchClear = document.querySelector('#sol-search-clear');
  const resultsBadge = document.querySelector('#sol-results-badge');
  const chipsContainer = document.querySelector('#sol-filter-chips');
  const gridContainer = document.querySelector('#sol-grid');
  const emptyState = document.querySelector('#sol-empty-state');
  const emptyResetBtn = document.querySelector('#sol-empty-reset');

  // Modal Elements
  const modalBackdrop = document.querySelector('#sol-modal-backdrop');
  const modalCloseBtn = document.querySelector('#sol-modal-close');
  const modalContent = document.querySelector('#sol-modal-content');

  // Architecture Elements
  const archNodes = document.querySelectorAll('.sol-arch-node');
  const archTitle = document.querySelector('#sol-arch-title');
  const archDesc = document.querySelector('#sol-arch-desc');
  const archCaps = document.querySelector('#sol-arch-caps');
  const archLogs = document.querySelector('#sol-arch-logs');

  let currentCategory = 'all';
  let searchQuery = '';

  // Filter and Search Logic
  function filterSolutions() {
    const q = searchQuery.toLowerCase().trim();
    let matchCount = 0;

    const cards = document.querySelectorAll('.sol-card');
    cards.forEach(card => {
      const id = parseInt(card.dataset.id, 10);
      const sol = solutions.find(s => s.id === id);
      if (!sol) return;

      const categoryMatch = currentCategory === 'all' || sol.group === currentCategory;
      
      const searchContent = [
        sol.name,
        sol.subtitle,
        sol.category,
        sol.tags.join(' '),
        sol.intro.join(' '),
        sol.capabilities.join(' '),
        sol.result.join(' ')
      ].join(' ').toLowerCase();

      const queryMatch = !q || searchContent.includes(q);

      if (categoryMatch && queryMatch) {
        card.style.display = '';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (resultsBadge) {
      resultsBadge.innerHTML = `Showing <strong>${matchCount}</strong> of ${solutions.length} systems`;
    }

    if (emptyState) {
      emptyState.hidden = matchCount > 0;
    }
  }

  // Search input events
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchClear) searchClear.hidden = !searchQuery;
      filterSolutions();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      searchClear.hidden = true;
      filterSolutions();
      if (searchInput) searchInput.focus();
    });
  }

  if (emptyResetBtn) {
    emptyResetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      if (searchClear) searchClear.hidden = true;
      currentCategory = 'all';
      if (chipsContainer) {
        chipsContainer.querySelectorAll('.sol-filter-chip').forEach(c => {
          c.classList.toggle('is-active', c.dataset.group === 'all');
        });
      }
      filterSolutions();
    });
  }

  // Filter chip clicks
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.sol-filter-chip');
      if (!chip) return;
      chipsContainer.querySelectorAll('.sol-filter-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      currentCategory = chip.dataset.group || 'all';
      filterSolutions();
    });
  }

  // Solution Modal Inspector
  function openSolutionModal(sol) {
    if (!modalBackdrop || !modalContent) return;

    const capabilitiesHtml = sol.capabilities.length > 0
      ? `
        <h4 class="sol-modal-caps-title">Operational Capabilities (${sol.capabilities.length})</h4>
        <div class="sol-modal-caps-list">
          ${sol.capabilities.map(cap => `
            <div class="sol-modal-caps-item">
              <span>&#x2713;</span>
              <p>${cap}</p>
            </div>
          `).join('')}
        </div>
      `
      : '';

    const scenarioHtml = sol.scenario.length > 0
      ? `
        <div class="sol-modal-scenario">
          <p class="eyebrow" style="color:var(--accent);margin-bottom:12px;">OPERATIONAL SCENARIO WALKTHROUGH</p>
          ${sol.scenario.map(s => `<p style="margin-bottom:10px;">${s.replace(/###\s*/, '<strong>').replace(/$/, '</strong>')}</p>`).join('')}
        </div>
      `
      : '';

    const resultHtml = sol.result.length > 0
      ? `
        <div class="sol-modal-result">
          <strong>THE OPERATIONAL RESULT</strong>
          <p>${sol.result.join(' ')}</p>
        </div>
      `
      : '';

    modalContent.innerHTML = `
      <span class="sol-modal-eyebrow">SYSTEM ${sol.number} · ${sol.category.toUpperCase()}</span>
      <h2>${sol.name}</h2>
      <p class="sol-modal-sub">${sol.subtitle}</p>
      
      <div class="sol-modal-intro">
        ${sol.intro.map(p => `<p style="margin-bottom:12px;">${p}</p>`).join('')}
      </div>

      ${capabilitiesHtml}
      ${scenarioHtml}
      ${resultHtml}

      <div class="sol-modal-actions">
        <button type="button" class="sol-modal-share" data-slug="${sol.slug}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px;" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Copy Direct Link
        </button>
        <button type="button" class="button button-primary sol-modal-book" data-solution="${sol.name}">
          Consult on ${sol.name}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px;" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>
        </button>
      </div>
    `;

    modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Update URL hash
    try {
      history.replaceState(null, '', `#${sol.slug}`);
    } catch (_) {}

    // Hook up copy link button
    const shareBtn = modalContent.querySelector('.sol-modal-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const url = `${window.location.origin}${window.location.pathname}#${sol.slug}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            shareBtn.textContent = 'Link copied to clipboard!';
            setTimeout(() => { shareBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px;" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy Direct Link'; }, 2500);
          });
        }
      });
    }

    // Hook up book consultation button
    const bookBtn = modalContent.querySelector('.sol-modal-book');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        closeSolutionModal();
        triggerContactModal(sol.name);
      });
    }
  }

  function closeSolutionModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    try {
      history.replaceState(null, '', window.location.pathname);
    } catch (_) {}
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSolutionModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeSolutionModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop?.classList.contains('is-open')) {
      closeSolutionModal();
    }
  });

  // Grid card clicks
  if (gridContainer) {
    gridContainer.addEventListener('click', (e) => {
      const inspectBtn = e.target.closest('.sol-card-inspect');
      const bookBtn = e.target.closest('.sol-card-book');
      const card = e.target.closest('.sol-card');

      if (bookBtn) {
        e.stopPropagation();
        const solName = bookBtn.dataset.solution;
        triggerContactModal(solName);
        return;
      }

      if (card) {
        const id = parseInt(card.dataset.id, 10);
        const sol = solutions.find(s => s.id === id);
        if (sol) openSolutionModal(sol);
      }
    });
  }

  // Trigger contact modal with pre-selected solution
  function triggerContactModal(solutionName) {
    const dialog = document.querySelector('#contact-dialog');
    if (!dialog) return;

    const select = dialog.querySelector('#contact-interest');
    if (select && solutionName) {
      let optionExists = false;
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text.includes(solutionName)) {
          select.selectedIndex = i;
          optionExists = true;
          break;
        }
      }
      if (!optionExists) {
        const newOpt = new Option(solutionName, solutionName, true, true);
        select.add(newOpt, 1);
        select.selectedIndex = 1;
      }
    }

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  // Architecture Visualizer Interactive Nodes
  function selectArchNode(index) {
    const stage = archStages[index];
    if (!stage) return;

    archNodes.forEach((node, i) => {
      node.classList.toggle('is-active', i === index);
    });

    if (archTitle) archTitle.innerHTML = `<span>STAGE ${stage.id} //</span> ${stage.name} <small style="color:#8fa080;font-size:16px;font-style:italic;">(${stage.subtitle})</small>`;
    if (archDesc) archDesc.textContent = stage.desc;

    if (archCaps) {
      archCaps.innerHTML = stage.caps.map(c => `
        <div class="sol-arch-caps-item">
          <span>&#x2713;</span>
          ${c}
        </div>
      `).join('');
    }

    if (archLogs) {
      archLogs.innerHTML = `
        <div class="sol-arch-terminal-top">
          <span>PIPELINE_MONITOR // STAGE_${stage.id}_${stage.name.toUpperCase()}</span>
          <span>STATUS: ONLINE</span>
        </div>
        ${stage.logs.map(log => `
          <div class="sol-arch-terminal-line">
            <span class="sol-arch-terminal-prompt">&gt;</span>${log}
          </div>
        `).join('')}
      `;
    }
  }

  archNodes.forEach((node, idx) => {
    node.addEventListener('click', () => selectArchNode(idx));
  });

  // Check initial hash for deep linking
  function checkHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (!hash) return;

    const sol = solutions.find(s => s.slug === hash || `solution-${s.id}` === hash);
    if (sol) {
      setTimeout(() => {
        openSolutionModal(sol);
      }, 100);
    }
  }

  // Header scroll detection for subnav
  const header = document.querySelector('#site-header');
  const subnav = document.querySelector('#sol-subnav');

  window.addEventListener('scroll', () => {
    const isScrolled = window.scrollY > 40;
    if (header) header.classList.toggle('is-scrolled', isScrolled);
  }, { passive: true });

  // Mobile menu toggle
  const menuToggle = document.querySelector('#menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const open = !mobileNav.hidden;
      mobileNav.hidden = open;
      menuToggle.setAttribute('aria-expanded', String(!open));
    });
  }

  // Contact form submission and calendar slots
  const contactForm = document.querySelector('#contact-form');
  const contactDialog = document.querySelector('#contact-dialog');
  const dialogClose = document.querySelector('#dialog-close');
  const formView = document.querySelector('#contact-form-view');
  const successView = document.querySelector('#contact-success');
  const successClose = document.querySelector('#success-close');
  const formError = document.querySelector('#form-error');

  if (dialogClose && contactDialog) {
    dialogClose.addEventListener('click', () => contactDialog.close());
  }
  if (successClose && contactDialog) {
    successClose.addEventListener('click', () => contactDialog.close());
  }

  // Slot pill click handler
  document.querySelectorAll('.slot-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.slot-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const timeInput = document.querySelector('#contact-time');
      if (timeInput) timeInput.value = pill.dataset.time || '';
    });
  });

  // Connect all elements with data-contact
  document.querySelectorAll('[data-contact]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (contactDialog) {
        if (typeof contactDialog.showModal === 'function') contactDialog.showModal();
        else contactDialog.setAttribute('open', '');
      }
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formError) formError.hidden = true;

      const submitBtn = contactForm.querySelector('.form-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Transmitting brief...';
      }

      const fd = new FormData(contactForm);
      const payload = Object.fromEntries(fd.entries());

      try {
        const res = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Submission failed');

        if (formView) formView.hidden = true;
        if (successView) successView.hidden = false;

        const refSpan = document.querySelector('#enquiry-reference');
        if (refSpan && data.reference) {
          refSpan.textContent = `Ref: ZI-${data.reference}`;
        }
      } catch (err) {
        if (formError) {
          formError.textContent = err.message || 'Something went wrong. Please check your inputs.';
          formError.hidden = false;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send your enquiry';
        }
      }
    });
  }

  // Initialize
  checkHash();
})();
