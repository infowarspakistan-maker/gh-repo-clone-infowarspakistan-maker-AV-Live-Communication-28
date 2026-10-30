# SEO Policy & Best Practices

## I. SEO Best Practices for Product Listings (The "DO's")

### 1. Keyword Research & Mapping
- Assign a primary keyword and secondary keywords to every product page.
- Prioritize transactional keywords (e.g., "buy + product name") as they convert best.
- Target long-tail keywords—broad terms are dominated by big players, but long-tails (e.g., "Cisco Room Bar video conferencing Pakistan") have lower search volume but much higher purchase intent.
- Map each keyword to a unique page type: Product Name → Product Page; Category terms → Category Page; Comparison/Guide terms → Blog or Buying Guide.

### 2. Page Titles & Meta Descriptions
- **Title Tags**: Include the product name, key attributes (brand, compatibility, model), and brand name.
- **Meta Descriptions**: Write a unique meta description for every product page to prevent Google from auto-generating irrelevant snippets.
- Naturally insert the primary keyword in both titles and descriptions.

### 3. Product Descriptions
- Write 150–300 words of unique product copy.
- Never copy manufacturer descriptions—duplicate content across hundreds of sites signals low quality to Google and kills rankings.
- Your description must do three things simultaneously: help visitors and search engines understand the page, answer the customer's real concerns, and drive the sale.
- Cover everything a customer wonders about before buying: compatibility, materials, dimensions, and delivery expectations.

### 4. URL Structure
- Use descriptive, readable URLs that include the product name and keyword (e.g., `/product/cisco-room-bar-pakistan`).
- Maintain a logical site hierarchy: `Home → Category → Sub-category → Product`.

### 5. Image Optimization
- Use high-quality product images: clean background hero shots, detailed close-ups, and lifestyle shots showing usage scenarios.
- The main image file name and ALT text must contain the product name and keywords.
- Compress images to improve page load speed.

### 6. Structured Data (Schema Markup)
- Add Product Schema (JSON-LD format) to every product page.
- Include complete fields: `name`, `brand`, `sku`, `gtin`, `image`, `material`, `price`, `stock status`, `ratings`, etc.
- Schema enables rich snippets in search results (price, stars, availability), dramatically boosting click-through rates.

### 7. Internal Links & Breadcrumbs
- Implement breadcrumb navigation to help users trace their path and help search engines understand site structure.
- Use logical categories and tags for sensible internal linking.
- Limit the clicks from the homepage to any product page (ideally ≤ 3 clicks).

### 8. User Experience & Trust Signals
- Add product reviews and ratings—they are both trust signals and valuable SEO content.
- Include clear Calls-to-Action (CTAs).
- Ensure mobile responsiveness and fast loading (Core Web Vitals).

### 9. Technical SEO Basics
- Use canonical tags to avoid duplicate content issues.
- Ensure Google can properly crawl and index all product pages.
- Regularly audit your site, prioritizing technical issues, category pages, product pages, content, and backlinks in that order.

---

## II. Mandatory Fields for the Product Listing Page (PLP)
Each product card on category or shop pages must include:
- **Product Hero Image**: High-quality thumbnail that clearly showcases the product.
- **Product Title**: Short but includes the core name + key attribute.
- **Price**: Display the selling price; show the original price if on sale.
- **Short Description**: 1–2 sentences summarizing the core selling point.
- **Rating / Review Count**: Show star rating and number of reviews to build trust.
- **Stock Status**: e.g., "In Stock," "Out of Stock," or "Only X left."
- **"Add to Cart" or "View Details" Button**: Clear entry point for the next action.
- **Filters / Sorting Options**: Help users narrow down to their target product quickly.

---

## III. Essential Elements for the Product Detail Page (PDP)

### Top Information Section
- **Breadcrumb Navigation**: Show the current location path.
- **Product Title**: Full product name + key attributes + brand.
- **SKU / Product ID**: Helps with precise searches and inventory tracking.
- **Price**: Clearly show the selling price and original price (if discounted).
- **Stock Status**: Real-time inventory availability.
- **Rating & Review Count**: Show social proof prominently.

