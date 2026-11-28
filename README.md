# AV Live Communications — Platform & Canonical SEO Blueprint (`avlive.com.pk`)

Welcome to the **AV Live Communications** source code repository and platform blueprint. This is a full-stack enterprise Pro-AV e-commerce, unified communications (Poly, Cisco, Logitech, Yealink), and corporate event engineering platform built with React 19, Vite, Express SSR metadata/body injection, Tailwind CSS v4, and Firebase Firestore.

---

## 1. Platform Architecture & Crawler Endpoints

| Endpoint / File | Purpose | Live Count / Status |
| :--- | :--- | :--- |
| **`/sitemap.xml`** (`public/sitemap.xml`) | Dynamic XML 1.0 Sitemap synced from Firestore + synchronous fallback catalogs | **193 Canonical URLs** (72 Static/Brand/Geo/Pillar including `/sitemap`, `/video-conference-in-pakistan`, `/event-management-in-pakistan`, `/video-conference`, `/brands/samsung`, `/brands/tcl` & `/user-data-deletion`, 88 Products, 13 Categories, 9 Services, 11 Blogs) |
| **`/sitemap`** (`src/pages/HtmlSitemap.tsx`) | Human & Googlebot HTML Sitemap & Enterprise Hardware Directory (all 193 URLs within 2 clicks) | Active (Linked in Navbar & Footer) |
| **`/llms.txt`** (`public/llms.txt`) | Concise AI Search (ChatGPT, Perplexity, Claude, Gemini) index & entity directory | Active (HTTP 200 `text/plain`) |
| **`/llms-full.txt`** (`public/llms-full.txt`) | Complete 45KB+ Markdown corpus of all 88 SKUs (MPNs, GTINs, real model-specific PKR prices), BoM tables & guides | Active (HTTP 200 `text/plain`) |
| **`/api/gmc-feed.xml`** | Google Merchant Center RSS 2.0 XML Product Feed (`g:id`, `g:size`, `g:item_group_id`, `g:price` in PKR, multi-angle images, 5+ specs) | **88 Verified Hardware & LED TV SKUs** |
| **`/api/gmc-feed.tsv`** | Google Merchant Center Tab-Separated Values (TSV) Feed for Google Sheets scheduled fetch | **88 Verified Hardware & LED TV SKUs** |
| **`/robots.txt`** (`public/robots.txt`) | Explicit `Allow: /` for `Googlebot`, `Google-Extended`, `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot` | Active (Blocks `/admin/` & private `/api/`, allows GMC feeds & `X-Robots-Tag: noindex` observation) |

---

## 2. Canonical Route Blueprint (193 Deduplicated Indexable URLs)

### A. Core Commercial, Geo & Solution Hubs (72 URLs)
- **Storefront & Discovery**: `/`, `/shop`, `/brands`, `/solutions`, `/services`, `/events-services`, `/event-quote`, `/esports`, `/room-designer`, `/podium-teleprompter`, `/compare`, `/guides`, `/reviews`, `/blog`, `/faqs`, `/contact`, `/about`, `/sitemap`
- **High-Intent Commercial Pillar Pages**: `/video-conference-in-pakistan` *(absorbs `/video-conferencing`, `/video-conferencing-solutions`, `/conference-room-solutions` via `301`)*, `/event-management-in-pakistan` *(absorbs `/corporate-event-management`, `/corporate-event-management-pakistan` via `301`)*, `/video-conference` *(Interactive Boardroom Configurator & Protocol Hub)*, `/zoom-rooms`, `/microsoft-teams-rooms`, `/3d-hologram`, `/projection-mapping`, `/live-streaming-services`, `/av-equipment-rental`, `/voip-service-providers`
- **Regional Local SEO Hubs**: `/lahore`, `/karachi`, `/islamabad`
- **B2B Procurement Programs (`/programs/*`)**: `/programs/quote`, `/programs/blind-drop-shipping`, `/programs/government-education-pricing`, `/programs/fulfillment-services`, `/programs/promotions`, `/programs/provisioning-services`, `/programs/reseller-program`
- **Trust & Policy Pages**: `/returns`, `/shipping`, `/payment`, `/rma`, `/privacy-policy`, `/terms-of-service`, `/user-data-deletion`
- **27 Authorized Brand Pages (`/brands/:brandSlug`)**:
  `/brands/poly`, `/brands/cisco`, `/brands/logitech`, `/brands/yealink`, `/brands/jabra`, `/brands/bosch`, `/brands/hikvision`, `/brands/dahua`, `/brands/axis`, `/brands/grandstream`, `/brands/fanvil`, `/brands/2n`, `/brands/epson`, `/brands/benq`, `/brands/optoma`, `/brands/panasonic`, `/brands/sony`, `/brands/viewsonic`, `/brands/uniview`, `/brands/itc`, `/brands/3cx`, `/brands/freepbx`, `/brands/sangoma`, `/brands/horion`, `/brands/samsung`, `/brands/tcl`, `/brands/google`

