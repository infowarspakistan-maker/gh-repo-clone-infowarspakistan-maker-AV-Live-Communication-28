# AV Live Classified Systems Modification Policy

This document defines the strict software modification policies that all AI Coding Agents must adhere to when updating, maintaining, or extending any system already in place and working within the AV Live Classified Workspace.

## Core Rules for Modifying Active Systems

### 1. Mandatory Read-Before-Write (No Assumptions)
- **Rule**: Never overwrite or replace any existing file without fully reading it first.
- **Goal**: Prevent regression and loss of custom features, hooks, states, or styles that have been integrated in previous steps.

### 2. Backward Compatibility & Preservation of State
- **Rule**: Ensure that all preexisting entity models, form inputs, database fields, or component properties (such as Active Status, Featured configuration, and custom rich text fields) are preserved.
- **Goal**: No functionality, field, or UI element should be "lost" or deleted unless explicitly requested by the user.

### 3. Iterative, Surgical Updates
- **Rule**: Prefer smaller, surgical code edits over complete file replacement. Use targeting edits (`edit_file` or `multi_edit_file`) rather than recreating the file (`create_file` with `Overwrite: true`) unless building a brand-new component from scratch.
- **Goal**: Minimize risks of compilation or integration errors on a complex live system.

### 4. Verification Workflow
- **Rule**: After making any changes, the agent must run the linter (`lint_applet`) and verify build success (`compile_applet`) before concluding.
- **Goal**: Maintain 100% up-time on dev environments.

## 5. Google Search Console, Canonical URL & Technical SEO Policy

All AI Coding Agents modifying routes, components, products, categories, services, or sitemaps MUST strictly enforce the following Google Search Console (GSC) indexing rules:

### 5.1 Single Self-Referencing Canonical Tag (`data-rh="true"`)
- **Rule**: Every indexable page MUST render a `<SEO url="https://avlive.com.pk/..." />` component whose `url` prop matches the exact canonical route path defined in `src/App.tsx` (without query parameters or trailing slashes). Static head tags in `index.html` and `server.ts` MUST retain `data-rh="true"` so `react-helmet-async` replaces rather than duplicates `<link rel="canonical">`.
- **Goal**: Prevent Google Search Console *"Duplicate without user-selected canonical"* and *"Alternate page with proper canonical tag"* errors.

### 5.2 Zero Empty-State / Loading-Spinner Soft 404s
- **Rule**: Never gate `<SEO />` or primary page content behind an asynchronous `if (loading) return <Loader2 />` state when synchronous catalog fallback data exists (`buildFallbackProductFromGmcMeta` in `src/lib/gmc-feed.ts`, `FALLBACK_PRODUCT_CATEGORIES` in `src/pages/Category.tsx`, and `FALLBACK_SERVICES_CATALOG` in `src/lib/services-catalog.ts`). Category, Brand, Product, and Service pages must ALWAYS render rich fallback hardware/service content immediately on the first render frame.
- **Goal**: Prevent Google Web Rendering Service (WRS) from snapshotting blank spinners or *"0 Products Found"* screens as *"Soft 404"* or *"Duplicate without user-selected canonical"*.

### 5.3 Canonical Slugs Only (No Raw Firestore IDs, MPNs, or Query Links)
- **Rule**: All internal product links (`<Link to={...}>`) and sitemap generators MUST resolve product slugs via `getCanonicalProductSlug(product, product.id)` (e.g., `/product/polycom-realpresence-group-500-pakistan`), NEVER raw Firestore document IDs (`/product/T1XLMubVYmFzeIfC7V9B`) or raw MPNs (`/product/9137161U`). Brand links must use `/brands/:brandSlug` (never `/shop?brand=...`), and subcategory links must use `/category/:subSlug` (never `/category/:slug?sub=...`).
- **Goal**: Eliminate duplicate URL discovery, *"Page with redirect"* warnings, and 5xx/404 crawl errors.

### 5.4 Route, SSR Metadata, Sitemap & Blueprint Synchronization
- **Rule**: Whenever a new `<Link to="/...">`, product, category, service, blog guide, or landing page is added or modified anywhere in the UI:
  1. Register its `<Route>` in `src/App.tsx`.
  2. Add its fallback data to `src/pages/Category.tsx`, `src/lib/services-catalog.ts`, `src/lib/sitemap-generator.ts`, or `src/lib/gmc-feed.ts`.
  3. Register its server-side metadata, JSON-LD `schema`, and `<div id="root">` SSR snapshot in `injectRouteSeoIntoHtml()` in `server.ts`.
  4. Regenerate `public/sitemap.xml` and `public/llms-full.txt` via `npx tsx scripts/generate-sitemap.ts`.
  5. Update the Website Blueprint in `README.md` and the Living SEO Progress Ledger in `seo-policy.md` so no SEO or architectural progress is lost across sessions.
  6. If renaming or retiring any existing URL path, add a permanent `301` redirect in `server.ts` (`legacyDirectRedirects`) AND a `<Navigate replace />` route in `src/App.tsx`.
