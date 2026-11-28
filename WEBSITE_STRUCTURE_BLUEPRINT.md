# AV Live Communications (`avlive.com.pk`) — Master Website Structure & Architecture Blueprint

> **Purpose**: This document is the authoritative structural map of the **AV Live Communications** platform (`https://avlive.com.pk`). It documents the complete **193 Deduplicated Canonical Indexable URLs**, the **Hub-and-Spoke Topical Silo Hierarchy**, the **88 Active Enterprise Hardware & LED TV SKUs** (87 `/product/*` SKUs + flagship `/podium-teleprompter` product showcase with MPNs, SKUs, and verified studio/local images), the **Single-Hop 301 Canonical Redirect Matrix**, and the **Dual-Wave Express SSR + Frame-0 Synchronous Hydration** mechanism so previous progress is permanently preserved.

---

## 1. Executive Architecture Overview

| Architectural Layer | Implementation File(s) | Invariant / Specification |
| :--- | :--- | :--- |
| **Stage 1: Single-Hop 301 Canonical Normalizer** | `/server.ts` (`resolveSingleHopCanonicalTarget`) | Collapses trailing slashes, uppercase paths, tracking/sort/filter query params, raw Firestore IDs, MPNs, and legacy aliases in **1 single HTTP 301 redirect** (zero redirect chains). |
| **Stage 2: Wave-1 Express SSR HTML & JSON-LD Injection** | `/server.ts` (`injectRouteSeoIntoHtml`) | Injects route-specific `<title data-rh="true">` ($50\text{–}65$ chars), `<meta name="description">` ($100\text{–}158$ chars), self-referencing `<link rel="canonical" data-rh="true">`, `#ssr-route-schema` `@graph` JSON-LD, and `<main class="ssr-seo-snapshot">` inside `<div id="root">...</div><!--ssr-root-end-->`. |
| **Stage 3: Zero-5xx Fault-Tolerant SSR Guard** | `/server.ts` (`vite.transformIndexHtml` fallback & global error handler) | Guarantees HTTP `200 OK` pre-rendered `seoHtml` delivery on every public `GET`/`HEAD` route even if Vite middleware or Firestore encounters an error. |
| **Stage 4: Frame-0 Synchronous React 19 Hydration** | `/src/lib/gmc-feed.ts`, `/src/pages/Category.tsx`, `/src/lib/services-catalog.ts` | Initializes all public pages on Frame 0 (`0ms`) from verified local catalogs so Googlebot WRS and users never see loading spinners or Soft 404s. |
| **Stage 5: Flat $\le 2$-Click Internal Link Graph** | `/src/App.tsx` (Mega-Menu), `/src/components/Footer.tsx`, `/src/pages/HtmlSitemap.tsx` (`/sitemap`) | 100% of canonical URLs in `/public/sitemap.xml` are reachable within $\le 2$ clicks from `/`. |
| **Stage 6: GMC & AI Search Corpus Feeds** | `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/api/gmc-feed.xml`, `/api/gmc-feed.tsv`, `/api/gmc-sheet-20.tsv` | Synchronized automatically on server startup and via `npx tsx scripts/generate-sitemap.ts`. |

---

## 2. Complete Canonical URL Inventory (193 Deduplicated Indexable URLs)