### B. Canonical Hardware Categories (13 URLs — `/category/:slug`)
- `/category/video-conferencing`
- `/category/led-tv-displays` *(Samsung Crystal UHD, TCL 4K Google & Smart LED TVs, Horion Interactive Panels)*
- `/category/touch-panels`
- `/category/large-room`
- `/category/speakerphones`
- `/category/boardroom-codecs`
- `/category/ptz-cameras`
- `/category/ip-phones`
- `/category/headsets`
- `/category/ip-cameras`
- `/category/intercom-paging-access`
- `/category/voip-phone-systems`
- `/category/projectors`

### C. Turnkey Integration & Event Services (9 URLs — `/services/:serviceSlug`)
- `/services/boardroom-integration`, `/services/voip-telephony`, `/services/corporate-events`, `/services/hybrid-events`, `/services/esports-events`, `/services/expo-organizing`, `/services/ai-automation`, `/services/ai-development`, `/services/ai-agents-workers`

### D. Bottom-of-Funnel (BoFu) Engineering & Comparison Blog Guides (11 Canonical URLs — `/blog/:postSlug`)
- **Brand vs. Brand Comparisons**:
  - `/blog/logitech-rally-bar-vs-poly-studio-x50-pakistan`
  - `/blog/yealink-vs-cisco-video-conferencing-pakistan`
  - `/blog/shure-bosch-ceiling-microphones-vs-table-mics-pakistan`
  - `/blog/ip-phones-vs-softphones-pakistan`
- **Room-Size & Industry Vertical Guides**:
  - `/blog/boardroom-av-system-price-guide-pakistan`
  - `/blog/banking-healthcare-university-av-solutions-pakistan`
  - `/blog/future-of-video-conferencing-pakistan-2026`
  - `/blog/how-to-choose-video-conferencing-equipment`
  - `/blog/understanding-public-address-systems-pakistan`
  - `/blog/hybrid-events-101-av-integration-pakistan`
  - `/blog/av-live-communications-15-years-pakistan`
  - *(Legacy IDs `/blog/1..11` and old Firestore slugs 301-redirect permanently to the canonical slugs above).*

### E. Verified Enterprise Hardware & LED TV Products (88 URLs — `/product/:slug`)
- All 88 hardware & LED TV SKUs defined in `PRODUCT_GMC_METADATA` (`src/lib/gmc-feed.ts` + `src/lib/tv-catalog.ts`) resolve via canonical `-pakistan` slugs (e.g., `/product/polycom-realpresence-group-500-pakistan`, `/product/samsung-u8000f-55-inch-4k-crystal-uhd-smart-tv-pakistan`, `/product/tcl-v6d-55-inch-4k-google-tv-pakistan`), with 1-hop `301` server redirects from raw MPNs, GMC TV SKU IDs (`TCL-*`, `SAM-*`), or legacy Firestore IDs.

---

## 3. First-Wave SSR, Core Web Vitals & High-Converting Service Blueprint

1. **`injectRouteSeoIntoHtml(html, reqPath)` (`server.ts`)**:
   - Injects route-specific `<title data-rh="true">`, `<meta name="description">`, `<link rel="canonical" href="https://avlive.com.pk/...">`, and `@graph` JSON-LD (`Product`, `CollectionPage` + `ItemList`, `Service` + `FAQPage`, `BlogPosting` + `FAQPage`, `WebApplication`, `MerchantReturnPolicy`) on the initial HTTP response.
   - Injects semantic HTML `<main class="ssr-seo-snapshot">` inside `<div id="root">...</div><!--ssr-root-end-->` containing `<h1>`, Answer-First engineering verdicts, and native `<table>` matrices with `<a href="/product/...">` links.
2. **Core Web Vitals & Gallery Image Optimization (`src/lib/image-optimize.ts`, `Home.tsx`, `Shop.tsx`, `App.tsx`)**:
   - **Code-Splitting**: `Home`, `Shop`, `TopBrands`, and all secondary routes are lazy-loaded into dedicated JS chunks; `vite.config.ts` separates `vendor-firebase`, `vendor-motion`, `vendor-icons`, and `vendor-react`.
   - **Image Payload & DOM Reduction**: `optimizeGalleryImageUrl()` enforces responsive WebP/AVIF URL parameters (`w=480&q=75`), explicit `width`/`height`, `decoding="async"`, and `loading="lazy"` (with `loading="eager"` + `fetchPriority="high"` reserved for the first 2 LCP cards).
   - **Hover-Only 2nd Image & Progressive Batching**: `Shop.tsx` mounts the secondary hover image only on active pointer hover (`hoveredProductId`) and progressively batches DOM cards in 16-item increments via `IntersectionObserver` while keeping all 53 products in the JSON-LD `ItemList` and Answer-First HTML table. `Home.tsx` mounts images only for the active/adjacent slide in the 15-item Video Conferencing gallery.
