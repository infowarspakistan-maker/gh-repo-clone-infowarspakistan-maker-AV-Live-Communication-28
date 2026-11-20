---
name: "apex-seo-aeo-engine"
description: >
  World-class, self-evolving Full-Stack SEO, AI Engine Optimization (AEO / GEO / LLMO),
  Google Lighthouse 100/100/100/100, Google Search Console (GSC), and Google Merchant
  Center (GMC) website building constitution. Synthesizes 1st (Systems/SSR/Lighthouse),
  2nd (GSC/Schema/GMC/Site Structure), and 3rd (AEO/GEO/UX/Competitor Outranker) AI
  Agent profiles into the Unified Apex Master Agent. Enforces Dual-Wave Express SSR,
  Frame-0 synchronous catalog hydration (zero Soft-404s), flat 2-click site structure,
  Answer-First 60-word engineering verdicts, native HTML table matrices, and a 4-Gate
  Monotonic Self-Updating Skill Protocol that learns new rules without ever losing
  existing capabilities.
---

# Apex SEO, AEO/GEO & Lighthouse 100 Website Engine Constitution (`v4.0-self-evolving`)

This skill governs the creation, optimization, and autonomous evolution of dominant commercial, e-commerce, and enterprise service websites designed to rank #1 on Google Search, Google Shopping (GMC), Google AI Overviews, ChatGPT Search, Perplexity, Claude, and Gemini.

---

## 0. Order of Resolution & First-Principles Search/LLM Physics

When architectural, design, or content requirements conflict, resolve them in this strict mathematical order. *A lower-priority rule never justifies violating a higher one:*

1. **Wave-1 SSR + Frame-0 Synchronous Render Integrity (Zero Soft-404s)**:
   - Every indexable URL MUST return HTTP `200` on Wave 1 (`GET` response from `server.ts`) with route-specific `<title data-rh="true">`, `<meta name="description">`, `<link rel="canonical" data-rh="true">`, `@graph` JSON-LD, and a populated `<main class="ssr-seo-snapshot">` inside `<div id="root">...</div><!--ssr-root-end-->`.
   - Client components MUST hydrate on **Frame 0 (0ms)** using synchronous fallback catalogs (`PRODUCT_GMC_METADATA`, `FALLBACK_PRODUCT_CATEGORIES`, `FALLBACK_SERVICES_CATALOG`). Never gate `<SEO />` or primary body copy behind `if (loading) return <Spinner />`.
2. **Deterministic Canonical Graph & 301 Redirect Hygiene (100% GSC Indexation)**:
   - Every page renders exactly one self-referencing `<link rel="canonical" data-rh="true" href="https://{{PRIMARY_DOMAIN}}/..." />` without query parameters (`?brand=`, `?sub=`, `?sort=`) or trailing slashes.
   - All product links resolve via `getCanonicalProductSlug(product, product.id)`—never raw database IDs or unformatted MPNs.
   - Retiring or renaming any URL path requires both a server-side HTTP `301` in `server.ts` (`legacyDirectRedirects`) and a client-side `<Navigate to="..." replace />` in `src/App.tsx`.
3. **Hub-and-Spoke Topical Silo & Anti-Cannibalization Cosine Partitioning**:
   - **National Head Pillars** (e.g., `/video-conference-in-pakistan`, `/event-management-in-pakistan`) exclusively target national head terms.
   - **Category Hubs** (`/category/:slug`) target hardware/product class terms.
   - **Brand Hubs** (`/brands/:slug`) target OEM authorized distributor terms.
   - **Regional Geo Hubs** (`/lahore`, `/karachi`, `/islamabad`) target hyper-local SLA & installation intent.
   - **SKU Pages** (`/product/:slug`) target `[Brand] [Model] [MPN] Price in {{COUNTRY}}` and link upward to their parent Pillar and Category hubs—never cannibalizing national head keywords in SKU `<title>` tags.
