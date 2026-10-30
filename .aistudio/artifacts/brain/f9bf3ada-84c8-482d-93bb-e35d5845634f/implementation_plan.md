# Google Search Console First-Wave SSR, 100% Schema Coverage & Living SEO Blueprint Plan

Eliminate every remaining Googlebot first-wave HTML and Google Merchant Center structured data gap by injecting pre-rendered product matrices and complete Merchant schemas on the server, adding rich JSON-LD (`WebApplication`, `Service`, `MerchantReturnPolicy`, `AggregateRating`, `BreadcrumbList`) across all 21 remaining public pages, and synchronizing `README.md`, `seo-policy.md`, and `AGENTS.md` into a living platform & SEO blueprint.

## User Review & Critical Decisions

> [!IMPORTANT]
> All three strategic directions have been confirmed and incorporated into this execution plan:

- **Confirmed Decision 1 (Server-Side HTML & Schema Depth)**: Inject full pre-rendered HTML product specification/pricing tables (`<table>`) and `CollectionPage` + `ItemList` JSON-LD on `/category/:slug` and `/brands/:slug`, and upgrade server-side `/product/:slug` JSON-LD with complete Google Merchant Center fields (`image`, `priceValidUntil`, `aggregateRating`, `shippingDetails`, `hasMerchantReturnPolicy`, and `BreadcrumbList`).
- **Confirmed Decision 2 (100% Public Page JSON-LD Structured Data)**: Add dedicated JSON-LD structured data to all 21 remaining public pages:
  - **Interactive Tools**: `WebApplication` + `BreadcrumbList` schema on `/room-designer`, `/compare`, and `/event-quote`.
  - **B2B Programs & Services**: `Service` + `BreadcrumbList` schema on `/programs/quote`, `/programs/blind-drop-shipping`, `/programs/government-education-pricing`, `/programs/fulfillment-services`, `/programs/promotions`, `/programs/provisioning-services`, `/programs/reseller-program`, `/esports`, `/voip-service-providers`, and `/guides` (`CollectionPage`).
  - **Trust & Policy Hubs**: `AggregateRating` / `CollectionPage` on `/reviews`, `MerchantReturnPolicy` on `/returns` and `/rma`, `OfferShippingDetails` / `WebPage` on `/shipping` and `/payment`, and `WebPage` + `BreadcrumbList` on `/privacy-policy` and `/terms-of-service`.
- **Confirmed Decision 3 (Living SEO Ledger & Platform Blueprint)**: Synchronize `README.md` (complete platform & 152-URL route architecture blueprint), `seo-policy.md` (living SEO progress ledger, completed audit log, and schema checklist), and `AGENTS.md` (mandatory agent rules to update `README.md`, `seo-policy.md`, and `/sitemap.xml` on every route/catalog change).

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **First-Wave Googlebot & Merchant Center Parity**: Ensures that when Googlebot or Google Merchant Center crawls any Product, Category, or Brand URL before executing JavaScript, the initial HTTP response already contains the complete `Product` Merchant Listing schema (shipping rates, 30-day return policy, verified aggregate ratings, product imagery) and pre-rendered HTML product tables with crawlable `<a href="/product/...">` links.
  2. **100% Public Page Structured Data Coverage**: Brings every single indexable route on `avlive.com.pk` to 100% Schema.org coverage so Google Search Console registers Rich Result eligibility across tools, B2B programs, reviews, and policies.
  3. **Permanent Institutional Memory**: Upgrades `README.md`, `seo-policy.md`, and `AGENTS.md` so both human developers and future AI sessions have an authoritative, up-to-date map of all 152 canonical URLs, SEO milestones, and synchronization rules.
- **Target Audience / Persona**: Googlebot (First-Wave HTML Crawler), Google Merchant Center Verification Bot, AI Search Engines (ChatGPT Search, Perplexity, Google AI Overviews), and B2B IT/Procurement buyers in Pakistan.
- **Key Value**: Zero Google Search Console Merchant warnings (*"Missing field 'shippingDetails'"*, *"Missing field 'hasMerchantReturnPolicy'"*, *"Missing field 'image'"*), faster internal link discovery on category/brand pages, and permanent protection against future SEO regressions.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  - **Search Engine & AI Crawler Flow**: Requests any `/category/:slug`, `/brands/:slug`, `/product/:slug`, or `/programs/*` route $\rightarrow$ receives immediate HTTP 200 with self-referencing `<link rel="canonical" data-rh="true">`, rich `@graph` JSON-LD in `<head>`, and a semantic HTML `<main class="ssr-seo-snapshot">` containing an Answer-First verdict and `<table>` matrix inside `<div id="root">`.
  - **Interactive Browser Flow**: React hydrates seamlessly over `#root`, maintaining the high-contrast enterprise hardware aesthetic (`#1A2B4C` deep navy, `#0F172A` slate, `#00A8E8` cyan accents with dark navy contrast text, and tabular numerals `tabular-nums` in all pricing/spec tables).
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Industrial & Enterprise Pro-AV Hardware Authority—clean architectural grids, structured specification tables, and zero decorative clutter.
  - *Typography & Hierarchy*: `Plus Jakarta Sans` / `Inter` display and body hierarchy with `tabular-nums` for PKR pricing, MPNs, and GTINs.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Shared Server & Client Merchant Schema Completeness**
  - *Chosen Approach*: Mirror the full Google Merchant Center `OfferShippingDetails` (0 PKR shipping across Pakistan, 1–5 business days transit), `MerchantReturnPolicy` (30-day return window), `AggregateRating`, `image`, and `BreadcrumbList` directly inside the server-side `injectRouteSeoIntoHtml()` handler.
  - *Why*: Google's Merchant Listing crawler frequently evaluates the raw initial HTML response without waiting for client-side React Helmet injection.