### Media Section
- **Multi-angle Hero Images**: At least 3–4 different angles or thumbnails.
- **Close-up / Detail Shots**: Show material, craftsmanship, and fine details.
- **Lifestyle / Usage Images**: Demonstrate the product in a real-world setting.
- **Product Video**: Show functionality or a usage demo.

### Content Section
- **Complete Product Description**: 150–300 words of unique copy with keywords.
- **Specifications / Technical Data**: Dimensions, weight, material, color, compatibility, etc.
- **Feature / Benefit Bullet Points**: List core selling points in scannable format.
- **FAQ / Common Questions**: Answer the most frequent customer queries upfront.

### Conversion Section
- **Clear CTA Button**: e.g., "Add to Cart" or "Buy Now."
- **Variant Selectors**: Options like warranty extension or configuration options.
- **Shipping Information**: Cost and estimated delivery time across Pakistan.
- **Return / Exchange Policy**: Display return policies transparently.
- **Trust Badges**: Secure payment, authenticity guarantee, etc.

### Additional Content (Below the Fold)
- **User Reviews / Testimonials**: Genuine customer feedback.
- **Related Product Recommendations**: "Complete the look" or "You may also like."
- **Product Comparison Table**: Compare with similar products in the same series.

---

## IV. Critical Reminder
> "If a piece of information doesn't exist in the raw HTML, there is no guarantee a crawler will see it."
> All SEO-critical content (titles, descriptions, prices, specs) must be present as HTML text on the page, not loaded dynamically via JavaScript after the fact.

---

## V. AV Live Communications — Living SEO & AI Search Progress Ledger (Updated October 2026)

This section tracks all completed technical SEO, Google Search Console (GSC), Google Merchant Center (GMC), Core Web Vitals, and Generative Engine Optimization (GEO / AEO) milestones so no progress is lost across engineering iterations.

### 1. Completed Technical SEO & GSC Indexing Resolutions
- [x] **Self-Referencing Canonical Deduplication (`data-rh="true"`)**: Every route renders a single self-referencing `<link rel="canonical">` and strips `?` query parameters (`src/components/SEO.tsx`, `index.html`, `server.ts`).
- [x] **Permanent 301 Redirects for Legacy & Query URLs (`server.ts`)**:
  - `?brand=<slug>` $\rightarrow$ `301` to `/brands/:slug`
  - `/category/:cat?sub=:sub` $\rightarrow$ `301` to `/category/:sub`
  - `/products/compare` $\rightarrow$ `301` to `/compare`
  - `/products/:cat` $\rightarrow$ `301` to `/category/:cat`
  - `/tools/room-designer` $\rightarrow$ `301` to `/room-designer`
  - `/product/:rawMpnOrId` $\rightarrow$ `301` to canonical `/product/:slug-pakistan`
- [x] **Zero Loading-Spinner Soft 404s**: `Shop.tsx`, `Category.tsx`, `ProductDetails.tsx`, `ServiceDetail.tsx`, and `Blog.tsx` initialize synchronously with fallback hardware/service/blog catalogs on frame 1.
- [x] **First-Wave SSR `<div id="root">` Semantic Snapshot (`index.html` & `server.ts`)**:
  - Pre-renders `<h1>`, Answer-First summaries, and semantic `<table>` matrices inside `<div id="root">...</div><!--ssr-root-end-->` for Homepage, Product pages (`/product/:slug`), Category pages (`/category/:slug`), Brand pages (`/brands/:slug`), Service pages (`/services/:slug`), and Blog guides (`/blog/:slug`).
- [x] **Automated Dynamic Sitemap (`/sitemap.xml`)**:
  - Serves **152 canonical URLs** (62 static/brand/geo/pillar routes, 53 products, 12 categories, 9 services, 16 blog guides) at `/sitemap.xml` with 1-hour memory cache + disk sync.
