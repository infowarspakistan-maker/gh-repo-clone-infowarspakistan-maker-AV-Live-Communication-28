# PageSpeed Insights & Core Web Vitals Optimization Plan

## 1. Executive Summary & Architectural Vision
We will resolve all Performance, Core Web Vitals (LCP, FCP, TBT, CLS, SI), and Accessibility bottlenecks identified in the Google PageSpeed Insights Mobile (`66/100`) and Desktop (`72/100`) reports for **AV Live Communications** while preserving 100% of existing product catalog data, Google Merchant Center feeds, and SEO/AEO structured schemas.

- **Instant First Paint & LCP Recovery (12.6s $\rightarrow$ < 2.0s)**: Eliminate the Firestore loading spinner gate on the homepage so the hero section and default product catalog render immediately in the initial HTML/React paint with `loading="eager"`, `fetchPriority="high"`, and an `index.html` `<link rel="preload" as="image">` tag.
- **Zero Layout Shift (CLS 0.156 $\rightarrow$ 0.000)**: Pre-populate the Footer and Navbar with static fallback categories before Firestore responds, maintain stable homepage layout heights, and convert the Hero slide progress bar from layout-shifting `left` property animations to GPU-composited `scaleX` transforms.
- **Payload & Bundle Optimization (4.1 MB $\rightarrow$ < 1.2 MB)**: Limit the homepage Featured Products carousel to 12 flagship items, defer secondary product hover images until user pointer interaction, split monolithic vendor JS bundles (`firebase`, `motion`, `lucide-react`, `react`) in `vite.config.ts`, lazy-load non-critical floating widgets (`AIAssist`, `CookieConsent`), and add static asset `Cache-Control` headers in `server.ts`.
- **100/100 Accessibility Compliance**: Add explicit `aria-label` attributes to all icon-only buttons, apply high-contrast `#1A2B4C` dark navy text on `#00B4D8` cyan badges and `text-slate-600` (`#475569`) on category labels, and fix heading hierarchy (`<h2>` $\rightarrow$ `<h3>`) across the homepage and footer.

---

## 2. Visual Direction & Domain Aesthetic
- **Theme Polarity**: Clean Corporate Enterprise Light-First storefront paired with High-Craft Dark Navy (`#1A2B4C` / `#1C4E70`) Hero and Footer surfaces.
- **Color & Contrast Tokens (WCAG AA/AAA Compliant)**:
  - **Cyan Accent Badge Surface (`#00B4D8`)**: Paired with **Dark Navy (`#1A2B4C`)** bold text (`6.3:1` contrast ratio, passing WCAG AA & AAA for bold labels) on the `NEW INNOVATION` and `Featured Brands` badges.
  - **Category Icon Grid Labels**: Upgraded from low-contrast `text-gray-400` (`#9CA3AF`, `2.5:1`) to **Slate 600 (`#475569`, `7.5:1` contrast ratio)** with hover transition to `#00B4D8`.
  - **Muted Product Metadata**: Upgraded from `text-gray-400` to `text-slate-600` (`#475569`) to ensure every product category label and stock indicator passes Lighthouse contrast checks.
- **Typography & Scannable Hierarchy**:
  - Non-blocking `Inter` font delivery with `font-display: swap` fallback metrics.
  - Strict sequential heading order (`<h1>` in Hero $\rightarrow$ `<h2>` Section Headers $\rightarrow$ `<h3>` Feature & Product Cards $\rightarrow$ `<h2 class="sr-only">` + `<h3>` Footer Columns).

---

## 3. Core Web Vitals & Accessibility Audit Matrix

