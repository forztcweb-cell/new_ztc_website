import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// Load solutions data
const dataPath = path.join(root, 'public', 'static', 'solutions-data.js');
let dataContent = fs.readFileSync(dataPath, 'utf8');
const jsonMatch = dataContent.match(/window\.__SOLUTIONS_DATA__\s*=\s*(\{[\s\S]*\});/);
if (!jsonMatch) {
  throw new Error('Failed to parse window.__SOLUTIONS_DATA__');
}
const solutionsData = JSON.parse(jsonMatch[1]);
const { solutions, essaySections } = solutionsData;

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHeader(activeNav = 'solutions') {
  return `
<header class="site-header is-scrolled" id="site-header" style="position:sticky;top:0;">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="Zatics Intelligence home">
      <img class="brand-mark" src="/static/logo.png" alt="" aria-hidden="true"/>
      <span>ZATICS<span class="brand-subtitle">INTELLIGENCE</span></span>
    </a>
    <nav class="desktop-nav" aria-label="Main navigation">
      <a href="/#what-we-build">What we build</a>
      <a href="/solutions/" class="${activeNav === 'solutions' ? 'active' : ''}" style="${activeNav === 'solutions' ? 'color:var(--accent);font-weight:600;' : ''}">Solutions</a>
      <a href="/#how-it-works">How it works</a>
      <a href="/#technology">Technology</a>
      <a href="/#approach">Our approach</a>
    </nav>
    <button class="button button-small button-outline header-cta" data-contact>Let's talk
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>
    </button>
    <button class="menu-toggle" id="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav">
      <span></span><span></span>
    </button>
  </div>
  <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden>
    <a href="/#what-we-build">What we build</a>
    <a href="/solutions/" style="color:var(--accent);font-weight:600;">Solutions</a>
    <a href="/#how-it-works">How it works</a>
    <a href="/#technology">Technology</a>
    <a href="/#capabilities">Capabilities</a>
    <a href="/#approach">Our approach</a>
    <button class="button button-primary" data-contact>Let's build something
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>
    </button>
  </nav>
</header>
`;
}

function renderContactDialog() {
  const optionsHtml = solutions.map(s => `<option value="${esc(s.name)}">${esc(s.name)} (${esc(s.category)})</option>`).join('\n          ');
  return `
<dialog id="contact-dialog" class="contact-dialog" aria-labelledby="contact-title">
  <button class="dialog-close" id="dialog-close" aria-label="Close enquiry form">&#xD7;</button>
  <div id="contact-form-view">
    <p class="eyebrow"><span class="status-dot"></span> LET'S BUILD WHAT'S NEXT</p>
    <h2 id="contact-title">What could intelligence<br/><span class="muted">do for your organisation?</span></h2>
    <p class="dialog-intro">Tell us about your challenge. Explore any of our 19 industry systems.</p>
    <form id="contact-form">
      <div class="form-row">
        <label>Your name<input name="name" autocomplete="name" maxlength="100" placeholder="Alex Morgan" required/></label>
        <label>Work email<input name="email" type="email" autocomplete="email" maxlength="254" placeholder="alex@company.com" required/></label>
      </div>
      <label>Organisation<input name="organisation" autocomplete="organization" maxlength="150" placeholder="Your organisation" required/></label>
      <label>Area of interest
        <select name="interest" id="contact-interest">
          <option value="General Exploration">Let's explore together</option>
          <optgroup label="Core Intelligence Systems">
            <option>Autonomous AI Agents</option>
            <option>Multi-Agent Systems</option>
            <option>Enterprise Intelligence</option>
            <option>Voice AI & Automation</option>
          </optgroup>
          <optgroup label="19 Industry Solutions">
            ${optionsHtml}
          </optgroup>
        </select>
      </label>

      <!-- PREFERRED CONSULTATION SCHEDULE (TIME & DATE) -->
      <div class="schedule-section">
        <div class="schedule-section-header">
          <span class="schedule-section-label">
            <span class="status-dot"></span> Preferred Consultation Schedule
          </span>
          <span class="schedule-section-badge">Optional</span>
        </div>
        <div class="form-row">
          <label>Preferred date
            <input type="date" name="preferred_date" id="contact-date" aria-label="Preferred consultation date" />
          </label>
          <label>Preferred time
            <input type="time" name="preferred_time" id="contact-time" step="900" aria-label="Preferred consultation time" />
          </label>
        </div>
        <div class="schedule-slots" role="group" aria-label="Quick time slots">
          <span class="schedule-slots-title">Quick slots:</span>
          <button type="button" class="slot-pill" data-time="10:00">10:00 AM</button>
          <button type="button" class="slot-pill" data-time="14:00">02:00 PM</button>
          <button type="button" class="slot-pill" data-time="16:30">04:30 PM</button>
          <button type="button" class="slot-pill" data-time="18:00">06:00 PM</button>
        </div>
      </div>

      <label>What would you like to make possible?
        <textarea name="message" rows="3" minlength="10" maxlength="3000" placeholder="A workflow to rethink. A challenge to solve. An idea to explore." required></textarea>
      </label>
      <label class="honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"/></label>
      <p class="form-privacy">Your details are stored securely to handle your enquiry. By submitting, you agree to our <a href="/privacy-policy/index.html" target="_blank" rel="noopener" style="color:var(--accent);text-underline-offset:3px;">Privacy Policy</a>.</p>
      <p class="form-error" id="form-error" role="alert" hidden></p>
      <button type="submit" class="button button-primary form-submit">Send your enquiry
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>
      </button>
    </form>
  </div>
  <div id="contact-success" class="contact-success" hidden>
    <div class="success-symbol">&#x2713;</div>
    <p class="eyebrow">ENQUIRY RECEIVED</p>
    <h2>A meaningful<br/><span class="accent">first step.</span></h2>
    <p>Your project brief has been saved. Thank you for sharing what you're looking to build with Zatics Intelligence.</p>
    <div id="enquiry-schedule-summary" class="schedule-confirmation" hidden></div>
    <span id="enquiry-reference" class="enquiry-reference"></span>
    <button class="button button-outline" id="success-close">Back to exploring
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
    </button>
  </div>
</dialog>
`;
}

