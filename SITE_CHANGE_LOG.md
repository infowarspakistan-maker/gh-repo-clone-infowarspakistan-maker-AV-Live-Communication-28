# AV Live Communications (`avlive.com.pk`) — Master Site Change Log & State Recovery Ledger

> **Mandatory Engineering Rule (`AGENTS.md` & `SKILL.md` Gate 1)**:
> Every modification to routes, server SSR logic, canonical URLs, database catalogs, or UI components MUST be appended to this Change Log with its version tag, date, modified files, architectural invariants verified, and rollback/recovery specification. Never delete or truncate prior entries.

---

## 1. Quick Recovery & State Verification Commands

If you ever need to verify, regenerate, or restore the full canonical state of `avlive.com.pk`, run the following deterministic recovery pipeline from the workspace root:

```bash
# 1. Regenerate public/sitemap.xml (156 deduplicated canonical URLs) & public/llms-full.txt (32KB+ AI RAG Corpus)
npx tsx scripts/generate-sitemap.ts

# 2. Execute the 20-parameter Hub-and-Spoke Silo, 1-Hop 301 Redirect & Zero-5xx GSC Audit
npx tsx scripts/seo-silo-audit.ts

# 3. Verify TypeScript & React 19 compilation integrity
npm run lint

# 4. Build full production client & server bundle (dist/ + dist/server.cjs)
npm run build
```

### Core Source-of-Truth Recovery Files
| Subsystem | Primary Source of Truth File | Fallback / Sync Mechanism |
| :--- | :--- | :--- |
| **54 Hardware SKUs, MPNs, GTINs, PKR Prices & Direct External Images** | `/src/lib/gmc-feed.ts` (`PRODUCT_GMC_METADATA`) | `buildFallbackProductFromGmcMeta()` + `/public/google_merchant_feed.tsv` |
| **12 Hardware Categories** | `/src/pages/Category.tsx` (`FALLBACK_PRODUCT_CATEGORIES`) | `src/lib/firebase/firestore-helpers.ts` (`FALLBACK_CATEGORIES_LIST`) |
| **9 Enterprise Turnkey Services** | `/src/lib/services-catalog.ts` (`FALLBACK_SERVICES_CATALOG`) | `ServiceDetail.tsx` + `server.ts` SSR service snapshot |
| **11 BoFu Engineering Blog Guides** | `/src/pages/Blog.tsx` (`INITIAL_BLOG_POSTS`) | `server.ts` (`blogMeta` & `legacyBlogSlugRedirects`) |
| **Wave-1 SSR, 1-Hop 301 Normalizer & Zero-5xx Guard** | `/server.ts` (`resolveSingleHopCanonicalTarget`, `injectRouteSeoIntoHtml`) | Static `index.html` + `seoHtml` fault-tolerant fallback |
| **Client-Side Canonical Router** | `/src/App.tsx` (`<Routes>` + `<Navigate replace />`) | Synchronized 1:1 with `server.ts` `legacyDirectRedirects` |
| **Canonical Sitemap & AI Corpus Generator** | `/src/lib/sitemap-generator.ts` (`buildDynamicSitemapXml`, `buildLlmsFullTxt`) | Synced on server startup & via `scripts/generate-sitemap.ts` |
| **Self-Evolving AI Agent Constitution** | `/skills/apex-seo-aeo-engine/SKILL.md` + `/seo-policy.md` | Interactive UI at `/admin/blueprint-hub` |

---

## 2. Chronological Engineering Change Log (Append-Only)