| PageSpeed Audit / Issue | Reported Impact | Root Cause in Codebase | Resolution Strategy |
| :--- | :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** & **LCP Request Discovery** | **12.6 s** (Mobile) / **2.3 s** (Desktop) | `Home.tsx` blocks render on `if (loading && !content)` waiting for Firestore; Hero `<img>` uses `loading="lazy"` and lacks `fetchPriority="high"` or `<link rel="preload">`. | Render default fallback hero & products immediately on mount; set `loading="eager"` + `fetchPriority="high"` on slide 0; add `<link rel="preload" as="image" fetchpriority="high">` in `index.html`. |
| **Cumulative Layout Shift (CLS)** | **0.156** (Desktop) | `<footer class="bg-[#1C4E70]">` shifts down when `Home.tsx` transitions from a `600px` spinner to full page and when `Footer.tsx` asynchronously loads categories; Hero dot indicators shift width (`w-6` vs `w-12`). | Remove spinner gate on `Home.tsx`; initialize `Footer.tsx` and `App.tsx` with the 7 static categories immediately; use fixed-width dot containers and `scaleX` transforms. |
| **Render-Blocking Resources** | **1,220 ms** (Mobile) / **300 ms** (Desktop) | `index.html` loads Google Fonts (`Inter`) via synchronous `<link rel="stylesheet">`. | Convert Google Fonts `<link>` in `index.html` to non-blocking `rel="preload" as="style"` with `onload` swap and `<noscript>` fallback. |
| **Avoid Enormous Network Payloads** | **4,157 KiB** (Desktop) / **2,960 KiB** (Mobile) | `Home.tsx` renders all 50+ products in the horizontal slider and mounts **2 `<img>` tags per card** (`firstImage` + `secondImage`). | Slice homepage carousel to `12` featured items (`filteredProducts.slice(0, 12)`) and only mount `secondImage` when a card is hovered (`hoveredProductId === prod.id`). |
| **Reduce Unused JavaScript & Unminified JS** | **548 KiB** est. savings | `vite.config.ts` sets `manualChunks: undefined`, bundling Firebase, Framer Motion, Lucide, and React into one 1.2 MB entry file; `AIAssist` & `CookieConsent` load eagerly. | Configure `manualChunks` in `vite.config.ts` (`vendor-react`, `vendor-firebase`, `vendor-motion`, `vendor-icons`) and `React.lazy()` load `AIAssist` and `CookieConsent` in `App.tsx`. |
| **Forced Reflow & Non-Composited Animations** | **62 ms** reflow / **4 animated elements** | `Home.tsx` polls `scrollLeft`/`clientWidth` every 5s; Hero dot animates `left: "-100%"` to `"0%"`; Navbar animates `transition-[height]`. | Use `requestAnimationFrame` for carousel scroll, replace `left` animation with GPU-composited `scaleX` (`origin-left`), and replace `transition-[height]` with `transition-colors transition-shadow`. |
| **Buttons Do Not Have an Accessible Name** | **Accessibility (88/100)** | Missing `aria-label` on Featured Products Left/Right slider buttons, Wishlist `<Heart />` buttons, `AIAssist` floating bot/close/send buttons, and mobile nav search/submenu buttons. | Add descriptive `aria-label` attributes to all icon-only buttons across `Home.tsx`, `AIAssist.tsx`, `App.tsx`, `Shop.tsx`, and `Category.tsx`. |
| **Background and Foreground Colors Do Not Have Sufficient Contrast** | **Accessibility (88/100)** | White text on `#00B4D8` cyan badges (`2.46:1`) and `text-gray-400` (`#9CA3AF`) category/product labels on white (`2.54:1`). | Apply `text-[#1A2B4C] font-extrabold` on `#00B4D8` cyan badges and `text-slate-600` (`#475569`) on category and product metadata labels. |
| **Heading Elements Are Not in Sequentially-Descending Order** | **Accessibility (88/100)** | `Home.tsx` jumps from `<h2>` to `<h4>` (`Certified Tech Support`, `Same Day Nationwide Shipping`); `Footer.tsx` uses `<h3>` without a preceding `<h2>`. | Change feature subheadings in `Home.tsx` from `<h4>` to `<h3>`, and add `<h2 className="sr-only">Footer Navigation</h2>` in `Footer.tsx`. |

---

## 4. Surgical File-by-File Implementation Tasks

### 1. `/index.html`
- Add `<link rel="preload" as="image" href="https://picsum.photos/seed/avhero1/1920/800" fetchpriority="high" />` and `<link rel="preconnect" href="https://picsum.photos" />` in `<head>` so the browser discovers the LCP hero image immediately in the initial HTML document.
- Convert the Google Fonts stylesheet link to a non-render-blocking preload pattern (`rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'"`) with a `<noscript>` fallback.

