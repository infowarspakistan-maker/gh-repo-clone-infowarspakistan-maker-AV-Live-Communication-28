# AV Live Communications — Platform & Canonical SEO Blueprint (`avlive.com.pk`)

Welcome to the **AV Live Communications** source code repository and platform blueprint. This is a full-stack enterprise Pro-AV e-commerce, unified communications (Poly, Cisco, Logitech, Yealink), and corporate event engineering platform built with React 19, Vite, Express SSR metadata/body injection, Tailwind CSS v4, and Firebase Firestore.

---

## 1. Platform Architecture & Crawler Endpoints

| Endpoint / File | Purpose | Live Count / Status |
| :--- | :--- | :--- |
| **`/sitemap.xml`** (`public/sitemap.xml`) | Dynamic XML 1.0 Sitemap synced from Firestore + synchronous fallback catalogs | **152 Canonical URLs** (62 Static/Brand/Geo, 53 Products, 12 Categories, 9 Services, 16 Blogs) |
| **`/llms.txt`** (`public/llms.txt`) | Concise AI Search (ChatGPT, Perplexity, Claude, Gemini) index & entity directory | Active (HTTP 200 `text/plain`) |
| **`/llms-full.txt`** (`public/llms-full.txt`) | Complete 30KB+ Markdown corpus of all 53 SKUs (MPNs, GTINs, PKR prices), BoM tables & guides | Active (HTTP 200 `text/plain`) |
| **`/api/gmc-feed.xml`** | Google Merchant Center RSS 2.0 XML Product Feed (`g:id`, `g:mpn`, `g:gtin`, `g:price` in PKR) | **53 Verified Hardware SKUs** |
| **`/api/gmc-feed.tsv`** | Google Merchant Center Tab-Separated Values (TSV) Feed for Google Sheets scheduled fetch | **53 Verified Hardware SKUs** |
| **`/robots.txt`** (`public/robots.txt`) | Explicit `Allow: /` for `Googlebot`, `Google-Extended`, `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot` | Active (Blocks `/admin/`, `/cart`, `/checkout`, and `?*=` query duplicates) |

---

## 2. Canonical Route Blueprint (152 Indexable URLs)

### A. Core Commercial, Geo & Solution Hubs (62 URLs)
- **Storefront & Discovery**: `/`, `/shop`, `/brands`, `/solutions`, `/services`, `/events-services`, `/event-quote`, `/esports`, `/room-designer`, `/compare`, `/guides`, `/reviews`, `/blog`, `/faqs`, `/contact`, `/about`
- **High-Intent Commercial Pillar Pages**: `/video-conferencing`, `/conference-room-solutions`, `/zoom-rooms`, `/microsoft-teams-rooms`, `/3d-hologram`, `/projection-mapping`, `/voip-service-providers`
- **Regional Local SEO Hubs**: `/lahore`, `/karachi`, `/islamabad`
- **B2B Procurement Programs (`/programs/*`)**: `/programs/quote`, `/programs/blind-drop-shipping`, `/programs/government-education-pricing`, `/programs/fulfillment-services`, `/programs/promotions`, `/programs/provisioning-services`, `/programs/reseller-program`
- **Trust & Policy Pages**: `/returns`, `/shipping`, `/payment`, `/rma`, `/privacy-policy`, `/terms-of-service`
- **23 Authorized Brand Pages (`/brands/:brandSlug`)**:
  `/brands/poly`, `/brands/cisco`, `/brands/logitech`, `/brands/yealink`, `/brands/jabra`, `/brands/bosch`, `/brands/hikvision`, `/brands/dahua`, `/brands/axis`, `/brands/grandstream`, `/brands/fanvil`, `/brands/2n`, `/brands/epson`, `/brands/benq`, `/brands/optoma`, `/brands/panasonic`, `/brands/sony`, `/brands/viewsonic`, `/brands/uniview`, `/brands/itc`, `/brands/3cx`, `/brands/freepbx`, `/brands/sangoma`

### B. Canonical Hardware Categories (12 URLs — `/category/:slug`)
- `/category/video-conferencing`
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

### D. Bottom-of-Funnel (BoFu) Engineering & Comparison Blog Guides (16 URLs — `/blog/:postSlug`)
- **Brand vs. Brand Comparisons**:
  - `/blog/logitech-rally-bar-vs-poly-studio-x50-pakistan`
  - `/blog/yealink-vs-cisco-video-conferencing-pakistan`
  - `/blog/shure-bosch-ceiling-microphones-vs-table-mics-pakistan`
  - `/blog/ip-phones-vs-softphones-pakistan`
- **Room-Size & Industry Vertical Guides**:
  - `/blog/boardroom-av-system-price-guide-pakistan`
  - `/blog/banking-healthcare-university-av-solutions-pakistan`
  - `/blog/future-of-video-conferencing-pakistan-2026`
  - `/blog/secure-voip-pbx-network-pakistan`
  - `/blog/pa-intercom-system-schools-hospitals-pakistan`
  - `/blog/hybrid-corporate-events-3d-hologram-pakistan`
  - Plus 6 legacy ID aliases (`/blog/1`–`/blog/6`) preserved for backward compatibility.

### E. Verified Enterprise Hardware Products (53 URLs — `/product/:slug`)
- All 53 hardware SKUs defined in `PRODUCT_GMC_METADATA` (`src/lib/gmc-feed.ts`) resolve via canonical `-pakistan` slugs (e.g., `/product/polycom-realpresence-group-500-pakistan`, `/product/poly-studio-x72-pakistan`, `/product/logitech-rally-bar-pakistan`), with 301 server redirects from raw MPNs or legacy Firestore IDs.

---

## 3. First-Wave SSR & AI Search Architecture (`server.ts`)

1. **`injectRouteSeoIntoHtml(html, reqPath)`**:
   - Injects route-specific `<title data-rh="true">`, `<meta name="description">`, `<link rel="canonical" href="https://avlive.com.pk/...">`, and `@graph` JSON-LD (`Product`, `CollectionPage` + `ItemList`, `Service`, `BlogPosting` + `FAQPage`, `WebApplication`, `MerchantReturnPolicy`) on the initial HTTP response.
   - Injects semantic HTML `<main class="ssr-seo-snapshot">` inside `<div id="root">...</div><!--ssr-root-end-->` containing `<h1>`, Answer-First engineering verdicts, and native `<table>` matrices with `<a href="/product/...">` links so Googlebot and non-JS AI crawlers parse complete data before React hydration.
2. **Zero Loading-Spinner Soft 404s**:
   - `Shop.tsx`, `Category.tsx`, `ProductDetails.tsx`, `ServiceDetail.tsx`, and `Blog.tsx` initialize synchronously from `PRODUCT_GMC_METADATA`, `FALLBACK_PRODUCT_CATEGORIES`, `FALLBACK_SERVICES_CATALOG`, and `FALLBACK_BLOG_CATALOG`.

---

## 4. Developer & AI Agent Commands

```bash
# Start full-stack development server (port 3000 with SSR SEO injection)
npm run dev

# Regenerate public/sitemap.xml (152 URLs) and public/llms-full.txt
npx tsx scripts/generate-sitemap.ts

# Type-check codebase
npm run lint

# Build production bundle (client + server + sitemap + llms-full.txt)
npm run build
```

> **Governance Reminder**: Always review `AGENTS.md` and `seo-policy.md` before modifying routes, products, categories, or metadata.

