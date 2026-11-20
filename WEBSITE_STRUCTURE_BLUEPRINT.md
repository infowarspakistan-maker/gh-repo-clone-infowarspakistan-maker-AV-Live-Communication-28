# AV Live Communications (`avlive.com.pk`) — Master Website Structure & Architecture Blueprint

> **Purpose**: This document is the authoritative structural map of the **AV Live Communications** platform (`https://avlive.com.pk`). It documents the complete **157 Deduplicated Canonical Indexable URLs**, the **Hub-and-Spoke Topical Silo Hierarchy**, the **53 Active Enterprise Hardware SKUs** (52 `/product/*` SKUs + flagship `/podium-teleprompter` product showcase with MPNs and direct external image URLs), the **Single-Hop 301 Canonical Redirect Matrix**, and the **Dual-Wave Express SSR + Frame-0 Synchronous Hydration** mechanism so previous progress is permanently preserved.

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

## 2. Complete Canonical URL Inventory (157 Deduplicated Indexable URLs)

### 2.1 Tier 1 — Storefront Core & National Commercial Pillar Hubs (30 URLs)
1. `/` — Homepage (`Home.tsx`) — *Video Conference in Pakistan | Event Management | AV Live*
2. `/shop` — Enterprise Hardware Store (`Shop.tsx`) — *All 54 Verified Pro-AV & UC SKUs*
3. `/brands` — Authorized OEM Brand Directory (`Shop.tsx`) — *25 Global Pro-AV & VoIP Brands*
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
18. `/video-conference-in-pakistan` — Primary National Video Conferencing Pillar (`KeywordLandingPage.tsx`)
19. `/event-management-in-pakistan` — Primary National Event Management Pillar (`KeywordLandingPage.tsx`)
20. `/video-conference` — Exact-Match Video Conference Systems, Protocol Architecture & Interactive PKR Room Configurator (`VideoConferenceHub.tsx`)
21. `/video-conferencing` — Video Conferencing Hardware & Codec Hub (`KeywordLandingPage.tsx`)
22. `/video-conferencing-solutions` — Turnkey Boardroom UC Integration Hub (`KeywordLandingPage.tsx`)
23. `/corporate-event-management` — Turnkey Corporate Event Production Hub (`KeywordLandingPage.tsx`)
24. `/conference-room-solutions` — Huddle-to-30-Seat Boardroom Packages (`KeywordLandingPage.tsx`)
25. `/zoom-rooms` — Certified Zoom Rooms Hardware & Integration Pakistan (`KeywordLandingPage.tsx`)
26. `/microsoft-teams-rooms` — Certified Microsoft Teams Rooms (MTR) Pakistan (`KeywordLandingPage.tsx`)
27. `/3d-hologram` — 3D Hologram Display Stages & Holo-Gauze Rental (`KeywordLandingPage.tsx`)
28. `/projection-mapping` — 3D Architectural & Stage Projection Mapping (`KeywordLandingPage.tsx`)
29. `/live-streaming-services` — Multi-Cam 4K Broadcast & Hybrid Event Streaming (`KeywordLandingPage.tsx`)
30. `/av-equipment-rental` — SMD LED Wall, Line-Array Audio & Conference Mic Rental (`KeywordLandingPage.tsx`)

### 2.2 Tier 2 — Regional Geo Hubs, Specialty Verticals, B2B Programs & Trust Policies (18 URLs)
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
- **Trust, Payment, Warranty & Legal Policies (6 URLs)**:
  - `/payment`, `/shipping`, `/returns`, `/rma`, `/privacy-policy`, `/terms-of-service`

### 2.3 Tier 3 — 25 Authorized OEM Brand Hubs (`/brands/:brandSlug`)
`/brands/poly`, `/brands/cisco`, `/brands/logitech`, `/brands/yealink`, `/brands/jabra`, `/brands/bosch`, `/brands/hikvision`, `/brands/dahua`, `/brands/axis`, `/brands/grandstream`, `/brands/fanvil`, `/brands/2n`, `/brands/epson`, `/brands/benq`, `/brands/optoma`, `/brands/panasonic`, `/brands/sony`, `/brands/viewsonic`, `/brands/uniview`, `/brands/itc`, `/brands/3cx`, `/brands/freepbx`, `/brands/sangoma`, `/brands/horion`, `/brands/google`

### 2.4 Tier 4 — 12 Canonical Hardware Categories (`/category/:categorySlug`)
1. `/category/video-conferencing` — All-in-One 4K Video Bars & Conference Systems
2. `/category/boardroom-codecs` — Dedicated Modular Boardroom Codecs (Poly G7500, Cisco Room Kit EQ/Plus)
3. `/category/large-room` — Auditorium, 20–40 Seat Boardroom & Stage Systems
4. `/category/ptz-cameras` — Optical Zoom PTZ & Auto-Tracking Lecture Cameras
5. `/category/touch-panels` — 65"–100" 4K Interactive Flat Panels & Room Schedulers
6. `/category/speakerphones` — Daisy-Chain Bluetooth/USB Conference Speakerphones & Mic Arrays
7. `/category/ip-phones` — Executive Gigabit PoE SIP & Video Desk Phones
8. `/category/voip-phone-systems` — On-Premise & Cloud IP-PBX Appliances (Grandstream, 3CX, FreePBX, Cisco CUCM)
9. `/category/headsets` — ANC DECT Wireless & USB Contact-Center Headsets
10. `/category/projectors` — 4K Laser Boardroom, Auditorium & Mapping Projectors
11. `/category/ip-cameras` — NDAA Enterprise PoE Dome, Bullet & Thermal IP Cameras
12. `/category/intercom-paging-access` — SIP Video Door Intercoms & Bosch EN54 PA/EVAC Controllers

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