- **Decision 2: Dynamic Category & Brand Product Table Injection in SSR**
  - *Chosen Approach*: Filter `PRODUCT_GMC_METADATA` by brand or category on the server and render an HTML `<table>` with canonical `<a href="/product/...">` links plus `ItemList` JSON-LD inside `injectRouteSeoIntoHtml()`.
  - *Why*: Passes internal PageRank directly from `/category/*` and `/brands/*` pages to all 53 `/product/*` pages on Googlebot's very first crawl pass, resolving *"Discovered - currently not indexed"* delays.
- **Decision 3: Three-File Living Documentation Synchronization (`README.md` + `seo-policy.md` + `AGENTS.md`)**
  - *Chosen Approach*: Keep `README.md` as the master platform & route blueprint, `seo-policy.md` as the living SEO audit & progress ledger, and `AGENTS.md` as the strict enforcement policy requiring updates to all three whenever routes or catalogs change.
  - *Why*: Prevents documentation drift and guarantees continuity across future compactions or engineering sessions.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   INCOMING HTTP REQUEST (Googlebot / User)                 │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS SSR SEO ENGINE (server.ts)                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 1. Canonical & Redirect Guard (301 legacy URLs, strip ?query)        │  │
│  │ 2. Route Matcher:                                                    │  │
│  │    • /product/:slug  -> Full GMC Product + Shipping/Return + <table> │  │
│  │    • /category/:slug -> Filtered Category <table> + ItemList Schema  │  │
│  │    • /brands/:slug   -> Filtered Brand <table> + ItemList Schema     │  │
│  │    • /services/:slug -> Service + Breadcrumb Schema + SLA <table>    │  │
│  │    • /blog/:slug     -> BlogPosting + FAQPage Schema + BoFu <table>  │  │
│  │    • Static / Tools  -> WebApplication / Service / Policy JSON-LD    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└───────────────────┬────────────────────────────────────┬───────────────────┘
                    │                                    │
                    ▼                                    ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────────┐
│     CLIENT REACT HYDRATION (SPA)      │  │   CRAWLER FEEDS & BLUEPRINTS    │
│ • 100% <SEO schema={...} /> coverage  │  │ • /sitemap.xml (152 URLs)       │
│   across all 36 public page views     │  │ • /llms.txt & /llms-full.txt    │
│ • Synchronous fallback catalogs       │  │ • /api/gmc-feed.xml (53 SKUs)   │
│ • Zero loading-spinner soft 404s      │  │ • README.md / seo-policy.md     │
└───────────────────────────────────────┘  └─────────────────────────────────┘
```

### Key Implementation Components
1. **Server-Side Category, Brand & Full GMC Product SSR (`server.ts`)**:
   - Add `freepbx: 'FreePBX (Sangoma)'` to the server brand dictionary.
   - Upgrade `/product/:slug` SSR JSON-LD with `image`, `priceValidUntil`, `aggregateRating`, `shippingDetails` (`OfferShippingDetails`), `hasMerchantReturnPolicy` (`MerchantReturnPolicy`), and `BreadcrumbList`.
   - Upgrade `/category/:slug` and `/brands/:slug` SSR blocks to filter `PRODUCT_GMC_METADATA`, build a `CollectionPage` + `ItemList` + `BreadcrumbList` JSON-LD `@graph`, and inject a semantic HTML `<table>` of matching hardware models with canonical `<a href="/product/...">` links.
   - Add SSR `schema` definitions to `routeMeta` for `/room-designer`, `/compare`, `/guides`, `/reviews`, `/esports`, `/event-quote`, `/voip-service-providers`, `/returns`, `/shipping`, `/payment`, `/rma`, and `/programs/*`.
2. **Client-Side JSON-LD Schema Completion Across All 21 Remaining Public Pages**:
   - Add structured `schema` props to `<SEO />` in `RoomDesigner.tsx`, `Compare.tsx`, `BuyersGuides.tsx`, `Reviews.tsx`, `Esports.tsx`, `EventQuote.tsx`, `VoipService.tsx`, `Quote.tsx`, `BlindDropShipping.tsx`, `GovEdPricing.tsx`, `FulfillmentServices.tsx`, `Promotions.tsx`, `Provisioning.tsx`, `Reseller.tsx`, `Returns.tsx`, `Shipping.tsx`, `Payment.tsx`, `RMA.tsx`, `PrivacyPolicy.tsx`, and `TermsOfService.tsx`.
3. **Living SEO Progress File (`seo-policy.md`), Website Blueprint (`README.md`), and Governance (`AGENTS.md`)**:
   - Update `seo-policy.md` with a comprehensive **AV Live SEO & AI Search Progress Ledger** tracking all completed technical fixes, GSC error resolutions, 152 canonical URLs by category, JSON-LD schema matrix, and ongoing audit checklist.
   - Update `README.md` into the complete **AV Live Platform & SEO Architecture Blueprint** documenting the full route map, SSR pipeline, GMC XML/TSV feeds, `/llms-full.txt`, and sitemap regeneration commands.
   - Update `AGENTS.md` Rule 5.4 to mandate keeping `README.md` and `seo-policy.md` synchronized whenever routes, products, services, or blog guides are added or modified.
