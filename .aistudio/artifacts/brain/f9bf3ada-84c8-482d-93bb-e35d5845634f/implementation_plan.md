# Critical SEO Metadata, Title/Description Length & JSON-LD Schema Remediation Plan

Eliminates the critical SEO tag and structured data warnings reported by the WebsiteCrawler audit by enforcing strict character limits (`≤ 65` characters for `<title>` and `≤ 160` characters for `<meta name="description">`), removing deprecated `<meta name="keywords">` tags, and scoping the heavy homepage JSON-LD `@graph` exclusively to the root path (`/`) while keeping clean, conflict-free per-route schemas across all 155 canonical pages.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following remediation scope reflects your confirmed choices from our interactive review of the WebsiteCrawler PDF report:

- **Confirmed Decision 1 (Focused Critical SEO Scope)**: Restrict changes strictly to critical SEO tags (`<title>`, `<meta name="description">`, OpenGraph/Twitter title & description mirrors, and JSON-LD structured data) without altering security headers or visual UI layouts.
- **Confirmed Decision 2 (Strict Title & Description Length Budgets)**: Trim and normalize all SSR and client-side `<title>` tags to **≤ 65 characters** (eliminating the 50 *"Title length is more than 70 characters"* warnings) and all `<meta name="description">` tags to **≤ 160 characters** (eliminating the 21 *"Meta Description length is more than 200"* warnings).
- **Confirmed Decision 3 (Homepage `@graph` Scoping & Meta Keywords Removal)**: Scope the large homepage JSON-LD `@graph` (`LocalBusiness`, homepage `FAQPage`, and `OfferCatalog`) strictly to `/` so subpages only emit their dedicated route schema (`Product`, `Service`, `CollectionPage`, or `BlogPosting`) plus a lightweight `Organization` publisher reference—eliminating the **8,990 repeated structured data warnings** and **52 `meta keywords` warnings**.

---

## 1. Overview & Core Concept

- **What It Does**: Streamlines the server-side and client-side `<head>` metadata pipeline so every HTML route serves a crisp, non-truncated title (`≤ 65` chars), an actionable summary description (`≤ 160` chars), zero deprecated `<meta name="keywords">` tags, and a single self-contained JSON-LD structured data payload matched to that exact route.
- **Target Audience / Persona**: Googlebot, Google Merchant Center validators, Answer Engine crawlers, and static HTML SEO auditors (`WebsiteCrawler.org`, Ahrefs, Semrush).
- **Key Value**: Removes duplicate `FAQPage` / `OfferCatalog` / `LocalBusiness` schema collisions on product and service pages, prevents SERP title/description truncation, and resolves over 9,100 reported tag/schema warnings in a single pass.

---

## 2. User Experience & Visual Design

- **Key User & Crawler Flows**:
  1. **Search Snippet Rendering**: When a user or crawler inspects any of the 155 canonical URLs (static hubs, 25 brands, 12 categories, 53 products, 9 services, 11 blog guides), the `<title>` fits cleanly within Google's 60–65 character desktop/mobile pixel budget and the `<meta name="description">` delivers a complete sentence under 160 characters without ellipsis cutoffs.
  2. **Structured Data Validation**:
     - Visiting `/` outputs the full corporate `Organization`, `LocalBusiness` (Lahore, Karachi, Islamabad branches), homepage `FAQPage`, and `OfferCatalog` `@graph`.
     - Visiting any subpage (`/product/*`, `/services/*`, `/category/*`, `/brands/*`, `/blog/*`) strips the homepage-only `FAQPage` and `OfferCatalog` block and emits only the route's dedicated JSON-LD schema alongside a minimal `Organization` (`#organization`) node so `@id` references (`provider`, `publisher`) remain 100% valid.
- **Visual Identity & Theme**:
  - Preserves the existing enterprise Pro-AV visual design, typography, and layout untouched.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Smart Word-Boundary Truncation + Concise Route Templates**
  - *Chosen Approach*: Update static route titles/descriptions and dynamic Brand, Category, Product, Service, and Blog title/description generators to produce naturally concise copy (`≤ 65` chars for titles, `≤ 160` chars for descriptions), backed by a word-boundary clamping helper (`clampSeoTitle(str, 65)` and `clampSeoDescription(str, 160)`) in both SSR and client-side `<SEO />`.
  - *Why*: Guarantees that even long product names or custom database descriptions never exceed crawler thresholds or break mid-word.
  - *Alternatives Considered*: Hard character slicing (`substring(0, 65)`), which cuts words in half and looks unpolished in search results.
- **Decision 2: Scoping the Static `@graph` to `/` While Retaining Valid `@id` References**
  - *Chosen Approach*: Mark the homepage JSON-LD `<script type="application/ld+json" id="ssr-home-schema">` in the HTML template so the SSR injector keeps the full `@graph` on `/` and replaces it on subpages with the subpage's specific `matched.schema` (including a compact `Organization` node for `#organization` reference integrity).
  - *Why*: Static crawlers flag pages that declare multiple unrelated `FAQPage`, `LocalBusiness`, and `OfferCatalog` blocks on product or policy URLs; scoping to `/` eliminates all 8,990 warnings while keeping Rich Results valid.
- **Decision 3: Complete Removal of `<meta name="keywords">`**
  - *Chosen Approach*: Remove `<meta name="keywords">` from the base HTML template, SSR replacement pipeline, and React `<SEO />` head output (while preserving the optional `keywords` prop on the TypeScript interface for backward compatibility).
  - *Why*: Google has ignored `<meta name="keywords">` since 2009, and modern SEO auditors penalize its presence as a keyword-stuffing signal.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Metadata Injection Flow

```text
┌───────────────────────────────────────────────────────────────────────────┐
│                   Incoming HTTP Request (155 Canonical URLs)              │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                SSR Metadata & Schema Engine (injectRouteSeoIntoHtml)      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 1. Resolve Route Metadata (Static / Brand / Category / Product /   │  │
│  │    Service / Blog)                                                  │  │
│  │ 2. Normalize & Clamp:                                               │  │
│  │    • clampSeoTitle(title, 65)       -> ≤ 65 chars (word-safe)      │  │
│  │    • clampSeoDescription(desc, 160) -> ≤ 160 chars (word-safe)     │  │
│  │ 3. Omit <meta name="keywords">                                      │  │
│  │ 4. Scope JSON-LD Schema:                                            │  │
│  │    • If path === "/" -> Keep full Homepage @graph                   │  │
│  │    • If path !== "/" -> Replace #ssr-home-schema with Route Schema  │  │
│  │                         + compact #organization reference node      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     Client-Side Hydration (<SEO /> Component)             │
│  • Applies identical clampSeoTitle(65) & clampSeoDescription(160)         │
│  • Renders <title>, <meta name="description">, OpenGraph & Twitter cards  │
│  • Does not emit <meta name="keywords">                                   │
└───────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State Compatibility
- **Backward Compatibility**: The `SEOProps` interface retains `keywords?: string` as an optional prop so no existing page component calls break during TypeScript compilation, while omitting the `<meta name="keywords">` DOM element from rendered output.
- **Verification**: After applying the metadata and schema rules, an automated audit script will verify all 155 sitemap URLs to confirm `0` titles over 65 characters, `0` descriptions over 160 characters, `0` `<meta name="keywords">` tags, and `1` clean JSON-LD schema block per page.