### 2.1 Tier 1 — Storefront Core & National Commercial Pillar Hubs (26 URLs)
1. `/` — Homepage (`Home.tsx`) — *Video Conference in Pakistan | Event Management | AV Live*
2. `/shop` — Enterprise Hardware Store (`Shop.tsx`) — *All 88 Verified Pro-AV, UC & LED TV SKUs*
3. `/brands` — Authorized OEM Brand Directory (`Shop.tsx`) — *27 Global Pro-AV, VoIP & Display Brands*
4. `/solutions` — Vertical Industry Solutions (`Solutions.tsx`) — *Banking, Healthcare, Higher-Ed, Government*
5. `/services` — Turnkey Engineering Services Hub (`ServicesLanding.tsx`) — *9 Core Practice Areas*
6. `/events-services` — Corporate Event & Rental Rate Card Hub (`Services.tsx`)
7. `/event-quote` — Instant Event & Rental BoQ Calculator (`EventQuote.tsx`)
8. `/room-designer` — Interactive 3D Boardroom & SMD LED Wall Calculator (`RoomDesigner.tsx`)
9. `/podium-teleprompter` — Fold-Flat Podium Teleprompter 17" & 22" Interactive Showcase & PKR Quote Builder (`FoldFlatTeleprompter.tsx`)
10. `/compare` — Side-by-Side Hardware Specification Comparator (`Compare.tsx`)
11. `/guides` — Enterprise Pro-AV & UC Buyer's Guides (`BuyersGuides.tsx`)
12. `/blog` — Engineering Case Studies & BoFu Comparison Hub (`Blog.tsx`)
13. `/reviews` — Verified Client & Enterprise Deployment Reviews (`Reviews.tsx`)
14. `/faqs` — Technical & Commercial Procurement FAQs (`FAQs.tsx`)
15. `/about` — 15-Year Engineering Authority & PEC Profile (`About.tsx`)
16. `/contact` — Lahore, Karachi & Islamabad Engineering Hotlines (`Contact.tsx`)
17. `/sitemap` — Complete Visual Silo & HTML Sitemap Directory (`HtmlSitemap.tsx`)
18. `/video-conference-in-pakistan` — Primary National Video Conferencing Pillar (`KeywordLandingPage.tsx` — absorbs `/video-conferencing`, `/video-conferencing-solutions`, `/conference-room-solutions` via `301`)
19. `/event-management-in-pakistan` — Primary National Event Management Pillar (`KeywordLandingPage.tsx` — absorbs `/corporate-event-management` & `/corporate-event-management-pakistan` via `301`)
20. `/video-conference` — Exact-Match Video Conference Protocol Architecture & Interactive PKR Room Configurator (`VideoConferenceHub.tsx`)
21. `/zoom-rooms` — Certified Zoom Rooms Hardware & Integration Pakistan (`KeywordLandingPage.tsx`)
22. `/microsoft-teams-rooms` — Certified Microsoft Teams Rooms (MTR) Pakistan (`KeywordLandingPage.tsx`)
23. `/3d-hologram` — 3D Hologram Display Stages & Holo-Gauze Rental (`KeywordLandingPage.tsx`)
24. `/projection-mapping` — 3D Architectural & Stage Projection Mapping (`KeywordLandingPage.tsx`)
25. `/live-streaming-services` — Multi-Cam 4K Broadcast & Hybrid Event Streaming (`KeywordLandingPage.tsx`)
26. `/av-equipment-rental` — SMD LED Wall, Line-Array Audio & Conference Mic Rental (`KeywordLandingPage.tsx`)

### 2.2 Tier 2 — Regional Geo Hubs, Specialty Verticals, B2B Programs & Trust Policies (19 URLs)
- **Regional Local SEO Hubs (3 URLs)**:
  - `/lahore` — Lahore Head Office (Johar Town Block N, Gulberg, DHA)
  - `/karachi` — Karachi Regional Hub (Clifton, Shahrah-e-Faisal, I.I. Chundrigar)
  - `/islamabad` — Islamabad Regional Hub (Blue Area, Red Zone, F-6/G-5)
- **Specialty Verticals (2 URLs)**:
  - `/esports` — E-Sports Arena Production, Low-Latency LED & Broadcast Rigging (`Esports.tsx`)
  - `/voip-service-providers` — Enterprise SIP Trunking, IP-PBX & Call Center VoIP (`VoipService.tsx`)
- **B2B Procurement Programs (`/programs/*` — 7 URLs)**:
  - `/programs/quote` — 15-Minute Official BoQ & Tender Quote Desk (`Quote.tsx`)
  - `/programs/blind-drop-shipping` — White-Label Partner Blind Drop Shipping (`BlindDropShipping.tsx`)
  - `/programs/government-education-pricing` — PPRA, GeP, PEC & HEC Tender Pricing (`GovEdPricing.tsx`)
  - `/programs/fulfillment-services` — Nationwide Multi-Branch Staging & Rollout (`FulfillmentServices.tsx`)
  - `/programs/promotions` — Current OEM Bundle Offers & Trade-In Rebates (`Promotions.tsx`)
  - `/programs/provisioning-services` — Zero-Touch SIP, Zoom & Teams Pre-Provisioning (`Provisioning.tsx`)
  - `/programs/reseller-program` — Authorized System Integrator & Sub-Dealer Portal (`Reseller.tsx`)
- **Trust, Payment, Warranty & Legal Policies (7 URLs)**:
  - `/payment`, `/shipping`, `/returns`, `/rma`, `/privacy-policy`, `/terms-of-service`, `/user-data-deletion`

### 2.3 Tier 3 — 27 Authorized OEM Brand Hubs (`/brands/:brandSlug`)
`/brands/poly`, `/brands/cisco`, `/brands/logitech`, `/brands/yealink`, `/brands/jabra`, `/brands/bosch`, `/brands/hikvision`, `/brands/dahua`, `/brands/axis`, `/brands/grandstream`, `/brands/fanvil`, `/brands/2n`, `/brands/epson`, `/brands/benq`, `/brands/optoma`, `/brands/panasonic`, `/brands/sony`, `/brands/viewsonic`, `/brands/uniview`, `/brands/itc`, `/brands/3cx`, `/brands/freepbx`, `/brands/sangoma`, `/brands/horion`, `/brands/samsung`, `/brands/tcl`, `/brands/google`