- **Goal**: Guarantee 100% HTTP 200 canonical resolution, first-wave SSR parity, and zero documentation drift across every internal link and sitemap entry.

### 5.5 Answer Engine Optimization (AEO / GEO) & Full Schema Standard
- **Rule**: Every indexable public page MUST include:
  1. A dedicated JSON-LD `schema` prop on `<SEO />` (`Product`, `Service`, `BlogPosting` + `FAQPage`, `CollectionPage` + `ItemList`, `WebApplication`, or `MerchantReturnPolicy`) mirrored in `server.ts`.
  2. An Answer-First direct verdict summary (50–70 words) and semantic HTML `<table>` for specifications/pricing on Product, Category, Brand, Service, and Blog pages.
- **Goal**: Maximize citations in Google AI Overviews, Featured Snippets, ChatGPT Search, Perplexity, and Google Merchant Center.

## 6. Google Lighthouse 100/100/100/100, Mobile Ergonomics & Flat 2-Click Site Structure Policy

### 6.1 Core Web Vitals & DOM Budget (`Performance = 100`)
- **Rule**: Maintain $\text{LCP} \le 1.8\text{s}$, $\text{TBT} \le 50\text{ms}$, $\text{INP} \le 100\text{ms}$, and $\text{CLS} = 0.000$.
  - Use `optimizeGalleryImageUrl(url, 480, 75)` for catalog images, explicit `width`/`height` + `aspect-ratio` on all images, `fetchPriority="high"` + `loading="eager"` strictly on the first 1–2 viewport images, hover-only mounting for 2nd product gallery images (`hoveredProductId`), and `IntersectionObserver` 16-card DOM batching ($<800$ DOM nodes).
  - Keep compact `16:6` hero containers on Services, Service Detail, and Keyword Pillar pages, and maintain the `54px` mobile sticky header with a full-width live search dropdown (`top-[54px] left-0 right-0`).

### 6.2 WCAG 2.2 AA Accessibility, Best Practices & $\le 2$-Click Crawl Depth
- **Rule**: Maintain 100/100 Accessibility and Best Practices:
  - Enforce a single `<h1>` per route, sequential `<h2>`->`<h3>` hierarchy, $\ge 4.5:1$ contrast, $\ge 44\times44\text{px}$ touch targets, and explicit `aria-label` attributes on icon buttons.
  - Keep `@firebase/firestore` configured with `experimentalAutoDetectLongPolling: true` and `setLogLevel('silent')` so idle gRPC stream resets never log console errors.
  - Ensure 100% of canonical URLs in `public/sitemap.xml` remain reachable within $\le 2$ clicks via the Header Mega-Menu, Siloed Footer, Breadcrumbs, and `/sitemap` (`src/pages/HtmlSitemap.tsx`).

## 7. 4-Gate Monotonic Self-Updating Skill Protocol ("Updates Itself Without Losing Skills")

- **Rule**: Whenever a new ranking strategy, competitor counter-move, Lighthouse optimization, or route/catalog entity is implemented:
  1. **Read First**: Read `skills/apex-seo-aeo-engine/SKILL.md` and `seo-policy.md` before making changes.
  2. **Append-Only Learning**: Append the newly learned rule or route milestone to `skills/apex-seo-aeo-engine/SKILL.md` (Section 9: Learned Rules Ledger) and `seo-policy.md` without deleting or truncating any existing rules.
  3. **Executable Audit Ratchet**: Run `npx tsx scripts/generate-sitemap.ts`, `npx tsx scripts/seo-silo-audit.ts`, `npm run lint`, and `npm run build` to guarantee zero regressions across all 156+ canonical URLs.
  4. **Reference Blueprints**: Full architectural documentation resides in `docs/WEBSITE_BUILDING_MECHANISM_REPORT.md`, `docs/AI_AGENT_PROFILES_COMPLETE.md`, and `NICHE_WEBSITE_BLUEPRINT.md` (and interactively at `/admin/blueprint-hub`).