function renderFooter() {
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <a class="brand" href="/" aria-label="Zatics Intelligence home">
        <img class="brand-mark" src="/static/logo.png" alt="" aria-hidden="true"/>
        <span>ZATICS<span class="brand-subtitle">INTELLIGENCE</span></span>
      </a>
      <p>Autonomous systems.<br/>Real-world intelligence.</p>
      <nav aria-label="Footer navigation">
        <a href="/solutions/">Solutions</a>
        <a href="/#what-we-build">What we build</a>
        <a href="/#technology">Technology</a>
        <a href="/#approach">Our approach</a>
        <a href="/privacy-policy/index.html">Privacy Policy</a>
        <button data-contact>Get in touch
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>
        </button>
      </nav>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Zatics Intelligence. All rights reserved.</span>
      <span class="footer-signature"><span class="status-dot"></span> BUILT IN INDIA. DESIGNED FOR GLOBAL OPERATIONS.</span>
      <a href="#" class="back-to-top" style="color:#94a680;text-decoration:none;">Back to top &#x2191;</a>
    </div>
  </div>
</footer>
`;
}

// 1. Generate solutions/index.html
function generateSolutionsHome() {
  const solutionCardsHtml = solutions.map(s => {
    const capsPreview = s.capabilities.slice(0, 3).map(cap => `
      <div class="sol-card-cap-item">
        <span class="sol-card-cap-bullet">&#x2022;</span>
        <span>${esc(cap)}</span>
      </div>
    `).join('');

    const resultText = s.result.length > 0 ? s.result[0] : 'Autonomous coordination with human oversight.';

    return `
    <article class="sol-card" data-id="${s.id}" id="${esc(s.slug)}">
      <div class="sol-card-top">
        <span class="sol-card-num">SYSTEM / ${s.number}</span>
        <span class="sol-card-category">${esc(s.category)}</span>
      </div>
      <h3>${esc(s.name)}</h3>
      <p class="sol-card-subtitle">${esc(s.subtitle)}</p>
      <p class="sol-card-desc">${esc(s.intro[0] || '')}</p>
      
      ${capsPreview ? `<div class="sol-card-caps">${capsPreview}</div>` : ''}

      <div class="sol-card-result">
        <strong>The Result</strong>
        <span>${esc(resultText)}</span>
      </div>

      <div class="sol-card-actions">
        <button type="button" class="sol-card-inspect">
          Inspect System Details <span>&#x2192;</span>
        </button>
        <button type="button" class="sol-card-book" data-solution="${esc(s.name)}">
          Consult
        </button>
      </div>
    </article>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="theme-color" content="#090b0a"/>
  <title>Solutions — Zatics Intelligence | 19 Autonomous Industry Systems</title>
  <meta name="description" content="Explore 19 purpose-built autonomous intelligence systems engineered by Zatics Intelligence across healthcare, logistics, physical infrastructure, finance, and enterprise operations."/>
  <meta property="og:title" content="Solutions — Zatics Intelligence | 19 Autonomous Industry Systems"/>
  <meta property="og:description" content="From healthcare to logistics, automotive to manufacturing: 19 purpose-built operational intelligence systems engineered to think, coordinate, and execute."/>
  <meta property="og:type" content="website"/>
  <meta property="og:image" content="/static/og-publication.svg"/>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=IBM+Plex+Mono:wght@400;450;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/static/style.css"/>
  <link rel="stylesheet" href="/static/solutions.css"/>
</head>
<body>
<a class="skip-link" href="#main-content">Skip to content</a>

${renderHeader('solutions')}

<!-- SUB-NAV / QUICK JUMP -->
<div class="sol-subnav" id="sol-subnav">
  <div class="container sol-subnav-inner">
    <div class="sol-subnav-links">
      <a href="#overview" class="is-active">Overview</a>
      <a href="#solutions-catalog">19 Industry Systems</a>
      <a href="#architecture">Architecture</a>
      <a href="#principles">Core Principles</a>
      <a href="#publication">Featured Essay</a>
      <a href="#focus-routes">Focus Views &#x25BE;</a>
    </div>
    <div class="sol-subnav-stats">
      <span>Active Systems: <strong>19</strong></span>
      <span>·</span>
      <span>Autonomous Stages: <strong>5</strong></span>
    </div>
  </div>
</div>

<main id="main-content">

  <!-- HERO -->
  <section class="sol-hero" id="overview">
    <div class="sol-hero-grid" aria-hidden="true"></div>
    <div class="container sol-hero-inner">
      <p class="eyebrow sol-hero-eyebrow">
        <span class="status-dot"></span> ZI / OPERATIONAL AUTONOMY ACROSS 19 INDUSTRY SYSTEMS
      </p>
      <h1>Intelligence.<br/>Engineered for <span class="accent">every industry.</span></h1>
      <p class="sol-hero-intro">
        From hospitals and financial institutions to logistics networks, automotive businesses, manufacturing facilities, and public infrastructure — we develop the intelligence layer that makes complex operations coordinated, responsive, and accountable.
      </p>

      <div class="sol-hero-metrics">
        <div class="sol-metric-pill"><span class="dot"></span> 19 Industry Systems</div>
        <div class="sol-metric-pill"><span class="dot"></span> 5-Stage Autonomous Execution</div>
        <div class="sol-metric-pill"><span class="dot"></span> 100% Traceable & Governed</div>
        <div class="sol-metric-pill"><span class="dot"></span> Built in India · Global Operations</div>
      </div>
    </div>
  </section>

  <!-- SOLUTIONS CATALOG (SEARCH, FILTERS & 19 CARDS) -->
  <section class="sol-grid-section" id="solutions-catalog">
    <div class="container">

      <!-- TOOLBAR -->
      <div class="sol-toolbar">
        <div class="sol-search-row">
          <div class="sol-search-input-wrap">
            <span class="sol-search-icon">&#x2315;</span>
            <input type="search" id="sol-search-input" class="sol-search-input" placeholder="Search by industry, capability (e.g. 'hospital', 'fleet', 'reconciliation', 'sensor')..." autocomplete="off"/>
            <button type="button" id="sol-search-clear" class="sol-search-clear" hidden aria-label="Clear search">&#x2715;</button>
          </div>
          <span class="sol-results-badge" id="sol-results-badge">Showing <strong>19</strong> of 19 systems</span>
        </div>

        <div class="sol-filter-chips" id="sol-filter-chips">
          <button type="button" class="sol-filter-chip is-active" data-group="all">All Systems (19)</button>
          <button type="button" class="sol-filter-chip" data-group="core">Enterprise Core</button>
          <button type="button" class="sol-filter-chip" data-group="health-public">Healthcare & Public</button>
          <button type="button" class="sol-filter-chip" data-group="logistics-physical">Logistics & Physical</button>
          <button type="button" class="sol-filter-chip" data-group="finance-legal">Finance & Legal</button>
          <button type="button" class="sol-filter-chip" data-group="commercial-growth">Commercial & Growth</button>
        </div>
      </div>

      <!-- 19 CARDS GRID -->
      <div class="sol-grid" id="sol-grid">
        ${solutionCardsHtml}
      </div>

      <!-- EMPTY STATE -->
      <div class="sol-empty-state" id="sol-empty-state" hidden>
        <span class="status-dot"></span>
        <h3>No matching industry systems found</h3>
        <p>Try searching for a different keyword or reset the filter category.</p>
        <button type="button" class="button button-small button-outline" id="sol-empty-reset">Reset search filters</button>
      </div>

    </div>
  </section>

  <!-- 5-STAGE SYSTEM ARCHITECTURE SECTION -->
  <section class="sol-arch-section" id="architecture">
    <div class="container">
      <div class="sol-arch-header">
        <p class="eyebrow"><span class="status-dot"></span> SYSTEM ARCHITECTURE // THE EXECUTION LAYER</p>
        <h2>From Information.<br/><span class="muted">To Autonomous Action.</span></h2>
        <p>Production intelligence is not a single model. It is the coordinated architecture around the model: context, reasoning, decision governance, multi-agent orchestration, and verifiable execution.</p>
      </div>

      <div class="sol-arch-flow" role="tablist" aria-label="5 Architecture Stages">
        <button type="button" class="sol-arch-node is-active" role="tab" aria-selected="true" data-index="0">
          <div class="sol-arch-node-top"><span>STAGE 01</span><span>INPUT</span></div>
          <h4>Understand</h4>
          <small>Contextualise</small>
        </button>
        <button type="button" class="sol-arch-node" role="tab" aria-selected="false" data-index="1">
          <div class="sol-arch-node-top"><span>STAGE 02</span><span>SYNTHESIS</span></div>
          <h4>Reason</h4>
          <small>Analyse & plan</small>
        </button>
        <button type="button" class="sol-arch-node" role="tab" aria-selected="false" data-index="2">
          <div class="sol-arch-node-top"><span>STAGE 03</span><span>GOVERN</span></div>
          <h4>Decide</h4>
          <small>Evaluate</small>
        </button>
        <button type="button" class="sol-arch-node" role="tab" aria-selected="false" data-index="3">
          <div class="sol-arch-node-top"><span>STAGE 04</span><span>DISPATCH</span></div>
          <h4>Coordinate</h4>
          <small>Delegate</small>
        </button>
        <button type="button" class="sol-arch-node" role="tab" aria-selected="false" data-index="4">
          <div class="sol-arch-node-top"><span>STAGE 05</span><span>OUTPUT</span></div>
          <h4>Execute</h4>
          <small>Act & verify</small>
        </button>
      </div>

      <!-- ARCHITECTURE INSPECTOR CONSOLE -->
      <div class="sol-arch-inspector">
        <div class="sol-arch-info">
          <h3 id="sol-arch-title"><span>STAGE 01 //</span> Understand <small style="color:#8fa080;font-size:16px;font-style:italic;">(Contextualise)</small></h3>
          <p class="sol-arch-info-desc" id="sol-arch-desc">
            Ingests organizational knowledge, historical activity, operating procedures, and current enterprise objectives to ground every decision.
          </p>
          <div class="sol-arch-caps-list" id="sol-arch-caps">
            <div class="sol-arch-caps-item"><span>&#x2713;</span> Historical activity analysis</div>
            <div class="sol-arch-caps-item"><span>&#x2713;</span> Knowledge base grounding</div>
            <div class="sol-arch-caps-item"><span>&#x2713;</span> Operating constraint parsing</div>
            <div class="sol-arch-caps-item"><span>&#x2713;</span> Multi-source data ingestion</div>
          </div>
        </div>

        <div class="sol-arch-terminal" id="sol-arch-logs">
          <div class="sol-arch-terminal-top">
            <span>PIPELINE_MONITOR // STAGE_01_UNDERSTAND</span>
            <span>STATUS: ONLINE</span>
          </div>
          <div class="sol-arch-terminal-line"><span class="sol-arch-terminal-prompt">&gt;</span>INITIALIZE_CONTEXT: Connecting enterprise knowledge graph...</div>
          <div class="sol-arch-terminal-line"><span class="sol-arch-terminal-prompt">&gt;</span>PARSING_SOP: Loading certified standard operating procedures (v4.2)</div>
          <div class="sol-arch-terminal-line"><span class="sol-arch-terminal-prompt">&gt;</span>OBJECTIVE_ALIGNMENT: Verification complete. Confidence score: 0.994</div>
        </div>
      </div>

      <div class="sol-arch-footnote">
        <span><span class="status-dot"></span> Human oversight at every critical point</span>
        <span>Every decision grounded. <strong>Every action traceable.</strong></span>
      </div>
    </div>
  </section>

  <!-- 4 FOUNDATION PRINCIPLES -->
  <section class="sol-principles-section" id="principles">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow"><span class="section-number">03 /</span> FOUNDATION PRINCIPLES</p>
          <h2>The Shared Foundation<br/><span class="muted">Behind Every System.</span></h2>
        </div>
        <p class="section-intro">One unified core architecture adapted to the operational realities, risks, and terminology of 19 different industries.</p>
      </div>

      <div class="sol-principles-grid">
        <div class="sol-principle-card">
          <div class="sol-principle-num">PRINCIPLE 01</div>
          <h3>Reasoning and planning</h3>
          <p>Interpreting objectives, evaluating options against business rules, and organizing work into actionable, deterministic steps.</p>
        </div>
        <div class="sol-principle-card">
          <div class="sol-principle-num">PRINCIPLE 02</div>
          <h3>Agent orchestration</h3>
          <p>Coordinating specialized domain agents (finance, logistics, sales, compliance) and assigning tasks according to their verified capabilities.</p>
        </div>
        <div class="sol-principle-card">
          <div class="sol-principle-num">PRINCIPLE 03</div>
          <h3>Organizational memory</h3>
          <p>Using authorized business context, operating histories, and corporate SOPs to make workflows consistently reliable over time.</p>
        </div>
        <div class="sol-principle-card">
          <div class="sol-principle-num">PRINCIPLE 04</div>
          <h3>Permissions and governance</h3>
          <p>Defining what a system can do autonomously, what requires explicit human sign-off, and what is strictly prohibited.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURED EDITORIAL ESSAY -->
  <section class="sol-essay-section" id="publication">
    <div class="container">
      <div class="sol-essay-box">
        <div>
          <div class="sol-essay-meta">FEATURED EDITORIAL PUBLICATION · AUGUST 6, 2026 · 23 MIN READ</div>
          <h2>Building Intelligence Across Industries</h2>
          <p>An editorial overview of the intelligence systems Zatics Intelligence is exploring and building toward — from autonomous agentic infrastructure to industry-specific operational execution.</p>
          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            <a class="button button-primary" href="/solutions/publications/building-intelligence-across-industries/">
              Read the full essay (23 min)
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>
            </a>
            <a class="button button-outline" href="/solutions/publications/">
              Publication Library
            </a>
          </div>
        </div>

        <div class="sol-essay-aside">
          <h4>IN THIS ESSAY</h4>
          <div class="sol-essay-toc-list">
            <a class="sol-essay-toc-item" href="/solutions/publications/building-intelligence-across-industries/#core-agentic-intelligence">
              Core Agentic Intelligence <span>01 &#x2192;</span>
            </a>
            <a class="sol-essay-toc-item" href="/solutions/publications/building-intelligence-across-industries/#healthcare-intelligence">
              Healthcare Intelligence <span>02 &#x2192;</span>
            </a>
            <a class="sol-essay-toc-item" href="/solutions/publications/building-intelligence-across-industries/#logistics-and-fulfillment">
              Logistics & Fulfillment <span>03 &#x2192;</span>
            </a>
            <a class="sol-essay-toc-item" href="/solutions/publications/building-intelligence-across-industries/#physical-intelligence">
              Physical Infrastructure <span>04 &#x2192;</span>
            </a>
            <a class="sol-essay-toc-item" href="/solutions/publications/building-intelligence-across-industries/#financial-intelligence">
              Financial Intelligence <span>05 &#x2192;</span>
            </a>
            <a class="sol-essay-toc-item" href="/solutions/publications/building-intelligence-across-industries/" style="color:var(--accent);">
              + 14 more industry systems <span>All 19 &#x2192;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOCUS SUB-ROUTES SECTION -->
  <section class="sol-subroutes-section" id="focus-routes">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow"><span class="section-number">05 /</span> DEDICATED FOCUS VIEWS</p>
          <h2>Explore Specialized<br/><span class="muted">Solutions Perspectives.</span></h2>
        </div>
        <p class="section-intro">Dive directly into dedicated documentation, research framing, engineering principles, and the publication library.</p>
      </div>

      <div class="sol-subroutes-grid">
        <a class="sol-subroute-card" href="/solutions/industries/">
          <div>
            <div class="sol-subroute-card-top">
              <span>INDEX // 19 DOMAINS</span>
              <span>&#x2197;</span>
            </div>
            <h3>Industries Index</h3>
            <p>A structured index of the 19 intelligence domains described in the Zatics Intelligence editorial.</p>
          </div>
          <span class="sol-subroute-card-link">Explore Industries Index &#x2192;</span>
        </a>

        <a class="sol-subroute-card" href="/solutions/intelligence/">
          <div>
            <div class="sol-subroute-card-top">
              <span>FOUNDATION // AGENTIC CORE</span>
              <span>&#x2197;</span>
            </div>
            <h3>Intelligence Layer</h3>
            <p>The shared agentic foundation, execution models, and organizational memory behind our systems.</p>
          </div>
          <span class="sol-subroute-card-link">Explore Intelligence Layer &#x2192;</span>
        </a>

        <a class="sol-subroute-card" href="/solutions/engineering/">
          <div>
            <div class="sol-subroute-card-top">
              <span>SYSTEMS // ARCHITECTURE</span>
              <span>&#x2197;</span>
            </div>
            <h3>Engineering Principles</h3>
            <p>Production engineering for context-aware, observable, governed multi-agent intelligence systems.</p>
          </div>
          <span class="sol-subroute-card-link">Explore Engineering Principles &#x2192;</span>
        </a>

        <a class="sol-subroute-card" href="/solutions/research/">
          <div>
            <div class="sol-subroute-card-top">
              <span>EDITORIAL // DIRECTIONS</span>
              <span>&#x2197;</span>
            </div>
            <h3>Research Framing</h3>
            <p>Editorial framing for future-facing systems, distinguishing active capabilities from research in progress.</p>
          </div>
          <span class="sol-subroute-card-link">Explore Research Framing &#x2192;</span>
        </a>

        <a class="sol-subroute-card" href="/solutions/publications/">
          <div>
            <div class="sol-subroute-card-top">
              <span>LIBRARY // EDITORIAL</span>
              <span>&#x2197;</span>
            </div>
            <h3>Publication Library</h3>
            <p>Search and inspect genuine Zatics Intelligence publications and long-form operational notes.</p>
          </div>
          <span class="sol-subroute-card-link">Explore Publication Library &#x2192;</span>
        </a>

        <a class="sol-subroute-card" href="/solutions/publications/building-intelligence-across-industries/">
          <div>
            <div class="sol-subroute-card-top">
              <span>LONG-FORM // FEATURED ESSAY</span>
              <span>&#x2197;</span>
            </div>
            <h3>Featured Essay</h3>
            <p>Unabridged reading experience of 'Building Intelligence Across Industries' with table of contents.</p>
          </div>
          <span class="sol-subroute-card-link">Read Featured Essay &#x2192;</span>
        </a>
      </div>
    </div>
  </section>

  <!-- A NOTE ON OUR SCOPE -->
  <section class="sol-scope-section">
    <div class="container">
      <div class="sol-scope-box">
        <span class="eyebrow"><span class="status-dot"></span> A NOTE ON OUR SCOPE</span>
        <p>
          Zatics Intelligence is building toward a broader vision of intelligence infrastructure across the industries and systems outlined in this portal. These areas represent our intended scope of development and the domains we are exploring, designing, or building toward. Development stages, capabilities, and availability may differ by system. Inclusion in this publication does not imply that a system is complete, commercially available, or deployed. We publish updates as our work progresses.
        </p>
      </div>
    </div>
  </section>

</main>

<!-- SOLUTION INSPECTOR MODAL -->
<div class="sol-modal-backdrop" id="sol-modal-backdrop" aria-hidden="true" role="dialog" aria-modal="true">
  <div class="sol-modal">
    <button type="button" class="sol-modal-close" id="sol-modal-close" aria-label="Close solution details">&#x2715;</button>
    <div id="sol-modal-content"></div>
  </div>
</div>

${renderContactDialog()}
${renderFooter()}

<script src="/static/solutions-data.js"></script>
<script src="/static/solutions.js"></script>
</body>
</html>`;
}

// 2. Generate sub-pages
function generateIndustriesPage() {
  const listHtml = solutions.map(s => `
    <div class="sol-card" style="margin-bottom:16px;">
      <div class="sol-card-top">
        <span class="sol-card-num">SYSTEM / ${s.number}</span>
        <span class="sol-card-category">${esc(s.category)}</span>
      </div>
      <h3>${esc(s.name)}</h3>
      <p class="sol-card-subtitle">${esc(s.subtitle)}</p>
      <p class="sol-card-desc">${esc(s.intro[0] || '')}</p>
      <div class="sol-card-actions">
        <a class="text-link" href="/solutions/#${esc(s.slug)}">
          Inspect on Solutions Portal <span>&#x2192;</span>
        </a>
        <a class="button button-small button-outline" href="/solutions/publications/building-intelligence-across-industries/#${esc(s.slug)}">
          Read in Essay &#x2197;
        </a>
      </div>
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Industries — Zatics Intelligence | 19 Operational Domains</title>
  <meta name="description" content="A structured index of the 19 intelligence domains engineered by Zatics Intelligence."/>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/static/style.css"/>
  <link rel="stylesheet" href="/static/solutions.css"/>
</head>
<body>
${renderHeader('solutions')}
<main class="container" style="padding-top:140px;padding-bottom:100px;">
  <div style="margin-bottom:40px;">
    <p class="eyebrow"><a href="/solutions/" style="color:#8fa080;">Solutions</a> <span style="margin:0 6px;">/</span> Industries Index</p>
    <h1 style="font-size:clamp(40px,5vw,64px);line-height:1.1;letter-spacing:-2px;margin:16px 0;">One Intelligence Vision.<br/><span class="accent">Multiple Industry Systems.</span></h1>
    <p style="font-size:16px;color:#9da795;max-width:750px;line-height:1.8;">
      The same operational foundation must adapt to the workflows, risks, terminology, regulations, and accountability requirements of each sector. Explore the 19 domains below.
    </p>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(360px, 1fr));gap:20px;">
    ${listHtml}
  </div>
  <div style="margin-top:60px;text-align:center;">
    <a class="button button-primary" href="/solutions/">Back to Solutions Portal</a>
  </div>
