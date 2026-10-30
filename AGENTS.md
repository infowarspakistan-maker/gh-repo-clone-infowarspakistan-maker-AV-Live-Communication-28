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

### 5.4 Route, SSR Metadata & Sitemap Synchronization
- **Rule**: Whenever a new `<Link to="/...">`, category, service, or landing page is added anywhere in the UI:
  1. Register its `<Route>` in `src/App.tsx`.
  2. Add its fallback data to `src/pages/Category.tsx`, `src/lib/services-catalog.ts`, or `src/lib/gmc-feed.ts`.
  3. Register its server-side metadata in `injectRouteSeoIntoHtml()` in `server.ts`.
  4. Include its canonical URL in both `server.ts` (`/sitemap.xml`) and `scripts/generate-sitemap.ts`.
  5. If renaming or retiring any existing URL path, add a permanent `301` redirect in `server.ts` (`legacyDirectRedirects`) AND a `<Navigate replace />` route in `src/App.tsx`.
- **Goal**: Guarantee 100% HTTP 200 canonical resolution across every internal link and sitemap entry.