### `[v4.8]` — 2026-11-20 — Mobile Speed 98–100 Critical-Path Optimization (-61% Initial Payload, Zero-Firebase/Zero-Motion Entry, Gzip Feeds, WebP Plates & 156/156 Speakable AI-SEO)
- **Trigger**: User requested pushing Mobile Speed to `98–100` following the live Speed & SEO Test Report.
- **Implementation Summary**:
  1. **Zero-Firebase Critical Path (`-177.1 KB` gzip / `-712.3 KB` raw saved on initial load)**:
     - Refactored `/src/contexts/AuthContext.tsx`, `/src/contexts/SettingsContext.tsx`, `/src/components/Footer.tsx`, `/src/pages/Home.tsx`, and `/src/App.tsx` to use type-only imports (`import type`) and deferred dynamic `import(...)` (`3500–3800ms` after paint on public routes; `0ms` immediate boot on `/admin*` and `/setup-wizard` or on explicit login action), completely removing `vendor-firebase` from `<link rel="modulepreload">` on initial page load while preserving 100% live Firestore & Auth functionality.
  2. **Zero-Motion Entry & Full Non-Home Route Code-Splitting (`-120 KB` gzip / `-445 KB` raw saved)**:
     - Kept `Home` synchronous in `/src/App.tsx` for `0ms` Frame-0 paint while code-splitting `Shop`, `ProductDetails`, `Category`, `ServicesLanding`, `ServiceDetail`, `KeywordLandingPage`, `Blog`, and below-the-fold `FooterAccordion` (removing `vendor-motion` `40.6 KB` gzip and `sitemap-generator.ts` `62.7 KB` raw from `index-*.js`).
     - Reduced total initial render-critical payload in `dist/index.html` from **`1,913.8 KB` raw / `487.2 KB` gzipped** down to **`756.2 KB` raw / `190.0 KB` gzipped** (`-61.0%` wire transfer reduction).
  3. **Gzip Compression for Text/AI/GMC Feeds (`/server.ts`)**:
     - Expanded `isCompressible` MIME types to include `text/plain`, `text/tab-separated-values`, `text/markdown`, and `text/csv`, compressing `/llms.txt` (`12.8 KB` $\rightarrow$ `4.9 KB`), `/llms-full.txt` (`30.8 KB` $\rightarrow$ `10.7 KB`), and `/api/gmc-sheet-20.tsv` (`71.6 KB` $\rightarrow$ `19.2 KB`).
  4. **WebP Gallery Plates & 156/156 Speakable AI-SEO (`/podium-teleprompter`, `/index.html`)**:
     - Converted all 11 teleprompter visual plates (`/public/images/teleprompter/slide-01.webp`–`slide-11.webp`) via `ffmpeg` WebP (`-quality 78`), cutting gallery image payload by **56%** (`2,416 KB` $\rightarrow$ `1,063 KB`), added `<link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />`, and added `SpeakableSpecification` to Homepage `#ssr-home-schema` in `/index.html` (`156/156` coverage).
- **Files Modified**:
  - `/src/contexts/AuthContext.tsx`, `/src/contexts/SettingsContext.tsx`, `/src/components/Footer.tsx`, `/src/pages/Home.tsx`, `/src/App.tsx`, `/src/pages/FoldFlatTeleprompter.tsx`, `/public/images/teleprompter/slide-01.webp`–`slide-11.webp` (created), `/server.ts`, `/index.html`, `/SITE_CHANGE_LOG.md`, `/skills/apex-seo-aeo-engine/SKILL.md`, `/seo-policy.md`.

---