4. **AEO / GEO / LLMO Information Gain & RAG Token Density**:
   - Every commercial page opens with a **50–70 word Answer-First Engineering Verdict** immediately below `<h1>` (factual specifications, models, SLA, and price ranges—zero marketing fluff).
   - Every Product, Category, Brand, Service, and Pillar page includes at least one semantic HTML `<table><thead><tbody>` matrix (Bill of Materials, Room-Size Tiers, Brand Comparison, or SLA Pricing) for direct extraction by Google Featured Snippets and LLM RAG chunkers.
   - Synchronize `/llms.txt` and `/llms-full.txt` (complete Markdown corpus of all SKUs, MPNs, GTINs, prices, and guides) alongside `/api/gmc-feed.xml` and `/api/gmc-feed.tsv`.
5. **Google Lighthouse 100/100/100/100 & Flat $\le 2$-Click Site Structure**:
   - Enforce $\text{LCP} \le 1.8\text{s}$, $\text{TBT} \le 50\text{ms}$, $\text{INP} \le 100\text{ms}$, $\text{CLS} = 0.000$, DOM nodes $< 800$, WCAG 2.2 AA accessibility, and $\le 2$-click reachability for 100% of canonical URLs.
6. **Non-Regressive Self-Updating Skill Persistence**:
   - Never overwrite existing files without reading them first; preserve all existing fields, routes, schemas, and redirects; append newly discovered rules monotonically to Section 9 of this skill and `seo-policy.md`.

---

## 1. Dialectic Architecture: Synthesis of the 1st, 2nd & 3rd AI Agent Profiles

The Apex Engine is the dialectical synthesis of three specialized sub-agents:

| Sub-Agent Persona | Mathematical Objective Function | Core Subsystems Owned | Why It Fails Alone (Dialectical Critique) |
| :--- | :--- | :--- | :--- |
| **1st Agent: Principal Systems, SSR & Lighthouse Architect** | $\min(\text{TTFB}, \text{LCP}, \text{TBT}, \text{CLS}) \land \text{Uptime} = 100\%$ | `server.ts` Wave-1 injection, `vite.config.ts` `manualChunks`, `optimizeGalleryImageUrl()`, `IntersectionObserver` DOM batching, Firestore Admin cache + long-polling fallback. | Treats URLs as state (`?id=123`), omits `@graph` schema relationships, and lacks commercial copy/AEO tables. |
| **2nd Agent: Staff GSC, Schema `@graph` & GMC Engineer** | $\text{GSC Coverage} = 100\% \land \text{Click Depth} \le 2 \land \text{GMC Valid} = 100\%$ | `SEO.tsx` (`data-rh="true"`), `getCanonicalProductSlug()`, 301 redirect matrix, `/sitemap.xml`, `/sitemap`, `/api/gmc-feed.xml`, `@graph` JSON-LD (`Product`, `Service`, `FAQPage`, `ItemList`). | Gets pages indexed on Page 2–3, but cannot beat entrenched competitors for Position #1 without intent silos and RAG density. |
| **3rd Agent: Principal AEO/GEO Scientist, UX & Competitor Outranker** | $\max(\text{RAG Citation}, \text{Info Gain}, \text{CVR}, \text{WCAG AA})$ | Anti-cannibalization keyword silos, 60-word Answer-First verdicts, native HTML `<table>` matrices, 7-Part Service Conversion Blueprint, `/llms-full.txt`, Reality-Check audit scripts. | Without Agent 1's SSR/LCP speed and Agent 2's canonical/GMC plumbing, crawlers time out or drop duplicate URLs. |

---

## 2. Google Lighthouse 100/100/100/100 + User-Friendliness + Site Structure Matrix

### 2.1 Performance (100/100 Target)
- **LCP ($\le 1.8\text{s}$)**:
  - Wave-1 SSR HTML renders the `<h1>` and Answer-First summary immediately at HTTP flush ($<50\text{ms}$ TTFB).
  - Apply `loading="eager"` and `fetchPriority="high"` ONLY to the primary hero image or the first 2 product cards in the viewport. All other images MUST use `loading="lazy"` and `decoding="async"`.
  - Route all external/Unsplash/CDN images through `optimizeGalleryImageUrl(url, 480, 75)` (`auto=format&fit=crop&w=480&q=75`).