</main>
${renderContactDialog()}
${renderFooter()}
<script src="/static/solutions-data.js"></script>
<script src="/static/solutions.js"></script>
</body>
</html>`;
}

function generateIntelligencePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Intelligence Layer — Zatics Intelligence</title>
  <meta name="description" content="The shared agentic foundation, execution model, and memory behind Zatics Intelligence systems."/>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/static/style.css"/>
  <link rel="stylesheet" href="/static/solutions.css"/>
</head>
<body>
${renderHeader('solutions')}
<main class="container" style="padding-top:140px;padding-bottom:100px;">
  <p class="eyebrow"><a href="/solutions/" style="color:#8fa080;">Solutions</a> <span style="margin:0 6px;">/</span> Intelligence Layer</p>
  <h1 style="font-size:clamp(40px,5vw,64px);line-height:1.1;letter-spacing:-2px;margin:16px 0;">From Information.<br/><span class="accent">To Autonomous Action.</span></h1>
  <p style="font-size:16px;color:#9da795;max-width:750px;line-height:1.8;margin-bottom:50px;">
    The intelligence layer is not a single model. It is the coordinated system around the model: context, reasoning, permissions, integrations, observability, and the human boundaries that make action accountable.
  </p>
  <div class="sol-principles-grid" style="margin-bottom:60px;">
    <div class="sol-principle-card">
      <div class="sol-principle-num">01 // REASONING</div>
      <h3>Reasoning & Planning</h3>
      <p>Interpreting objectives, evaluating options, and organizing work into verified actionable steps.</p>
    </div>
    <div class="sol-principle-card">
      <div class="sol-principle-num">02 // ORCHESTRATION</div>
      <h3>Agent Orchestration</h3>
      <p>Coordinating specialized domain agents and assigning tasks according to their capabilities.</p>
    </div>
    <div class="sol-principle-card">
      <div class="sol-principle-num">03 // MEMORY</div>
      <h3>Organizational Memory</h3>
      <p>Using authorized business context, records, and operating procedures to make workflows consistent.</p>
    </div>
    <div class="sol-principle-card">
      <div class="sol-principle-num">04 // GOVERNANCE</div>
      <h3>Permissions & Governance</h3>
      <p>Defining what a system can do independently, what requires approval, and what is prohibited.</p>
    </div>
  </div>
  <div style="text-align:center;">
    <a class="button button-primary" href="/solutions/">Explore 19 Industry Solutions</a>
  </div>
</main>
${renderContactDialog()}
${renderFooter()}
<script src="/static/solutions-data.js"></script>
<script src="/static/solutions.js"></script>
</body>
</html>`;
}

function generateEngineeringPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Engineering Principles — Zatics Intelligence</title>
  <meta name="description" content="Engineering principles for context-aware, observable, governed multi-agent intelligence systems."/>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/static/style.css"/>
  <link rel="stylesheet" href="/static/solutions.css"/>
</head>
<body>
${renderHeader('solutions')}
<main class="container" style="padding-top:140px;padding-bottom:100px;">
  <p class="eyebrow"><a href="/solutions/" style="color:#8fa080;">Solutions</a> <span style="margin:0 6px;">/</span> Engineering Principles</p>
  <h1 style="font-size:clamp(40px,5vw,64px);line-height:1.1;letter-spacing:-2px;margin:16px 0;">The Model Is Only<br/><span class="accent">The Beginning.</span></h1>
  <p style="font-size:16px;color:#9da795;max-width:750px;line-height:1.8;margin-bottom:50px;">
    Production intelligence depends on the system around the model: the context it can access, the work it can coordinate, the actions it is permitted to take, and the evidence available when something goes wrong.
  </p>
  <div class="sol-scope-box" style="margin-bottom:50px;">
    <span class="eyebrow">5-STAGE FLOW</span>
    <p>01 Understand (Contextualise) → 02 Reason (Analyse & Plan) → 03 Decide (Evaluate & Govern) → 04 Coordinate (Delegate) → 05 Execute (Act & Verify). Every decision grounded. Every action traceable.</p>
  </div>
  <div style="text-align:center;">
    <a class="button button-primary" href="/solutions/#architecture">View System Architecture Flow</a>
  </div>