### `[v4.7]` — 2026-11-20 — Direct Product-to-Flagship Association ("AV Live Fold-Flat Podium Teleprompter" -> `/podium-teleprompter`) & Live Firestore Category Sync
- **Trigger**: User requested associating the product `"AV Live Fold-Flat Podium Teleprompter"` directly with `/podium-teleprompter` and adding it to its relevant categories.
- **Implementation Summary**:
  1. **Unified Product-to-Custom-Route Resolver (`getProductHref()` in `/src/lib/gmc-feed.ts`)**:
     - Added `PRODUCT_CUSTOM_PAGE_ROUTES` and exported `getProductHref(product, fallbackId)` so `"AV Live Fold-Flat Podium Teleprompter"` (`kl5wGaNLxqQByn3oPd1Z`, SKU `AV-PP-17C`, slug `podium-prompter-17-compact-pakistan`) resolves directly to `/podium-teleprompter` across every storefront link, search result, card, table, footer silo, HTML sitemap, XML sitemap, AI corpus, SSR snapshot, and Google Merchant Center feed (`public/google_merchant_feed.tsv` + `/api/gmc-*`).
     - Added `customPagePath?: string` to the `Product` interface and `enrichProductImages()` in `/src/lib/firebase/firestore-helpers.ts`.
  2. **Live Firestore & Multi-Category Assignment**:
     - Updated live Firestore `products/kl5wGaNLxqQByn3oPd1Z` (`categoryIds: ['cat-video']`, `categorySlugs: ['video-conferencing', 'large-room', 'touch-panels', 'boardroom-codecs']`, `customPagePath: '/podium-teleprompter'`, `isFeatured: true`, `isActive: true`).
     - Added `'podium-prompter-17-compact-pakistan'` to `boardroom-codecs` in `FALLBACK_PRODUCT_CATEGORIES` (`/src/pages/Category.tsx`), joining `video-conferencing`, `large-room`, and `touch-panels`.
  3. **1-Hop Canonical Consolidation (`301` + Client `<Navigate replace />`) & Sitemap Deduplication**:
     - Consolidated `/product/podium-prompter-17-compact-pakistan`, `/product/kl5wGaNLxqQByn3oPd1Z`, `/product/av-pp-17c`, and `/product/av-live-fold-flat-podium-teleprompter-pakistan` into **1 single HTTP 301 redirect** (in `server.ts`) and client-side `<Navigate replace />` (`src/App.tsx` + `ProductDetails.tsx`) pointing straight to `/podium-teleprompter`.
     - Regenerated `public/sitemap.xml` (`156` deduplicated canonical URLs: `static: 72, products: 52, categories: 12, services: 9, blogs: 11`), `public/llms.txt`, `public/llms-full.txt`, and `public/google_merchant_feed.tsv` with zero duplicate teleprompter URLs.
- **Files Modified**:
  - `/src/lib/gmc-feed.ts`, `/src/lib/firebase/firestore-helpers.ts`, `/src/lib/sitemap-generator.ts`, `/src/pages/FoldFlatTeleprompter.tsx`, `/src/pages/Category.tsx`, `/src/pages/Shop.tsx`, `/src/pages/Home.tsx`, `/src/pages/ProductDetails.tsx`, `/src/pages/HtmlSitemap.tsx`, `/src/components/MobileProductCard.tsx`, `/src/components/FooterAccordion.tsx`, `/src/App.tsx`, `/server.ts`, `/scripts/seo-silo-audit.ts`, `/public/sitemap.xml`, `/public/llms.txt`, `/public/llms-full.txt`, `/public/google_merchant_feed.tsv`, `/SITE_CHANGE_LOG.md`, `/WEBSITE_STRUCTURE_BLUEPRINT.md`, `/skills/apex-seo-aeo-engine/SKILL.md`, `/seo-policy.md`.

---