3. **7-Part Enterprise Service Page Blueprint (`ServiceDetail.tsx`, `KeywordLandingPage.tsx`, `services-catalog.ts`)**:
   - **1. Localized Hero Section**: Localized H1 (Lahore, Karachi, Islamabad) + direct **"Request a 15-Minute Quote"** CTA.
   - **2. Trust & Authority Bar**: Partner authority badges for **Cisco, Poly, Yealink, Logitech, Horion, and Grandstream** + Certified Pro-AV Engineering Team.
   - **3. The "AV Live" Advantage**: Guaranteed 15-minute technical SLA response, zero-downtime architecture, and on-site standby engineers.
   - **4. Service Breakdown**: Boardroom integration, huddle room kits, interactive flat panels, hybrid event broadcasting, 3D hologram stages, SMD LED screen rental, and multi-camera live streaming.
   - **5. Localized Proof (Case Studies)**: Verified installations and corporate events in **Johar Town & DHA (Lahore)**, **Clifton (Karachi)**, and **Blue Area (Islamabad)**.
   - **6. FAQ & Schema Markup**: Commercial FAQs (including 30-person boardroom cost breakdown) wrapped in `FAQPage` JSON-LD.
   - **7. Dual-Hotline Contact Footer**: Prominent click-to-call numbers **`0321 425 6263`** and **`0339 0000 921`** alongside an integrated quote form.

---

## 4. Developer & AI Agent Commands

```bash
# Start full-stack development server (port 3000 with SSR SEO injection)
npm run dev

# Regenerate public/sitemap.xml (193 deduplicated canonical URLs) and public/llms-full.txt
npx tsx scripts/generate-sitemap.ts

# Run 20-parameter Hub-and-Spoke Silo & Technical SEO Audit across all 193 canonical URLs + 301 consolidation redirects
npx tsx scripts/seo-silo-audit.ts

# Type-check codebase
npm run lint

# Build production bundle (client + server + sitemap + llms-full.txt)
npm run build
```

> **Governance Reminder**: Always review `AGENTS.md` and `seo-policy.md` before modifying routes, products, categories, or metadata. All 28 shorthand/keyword alias paths from the **AV Live Communications Internal Link Map** (`/products/*`, `/contact/*`, `/support`, `/request-quote`, `/hybrid-event-production`, `/boardroom-av-integration`, etc.) are permanently `301`-redirected in `server.ts` and `<Navigate replace />`-routed in `src/App.tsx` to their canonical URLs.

---

## 5. Self-Evolving AI Agent Skill, Architecture Report & Multi-Niche Blueprints

| File / Route | Purpose |
| :--- | :--- |
| **`skills/apex-seo-aeo-engine/SKILL.md`** | World-class installable AI Studio Skill (`v4.0-self-evolving`) enforcing the 6-Tier Order of Resolution, Google Lighthouse 100/100/100/100 matrix, and the 4-Gate Monotonic Self-Updating Skill Protocol. |
| **`docs/AI_AGENT_PROFILES_COMPLETE.md`** | Dialectical reasoning and standalone system prompts for the **1st Agent** (Systems/SSR/Lighthouse), **2nd Agent** (GSC/Schema/GMC/Site Structure), **3rd Agent** (AEO/GEO/UX/Competitor Outranker), and **Unified Apex Master Agent**. |
| **`docs/WEBSITE_BUILDING_MECHANISM_REPORT.md`** | Complete engineering report of the Dual-Wave Express SSR + Frame-0 Synchronous Hydration + Hub-and-Spoke Silo + AEO/GEO/GMC mechanism. |
| **`NICHE_WEBSITE_BLUEPRINT.md`** | Universal parameterized starter blueprint (`{{BRAND_NAME}}`, `{{PRIMARY_DOMAIN}}`, `{{NICHE_INDUSTRY}}`, etc.) to recreate this entire architecture for any new niche. |
| **`SITE_CHANGE_LOG.md`** | Chronological append-only engineering change log (`v1.0`–`v4.27`), modified files ledger, and deterministic state recovery commands. |
| **`WEBSITE_STRUCTURE_BLUEPRINT.md`** | Complete 193-route Website Structure Map, 88-SKU inventory, 6-stage SSR/hydration architecture, and Single-Hop 301 Redirect Matrix. |
| **`/admin/blueprint-hub` & `/blueprint-hub`** | Interactive browser UI (`src/pages/admin/BlueprintGeneratorHub.tsx`) to inspect the mechanism report, evolve `SKILL.md` monotonically, audit GSC link health, and download `SITE_CHANGE_LOG.md` & `WEBSITE_STRUCTURE_BLUEPRINT.md`. |