- **TBT ($\le 50\text{ms}$) & INP ($\le 100\text{ms}$)**:
  - Keep core money routes (`Home`, `Shop`, `ProductDetails`, `Category`, `ServicesLanding`, `ServiceDetail`, `KeywordLandingPage`, `Blog`) synchronous for 0ms render; lazy-load secondary/admin routes via `React.lazy()`.
  - Configure `vite.config.ts` `manualChunks` to isolate `vendor-react`, `vendor-firebase`, `vendor-motion`, and `vendor-icons`.
  - In product grids (`Shop.tsx`, `Category.tsx`), mount the secondary hover image ONLY when `hoveredProductId === product.id`, and batch DOM cards in 16-item increments via `IntersectionObserver` so total DOM nodes stay $<800$.
- **CLS ($0.000$ Target)**:
  - Every `<img>` tag MUST declare explicit `width` and `height` attributes plus CSS `aspect-*` containers.
  - Hero banners on Services, Service Detail, and Keyword Pillar pages use compact `16:6` or `min-h-[280px] lg:min-h-[340px]` containers so the Answer-First verdict and CTAs appear above the fold without layout shift.
  - Defer non-critical floating widgets (AI chat button, cookie consent banner) by $2,500\text{ms}$–$15,000\text{ms}$ after initial paint with fixed positioning (`z-[90]`) that never pushes document flow.

### 2.2 Accessibility & Mobile User-Friendliness (100/100 WCAG 2.2 AA)
- **Semantic Landmarks & Heading Hierarchy**:
  - Include a keyboard-accessible `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>` link as the first child of `<body>`.
  - Wrap page regions in `<header>`, `<nav>`, `<main id="main-content">`, and `<footer>`.
  - Enforce **exactly one `<h1>` per route**, followed by sequential `<h2>` and `<h3>` headings (never skip from `<h1>` to `<h4>`).
- **Contrast & Touch Ergonomics**:
  - Maintain $\ge 4.5:1$ contrast ratio for body text and $\ge 3.0:1$ for large headings/UI controls.
  - Mobile header height is locked at a compact `54px` (`h-[54px]`) with a full-width live search suggestions dropdown anchored flush below (`top-[54px] left-0 right-0`) so results never clip on $360\text{px}$–$390\text{px}$ screens.
  - All interactive buttons, phone links, and bottom nav items maintain $\ge 44\times44\text{px}$ touch targets with explicit `aria-label` attributes on icon-only controls.

### 2.3 Best Practices (100/100 Target)
- Silence benign background gRPC stream disconnects via `setLogLevel('silent')` on `@firebase/firestore` and `experimentalAutoDetectLongPolling: true`.
- Attach `{ passive: true }` to all `window.addEventListener('scroll', ...)` handlers.
- Provide deterministic SVG/placeholder `onError` fallbacks on all `<img>` elements so broken external URLs never log network console errors.

### 2.4 Flat $\le 2$-Click Site Structure & Internal Link Graph
- Every indexable URL in `public/sitemap.xml` MUST be reachable within **$\le 2$ clicks** from the homepage (`/`):
  1. **Header Mega-Menu**: Links directly to National Pillar Hubs, top Product Categories, Turnkey Services, and Regional Geo Hubs.
  2. **Footer Silo Directory**: Links to Authorized Brand Hubs, Commercial Pillar Pages, Procurement Programs, Trust Policies, and `/sitemap`.
  3. **HTML Sitemap (`/sitemap`)**: Categorized human-and-bot directory linking 100% of canonical Products, Categories, Brands, Services, Pillars, and Blog Guides on a single crawlable page.
  4. **Contextual Silo Cross-Links**: Every Product page links upward to its parent Category Hub, Brand Hub, and National Pillar Page; every Pillar Page links downward via HTML `<table>` rows to verified SKUs.

---

## 3. 7-Part High-Converting Commercial & Service Page Blueprint

Every Service Detail (`/services/:slug`) and High-Intent Keyword Pillar Page (`KeywordLandingPage.tsx`) MUST implement this 7-part conversion architecture:

1. **Compact Localized Hero (`16:6` ratio)**: Exact-match keyword + city coverage (`Lahore, Karachi, Islamabad & Nationwide`) in `<h1>`, sub-headline with SLA metrics, and dual CTAs (**"Request a 15-Minute Quote"** + Click-to-Call hotline).
2. **Answer-First 60-Word Engineering Verdict + Trust Bar**: Self-contained factual summary box immediately below the hero, paired with OEM Partner Authority badges (e.g., Cisco, Poly, Logitech, Yealink, Bosch, Shure) and ISO/PEC engineering credentials.
3. **The Technical SLA Advantage**: Quantified operational guarantees (15-minute remote response, 4-hour on-site dispatch, redundant failover rigging, certified acoustic/RF engineers).
4. **Semantic HTML `<table>` Package & BoM Matrix**: Native `<table>` detailing room sizes / event capacities, exact hardware models, turnaround times, and transparent local currency (`PKR` / `{{CURRENCY}}`) pricing tiers.
5. **Hyper-Local Case Studies (E-E-A-T Proof)**: Named commercial deployments in specific business districts (e.g., *Gulberg & Johar Town Lahore*, *Clifton & I.I. Chundrigar Karachi*, *Blue Area & Red Zone Islamabad*) with verifiable equipment lists and outcomes.
6. **Commercial `FAQPage` Schema & Accordion**: 4–6 high-intent buyer questions (pricing, warranty, installation timeline, multi-city support) rendered visibly in the DOM and mirrored in `FAQPage` JSON-LD.
7. **Dual-Hotline Conversion Footer**: Direct `tel:` and WhatsApp triggers + inline rapid RFQ lead capture form.

---

## 4. 4-Gate Monotonic Self-Updating Skill Protocol ("Updates Itself Without Losing Skills")

To prevent **Catastrophic Forgetting** or context drift across sessions, the agent MUST execute these 4 gates whenever modifying the codebase or learning a new optimization:

### Gate 1: Read-Before-Write & Append-Only Skill Evolution
- Before editing any file, call `view_file` to inspect its complete current state.
- When a new SEO rule, competitor counter-strategy, Lighthouse optimization, or route pattern is discovered, **append** it as a new numbered rule (`Rule #N`) in **Section 9 (Learned Rules Ledger)** of this `SKILL.md` and in `seo-policy.md`.
- **STRICT BAN**: Never delete, truncate, or summarize away prior rules in `SKILL.md`, `AGENTS.md`, or `seo-policy.md`.

### Gate 2: Synchronization Across the 6 Canonical Pillars
Whenever a route, product, category, service, brand, or blog guide is added or updated, synchronize all 6 locations in the same turn:
1. `src/App.tsx` (`<Route>` registration + `<Navigate replace />` for any legacy alias).
2. Synchronous catalog fallback (`src/lib/gmc-feed.ts`, `src/pages/Category.tsx`, or `src/lib/services-catalog.ts`).
3. `server.ts` (`injectRouteSeoIntoHtml()` Wave-1 metadata, `@graph` JSON-LD, `<main class="ssr-seo-snapshot">`, and `legacyDirectRedirects` if retiring a slug).
4. `src/lib/sitemap-generator.ts` + run `npx tsx scripts/generate-sitemap.ts` (updates `public/sitemap.xml` and `public/llms-full.txt`).
5. `src/pages/HtmlSitemap.tsx` (ensuring $\le 2$-click crawl depth).
6. `README.md` + `seo-policy.md` + Section 9 of this `SKILL.md`.

### Gate 3: Executable Invariant Ratchet (`scripts/seo-silo-audit.ts`)
- Every structural rule is codified as an automated check in `scripts/seo-silo-audit.ts` (verifying 0 duplicate URLs, 0 query-parameter links, 100% `<SEO />` coverage, `<table>` presence, and HTTP 200 SSR parity).
- If a future edit accidentally breaks any historical skill, `seo-silo-audit.ts` fails immediately and blocks completion until fixed.

### Gate 4: Pre-Completion Verification Sequence
Run and pass all four commands before concluding any coding task:
```bash
npx tsx scripts/generate-sitemap.ts
npx tsx scripts/seo-silo-audit.ts
npm run lint
npm run build
```