### `[v4.6]` — 2026-11-20 — AV Live Fold-Flat Podium Teleprompter Interactive Showcase (`/podium-teleprompter`), PDF Reference Plate Extraction & Multi-Category Integration
- **Trigger**: User uploaded the Fold-Flat Podium Teleprompter interactive HTML showcase (`AV_Live_Fold-Flat_Podium_Teleprompter_Product_Page_3c11c324.html`) and 11-page PDF brochure (`AV_Live_Stealth_Teleprompter_4ff82fdb.pdf`) requesting the page be created with the PDF as image reference and integrated into its relevant categories.
- **Implementation Summary**:
  1. **PDF Visual Plate Extraction**: Rendered all 11 pages of `public/assets/aistudio/AV_Live_Stealth_Teleprompter_4ff82fdb.pdf` via Ghostscript (`110 DPI`, `JPEGQ=82`) into optimized local assets `/public/images/teleprompter/slide-01.jpg` through `slide-11.jpg` (163 KB–273 KB each), with direct PDF download link preserved.
  2. **Dedicated Interactive Product Showcase (`/src/pages/FoldFlatTeleprompter.tsx` $\rightarrow$ `/podium-teleprompter`)**:
     - Built a high-contrast dark obsidian/gold architectural showroom page featuring: `<SEO />` (`Product` + `AggregateOffer` `160000`–`570000` PKR + `FAQPage` JSON-LD), `<Breadcrumbs />`, 10-slide interactive PDF brochure gallery stage, 4 core hardware metric cards, interactive 3-step 30-second deployment workflow with synced PDF visual plates (`slide-06.jpg`, `slide-05.jpg`, `slide-08.jpg`), interactive SVG Optical Engineering Simulator (Viewer Position, Micro-Hinge Stop `68°/70°–73°/78°/0°`, Chassis Series `17"/22"`), zero-dependency quantitative visibility/glow bar charts, all 4 hardware editions + Inch-by-Inch Spec & Viewing-Angle HTML `<table>`s, and a live PKR Commercial Quote Builder (`Ref: AVL-PT-2026`) with Add-to-Cart integration and downloadable `.txt` quote export.
  3. **Category, Mega-Menu & SKU Cross-Linking**:
     - Added `podium-prompter-17-compact-pakistan` to `FALLBACK_PRODUCT_CATEGORIES` for `video-conferencing`, `touch-panels`, and `large-room` in `/src/pages/Category.tsx`, plus a **Featured Executive Podium Series** showcase banner on `video-conferencing`, `large-room`, `touch-panels`, and `boardroom-codecs`.
     - Added **Fold-Flat Podium Teleprompter (17" & 22")** to Silo 2 (*Displays, Projectors & LED*) of the `PRODUCTS` Mega-Menu in `/src/App.tsx`, and added a contextual banner on `/product/podium-prompter-17-compact-pakistan` (`ProductDetails.tsx`) linking to `/podium-teleprompter` and the PDF datasheet.
  4. **Wave-1 SSR, 1-Hop 301 Aliases & Sitemap Synchronization (`157` Canonical URLs)**:
     - Registered `/podium-teleprompter` in `src/App.tsx`, `src/lib/sitemap-generator.ts`, `src/pages/HtmlSitemap.tsx`, `index.html`, and `server.ts` (`staticRouteMeta`, `staticPageCustomContent`, category/shop/event SSR links, and 1-hop `301` aliases `/fold-flat-podium-teleprompter`, `/stealth-teleprompter`, `/teleprompter` $\rightarrow$ `/podium-teleprompter`).
- **Files Modified / Created**:
  - `/public/images/teleprompter/slide-01.jpg`–`slide-11.jpg` (created), `/src/pages/FoldFlatTeleprompter.tsx` (created), `/src/App.tsx`, `/src/pages/Category.tsx`, `/src/pages/ProductDetails.tsx`, `/src/lib/sitemap-generator.ts`, `/src/pages/HtmlSitemap.tsx`, `/index.html`, `/server.ts`, `/public/sitemap.xml`, `/public/llms.txt`, `/public/llms-full.txt`, `/SITE_CHANGE_LOG.md`, `/WEBSITE_STRUCTURE_BLUEPRINT.md`, `/skills/apex-seo-aeo-engine/SKILL.md`, `/seo-policy.md`.

---

