# Zatics Intelligence — Publication Website Plan

## Scope and implementation approach

The initialized project is an empty managed Webdev workspace. The existing public `https://zatics.tech` site was inspected and provides the current brand direction: dark, systems-oriented, engineering-led, and focused on autonomous operational intelligence. This project will add a publication experience in that visual language without pretending that an existing local codebase is available.

The build will be a static-first website with no application database or server dependency. A small Node/Vite toolchain will generate content-bearing HTML for the public routes at build time, while a shared browser script adds search, filters, theme persistence, navigation behavior, copy/share actions, and reduced-motion-aware interactions. This keeps article content visible to crawlers without JavaScript and makes the site inexpensive to serve.

The supplied files are the source of truth:

- `pasted_content.txt`: product and editorial implementation brief.
- `pasted_content_2.txt`: the long-form editorial source, including the 19 industry sections and the transparency language.

The publication library will contain one genuine featured editorial publication because no other verified publications were supplied. No fabricated authors, citations, metrics, customers, publication history, deployment claims, or research findings will be added. Search and related-publication UI will still be implemented against the structured library so future genuine publications can be added without a component rewrite.

## Proposed project structure

```text
zaticspub/
├── app.config.ts                 # Project logo metadata
├── package.json                  # Pinned Node/Vite toolchain and scripts
├── pnpm-workspace.yaml           # Reviewed lifecycle-script policy
├── plan.md                       # This approved implementation/design plan
├── TODO.md                       # Outcome-based delivery criteria
├── public/
│   ├── manus-routes.json         # Complete public page route manifest
│   ├── favicon.svg               # Lightweight Zatics mark
│   └── static/                   # Generated static assets copied for preview/build
├── src/
│   ├── content/publication.json  # Structured article metadata and source sections
│   ├── templates/page.mjs        # Shared HTML shell and route metadata
│   ├── templates/article.mjs     # Long-form article renderer
│   ├── templates/home.mjs        # Publication landing page renderer
│   ├── styles/main.css           # Theme tokens, responsive layout, accessibility
│   └── client/app.js             # Search, filters, theme, keyboard behavior, sharing
├── scripts/
│   ├── build-site.mjs            # Generates HTML routes and copies assets
│   └── dev.mjs                   # Generates site then starts Vite on port 3000
└── dist/                         # Generated production output, not hand-authored
```

The exact file names may be adjusted during implementation if the chosen Vite setup benefits from a simpler layout, but the responsibilities will remain separated: content, templates, client behavior, styling, and build generation.

## Routes and content model

The generated public route set will be:

- `/` — publication landing page with hero, featured publication, library, industry index, architecture diagram, and scope note.
- `/publications/` — searchable publication library view, shareable query/filter URL state, and empty states.
- `/publications/building-intelligence-across-industries/` — the full article with title, summary, date, category, reading time, breadcrumbs, contents, long-form sections, architecture foundation, transparent scope note, related publications, and canonical metadata.
- `/intelligence/` — focused view of the shared agentic foundation and execution model, linking into the featured publication.
- `/industries/` — focused industry index derived from the article's 19 industry sections, with links back to relevant article anchors.
- `/research/` — an editorial framing page that clearly labels the current material as Zatics Intelligence editorial direction rather than independently verified research.
- `/engineering/` — focused view of the systems architecture and operational principles described in the supplied source.

The publication data will include title, slug, summary, publication date, type, reading time, category, tags, section headings, section IDs, paragraphs, lists, callouts, related slugs, and indexed plain text. Article content will preserve the provided meaning while making section hierarchy and reading flow easier to scan. Any statement that is an ambition or concept will remain explicitly framed as “being developed,” “designed to,” “could,” “is exploring,” or “intended to,” where appropriate.

## Design direction

### Alternatives considered

1. **Editorial systems journal** — 0.06 probability. A quiet, typographic publication with system diagrams and research-note rhythm.
2. **Dark operations console** — 0.04 probability. A dense, technical interface emphasizing live-system status and data panels.
3. **Brutalist enterprise manifesto** — 0.08 probability. High-contrast oversized type, hard rules, and intentionally disruptive editorial pacing.

### Chosen direction: editorial systems journal