</main>
${renderContactDialog()}
${renderFooter()}
<script src="/static/solutions-data.js"></script>
<script src="/static/solutions.js"></script>
</body>
</html>`;
}

function generateResearchPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Research Framing — Zatics Intelligence</title>
  <meta name="description" content="Editorial framing for Zatics Intelligence research directions and future-facing systems work."/>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/static/style.css"/>
  <link rel="stylesheet" href="/static/solutions.css"/>
</head>
<body>
${renderHeader('solutions')}
<main class="container" style="padding-top:140px;padding-bottom:100px;">
  <p class="eyebrow"><a href="/solutions/" style="color:#8fa080;">Solutions</a> <span style="margin:0 6px;">/</span> Research Framing</p>
  <h1 style="font-size:clamp(40px,5vw,64px);line-height:1.1;letter-spacing:-2px;margin:16px 0;">A Direction For<br/><span class="accent">Consequential Systems.</span></h1>
  <p style="font-size:16px;color:#9da795;max-width:750px;line-height:1.8;margin-bottom:40px;">
    This is an editorial overview describing the systems, questions, and directions Zatics Intelligence is exploring, designing, or building toward, with boundaries stated alongside ambition.
  </p>
  <div class="sol-scope-box" style="margin-bottom:40px;">
    <span class="eyebrow">EDITORIAL STATUS</span>
    <p>Clear ambition should come with clear boundaries. We distinguish operational capability from research direction, experiment, plan, and future possibility. The featured publication is dated August 6, 2026.</p>
  </div>
  <div style="text-align:center;">
    <a class="button button-primary" href="/solutions/publications/building-intelligence-across-industries/">Read the Featured Essay</a>
  </div>
</main>
${renderContactDialog()}
${renderFooter()}
<script src="/static/solutions-data.js"></script>
<script src="/static/solutions.js"></script>
</body>
</html>`;
}

function generatePublicationsPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Publications — Zatics Intelligence</title>
  <meta name="description" content="Search the verified Zatics Intelligence publication library across titles, topics, categories, and article content."/>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/static/style.css"/>
  <link rel="stylesheet" href="/static/solutions.css"/>
</head>
<body>
${renderHeader('solutions')}
<main class="container" style="padding-top:140px;padding-bottom:100px;">
  <p class="eyebrow"><a href="/solutions/" style="color:#8fa080;">Solutions</a> <span style="margin:0 6px;">/</span> Publications</p>
  <h1 style="font-size:clamp(40px,5vw,64px);line-height:1.1;letter-spacing:-2px;margin:16px 0;">Ideas For Systems<br/><span class="accent">That Do The Work.</span></h1>
  <p style="font-size:16px;color:#9da795;max-width:750px;line-height:1.8;margin-bottom:40px;">
    Long-form editorial thinking on the intelligence layer behind consequential operations.
  </p>
  <div class="sol-card" style="max-width:800px;margin-bottom:40px;">
    <div class="sol-card-top">
      <span class="sol-card-num">EDITORIAL OVERVIEW</span>
      <span class="sol-card-category">August 6, 2026 · 23 min read</span>
    </div>
    <h2 style="font-size:28px;margin:12px 0;">Building Intelligence Across Industries</h2>
    <p style="color:#9da795;line-height:1.8;margin-bottom:20px;">
      An editorial overview of the intelligence systems Zatics Intelligence is exploring and building toward, from agentic infrastructure to industry-specific operations.
    </p>
    <a class="button button-primary" href="/solutions/publications/building-intelligence-across-industries/">
      Read Full Essay &#x2192;
    </a>
  </div>
