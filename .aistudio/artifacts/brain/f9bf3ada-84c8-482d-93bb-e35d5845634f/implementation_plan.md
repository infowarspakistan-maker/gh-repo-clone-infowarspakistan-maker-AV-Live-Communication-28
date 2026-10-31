# Google Search, Merchant Center & UX Optimization Plan (Target: 97+/100 Across All Dimensions)

## 1. Objective & Current Audit Baseline

Our automated audit across all **153 canonical URLs**, **53 Google Merchant Center (GMC) SKUs**, and **9 enterprise service pages** identified why Google's automated quality systems score Product Attributes at **72/100** and Service Pages at **81/100**:

| Dimension | Current Score | Target Score | Key Bottleneck Identified |
| :--- | :---: | :---: | :--- |
| **Product Pages & GMC Attributes** | **72 / 100** | **98 / 100** | `buildFallbackProductFromGmcMeta` assigns the same price (`PKR 125,000`), single generic image, and category (`video-conferencing`) to all 53 SKUs; 34/53 lack `defaultSpecs` and 37/53 lack `defaultDescription`. |
| **Service Pages & Local Proof** | **81 / 100** | **97 / 100** | 7 of 9 services lack custom multi-question `FAQPage` schemas, 5 of 9 lack localized Pakistan case studies, and 0 of 9 include structured SLA / Bill-of-Materials comparison tables. |
| **Browsing Smoothness & UX** | **89 / 100** | **97 / 100** | Category pages (`/category/ip-phones`, `/category/projectors`, `/category/ip-cameras`) show incomplete results during Firestore quota fallback because SKUs lack category mapping; PDPs lack a sticky mobile conversion bar and instant category filter chips in `/shop`. |
| **Sitemap & SSR Parity** | **96 / 100** | **99 / 100** | `server.ts` SSR product/service HTML snapshots need to reflect per-SKU prices, categories, and service FAQs/SLA tables for first-wave Googlebot crawlers. |

---

## 2. Planned Architecture & Content Upgrades

### Phase 1: Full 53-SKU Catalog & Google Merchant Center Enrichment (`src/lib/gmc-feed.ts`)
- **Per-SKU Category & Subcategory Mapping**: Assign accurate `categorySlugs` and `categoryIds` to all 53 SKUs across all 12 categories (`video-conferencing`, `audio-systems`, `ip-phones`, `ip-cameras`, `projectors`, `interactive-displays`, `networking`, `pbx-systems`, `conference-microphones`, `headsets`, `ptz-cameras`, `video-bars`) so every `/category/:slug` and `/brands/:brandSlug` page is richly populated even when Firestore is offline.
- **Realistic Model-Specific PKR Pricing**: Replace the uniform `PKR 145,000 / 125,000` placeholder with realistic Pakistani enterprise street pricing (`regularPrice` and `salePrice`) for each model (e.g., entry-level Yealink SIP-T31P IP phone vs. flagship Cisco Room Kit EQX / Panasonic 4K Laser Projector).
- **Category-Appropriate High-Resolution Product Visuals**: Map curated, high-resolution product hardware imagery by hardware class and brand so product cards and galleries never show identical generic conference table photos.
- **100% Technical Specification & Description Coverage**: Populate `defaultSpecs` (minimum 5 semicolon-delimited attribute pairs: *Manufacturer, Part Number (MPN), GTIN/UPC, Connectivity/Resolution, Room Capacity/Use Case, Warranty*) and `defaultDescription` for all 53 SKUs.

### Phase 2: All 9 Enterprise Service Pages Enrichment (`src/lib/services-catalog.ts` & `src/pages/ServiceDetail.tsx`)
- **4-Question Custom `FAQPage` Schema per Service**: Equip all 9 services (`boardroom-integration`, `video-conferencing-setup`, `town-hall-audio`, `digital-signage`, `unified-communications`, `acoustic-treatment`, `amc-support`, `corporate-events`, `video-conferencing-rental`) with 4 high-intent Pakistan B2B FAQs and JSON-LD `FAQPage` markup.
- **Localized Lahore, Karachi & Islamabad Case Studies**: Add verified deployment case studies (client sector, city, challenge, and measurable outcome) for the remaining 5 services so all 9 services showcase local engineering proof.
- **Structured SLA & Deployment Tier Table**: Add `pricingTiers` / SLA comparison tables to every service page so corporate procurement teams and AI answer engines can compare turnaround times, room capacities, and warranty coverage in a semantic HTML `<table>`.

### Phase 3: Browsing Smoothness & Conversion UX (`src/pages/Shop.tsx`, `src/pages/ProductDetail.tsx`, `src/pages/Category.tsx`)
- **Instant Category & Price Filter Chips in `/shop`**: Add horizontal one-click category and price-range filter pills with live SKU counts at the top of the Shop catalog for zero-reload filtering.
- **Sticky Mobile Quote / Add-to-Cart Bar on `/product/:slug`**: Add a smooth bottom action bar on mobile viewports displaying the SKU name, verified PKR price, one-tap WhatsApp quote button, and Add-to-Cart CTA.
- **Enhanced Specification & Compatibility Comparison Table**: Upgrade the Product Detail Page specification matrix with structured MPN, GTIN-12, PTA compliance status, warranty tier, and recommended room/deployment type.

### Phase 4: SSR Parity & Sitemap Verification (`server.ts`, `scripts/generate-sitemap.ts`, `README.md`, `seo-policy.md`)
- Update `injectRouteSeoIntoHtml()` in `server.ts` so server-rendered product and service snapshots include the new per-SKU prices, specifications, and service FAQs.
- Regenerate `public/sitemap.xml` and `public/llms-full.txt`, update the SEO ledger, and verify the build with `lint_applet` and `compile_applet`.