- **Design Movement:** Contemporary Swiss editorial design combined with systems-engineering documentation and the restraint of premium technology publishing.
- **Core Principles:** Make the content the interface; show system relationships rather than decorative spectacle; use contrast and spacing to signal hierarchy; communicate ambition with precise caveats.
- **Color Philosophy:** Pure white and pure black are the primary themes. Muted green is reserved for active states, small diagrams, and meaningful system signals. Gray is structural rather than ornamental, supporting reading comfort and boundaries.
- **Layout Paradigm:** An asymmetric reading column paired with a narrow metadata rail and occasional full-bleed system diagrams. The landing page alternates wide editorial bands with indented content rails rather than repeating centered card grids.
- **Signature Elements:** A geometric Z mark; numbered section markers with thin rule lines; monochrome architecture diagrams that use one muted green signal path.
- **Interaction Philosophy:** Controls should feel like publication instruments: clear, reversible, keyboard-accessible, and quiet. Search exposes relevance rather than overwhelming the reader. Theme changes are immediate and persistent.
- **Animation:** Minimal opacity/transform transitions only for menu/search disclosure and page-level affordances. Respect `prefers-reduced-motion: reduce` by removing nonessential transitions and motion.
- **Typography System:** The interface uses a refined system sans stack with `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, and `Inter` fallbacks. Long-form article prose uses a separate reading face, `Iowan Old Style`, `Baskerville`, `Georgia`, and `serif` fallbacks, with tuned font size, line-height, paragraph measure, and hanging punctuation where supported. Large headlines use tight tracking and controlled max-width; interface body copy uses a readable 68–74 character line length, generous leading, and strong contrast. Metadata uses compact uppercase labels with measured letter spacing. Headline wrapping, article rhythm, and mobile line lengths will be checked as deliberately as the theme palette.
- **Brand Essence:** Intelligence infrastructure for organizations with consequential operations; precise, ambitious, accountable. Personality: rigorous, composed, forward-looking.
- **Brand Voice:** Headlines are direct and declarative. Supporting copy explains mechanisms and boundaries without hype. Example lines: “The work after the answer.” and “Autonomy is a defined scope of responsibility, not a promise that every decision can be delegated.”
- **Wordmark & Logo:** A text wordmark, `ZATICS / INTELLIGENCE`, paired with a compact geometric Z monogram built from three offset strokes. It will be inline SVG so it remains sharp and theme-aware.
- **Signature Brand Color:** `#7FAF8D`, a muted signal green used sparingly for active state, system pathways, and editorial emphasis.

## Functional behavior

- Theme switcher stores `theme=light|dark` in local storage, uses `prefers-color-scheme` only on first visit, and applies an inline pre-paint theme guard to avoid a flash of the wrong theme.
- Search indexes titles, summaries, categories, tags, section headings, and article text. Results are ranked by title/category/tag matches before general content matches.
- Search state is encoded in the URL using `?q=` and `?category=` so filtered views are shareable. Clear-query control resets both the UI and URL.
- `/` focuses search with `/`; Escape clears/closes the search overlay when it is open. All controls have visible focus states and accessible labels.
- Article pages include breadcrumbs, a sticky table of contents on wide screens, section anchors, share/copy-link controls, related-publication treatment, and next/previous navigation where applicable.
- The mobile header collapses into a keyboard-accessible menu. No critical content depends on hover.
- Unknown routes and unknown publication slugs receive a real static 404 page in the generated output path model, with `noindex` metadata.

## SEO and static delivery

Each indexable route will receive meaningful initial HTML, route-specific title and description, Open Graph tags, Twitter card tags, canonical URL, and page body content without requiring JavaScript. The configured public origin will be `https://zatics.tech` only for routes intended to represent the public Zatics domain; if the managed project cannot safely bind that origin during this task, canonical and social absolute URLs will be omitted rather than guessed.

The build will generate `sitemap.xml` and `robots.txt` aligned with the public route set, and `public/manus-routes.json` will describe the same page routes for the Webdev platform. The output will be configured as a static build with `dist/index.html` present.

## Build and validation workflow

1. Add the minimal pinned Node/Vite configuration and reviewed lifecycle policy.
2. Register TypeScript/JavaScript diagnostics through the managed Webdev runtime before the first application-code batch.
3. Create structured publication data from the supplied editorial source and build the shared HTML shell, templates, CSS, and client behavior.
4. Generate the static route set and route manifest before starting the preview server.
5. Run the production build and inspect generated HTML for content-bearing body text, route metadata, canonical consistency, sitemap, robots, and 404 output.
6. Start the configured Vite preview service on port 3000 and verify HTTP readiness plus the route manifest.
7. Run a final visual review of the rendered homepage, long-form article, search overlay, and mobile navigation in both light and dark themes, using desktop and mobile viewports. Resolve concrete visual issues found in that review.
8. Verify the actual existing Zatics privacy, terms, and contact routes before launch. Link only verified routes; if a route cannot be confirmed, omit it rather than inventing a URL.
9. Use code inspection and available diagnostics for the main acceptance checks, alongside the rendered visual review.
10. Commit the completed project to the managed canonical repository and create the Webdev checkpoint. Publication will not be claimed unless a successful publish result is explicitly returned.

## Material constraints

No external claims will be added beyond the supplied editorial source and the visible brand language of `https://zatics.tech`. The site will not state that all systems are operational, commercially available, or deployed. The scope note will appear immediately before the footer. Verified privacy, terms, and company-contact routes were not available in the supplied materials, so unsupported footer links will be omitted rather than fabricated.