</main>
${renderContactDialog()}
${renderFooter()}
<script src="/static/solutions-data.js"></script>
<script src="/static/solutions.js"></script>
</body>
</html>`;
}

function generateEssayPage() {
  const tocHtml = solutions.map(s => `
    <a href="#${esc(s.slug)}" style="display:flex;align-items:center;gap:10px;padding:6px 0;color:#92a285;text-decoration:none;font-size:12.5px;border-bottom:1px solid #1c2716;transition:color 0.2s;">
      <span style="font-family:var(--mono);color:var(--accent);font-size:10.5px;">${s.number}</span>
      <span>${esc(s.name)}</span>
    </a>
  `).join('\n');

  const sectionsHtml = solutions.map(s => {
    const capsHtml = s.capabilities.length > 0
      ? `
        <h4 style="font-family:var(--mono);font-size:11px;letter-spacing:1px;color:var(--accent);text-transform:uppercase;margin:22px 0 12px;">What can it do?</h4>
        <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:9px;margin-bottom:24px;">
          ${s.capabilities.map(c => `
            <li style="display:flex;align-items:flex-start;gap:10px;font-size:14px;color:#c7d6bc;line-height:1.6;">
              <span style="color:var(--accent);">&#x2713;</span>
              <span>${esc(c)}</span>
            </li>
          `).join('')}
        </ul>
      `
      : '';

    const scenarioHtml = s.scenario.length > 0
      ? `
        <div style="background:#0c120a;border:1px solid #23311b;border-radius:6px;padding:20px;margin-bottom:22px;">
          <p style="font-family:var(--mono);font-size:9.5px;color:var(--accent);letter-spacing:1px;margin-bottom:8px;">OPERATIONAL SCENARIO</p>
          ${s.scenario.map(sc => `<p style="font-size:13.5px;line-height:1.75;color:#9cad8e;margin-bottom:8px;">${esc(sc.replace(/###\s*/, ''))}</p>`).join('')}
        </div>
      `
      : '';

    const resultHtml = s.result.length > 0
      ? `
        <div style="background:rgba(209,248,154,0.07);border-left:3px solid var(--accent);padding:14px 18px;border-radius:0 6px 6px 0;margin-bottom:26px;">
          <p style="font-family:var(--mono);font-size:10px;letter-spacing:1px;color:var(--accent);text-transform:uppercase;margin-bottom:4px;">The Result</p>
          <p style="font-size:13.5px;color:#d3e5c0;line-height:1.65;margin:0;">${esc(s.result.join(' '))}</p>
        </div>
      `
      : '';

    return `
    <section id="${esc(s.slug)}" style="padding:48px 0;border-bottom:1px solid #1c2715;">
      <p class="eyebrow" style="color:var(--accent);margin-bottom:10px;">SYSTEM ${s.number} · ${esc(s.category.toUpperCase())}</p>
      <h2 style="font-size:32px;letter-spacing:-1px;line-height:1.2;margin-bottom:8px;color:#eeefea;">${esc(s.fullName)}</h2>
      
      <div style="font-size:15px;line-height:1.85;color:#9da992;margin:20px 0;">
        ${s.intro.map(p => `<p style="margin-bottom:14px;">${esc(p)}</p>`).join('')}
      </div>

      ${capsHtml}
      ${scenarioHtml}
      ${resultHtml}

      <div style="display:flex;gap:14px;align-items:center;">
        <button type="button" class="button button-small button-primary" data-contact>
          Consult on ${esc(s.name)}
        </button>
        <a class="text-link" href="/solutions/#${esc(s.slug)}">
          Open interactive system view <span>&#x2192;</span>
        </a>
      </div>
    </section>
    `;
  }).join('\n');

  const essaysHtml = essaySections.map(e => `
    <div style="padding:40px 0;border-bottom:1px solid #1c2715;">
      <h3 style="font-size:26px;letter-spacing:-0.8px;margin-bottom:18px;color:#eeefea;">${esc(e.title)}</h3>
      <div style="font-size:15px;line-height:1.85;color:#9da992;">
        ${e.paragraphs.map(p => `<p style="margin-bottom:14px;">${esc(p)}</p>`).join('')}
      </div>
      ${e.list.length > 0 ? `
        <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:10px;margin:20px 0;">
          ${e.list.map(item => `
            <li style="display:flex;gap:10px;font-size:14px;color:#c7d6bc;line-height:1.6;">
              <span style="color:var(--accent);">&#x2713;</span>
              <span>${esc(item)}</span>
            </li>
          `).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Building Intelligence Across Industries — Zatics Intelligence Publication</title>
  <meta name="description" content="An editorial overview of the 19 autonomous intelligence systems Zatics Intelligence is exploring and building toward."/>
  <meta property="og:title" content="Building Intelligence Across Industries — Zatics Intelligence"/>
  <meta property="og:description" content="An editorial overview of the 19 autonomous intelligence systems Zatics Intelligence is exploring and building toward."/>
  <meta property="og:image" content="/static/og-publication.svg"/>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/static/style.css"/>
  <link rel="stylesheet" href="/static/solutions.css"/>
</head>
<body>
${renderHeader('solutions')}

<div class="container" style="padding-top:140px;padding-bottom:120px;">
  <p class="eyebrow"><a href="/solutions/" style="color:#8fa080;">Solutions</a> <span style="margin:0 6px;">/</span> <a href="/solutions/publications/" style="color:#8fa080;">Publications</a> <span style="margin:0 6px;">/</span> Building Intelligence Across Industries</p>
  
  <header style="margin:24px 0 50px;border-bottom:1px solid #23311b;padding-bottom:34px;">
    <span class="sol-card-category" style="margin-bottom:14px;display:inline-block;">August 6, 2026 · 23 min read · Editorial Overview</span>
    <h1 style="font-size:clamp(40px,5.5vw,72px);letter-spacing:-2.5px;line-height:1.06;margin:14px 0 20px;">Building Intelligence<br/><span class="accent">Across Industries.</span></h1>
    <p style="font-size:clamp(15px,1.8vw,18px);line-height:1.75;color:#9da894;max-width:850px;">
      From autonomous business operations to intelligent healthcare, public infrastructure, finance, and industry — we are building a new generation of systems designed to think, coordinate, and execute.
    </p>
  </header>

  <div style="display:grid;grid-template-columns:300px 1fr;gap:60px;align-items:start;">
    
    <!-- STICKY TABLE OF CONTENTS -->
    <aside style="position:sticky;top:100px;background:#0d130a;border:1px solid #23311b;border-radius:8px;padding:22px;max-height:calc(100vh - 130px);overflow-y:auto;scrollbar-width:thin;">
      <p style="font-family:var(--mono);font-size:10px;letter-spacing:1.2px;color:var(--accent);text-transform:uppercase;margin-bottom:16px;">19 Industry Systems</p>
      <nav aria-label="Table of contents">
        ${tocHtml}
      </nav>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #1e2a16;">
        <a class="button button-small button-outline" style="width:100%;text-align:center;" href="/solutions/">
          Open Interactive Portal
        </a>
      </div>
    </aside>

    <!-- ESSAY MAIN BODY -->
    <article style="min-width:0;">
      <div style="font-size:16px;line-height:1.85;color:#9da794;margin-bottom:40px;border-bottom:1px solid #23311b;padding-bottom:30px;">
        <p style="margin-bottom:16px;">The next era of technology will not be defined by how quickly we can generate an answer. It will be defined by how much meaningful work technology can actually accomplish.</p>
        <p style="margin-bottom:16px;">At Zatics Intelligence, we are developing advanced, industry-specific intelligence systems designed to transform the way businesses, institutions, and public infrastructure operate. Our ambition is to move beyond isolated software tools and disconnected automations toward something far more capable: intelligent systems that understand operations, coordinate complex workflows, make context-aware decisions, and execute work under defined objectives and human-approved boundaries.</p>
        <p style="margin-bottom:16px;">Built by an Indian engineering team competing at the national level, our work spans some of the most consequential sectors of the modern world. Technology should not merely help people do more work. It should take responsibility for executing the work that no longer needs their constant attention.</p>
      </div>

      <!-- 19 SECTIONS -->
      ${sectionsHtml}

      <!-- CONCLUDING ESSAYS -->
      <div style="margin-top:50px;">
        <p class="eyebrow" style="color:var(--accent);margin-bottom:14px;">EDITORIAL DIRECTION &amp; OPERATIONAL AMBITION</p>
        ${essaysHtml}
      </div>

      <!-- SCOPE NOTE -->
      <div class="sol-scope-box" style="margin-top:50px;">
        <span class="eyebrow">A NOTE ON OUR SCOPE</span>
        <p>Zatics Intelligence is building toward a broader vision of intelligence infrastructure across the industries and systems outlined in this publication. These areas represent our intended scope of development and the domains we are exploring, designing, or building toward. Development stages, capabilities, and availability may differ by system. Inclusion in this publication does not imply that a system is complete, commercially available, or deployed. We will publish updates as our work progresses.</p>
      </div>

    </article>

  </div>
</div>

${renderContactDialog()}
${renderFooter()}

<script src="/static/solutions-data.js"></script>
<script src="/static/solutions.js"></script>
</body>
</html>`;
}

// Write files
function writePage(relPath, content) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log(`Generated: ${relPath}`);
}

console.log('Generating merged solutions pages...');

// 1. Root-accessible solutions pages
writePage('solutions/index.html', generateSolutionsHome());
writePage('solutions/industries/index.html', generateIndustriesPage());
writePage('solutions/intelligence/index.html', generateIntelligencePage());
writePage('solutions/engineering/index.html', generateEngineeringPage());
writePage('solutions/research/index.html', generateResearchPage());
writePage('solutions/publications/index.html', generatePublicationsPage());
writePage('solutions/publications/building-intelligence-across-industries/index.html', generateEssayPage());

// 2. Also write to public/solutions/ so static file servers serve directly
writePage('public/solutions/index.html', generateSolutionsHome());
writePage('public/solutions/industries/index.html', generateIndustriesPage());
writePage('public/solutions/intelligence/index.html', generateIntelligencePage());
writePage('public/solutions/engineering/index.html', generateEngineeringPage());
writePage('public/solutions/research/index.html', generateResearchPage());
writePage('public/solutions/publications/index.html', generatePublicationsPage());
writePage('public/solutions/publications/building-intelligence-across-industries/index.html', generateEssayPage());

console.log('All solutions pages generated successfully!');