### 2. `/src/pages/Home.tsx`
- **Instant Hero & Catalog Render**: Initialize `content` state with `defaultHomepage` fallback data and `products` state with `initialProductsData` so the page renders immediately without blocking on `if (loading && !content)`. When Firestore responds, smoothly merge any custom overrides.
- **Eager High-Priority Hero Image**: On the active first slide (`currentSlide === 0`), set `loading="eager"`, `fetchPriority="high"`, `decoding="async"`, `width="1920"`, and `height="800"`.
- **12-Item Carousel Cap & On-Hover Secondary Image**: Limit the homepage Featured Products slider to `filteredProducts.slice(0, 12)` (with a "View All Products" link to `/shop`) and track `hoveredProductId` state so `secondImage` is only mounted in the DOM when a user hovers/focuses that product card.
- **GPU-Composited Hero Pagination & Zero Reflow**: Replace `animate={{ left: "0%" }}` with `initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}` (`origin-left`) inside fixed-dimension indicator buttons (`w-10 h-2`) to eliminate layout shifts and non-composited animations. Wrap `scrollSlider` geometry reads in `requestAnimationFrame`.
- **Accessibility Fixes**:
  - Add `aria-label="Scroll featured products left"` and `aria-label="Scroll featured products right"` to the carousel arrow buttons.
  - Add `aria-label={`Save ${prod.productName} to wishlist`}` to the product card `<Heart />` button.
  - Change `bg-[#00B4D8] text-white` badges (`NEW INNOVATION`, `Featured Brands`) to `bg-[#00B4D8] text-[#1A2B4C] font-extrabold`.
  - Change category bar labels (`PROJECTORS`, `IP PHONES`, etc.) and card metadata from `text-gray-400` to `text-slate-600`.
  - Change `<h4>Certified Tech Support</h4>` and `<h4>Same Day Nationwide Shipping</h4>` to `<h3>`.

### 3. `/src/components/AIAssist.tsx`
- Add `aria-label="Open AV Live AI Assistant"` to the floating chat trigger button.
- Add `aria-label="Close AI Assistant"` to the modal close `<X />` button.
- Add `aria-label="Ask a question about AV equipment"` to the text input and `aria-label="Send message"` to the submit `<Send />` button.

### 4. `/src/components/Footer.tsx`
- Initialize `categories` state with the 7 static fallback categories immediately (instead of `[]`) so the Footer `Shop` column height never shifts (`CLS 0.156 -> 0`) when Firestore resolves.
- Add `<h2 className="sr-only">Site Footer Navigation</h2>` before the `<h3>` column headers to maintain sequential heading hierarchy.
- Upgrade muted footer link text contrast from `text-gray-300` to `text-slate-200`.

### 5. `/src/App.tsx`
- Lazy-load `AIAssist` and `CookieConsent` with `React.lazy` and `<Suspense fallback={null}>` so they do not block initial main-thread hydration.
- Initialize `Navbar` categories with the 7 default categories immediately to prevent header submenu shifts.
- Add `aria-label="Search products"` to the mobile search submit button and `aria-label={`Toggle ${parent.name} submenu`}` to mobile category accordion buttons.
- Replace `transition-all` / `transition-[height]` on the sticky header with `transition-shadow duration-200` to eliminate non-composited layout animations.

### 6. `/vite.config.ts` & `/server.ts`
- Update `vite.config.ts` `build.rollupOptions.output.manualChunks` to split `firebase`, `motion`, `lucide-react`, and `react` into dedicated cacheable chunks and enable `cssMinify: true`.
- Update `server.ts` static middleware to serve `/assets` with long-lived `Cache-Control: public, max-age=31536000, immutable` headers.

---

## 5. Verification & Acceptance Criteria
1. Run `lint_applet` (`npm run lint`) to verify zero TypeScript or React syntax errors.
2. Run `compile_applet` (`npm run build`) to verify vendor chunk splitting and production asset compilation succeed cleanly.
3. Verify that all existing pages, Google Merchant Center TSV feed endpoints, and SEO/AEO JSON-LD schemas remain completely intact.