### 2.4 Tier 4 — 13 Canonical Hardware Categories (`/category/:categorySlug`)
1. `/category/video-conferencing` — All-in-One 4K Video Bars & Conference Systems
2. `/category/led-tv-displays` — Samsung Crystal UHD, TCL 4K Google/Smart LED TVs & Horion Commercial Displays
3. `/category/boardroom-codecs` — Dedicated Modular Boardroom Codecs (Poly G7500, Cisco Room Kit EQ/Plus)
4. `/category/large-room` — Auditorium, 20–40 Seat Boardroom & Stage Systems
5. `/category/ptz-cameras` — Optical Zoom PTZ & Auto-Tracking Lecture Cameras
6. `/category/touch-panels` — 65"–100" 4K Interactive Flat Panels & Room Schedulers
7. `/category/speakerphones` — Daisy-Chain Bluetooth/USB Conference Speakerphones & Mic Arrays
8. `/category/ip-phones` — Executive Gigabit PoE SIP & Video Desk Phones
9. `/category/voip-phone-systems` — On-Premise & Cloud IP-PBX Appliances (Grandstream, 3CX, FreePBX, Cisco CUCM)
10. `/category/headsets` — ANC DECT Wireless & USB Contact-Center Headsets
11. `/category/projectors` — 4K Laser Boardroom, Auditorium & Mapping Projectors
12. `/category/ip-cameras` — NDAA Enterprise PoE Dome, Bullet & Thermal IP Cameras
13. `/category/intercom-paging-access` — SIP Video Door Intercoms & Bosch EN54 PA/EVAC Controllers

### 2.5 Tier 5 — 9 Turnkey Integration & Event Production Services (`/services/:serviceSlug`)
1. `/services/boardroom-integration` — Turnkey Boardroom & Smart Conference Room AV Integration
2. `/services/voip-telephony` — Enterprise IP-PBX, Call Center & Unified Telephony Deployment
3. `/services/corporate-events` — Turnkey Corporate Event Management, AGM & Product Launch Production
4. `/services/hybrid-events` — Hybrid Townhalls, Zoom/Teams Broadcast & Multi-Cam Streaming
5. `/services/esports-events` — E-Sports Tournament Stage, LED Volume & Live Broadcast Production
6. `/services/expo-organizing` — Custom 3D Exhibition Stall Fabrication & SMD Digital Signage
7. `/services/ai-automation` — Enterprise AI Workflow & Contact Center Automation
8. `/services/ai-development` — Custom RAG Knowledge Base & AI Software Engineering
9. `/services/ai-agents-workers` — Autonomous AI Voice & Support Agents for Pakistani Enterprises

### 2.6 Tier 6 — 11 Bottom-of-Funnel (BoFu) Engineering & Comparison Blog Guides (`/blog/:postSlug`)
1. `/blog/logitech-rally-bar-vs-poly-studio-x50-pakistan`
2. `/blog/yealink-vs-cisco-video-conferencing-pakistan`
3. `/blog/boardroom-av-system-price-guide-pakistan`
4. `/blog/banking-healthcare-university-av-solutions-pakistan`
5. `/blog/shure-bosch-ceiling-microphones-vs-table-mics-pakistan`
6. `/blog/future-of-video-conferencing-pakistan-2026`
7. `/blog/how-to-choose-video-conferencing-equipment`
8. `/blog/ip-phones-vs-softphones-pakistan`
9. `/blog/understanding-public-address-systems-pakistan`
10. `/blog/hybrid-events-101-av-integration-pakistan`
11. `/blog/av-live-communications-15-years-pakistan`

