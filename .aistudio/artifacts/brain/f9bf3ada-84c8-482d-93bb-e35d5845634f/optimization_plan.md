# SEO & Merchant Center Optimization Plan

## 1. Google Merchant Center (GMC) Remediation
*   **Data Audit:** Analyze the "Active with warnings" report to identify specific missing/invalid attributes (e.g., GTIN, product details, images).
*   **Data Schema Update:** Update `Product` interface and Firestore schema to include mandatory GMC fields (`gtin`, `mpn`, `condition`, `color`, `size`, `gender`, `material`).
*   **Sync Automation:** Improve `DataManagement.tsx` to include these new fields and ensure validation before syncing to Google Sheets/GMC.

## 2. Technical SEO Enhancement
*   **Canonicalization:** Enforce strict canonical URLs for all product pages to prevent duplicate content issues.
*   **Structured Data (JSON-LD):** Dynamically generate `Product` schema with complete specifications to help Google crawlers understand product details without relying solely on crawling HTML.
*   **Crawlability:** Resolve 5xx server errors by optimizing API routes and implementing caching strategies, and update `sitemap.xml` with high-priority product pages.

## 3. Advanced Integration Setup
*   **Google Analytics 4 & Tag Manager:** Implement the GTM container in the root layout to track user behavior and conversion events.
*   **Google Cloud Vision API:** Integrate Vision API via server-side cloud function to automatically generate image labels/alt-text and analyze product images for compliance.
*   **Search Console:** Proactively submit the newly optimized `sitemap.xml` and monitor index status changes.

## 4. Implementation Workflow
1.  **Phase 1 (GMC Data):** Update Firestore schema and `DataManagement.tsx` mapping to include all 40 required GMC attributes.
2.  **Phase 2 (Content):** Implement server-side logic for Cloud Vision analysis and apply automated alt-text generation.
3.  **Phase 3 (Technical SEO):** Refactor `SEO.tsx` and API handlers for stability.
4.  **Phase 4 (Monitoring):** Setup GA4/GTM tracking events.