---

## 9. Autonomous Self-Update & Learned Rules Ledger (Append-Only)

> **Instruction for AI Agents**: Append every newly discovered ranking rule, competitor counter-move, or Lighthouse optimization below with a version tag and date. Never remove prior entries.

- **`[v1.0 - Baseline Dual-Wave SSR & GMC Engine]`**: Established `server.ts` `injectRouteSeoIntoHtml()` Wave-1 head + body snapshot injection, `data-rh="true"` canonical replacement, and automated 53-SKU Google Merchant Center RSS 2.0 XML (`/api/gmc-feed.xml`) & TSV (`/api/gmc-feed.tsv`) feeds.
- **`[v2.0 - Zero Soft-404 Synchronous Fallback Ratchet]`**: Eliminated async loading spinners on public routes by wiring `buildFallbackProductFromGmcMeta`, `FALLBACK_PRODUCT_CATEGORIES`, and `FALLBACK_SERVICES_CATALOG` into Frame-0 initial state, paired with Firestore Admin SDK 5-minute caching and client `experimentalAutoDetectLongPolling: true` + `setLogLevel('silent')`.
- **`[v3.0 - 2011 Legacy Head-Keyword Reclamation & Anti-Cannibalization Silo]`**: Dedicated `/video-conference-in-pakistan` and `/event-management-in-pakistan` as national SSR Pillar hubs with Answer-First verdicts and native HTML `<table>` comparison matrices to outrank `accsys.pk`, `kbse.com.pk`, `nasco-av.com`, `a2zeventssolutions.com`, `gncaterers.com`, and `blacktieeventsandcaters.com`, while stripping head-term cannibalization from SKU `<title>` tags.
- **`[v4.0 - Lighthouse 100/100/100/100 & Mobile Ergonomics Standard]`**: Enforced compact `54px` mobile sticky header with full-width live search dropdown, compact `16:6` service/landing heroes, `optimizeGalleryImageUrl()` WebP compression, hover-only secondary product images, `IntersectionObserver` 16-card DOM batching ($<800$ DOM nodes), and this 4-Gate Monotonic Self-Updating Skill Protocol.
- **`[v4.1 - Google Merchant Center 20-Column Sheet & Image Extension Normalization Ratchet]`**: Enforced unique SKU/MPN as `id`, specific `title` ($\le 150$ chars with MPN), non-truncated word-bounded `description` ($\le 200$ chars, distinct from `product_highlight`), high-res `image_link` and `additional_image_link` with explicit `.jpg`/`.png`/`.webp` extensions via `normalizeGmcImageUrl()` (filtering out `encrypted-tbn0.gstatic.com`), strict 3-part `section_name:attribute_name:attribute_value` in `product_detail`, and full UI/JSON-LD parity on `ProductDetails.tsx` + `/api/gmc-sheet-20.tsv`.
- **`[v4.2 - Enterprise-Tech Studio Asset Generation & Dual-Mode Local/GMC Image Resolution]`**: Generated 6 local `1200x900` studio assets (`.jpg`, `.webp`, `.svg`) in `/public/images/products/` (`poly-x70-studio`, `poly-x70-boardroom`, `cisco-room-kit-studio`, `cisco-room-kit-eq`, `3d-hologram-stage`, `3d-hologram-display`) via `scripts/generate-enterprise-images.ts` and updated 16 Poly X70 / Cisco Room Kit / 3D Hologram products in `PRODUCT_GMC_METADATA` (`src/lib/gmc-feed.ts`), live Firestore (`scripts/update-product-images-db.ts` + `enrichProductImages` in `src/lib/firebase/firestore-helpers.ts`), `Category.tsx`, and `services-catalog.ts`. Configured dual-mode URL resolution: `normalizeGmcImageUrl()` expands `/images/products/*.jpg` to `https://avlive.com.pk/images/products/*.jpg` for Google Merchant Center feeds (`public/google_merchant_feed.tsv`), OpenGraph, and JSON-LD `Product.image`, while `optimizeGalleryImageUrl()` rewrites `https://avlive.com.pk/images/...` to `/images/...` so browser `<img>` tags load directly from local static files with zero external network latency.
- **`[v4.3 - 100% Direct External Image URL Persistence & Zero Local-Path Override Ratchet]`**: Eliminated all local `/images/products/...` file path usage across `src/lib/image-optimize.ts`, `src/lib/firebase/firestore-helpers.ts`, `src/pages/ProductDetails.tsx`, `src/lib/gmc-feed.ts`, `src/pages/Category.tsx`, `src/lib/services-catalog.ts`, `src/pages/admin/ProductManagement.tsx`, and live Firestore (`53/53` SKUs). Added `normalizeExternalImageUrl()` and `extractDirectImageUrls()` in `src/lib/image-optimize.ts` to strictly preserve user-provided direct external `https://` image URLs, automatically split accidentally concatenated URLs on a single line, convert Google Drive `/file/d/<ID>/view` share links to direct `https://lh3.googleusercontent.com/d/<ID>` image stream URLs, and never filter out or mutate frontend `<img>` URLs via `normalizeGmcImageUrl()`. Added a Bulk External Image URL Updater in `/admin/products` (`ProductManagement.tsx`) that synchronizes `images`, `image`, and `imageUrl` simultaneously in Firestore.
- **`[v4.4 - Google Search Console Zero-Error 1-Hop Canonical Normalizer, Zero-5xx SSR Guard & Site Recovery Ledger]`**: Mapped the 54th live Firestore product (`kl5wGaNLxqQByn3oPd1Z` $\rightarrow$ `podium-prompter-17-compact-pakistan` in `PRODUCT_GMC_METADATA` and `PRODUCT_ID_TO_SEO_SLUG`) and hardened `getCanonicalProductSlug()` so unmapped Firestore records derive a clean lowercase `-pakistan` slug from `productName` rather than leaking raw 20-char Firestore document IDs into `public/sitemap.xml`. Implemented `resolveSingleHopCanonicalTarget()` in `server.ts` to collapse trailing slashes, uppercase characters, tracking/sort/filter query parameters (`?sort=`, `?filter=`, `?utm_*`, `?fbclid=`, `?gclid=`), raw Firestore IDs, MPNs, unknown child slugs (`/product/*`, `/category/*`, `/brands/*`, `/services/*`, `/blog/*`), and multi-hop redirect chains (`/products/about/` $\rightarrow$ `/about`) into **1 single HTTP 301 jump**. Added deterministic fallback route metadata synthesis in `injectRouteSeoIntoHtml()` so no unmatched URL ever serves duplicate Homepage `<title>`, `<meta name="description">`, or `<div id="root">` HTML. Wrapped `vite.transformIndexHtml` and the Express error handler in a **Zero-5xx Fault-Tolerant Guard** that falls back to `200 OK` pre-rendered `seoHtml`. Updated `public/robots.txt` and added `rel="nofollow"` to Navbar `/cart` links to eliminate *"Blocked by robots.txt"*. Created `/SITE_CHANGE_LOG.md` and `/WEBSITE_STRUCTURE_BLUEPRINT.md` and integrated both into `/admin/blueprint-hub`.
- **`[v4.5 - 360-Degree Deep-Scan 30-Point Precision Remediation (CMS Hygiene, Zero-Unsplash GMC, Wave-1/Wave-2 Table Parity, 460+ Word Brand Hubs, Flesch-Kincaid Punctuation & Speakable AI SEO)]`**: Executed all 30 audit findings without compromising site speed or Core Web Vitals: (1) Filtered YouTube/Vimeo video URLs out of `normalizeExternalImageUrl()` and `normalizeGmcImageUrl()` while adding a zero-TBT click-to-load `youtube-nocookie.com` video player and `VideoObject` JSON-LD on `ProductDetails.tsx`; (2) Replaced all 7 remaining Unsplash product image URLs in `PRODUCT_GMC_METADATA` and Firestore with direct external product photos (`54/54` SKUs on direct external images); (3) Synchronized `podium-prompter-17-compact-pakistan` pricing (`Rs. 125,000` sale / `Rs. 150,000` regular), specifications, and direct Google Drive images across Firestore and `PRODUCT_GMC_METADATA`, and added `cleanRichTextHtml()` to strip `&nbsp;` chains and fix malformed markdown links; (4) Standardized all `FAQs.tsx` and `RoomDesigner.tsx` pricing to `PKR (Rs.)` and added client-side `<Breadcrumbs />` + Answer-First `<table>` matrices for 100% Wave-1 SSR to Wave-2 React CSR parity; (5) Expanded all 25 `/brands/:brandSlug` SSR hubs to `460+` words with `FAQPage` JSON-LD, added terminal periods to SSR table cells/list items for NLP sentence segmentation, generated `/public/llms.txt` alongside `/public/llms-full.txt`, and injected `SpeakableSpecification` JSON-LD across all indexable routes.
- **`[v4.6 - Interactive Hardware Flagship Showcase, PDF Brochure Plate Extraction & 6-Pillar Category Synchronization (/podium-teleprompter)]`**: When launching a rich bespoke hardware showcase page from client HTML + PDF collateral (`FoldFlatTeleprompter.tsx` at `/podium-teleprompter`), extract PDF reference slides via Ghostscript (`-r110 -dJPEGQ=82`) into lightweight static plates (`/public/images/teleprompter/slide-01.jpg`–`slide-11.jpg`), implement zero-dependency native SVG/CSS optical simulators and interactive PKR quote builders with direct cart integration, and synchronize across all 6 canonical pillars (`App.tsx` route + Mega-Menu + `<Navigate replace />` aliases, `Category.tsx` featured banners + `FALLBACK_PRODUCT_CATEGORIES`, `ProductDetails.tsx` SKU cross-link, `index.html` + `server.ts` Wave-1 SSR + 1-hop `301` redirects, `sitemap-generator.ts` + `HtmlSitemap.tsx`, and the 4 recovery ledgers) so Wave-1 SSR BFS crawl depth remains $\le 2$ clicks across all `157` canonical URLs.
- **`[v4.7 - Unified Custom Flagship Product Route Resolver (getProductHref) & 1-Hop SKU Consolidation]`**: When a live catalog SKU (`products/kl5wGaNLxqQByn3oPd1Z`, SKU `AV-PP-17C`, `"AV Live Fold-Flat Podium Teleprompter"`) is promoted to a dedicated flagship page (`/podium-teleprompter`), centralize URL resolution via `getProductHref(product, fallbackId)` + `PRODUCT_CUSTOM_PAGE_ROUTES` in `src/lib/gmc-feed.ts`, persist `customPagePath`, `categoryIds` (`['cat-video']`), and `categorySlugs` (`['video-conferencing', 'large-room', 'touch-panels', 'boardroom-codecs']`) in live Firestore, wire `getProductHref()` across all storefront cards/search/tables/sitemaps/SSR/GMC feeds, and consolidate legacy `/product/*` aliases into a single-hop `301` redirect to the flagship URL so Google Search Console sees zero duplicate product pages (`156` deduplicated canonical URLs).
- **`[v4.8 - Mobile Speed 98-100 Critical-Path Ratchet (Zero-Firebase/Zero-Motion Entry, <200KB Gzip Payload, Gzip Text Feeds & 156/156 Speakable)]`**: Never statically import `firebase/*`, `src/lib/firebase/*`, `motion/react`, or `sitemap-generator.ts` into the initial entry shell (`App.tsx`, `AuthContext.tsx`, `SettingsContext.tsx`, `Footer.tsx`, `Home.tsx`). Keep `Home` synchronous for `0ms` Frame-0 paint while lazy-loading Firebase Auth/Firestore after `3500–3800ms` on public routes (`0ms` immediate on `/admin*` and login triggers) and code-splitting non-Home routes + `FooterAccordion`, keeping total initial render-critical payload $\le 200\text{ KB}$ gzipped (`190.0 KB` verified, `-61%` vs `487.2 KB`). Compress `text/plain` and `text/tab-separated-values` feeds via Gzip in `server.ts`, serve WebP visual plates on bespoke showcase pages, and enforce `156/156` `SpeakableSpecification` coverage including `/` `#ssr-home-schema`.
- **`[v4.9 - Exact-Match Head-Keyword Flagship Hub Architecture (/video-conference) & Zero-Dependency Interactive Configurator]`**: When building a dedicated exact-match head-keyword pillar (`/video-conference`, `VideoConferenceHub.tsx`) alongside existing national/solution pages (`/video-conference-in-pakistan`, `/video-conferencing`, `/video-conferencing-solutions`), eliminate cannibalization by differentiating search intent (exact head-term protocol architecture + interactive PKR Room Configurator & live BoM), lazy-load the route via `React.lazy()` to preserve the `≤ 200 KB` gzipped initial homepage bundle, replace external CDN chart/CSS libraries with native interactive SVG graphics and compressed local WebP visuals (`/public/images/video-conference/*.webp` 65–106 KB + `1200x630` OpenGraph JPG), hydrate featured products synchronously from `PRODUCT_GMC_METADATA` via `buildFallbackProductFromGmcMeta` + `getProductHref`, and synchronize 1-click links across `App.tsx`, `index.html`, `server.ts`, `Footer.tsx`, `FooterAccordion.tsx`, `HtmlSitemap.tsx`, and `sitemap-generator.ts` (`157` canonical URLs).
- **`[v4.10 - Authentic Field-Deployment E-E-A-T Proof, Companies-Only Client Filtering & Primary Pillar Hierarchy Lock]`**: Keep `/video-conference-in-pakistan` locked as the #1 primary navigation target (`VIDEO CONFERENCE` top-level link and first `SERVICES` dropdown item) while `/video-conference` serves as the #2 interactive Room Configurator & Protocol Architecture hub. Neutralize competitor installation-gallery moats (`nasco-av.com`, `accsys.pk`, `videoconference.pk`) by converting real on-site deployment photos into `<100 KB` WebP plates (`/public/images/projects/*.webp`), pairing them with self-hosted brand-mark cards and a strictly sanitized **Companies-Only** institutional roster (`RealProjectsAndClients.tsx` — zero individual person names, zero CRM autocomplete fragments), lazy-loading on `/` (`Home.tsx`) to preserve the `≤ 200 KB` gzipped critical bundle, and mirroring flagship client names (Nestlé, World Bank, ADB, AkzoNobel, Lucky Core / ICI, Berger Paints, Jazz, Allied Bank, CitiBank, Deutsche Bank, OGDCL, LUMS, PSHD/HISDU, Punjab Food Authority, Adamjee Insurance) in `server.ts` Wave-1 SSR snapshots.
- **`[v4.11 - 23-Photo / 1,000+ Events Field Archive, Competitor Watermark Screening, GS1 Modulo-10 GTIN Verification & GSC Dual-Wave JSON-LD Deduplication]`**: Visually inspect all uploaded field photographs to screen out any third-party competitor watermarks before converting into `<115 KB` WebP assets (`/public/images/projects/*.webp`, 23 verified deployments across Meta, World Bank Group, USAID, NIMA & Pakistan Navy, WAPDA, Novo Nordisk, Servier, Ferozsons, JazzCash, PSG, HISDU/PSHD, and VISSONIC council rooms). To prevent all Google Search Console Merchant Listing critical and non-critical structured data errors (`Missing field "image"`, `Missing field "description"`, `Missing field "hasMerchantReturnPolicy"`, `Missing field "shippingDetails"`, `Missing field "validFrom"`, `Duplicate field "brand"`, `Review has multiple aggregate ratings`, and `Invalid GTIN`), always include `"image": [absImg]`, `"description"`, `"offers.validFrom"`, `"offers.shippingDetails"`, and `"offers.hasMerchantReturnPolicy"` on every nested `"@type": "Product"` inside `ItemList` schemas (`Category.tsx`, `Shop.tsx`), remove Wave-1 `#ssr-route-schema` / `#ssr-home-schema` inside `SEO.tsx` `useEffect` upon Wave-2 hydration so Google WRS never merges two JSON-LD graphs sharing `@id: "#product"`, and validate every 12/13/14-digit GTIN in `PRODUCT_GMC_METADATA` against the GS1 modulo-10 check-digit formula.