### 2.7 Tier 7 — 88 Verified Enterprise Hardware & LED TV SKUs (`/product/:slug` + `/podium-teleprompter`)
All 88 hardware & LED TV SKUs in `PRODUCT_GMC_METADATA` (`/src/lib/gmc-feed.ts` + `/src/lib/tv-catalog.ts`) use verified studio/local `.jpg`/`.webp` assets or direct `https://` OEM URLs, verified MPNs/IDs, GS1 GTINs (or `identifier_exists=no` on Samsung/TCL TVs), and exact PKR pricing:
- **Poly / HP Poly (14 SKUs)**: `polycom-realpresence-group-500-pakistan`, `poly-studio-x72-pakistan`, `poly-studio-x70-pakistan`, `poly-studio-x52-pakistan`, `poly-studio-x50-pakistan`, `poly-studio-x50-tc8-special-offer-pakistan`, `poly-studio-x30-pakistan`, `poly-studio-usb-video-bar-pakistan`, `poly-g7500-codec-pakistan`, `poly-studio-e70-camera-pakistan`, `poly-trio-c60-pakistan`, `poly-sync-40-speakerphone-pakistan`, `poly-voyager-focus-2-pakistan`, `poly-vvx-411-pakistan`
- **Cisco Webex (11+ SKUs)**: `cisco-room-kit-eq-pakistan`, `cisco-room-kit-plus-pakistan`, `cisco-room-bar-pro-pakistan`, `cisco-room-bar-pakistan`, `cisco-desk-pro-pakistan`, `cisco-quad-camera-pakistan`, `cisco-ip-phone-8845-pakistan`, `cisco-cucm-enterprise-pakistan`, plus GGN Cisco SKUs (`cisco-codec-pro-pakistan`, `cisco-room-kit-pro-p60-pakistan`, `cisco-room-bar-teams-pakistan`, `cisco-codec-eq-pakistan`, `cisco-room-kit-pakistan`)
- **Samsung & TCL LED TVs (28 SKUs)**: 10 Samsung U8000F/DU8000/DU7000/F6000/H5000/T5300 SKUs (`32"`–`85"`) + 18 TCL V6D/P6L/P755/P6K/S51K/P79L/T6D/P8US SKUs (`32"`–`75"`) grouped by `item_group_id` under `/category/led-tv-displays`
- **Logitech, Yealink, Jabra, Horion, Projectors, Audio & Security (35 SKUs)**: Complete enterprise lineups across `logitech-*`, `yealink-*`, `jabra-*`, `horion-*`, `indoor-smd-led-p2-5-cabinet-pakistan`, **AV Live Fold-Flat Podium Teleprompter** (`/podium-teleprompter`), `epson-*`, `benq-*`, `optoma-*`, `panasonic-*`, `viewsonic-*`, `bosch-*`, `grandstream-*`, `fanvil-*`, `2n-*`, `axis-*`, `hikvision-*`, `3cx-*`, and `freepbx-*`.

---

## 3. Single-Hop `301` Canonical Redirect & Non-Indexable Boundary Matrix

| Incoming Request Pattern | HTTP Resolution | Target Canonical Destination | GSC Issue Prevented |
| :--- | :--- | :--- | :--- |
| Trailing slash (`/shop/`, `/about/`) | `301 Moved Permanently` (1 Hop) | `/shop`, `/about` | `Duplicate without user-selected canonical` |
| Uppercase path (`/Shop`, `/Brands/Poly`) | `301 Moved Permanently` (1 Hop) | `/shop`, `/brands/poly` | `Duplicate without user-selected canonical` |
| Brand query (`/shop?brand=polycom`) | `301 Moved Permanently` (1 Hop) | `/brands/poly` | `Duplicate without user-selected canonical` |
| Subcategory query (`/category/video-conferencing?sub=ptz-cameras`) | `301 Moved Permanently` (1 Hop) | `/category/ptz-cameras` | `Alternate page with proper canonical tag` |
| Tracking/Sort query (`/shop?sort=price&utm_source=fb`) | `301 Moved Permanently` (1 Hop) | `/shop` | `Duplicate without user-selected canonical` |
| Multi-hop legacy path (`/products/about/`, `/category/corporate-events/`) | `301 Moved Permanently` (Flattened 1 Hop) | `/about`, `/services/corporate-events` | `Redirect error` & `Page with redirect` |
| Overlapping Pillar & Service Consolidation (`/video-conferencing`, `/video-conferencing-solutions`, `/conference-room-solutions`, `/corporate-event-management`, `/corporate-event-management-pakistan`, `/services/video-conferencing-solutions`, `/services/corporate-event-management`) | `301 Moved Permanently` (1 Hop) | `/video-conference-in-pakistan`, `/event-management-in-pakistan`, `/services/boardroom-integration`, `/services/corporate-events` | Keyword cannibalization & split impression equity |
| Raw Firestore Product IDs & Legacy Prompter Slugs (`/product/kl5wGaNLxqQByn3oPd1Z`, `/product/podium-prompter-17-compact-pakistan`, `/product/av-pp-17c`, `/product/T1XLMubVYmFzeIfC7V9B`) | `301 Moved Permanently` (1 Hop) | `/podium-teleprompter`, `/product/polycom-realpresence-group-500-pakistan` | `Duplicate without user-selected canonical` |
| Retired / Unknown Child Slug (`/product/unknown-999`, `/category/unknown-cat`) | `301 Moved Permanently` (1 Hop) | `/shop` (or `/brands`, `/services`, `/blog`) | `Not found (404)` & `Duplicate without user-selected canonical` |
| Transactional / Admin (`/cart`, `/checkout`, `/setup-wizard`, `/admin/*`) | `200 OK` + `X-Robots-Tag: noindex, nofollow` | Self (`noindex` meta tag + `rel="nofollow"` links) | `Blocked by robots.txt` |
