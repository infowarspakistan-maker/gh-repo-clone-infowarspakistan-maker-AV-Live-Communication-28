# Implementation Plan: Database Recovery, Google Merchant Center 40-Column Compliance & SEO/AEO Strategy

## 1. Root-Cause Diagnosis & System Recovery (Firestore & Indexing Errors)
### Identified Issues
- **Firestore `5 NOT_FOUND` & `Client is offline` Errors**: When Google Workspace OAuth was configured on project `pacific-exchanger-2dckx`, `/firebase-applet-config.json` was overwritten and pointed to a project where the custom database ID (`ai-studio-avlivecommunicat-f9bf3ada-84c8-482d-93bb-e35d5845634f`) was not yet provisioned, and `experimentalForceLongPolling: true` was removed from `initializeFirestore`.
- **Search Console `5xx` & Canonical Warnings**: Crawler requests to dynamic routes and missing trailing-slash normalization caused duplicate canonical URLs.

### Action Steps
1. **Provision & Reconnect Firestore**:
   - Verify and provision the Firestore database (`ai-studio-avlivecommunicat-f9bf3ada-84c8-482d-93bb-e35d5845634f`) via the Firebase integration service and configure `/src/lib/firebase/client.ts` with `experimentalForceLongPolling: true` so real-time listeners and queries work reliably without dropping offline.
2. **Existing Product Data Enrichment (No New Items Added)**:
   - Update only existing products in the database (without adding new products) to ensure every active product has valid manufacturer `gtin` (12-digit UPC / 13-digit EAN), `mpn` (mapped from `sku`), `condition` (`new`), `availability` (`in_stock` / `out_of_stock`), clean plain-text descriptions, and structured `Section:Attribute:Value` specifications.

---

## 2. Google Merchant Center (GMC) 40-Column Template Compliance
### Identified GMC Rejections
- **`product_detail` Sub-attribute Error**: GMC requires strictly 3 colon-separated parts (`section_name:attribute_name:attribute_value`). Existing specs use `Attribute: Value` (2 parts), triggering `"Too few subattributes for attribute: product_detail"`.
- **Description & Tab/Newline Corruption**: Raw HTML (`<h3>`, `<p>`, `&nbsp;`) and line breaks inside `description` shift columns in TSV exports.
- **Availability Mismatch**: `ProductDetails.tsx` and feed exports must strictly output `"in_stock"`, `"out_of_stock"`, `"preorder"`, or `"backorder"` and format prices as `<amount> PKR` (ISO 4217).

### Action Steps
1. **Strict 40-Column GMC Formatter (`/src/lib/gmc-feed.ts`)**:
   - Build a shared utility that maps existing Firestore products to the exact 40 attributes in your template:
     `id`, `title`, `description`, `availability`, `availability_date`, `expiration_date`, `link`, `mobile_link`, `image_link`, `price`, `sale_price`, `sale_price_effective_date`, `identifier_exists`, `gtin`, `mpn`, `brand`, `product_highlight`, `product_detail`, `additional_image_link`, `condition`, `adult`, `color`, `size`, `size_type`, `size_system`, `gender`, `material`, `pattern`, `age_group`, `multipack`, `is bundle`, `unit_pricing_measure`, `unit_pricing_base_measure`, `energy_efficiency_class`, `min_energy_efficiency_class`, `max_energy_efficiency`, `item_group_id`, `video_link`, `virtual_model_link`, `cost_of_goods_sold`.
   - Strip all HTML tags, tabs, and newlines from `title` (max 150 chars) and `description` (clean, high-converting summary up to 200–5000 chars).
   - Automatically convert `specifications` into valid 3-part `Technical Specifications:<Attribute>:<Value>` entries for `product_detail` and generate scannable `product_highlight` strings.
   - Lookup and attach verified manufacturer UPC/GTIN codes for existing Poly, Cisco, Logitech, Yealink, and Grandstream items (setting `identifier_exists` to `"yes"` with valid `gtin` and `mpn`).
2. **Multi-Channel Feed Delivery**:
   - **Downloadable 40-Column `.tsv` File**: Update `/src/pages/admin/DataManagement.tsx` and `/src/pages/admin/SettingsPage.tsx` so admins can download the compliant TSV with one click.
   - **Live `/feed/google-merchant.tsv` Endpoint**: Add an Express route in `/server.ts` serving the live 40-column TSV feed with `Content-Type: text/tab-separated-values; charset=utf-8` so Google Merchant Center can auto-fetch on a daily schedule.
   - **Google Sheets & Google Drive Sync**: Update the Google Workspace integration in Admin so clicking "Sync Products to GMC" creates/updates a 40-column Google Sheet in your connected Google Drive.

---

## 3. SEO & Answer Engine Optimization (AEO) for Target Keywords
### Target Focus Keywords
- **Hardware & Conferencing**: `Video Conference in Pakistan`, `Video conference`, `Polycom Group 500`, `Poly X70`
- **Events & Immersive Tech**: `Event management`, `Corporate event management`, `hybrid event`, `Hologram Display`, `events`

### Action Steps
1. **Homepage SEO & AEO Q&A Architecture (`/src/pages/Home.tsx`)**:
   - Inject focus keywords naturally into headings, hero metadata, and solution summaries.
   - Add an interactive **Answer Engine Optimization (AEO) Knowledge & FAQ Section** on the Homepage answering high-intent conversational queries (e.g., *"What is the best video conference system in Pakistan for boardrooms?"*, *"How does AV Live compare Polycom Group 500 and Poly X70 for enterprise rooms?"*, *"Who provides 3D Hologram Display and corporate event management in Pakistan?"*).
   - Embed combined `@graph` JSON-LD structured data (`Organization`, `WebSite`, `LocalBusiness`, `Service`, and `FAQPage`) so Google Search, AI Overviews, and Answer Engines cite `avlive.com.pk` directly.
2. **Product Detail Pages (`/src/pages/ProductDetails.tsx`)**:
   - Align OpenGraph `product:availability` and Schema.org `Offer` with Google Merchant Center (`https://schema.org/InStock` / `in_stock`, `mpn`, `gtin12`/`gtin13`, `sku`, `brand`, `priceCurrency: "PKR"`).
   - Enhance product-level FAQs and `FAQPage` JSON-LD schema to reference compatibility with **Polycom Group 500**, **Poly X70**, Zoom, and Microsoft Teams deployments in Pakistan.
3. **Dedicated Event Solutions & Video Conferencing Landing Sections (`/src/pages/Services.tsx`, `/src/pages/ServiceDetail.tsx`, `/src/pages/CategoryPage.tsx`)**:
   - Add structured AEO Q&A blocks and `Service` + `FAQPage` JSON-LD schemas on Event Solutions and Video Conferencing pages targeting **Event management**, **Corporate event management**, **hybrid event**, **Hologram Display**, and **Video Conference in Pakistan**.
4. **Canonical Normalization (`/src/components/SEO.tsx`)**:
   - Strip trailing slashes and query parameters from `<link rel="canonical">` to eliminate Google Search Console's *"Duplicate without user-selected canonical"* warnings.
