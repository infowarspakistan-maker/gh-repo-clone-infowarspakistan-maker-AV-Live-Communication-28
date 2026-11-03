# SEO, AEO & Competitor-Beating Implementation Plan (`avlive.com.pk`)

## 1. Forensic Diagnosis: Why Competitors Currently Outrank `avlive.com.pk`

| Competitor Cluster | Competitor Domains | Why They Rank Today | Current Blocker on `avlive.com.pk` |
| :--- | :--- | :--- | :--- |
| **Video Conferencing & AV Integration** | `accsys.pk`, `kbse.com.pk`, `nasco-av.com` | Single-intent commercial pillar pages for *"Video Conference in Pakistan"* & brand hardware without internal URL duplication; clean SKU `<title>` tags. | **1.** Homepage `<h1>` is inside `hidden lg:flex` (`display: none` to Googlebot Smartphone).<br>**2.** `/video-conferencing` and `/video-conference-in-pakistan` have 100% duplicate content, while `/video-conference-in-pakistan` lacks custom SSR HTML in `server.ts`.<br>**3.** 65+ product & category pages append `\| Video Conference in Pakistan` to client `<title>` tags, cannibalizing the pillar page and drifting from SSR `<title>`. |
| **Event Management & Corporate Events** | `a2zeventssolutions.com`, `gncaterers.com`, `blacktieeventsandcaters.com` | Dedicated top-level pages targeting *"Event Management in Pakistan"*, *"Event Management Company in Lahore"*, and *"Corporate Event Management"* with local service packages. | **4.** No canonical `/event-management-in-pakistan` pillar exists in `KeywordLandingPage.tsx`, `server.ts`, or `sitemap.xml`.<br>**5.** Event management authority is split across generic rental subpages without a unified national comparison table proving AV Live owns the physical inventory (unlike agency middlemen). |

---

## 2. Targeted Fixes & Architecture Overhaul

### Phase A: Fix Mobile-First Indexing `<h1>` Blackout & Homepage Dual-Pillar Authority
- **File:** `src/pages/Home.tsx`, `index.html`, `server.ts`
- **Action:**
  - Promote the mobile hero primary heading from `<p>` to a semantic, visible `<h1>` on viewports `< 1024px` (or unify a single responsive `<h1>` visible across both mobile and desktop layouts) so Googlebot Smartphone immediately indexes:  
    `Video Conference in Pakistan, Event Management & Professional AV Solutions — AV Live (Est. 2011)`
  - Add a compact, crawlable **"Why Direct AV Engineering Beats Third-Party Event Agencies & Box-Mover Resellers"** comparison matrix and **2011 Legacy Keyword Authority Hub** on the homepage linking directly to the canonical pillar pages (`/video-conference-in-pakistan`, `/event-management-in-pakistan`, `/corporate-event-management`, `/smd-led-screen-rental`, `/sound-system-rental-lahore`, `/conference-discussion-system-pakistan`, `/simultaneous-interpretation-system`).

### Phase B: Eliminate 70-Way Keyword Cannibalization & Client/Server `<title>` Drift
- **Files:** `src/pages/ProductDetails.tsx`, `src/pages/Category.tsx`, `src/pages/KeywordLandingPage.tsx`, `server.ts`
- **Action:**
  - **Product Pages (`src/pages/ProductDetails.tsx`):** Replace the cannibalizing `| Video Conference in Pakistan | AV Live` title suffix with exact SKU/MPN commercial intent matching `server.ts` SSR (`${product.name} (${mpn}) Price in Pakistan | Official Dealer — AV Live`), ensuring 100% client/SSR `<title>` parity and freeing `"Video Conference in Pakistan"` exclusively for the pillar hub.
  - **Category Pages (`src/pages/Category.tsx`):** Align client `<SEO title={...} />` with `server.ts` SSR category titles (`${category.name} Price in Pakistan — Official Commercial AV Dealer | AV Live`) instead of repeating `Video Conference in Pakistan` on non-conferencing categories (microphones, speakers, trussing, cables).
  - **Differentiate `/video-conference-in-pakistan` vs. `/video-conferencing`:**
    - Make `/video-conference-in-pakistan` the definitive **National Hardware, Pricing & Deployment Pillar** for *"Video Conference in Pakistan"* (comparing Poly, Logitech, Cisco, Yealink, Aver, Maxhub room kits with PKR price tiers and boardroom sizing tables to outrank `accsys.pk`, `kbse.com.pk`, and `nasco-av.com`).
    - Differentiate `/video-conferencing` into the **Zoom / Microsoft Teams / SIP Codec Room Engineering & Integration Guide** with distinct `<title>`, `<h1>`, `description`, SSR comparison table, and cross-link to `/video-conference-in-pakistan`.