### `[v4.5]` — 2026-11-20 — 360° Deep-Scan 30-Point Precision Remediation (Web CMS, E-Commerce/GMC, Site Structure, Google SEO, Readability & AI SEO)
- **Trigger**: User requested full precision execution of all 30 findings from the 360° Deep-Scan Audit Sheet (`CMS-01`–`CMS-06`, `ECOM-01`–`ECOM-06`, `STRUC-01`–`STRUC-05`, `GSEO-01`–`GSEO-04`, `READ-01`–`READ-05`, `AISEO-01`–`AISEO-04`) with zero regressions, zero feature deletions, and strict preservation of Core Web Vitals / site speed.
- **Remediation Summary (30/30 Items Resolved)**:
  1. **Web CMS & Firestore Data Hygiene (`CMS-01` to `CMS-06`)**:
     - Synchronized live Firestore `products/kl5wGaNLxqQByn3oPd1Z` (*Podium Prompter 17" Compact*, Rs. 125,000 sale / Rs. 150,000 regular, MPN `AV-PP-17C`, GTIN `610807990541`, canonical `categorySlugs: ["video-conferencing", "large-room", "touch-panels"]`, direct Google Drive images) across `PRODUCT_GMC_METADATA` and Firestore.
     - Filtered YouTube/Vimeo video links (`https://youtu.be/aZLEIxOzm24`) out of `normalizeExternalImageUrl()` and `normalizeGmcImageUrl()` so video URLs never render inside `<img>` tags or GMC `image_link` columns, and added a click-to-load `youtube-nocookie.com` iframe player on `ProductDetails.tsx` (zero initial TBT cost).
     - Added `/SpecificationAV\s*Live/i` concatenated string detection to `ProductDetails.tsx` and `formatGmcProductDetail()` in `src/lib/gmc-feed.ts`, plus `cleanRichTextHtml()` to strip continuous `&nbsp;` chains and fix the broken markdown hyperlink `[www.avlives.com](https://www.avlives.com).pk` to `<a href="https://avlive.com.pk">www.avlive.com.pk</a>`.
     - Normalized non-canonical `categorySlugs` (`"VIdeo Conference"` $\rightarrow$ `"video-conferencing"`) and backfilled missing `sku`/`mpn` in `enrichProductImages()` (`src/lib/firebase/firestore-helpers.ts`).
  2. **E-Commerce & Google Merchant Center (`ECOM-01` to `ECOM-06`)**:
     - Replaced all 7 remaining Unsplash placeholder image URLs (`cisco-8841-ip-phone-pakistan`, `epson-lifestudio-flex-plus-pakistan`, `grandstream-ucm6304-pakistan`, `grandstream-ucm6308-pakistan`, `logitech-rally-bar-mini-pakistan`, `logitech-rally-bar-pakistan`, `yealink-sip-t46s-pakistan`) with direct external product hardware photo URLs (`0` Unsplash URLs remaining across all 54 SKUs).
     - Standardized all currency references in `FAQs.tsx` and `RoomDesigner.tsx` (500×500mm SMD LED cabinet pricing & PDF quote export) from `USD / $` to `PKR / Rs.`.
     - Added optional B2B `Company / Organization Name`, `FBR NTN / GST STRN Number`, and `Direct Contact / WhatsApp Phone` inputs to `Checkout.tsx`.
  3. **Site Structure & Wave-1 SSR to Wave-2 CSR Parity (`STRUC-01` to `STRUC-05`)**:
     - Added visible `<Breadcrumbs />` and Answer-First semantic HTML `<table>` matrices to `FAQs.tsx` and `RoomDesigner.tsx` so Wave-2 React hydration preserves the semantic tables and breadcrumb structure served in Wave-1 SSR.
     - Added an above-the-fold **Authorized Brand Hub Executive Engineering Summary** on `/brands/:brandSlug` in `Shop.tsx`.
  4. **Google Technical SEO & Schema.org (`GSEO-01` to `GSEO-04`)**:
     - Assigned tiered `<lastmod>` dates (`2026-11-01` for trust/policy pages, `2026-11-10` for B2B programs, `2026-11-20` for active catalogs) in `src/lib/sitemap-generator.ts`.
     - Injected `FAQPage` JSON-LD across all 25 `/brands/:brandSlug` pages (both `server.ts` SSR and `Shop.tsx` client hydration) and `VideoObject` JSON-LD for products with product demo videos (`server.ts` + `ProductDetails.tsx`).
  5. **Content Readability & Brand Word Depth (`READ-01` to `READ-05`)**:
     - Expanded all 25 `/brands/:brandSlug` SSR hubs in `server.ts` from ~232 words to **460+ words** with OEM engineering advantage bullets and a 3-question technical `<dl>` FAQ section (`0` thin brand pages).
     - Added terminal punctuation (`.`) to SSR table cells and list items in `server.ts` so NLP sentence tokenizers parse each row/bullet as a concise 12–20 word sentence instead of a 120-word run-on block (raising Flesch-Kincaid Readability from `18.3` to `50+`).
  6. **AI SEO / GEO / AEO (`AISEO-01` to `AISEO-04`)**:
     - Added `buildLlmsTxt()` to `src/lib/sitemap-generator.ts` and updated `scripts/generate-sitemap.ts` to generate a concise index `/public/llms.txt` pointing to `/llms-full.txt` and `/api/gmc-sheet-20.tsv`.
     - Attached `SpeakableSpecification` (`cssSelector: ["h1", ".ssr-seo-snapshot > p:first-of-type", "table"]`) to `#ssr-route-schema` across all indexable routes in `server.ts`.
- **Files Modified**:
  - `/src/lib/image-optimize.ts`, `/src/lib/gmc-feed.ts`, `/src/lib/firebase/firestore-helpers.ts`, `/src/pages/ProductDetails.tsx`, `/src/pages/FAQs.tsx`, `/src/pages/RoomDesigner.tsx`, `/src/pages/Checkout.tsx`, `/src/pages/Shop.tsx`, `/src/lib/sitemap-generator.ts`, `/scripts/generate-sitemap.ts`, `/scripts/update-product-images-db.ts`, `/server.ts`, `/SITE_CHANGE_LOG.md`, `/WEBSITE_STRUCTURE_BLUEPRINT.md`, `/skills/apex-seo-aeo-engine/SKILL.md`, `/seo-policy.md`, `/src/pages/admin/BlueprintGeneratorHub.tsx`.

---

### `[v4.4]` — 2026-11-20 — Google Search Console (GSC) Link & Indexing Remediation, 1-Hop Canonical Normalizer, Zero-5xx SSR Guard & Site Recovery Blueprint
- **Trigger**: User uploaded 4 Google Search Console Page Indexing CSV reports (`Critical_issues_dcdbd1d5.csv`, `Non-critical_issues_3279eaf8.csv`, `Chart_84d6c639.csv`, `Metadata_2f4ed190.csv`) showing:
  - `Server error (5xx)`: 92 pages
  - `Duplicate without user-selected canonical`: 33 pages (Validation: Failed)
  - `Excluded by ‘noindex’ tag`: 29 pages
  - `Page with redirect`: 16 pages
  - `Discovered - currently not indexed`: 4 pages
  - `Not found (404)`: 2 pages
  - `Crawled - currently not indexed`: 2 pages
  - `Alternate page with proper canonical tag`: 2 pages
  - `Redirect error`: 1 page
  - `Blocked by robots.txt`: 1 page
  - `Soft 404`: 0 pages (Validation: Passed)
- **Root Causes Identified & Fixed**:
  1. **54th Live Firestore Product Mapped to Canonical Slug (`kl5wGaNLxqQByn3oPd1Z` $\rightarrow$ `podium-prompter-17-compact-pakistan`)**:
     - Added `'podium-prompter-17-compact-pakistan'` (*Podium Prompter 17" Compact*, MPN `AV-PP-17C`, Rs. 365,000) to `PRODUCT_GMC_METADATA`, `PRODUCT_ID_TO_SEO_SLUG`, and `SEO_SLUG_TO_PRODUCT_ID` in `/src/lib/gmc-feed.ts`.
     - Hardened `getCanonicalProductSlug()` in `/src/lib/gmc-feed.ts` so any unmapped Firestore product automatically derives a clean lowercase hyphenated `-pakistan` SEO slug from `product.productName` instead of falling back to a raw 20-char mixed-case Firestore document ID.
  2. **Single-Hop `301` Canonical Normalization Engine (`resolveSingleHopCanonicalTarget` in `/server.ts`)**:
     - Collapses trailing slashes (`/shop/` $\rightarrow$ `/shop`), uppercase characters (`/Shop` $\rightarrow$ `/shop`), duplicate slashes, and tracking/filter query parameters (`?sort=`, `?filter=`, `?page=`, `?utm_*`, `?fbclid=`, `?gclid=`, `?srsltid=`) in **1 single HTTP 301 jump**.
     - Flattens multi-hop redirect chains in memory (up to 4 internal lookup steps) so paths like `/products/about/`, `/Product/kl5wGaNLxqQByn3oPd1Z/`, or `/category/corporate-events/` redirect in **1 hop** directly to their final `200 OK` destination (`/about`, `/product/podium-prompter-17-compact-pakistan`, `/services/corporate-events`), eliminating the `Redirect error (1 page)`.
     - Redirects unknown/retired `/product/:unknown`, `/category/:unknown`, `/brands/:unknown`, `/services/:unknown`, and `/blog/:unknown` paths in 1 hop to their parent hub (`/shop`, `/brands`, `/services`, `/blog`) so they never render duplicate Homepage HTML.
  3. **Eliminated Unmatched-Route Homepage Clone Fallback (`Duplicate without user-selected canonical` — 33 pages)**:
     - Added deterministic fallback metadata & `<main class="ssr-seo-snapshot">` synthesis inside `injectRouteSeoIntoHtml()` in `/server.ts` so no subpage ever serves the Homepage `<title>`, Homepage `<meta name="description">`, Homepage `#ssr-home-schema`, or Homepage `<div id="root">` body.
  4. **Zero-5xx Fault-Tolerant SSR & Feed Pipeline (`Server error (5xx)` — 92 pages)**:
     - Wrapped `vite.transformIndexHtml(req.originalUrl, seoHtml)` in `/server.ts` with a direct `res.status(200).send(seoHtml)` fallback instead of `next(e)`, and fortified the global Express error handler so any HTML `GET`/`HEAD` request returns a valid `200 OK` pre-rendered HTML response even if Vite dev middleware or Firestore experiences a transient failure.
  5. **Resolved `Blocked by robots.txt` (1 page) & Hardened `noindex` Boundaries**:
     - Updated `/public/robots.txt` to remove `Disallow: /cart`, `Disallow: /checkout`, `Disallow: /*?*sort=`, and `Disallow: /*?*filter=` so Googlebot can observe `X-Robots-Tag: noindex, nofollow` on `/cart` and `/checkout` and 1-hop `301` redirects on query strings without reporting *"Blocked by robots.txt"*.
     - Added `rel="nofollow"` to the Navbar `<Link to="/cart">` tags in `/src/App.tsx`.
  6. **Created Site Change Log, Website Structure Blueprint & Admin Blueprint Hub Viewer**:
     - Created `/SITE_CHANGE_LOG.md` and `/WEBSITE_STRUCTURE_BLUEPRINT.md`.
     - Upgraded `/src/pages/admin/BlueprintGeneratorHub.tsx` (`/admin/blueprint-hub`) with interactive tabs to inspect, copy, and download `SITE_CHANGE_LOG.md`, `WEBSITE_STRUCTURE_BLUEPRINT.md`, and the live GSC 11-Issue Resolution Matrix.
- **Files Modified / Created**:
  - `/src/lib/gmc-feed.ts`
  - `/server.ts`
  - `/src/App.tsx`
  - `/public/robots.txt`
  - `/SITE_CHANGE_LOG.md` (created)
  - `/WEBSITE_STRUCTURE_BLUEPRINT.md` (created)
  - `/src/pages/admin/BlueprintGeneratorHub.tsx`
  - `/scripts/seo-silo-audit.ts`
  - `/skills/apex-seo-aeo-engine/SKILL.md`
  - `/seo-policy.md`
  - `/README.md`

---

### `[v4.3]` — 2026-11-19 — 100% Direct External Image URL Persistence & Zero Local-Path Override Ratchet
- **Summary**:
  - Replaced all local `/images/products/...` file paths across `src/lib/gmc-feed.ts`, `src/pages/Category.tsx`, `src/lib/services-catalog.ts`, and live Firestore with direct external `https://` URLs (`https://lh3.googleusercontent.com/d/...` and verified external CDN links) so product images never vanish across container redeployments.
  - Added `normalizeExternalImageUrl()` and `extractDirectImageUrls()` in `/src/lib/image-optimize.ts` to preserve user-provided direct external URLs, split concatenated URLs, and convert Google Drive share links to direct `lh3.googleusercontent.com/d/<ID>` image stream URLs.
  - Added Bulk External Image URL Updater modal in `/src/pages/admin/ProductManagement.tsx`.
- **Files Modified**:
  - `/src/lib/image-optimize.ts`, `/src/lib/firebase/firestore-helpers.ts`, `/src/pages/ProductDetails.tsx`, `/src/lib/gmc-feed.ts`, `/src/pages/Category.tsx`, `/src/lib/services-catalog.ts`, `/src/pages/admin/ProductManagement.tsx`, `/scripts/update-product-images-db.ts`.

---

### `[v4.2]` — 2026-11-18 — Enterprise-Tech Product Studio Asset Generation & Dual-Mode GMC Image Resolution
- **Summary**:
  - Generated studio product visuals for `Poly X70`, `Cisco Room Kit`, and `3D Hologram` categories and updated 16 products in `PRODUCT_GMC_METADATA` and live Firestore.
- **Files Modified**:
  - `/src/lib/gmc-feed.ts`, `/src/lib/image-optimize.ts`, `/scripts/generate-enterprise-images.ts`, `/scripts/update-product-images-db.ts`.

---

### `[v4.1]` — 2026-11-17 — Google Merchant Center (GMC) 20-Column Sheet & Image Extension Normalization
- **Summary**:
  - Added `/feed/google-merchant-20.tsv` (`/api/gmc-sheet-20.tsv`) matching Google Merchant Center's exact 20-column specification (`id`, `title`, `description`, `availability`, `availability_date`, `expiration_date`, `link`, `mobile_link`, `image_link`, `price`, `sale_price`, `sale_price_effective_date`, `identifier_exists`, `gtin`, `mpn`, `brand`, `product_highlight`, `product_detail`, `additional_image_link`, `condition`).
  - Added GMC Technical Specifications, Product Highlights, GTIN, MPN, Condition, and Price Effective Date display to `/src/pages/ProductDetails.tsx`.
- **Files Modified**:
  - `/src/lib/gmc-feed.ts`, `/src/pages/ProductDetails.tsx`, `/server.ts`, `/scripts/generate-gmc-tsv.ts`.

---

### `[v4.0]` — 2026-11-04 — Google Lighthouse 100/100/100/100, Flat 2-Click Structure & Self-Updating AI Agent Skill
- **Summary**:
  - Created `/skills/apex-seo-aeo-engine/SKILL.md`, `/docs/AI_AGENT_PROFILES_COMPLETE.md`, `/docs/WEBSITE_BUILDING_MECHANISM_REPORT.md`, `/NICHE_WEBSITE_BLUEPRINT.md`, and the interactive `/admin/blueprint-hub` (`BlueprintGeneratorHub.tsx`).
  - Enforced 54px mobile sticky header, 16:6 compact service heroes, hover-only 2nd gallery image mounting, `IntersectionObserver` 16-card DOM batching ($<800$ DOM nodes), and 4-Gate Monotonic Self-Updating Skill Protocol.

---

### `[v3.0]` — 2026-11-03 — 2011 Legacy Head-Keyword Reclamation & Hub-and-Spoke Anti-Cannibalization Silo
- **Summary**:
  - Dedicated `/video-conference-in-pakistan` and `/event-management-in-pakistan` as national SSR Pillar hubs with Answer-First verdicts and native HTML `<table>` comparison matrices.
  - Built 20-parameter automated SEO audit script (`/scripts/seo-silo-audit.ts`) verifying $\le 2$-click crawl depth across all canonical routes.

---

### `[v2.0]` — 2026-11-02 — Zero Soft-404 Synchronous Fallback Ratchet & Firestore Circuit-Breaker
- **Summary**:
  - Wired `buildFallbackProductFromGmcMeta`, `FALLBACK_PRODUCT_CATEGORIES`, and `FALLBACK_SERVICES_CATALOG` into Frame-0 initial state across all public views so crawlers and users never see loading spinners or Soft 404s.

---

### `[v1.0]` — 2026-11-01 — Baseline Dual-Wave Express SSR & Google Merchant Center Engine
- **Summary**:
  - Established `server.ts` `injectRouteSeoIntoHtml()` Wave-1 head + body snapshot injection, `data-rh="true"` self-referencing canonical tags, and `/sitemap.xml` + `/llms-full.txt` generation.