### 2.7 Tier 7 — 54 Verified Enterprise Hardware SKUs (`/product/:slug`)
All 54 hardware SKUs in `PRODUCT_GMC_METADATA` (`/src/lib/gmc-feed.ts`) use direct external `https://` image URLs (`https://lh3.googleusercontent.com/d/...`), verified MPNs, GTINs, and PKR pricing:
- **Poly / HP Poly (12 SKUs)**: `polycom-realpresence-group-500-pakistan`, `poly-studio-x72-pakistan`, `poly-studio-x70-pakistan`, `poly-studio-x52-pakistan`, `poly-studio-x50-pakistan`, `poly-studio-x30-pakistan`, `poly-studio-usb-video-bar-pakistan`, `poly-g7500-codec-pakistan`, `poly-studio-e70-camera-pakistan`, `poly-trio-c60-pakistan`, `poly-sync-40-speakerphone-pakistan`, `poly-voyager-focus-2-pakistan`
- **Cisco Webex (8 SKUs)**: `cisco-room-kit-eq-pakistan`, `cisco-room-kit-plus-pakistan`, `cisco-room-bar-pro-pakistan`, `cisco-room-bar-pakistan`, `cisco-desk-pro-pakistan`, `cisco-quad-camera-pakistan`, `cisco-ip-phone-8845-pakistan`, `cisco-cucm-enterprise-pakistan`
- **Logitech (7 SKUs)**: `logitech-rally-plus-pakistan`, `logitech-rally-bar-pakistan`, `logitech-rally-bar-mini-pakistan`, `logitech-meetup-pakistan`, `logitech-rally-camera-pakistan`, `logitech-tap-ip-pakistan`, `logitech-zone-wireless-2-pakistan`
- **Yealink (5 SKUs)**: `yealink-meetingbar-a30-pakistan`, `yealink-meetingbar-a20-pakistan`, `yealink-mvc860-teams-kit-pakistan`, `yealink-cp965-conference-phone-pakistan`, `yealink-t58w-pro-ip-phone-pakistan`
- **Jabra (3 SKUs)**: `jabra-panacast-50-pakistan`, `jabra-speak2-75-pakistan`, `jabra-evolve2-65-flex-pakistan`
- **Horion, SMD LED, Stage & Prompters (4 SKUs)**: `horion-k6a-bundle-special-offer`, `horion-m6a-pro-75-interactive-panel-pakistan`, `indoor-smd-led-p2-5-cabinet-pakistan`, and **AV Live Fold-Flat Podium Teleprompter** (SKU `AV-PP-17C`, Firestore `kl5wGaNLxqQByn3oPd1Z`, routed directly to flagship `/podium-teleprompter` and assigned to `video-conferencing` / `cat-video`, `large-room`, `touch-panels`, and `boardroom-codecs`)
- **Projectors — Epson, BenQ, Optoma, Panasonic, Sony, ViewSonic (6 SKUs)**: `epson-eb-l730u-laser-projector-pakistan`, `benq-tk705i-4k-projector-pakistan`, `benq-w4100i-4k-projector-pakistan`, `optoma-zk507-4k-laser-projector-pakistan`, `panasonic-pt-vmz71-laser-projector-pakistan`, `viewsonic-ls740hd-laser-projector-pakistan`
- **Audio, PA, VoIP & Security — Bosch, Grandstream, Fanvil, 2N, Axis, Hikvision, Dahua, ITC, 3CX, FreePBX (9 SKUs)**: `bosch-paviro-controller-pakistan`, `bosch-ccn-dc-discussion-system-pakistan`, `grandstream-ucm6308-pakistan`, `fanvil-x7a-android-ip-phone-pakistan`, `2n-ip-vario-intercom-pakistan`, `axis-a8105-e-network-video-door-station-pakistan`, `axis-m3065-v-mini-dome-ip-camera-pakistan`, `hikvision-ds-2cd2187g2-colorvu-ip-camera-pakistan`, `3cx-pro-8-sc-enterprise-license-pakistan`

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
| Raw Firestore Product IDs & Legacy Prompter Slugs (`/product/kl5wGaNLxqQByn3oPd1Z`, `/product/podium-prompter-17-compact-pakistan`, `/product/av-pp-17c`, `/product/T1XLMubVYmFzeIfC7V9B`) | `301 Moved Permanently` (1 Hop) | `/podium-teleprompter`, `/product/polycom-realpresence-group-500-pakistan` | `Duplicate without user-selected canonical` |
| Retired / Unknown Child Slug (`/product/unknown-999`, `/category/unknown-cat`) | `301 Moved Permanently` (1 Hop) | `/shop` (or `/brands`, `/services`, `/blog`) | `Not found (404)` & `Duplicate without user-selected canonical` |
| Transactional / Admin (`/cart`, `/checkout`, `/setup-wizard`, `/admin/*`) | `200 OK` + `X-Robots-Tag: noindex, nofollow` | Self (`noindex` meta tag + `rel="nofollow"` links) | `Blocked by robots.txt` |