### Phase C: Build the Dedicated `/event-management-in-pakistan` Pillar to Outrank `a2zeventssolutions.com`, `gncaterers.com`, and `blacktieeventsandcaters.com`
- **Files:** `src/pages/KeywordLandingPage.tsx`, `src/App.tsx`, `src/components/Footer.tsx`, `server.ts`, `src/lib/sitemap-generator.ts`
- **Action:**
  - Create `/event-management-in-pakistan` in `KEYWORD_LANDING_PAGES` (`src/pages/KeywordLandingPage.tsx`) and register its route in `src/App.tsx` and SSR metadata + rich semantic HTML `<table>` snapshot in `server.ts`.
  - Include an **Answer-First Verdict (60 words)**, a **Turnkey Corporate Event Management vs. Traditional Caterer/Decor Agency Comparison Table** (highlighting AV Live's in-house SMD LED walls, line-array sound, stage trussing, multi-cam live streaming, and hybrid interpretation systems across Lahore, Islamabad, and Karachi), city-by-city venue coverage (PC Lahore, Expo Centre, Serena Islamabad, Marriott Karachi), and `Service` + `FAQPage` JSON-LD schema.
  - Upgrade `/corporate-event-management` in both `src/pages/KeywordLandingPage.tsx` and `server.ts` (`staticPageCustomContent`) with dedicated custom SSR tables and internal links to `/event-management-in-pakistan`.

### Phase D: Deploy 2011 Legacy Keyword Clusters + Full SSR `staticPageCustomContent` Parity
- **Files:** `server.ts`, `src/pages/KeywordLandingPage.tsx`, `src/components/Footer.tsx`
- **Action:**
  - Upgrade `staticPageCustomContent` in `server.ts` so `/video-conference-in-pakistan`, `/event-management-in-pakistan`, `/corporate-event-management`, `/smd-led-screen-rental`, `/sound-system-rental-lahore`, `/multimedia-projector-in-pakistan`, `/conference-discussion-system-pakistan`, and `/simultaneous-interpretation-system` all serve bespoke first-wave SSR HTML with semantic `<table>` pricing/specification matrices, city coverage (Lahore, Islamabad, Karachi, Faisalabad, Multan, Peshawar), and FAQ blocks.
  - Ensure all navigation headers, footer SEO links, and homepage quick-links include direct anchor text for **Video Conference in Pakistan**, **Event Management in Pakistan**, and **Corporate Event Management**.

### Phase E: Sitemap, `llms-full.txt`, Blueprint & Verification Synchronization
- **Files:** `scripts/generate-sitemap.ts`, `public/sitemap.xml`, `public/llms-full.txt`, `README.md`, `seo-policy.md`
- **Action:**
  - Run `npx tsx scripts/generate-sitemap.ts` to index `/event-management-in-pakistan` and updated pillar metadata in `public/sitemap.xml` and `public/llms-full.txt`.
  - Update `README.md` and `seo-policy.md` with the competitor-beating architecture and canonical pillar mapping.
  - Run a verification audit script plus `lint_applet` and `compile_applet` to confirm 0 errors and 100% SSR/client parity.