- [x] **AI Search Crawler Readiness (`/llms.txt`, `/llms-full.txt` & `robots.txt`)**:
  - Explicit `Allow: /` rules for `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, and `Applebot-Extended`.
  - Complete 30KB+ Markdown hardware/pricing/BoM corpus served at `/llms-full.txt`.

### 2. 100% Public Page JSON-LD Structured Data Coverage Matrix (36/36 Public Views)

| Route Group | React View(s) | JSON-LD `@type` Schema | SSR Parity (`server.ts`) |
| :--- | :--- | :--- | :--- |
| **Homepage (`/`)** | `Home.tsx` | `Organization`, `LocalBusiness`, `WebSite`, `Service`, `FAQPage` • Title locked to `Video Conference | Event Management | AV Live` (45 chars) & 153-char meta description | Yes (`index.html` + `server.ts` + `SEO.tsx`) |
| **Product Detail (`/product/:slug`)** | `ProductDetails.tsx` | `Product` (`mpn`, `gtin`, `Offer`, `OfferShippingDetails`, `MerchantReturnPolicy`, `AggregateRating`, `Review`) + `BreadcrumbList` | Yes (Full GMC schema + SSR `<table>`) |
| **Category Pages (`/category/:slug`)** | `Category.tsx` | `CollectionPage` + `ItemList` + `BreadcrumbList` | Yes (Dynamic `ItemList` + SSR `<table>`) |
| **Brand Pages (`/brands/:slug`)** | `Shop.tsx` | `CollectionPage` + `ItemList` + `BreadcrumbList` | Yes (Dynamic `ItemList` + SSR `<table>`) |
| **Service Detail (`/services/:slug`)** | `ServiceDetail.tsx` | `Service` + `BreadcrumbList` | Yes (`Service` + SSR SLA `<table>`) |
| **BoFu Blog Guides (`/blog/:slug`)** | `Blog.tsx` | `BlogPosting` + `FAQPage` + `BreadcrumbList` | Yes (`@graph` + SSR comparison `<table>`) |
| **Interactive Tools (`/room-designer`, `/compare`, `/event-quote`)** | `RoomDesigner.tsx`, `Compare.tsx`, `EventQuote.tsx` | `WebApplication` + `BreadcrumbList` | Yes |
| **B2B Programs (`/programs/*`, `/esports`, `/voip-service-providers`)** | `Quote.tsx`, `BlindDropShipping.tsx`, `GovEdPricing.tsx`, `FulfillmentServices.tsx`, `Promotions.tsx`, `Provisioning.tsx`, `Reseller.tsx`, `Esports.tsx`, `VoipService.tsx` | `Service` / `CollectionPage` + `BreadcrumbList` | Yes |
| **Buyer's Guides & Reviews (`/guides`, `/reviews`, `/faqs`)** | `BuyersGuides.tsx`, `Reviews.tsx`, `FAQs.tsx` | `CollectionPage`, `AggregateRating`, `FAQPage` + `BreadcrumbList` | Yes |
| **Trust & Legal Policies (`/returns`, `/shipping`, `/payment`, `/rma`, `/privacy-policy`, `/terms-of-service`)** | `Returns.tsx`, `Shipping.tsx`, `Payment.tsx`, `RMA.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx` | `MerchantReturnPolicy`, `Service`, `WebPage` + `BreadcrumbList` | Yes |
| **Transactional / Admin (`/cart`, `/checkout`, `/setup-wizard`, `/admin/*`)** | `Cart.tsx`, `Checkout.tsx`, `SetupWizard.tsx` | `noindex, nofollow` directive enforced | Yes (`noindex: true`) |

### 3. Bottom-of-Funnel (BoFu) Content Clusters Published
1. `/blog/logitech-rally-bar-vs-poly-studio-x50-pakistan` — *Logitech Rally Bar vs. Poly Studio X50 & X52 in Pakistan: 2026 Boardroom Comparison*
2. `/blog/yealink-vs-cisco-video-conferencing-pakistan` — *Yealink vs. Cisco Room Kits in Pakistan: 2026 Enterprise Video Conferencing TCO & Licensing Guide*
3. `/blog/boardroom-av-system-price-guide-pakistan` — *6-to-30 Person Boardroom AV System BoM & Price Guide in Pakistan (2026 PKR Reference)*
4. `/blog/banking-healthcare-university-av-solutions-pakistan` — *Enterprise AV Architecture for Banks, Hospitals & HEC Universities in Pakistan*
5. `/blog/shure-bosch-ceiling-microphones-vs-table-mics-pakistan` — *Ceiling Microphone Arrays vs. Table Microphones: Acoustic Guide for Pakistani Boardrooms*

