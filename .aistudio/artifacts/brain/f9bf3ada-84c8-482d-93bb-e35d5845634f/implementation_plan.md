# Viewport Density, Aspect Ratio & Chrome Resizing Plan (Mobile & Desktop)

## Goal
Reclaim vertical screen real estate across mobile (`< 1024px`) and desktop (`>= 1024px`) by compacting the top header, bottom navigation dock, breadcrumbs, hero banners, page headings, and footer menu while maintaining clean aspect ratios (`16:6` hero banners, `4:3` hardware cards/galleries) so visitors immediately see products and core content above the fold.

---

## 1. Compact Top Menu & Slim 52px Mobile Bottom Dock (`src/App.tsx`)
- **Single-Row Mobile Top Header (`54px` total height vs. `120px` legacy)**:
  - Merge the 2-row mobile header into a single compact row (`px-3 py-1.5 h-[54px]`):
    - Left: `w-9 h-9` (`36px`) menu drawer toggle button + compact `AV Live` badge link.
    - Center: `flex-1` pill search input (`h-9` / `36px`, `text-xs`) with clear button, submit icon, and the live search autocomplete dropdown.
    - Right: `w-9 h-9` (`36px`) direct call button with status dot.
  - Update the mobile menu drawer position from `top-[116px] bottom-20` to `top-[54px] bottom-[52px]` with compact card spacing (`p-3.5`, `min-h-[38px]` category rows).
- **Slim Desktop Header (`128px` total / `88px` sticky vs. `168px` legacy)**:
  - Reduce the top dark utility bar from `h-10` (`40px`) to `h-8` (`32px`, `text-[11px]`).
  - Reduce the main desktop brand/search/cart row from `md:h-20` (`80px`) to `lg:h-14` (`56px`) with a `h-9` (`36px`) pill search bar and scaled logo (`text-xl`).
  - Reduce `StaticPrimaryNav` from `h-12` (`48px`) to `h-10` (`40px`) and update dropdown top offsets from `top-12` to `top-10`.
- **Slim 52px Mobile Bottom Navigation Dock (`52px` vs. `88px` legacy)**:
  - Reduce dock bar height from `h-16` (`64px`) to `h-[52px]` with `text-[9px]` labels and `17px` icons.
  - Scale the center floating Cart badge from `-top-6 w-14 h-14 ring-[6px]` to a proportional `-top-3 w-11 h-11 ring-4` button.

---

## 2. Slim 28px Breadcrumbs (`src/components/Breadcrumbs.tsx` & `src/pages/ProductDetails.tsx`)
- **`src/components/Breadcrumbs.tsx`**:
  - Remove `min-h-[48px] min-w-[48px]` and `mb-8` (`32px` bottom margin) from inline breadcrumb links.
  - Render a single-line `h-7` (`28px`) horizontally scrollable trail (`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 py-1 mb-2.5 overflow-x-auto whitespace-nowrap hide-scrollbar`).
- **`src/pages/ProductDetails.tsx`**:
  - Reduce the top breadcrumb wrapper bar from `py-4` with `min-h-[48px]` links to `py-1.5` (`h-8`), and reduce the main container top margin from `mt-8` to `mt-3 lg:mt-5`.

---

## 3. Proportional `16:6` Hero Banners, Page Headings & `4:3` Product Aspect Ratios
- **Homepage (`src/pages/Home.tsx` & `src/components/MobileProductCard.tsx`)**:
  - **Mobile Hero & Category Strip**: Compact the mobile promo card (`p-3.5 rounded-2xl`, `text-sm sm:text-base` title, `w-20 h-20` `1:1` hardware thumbnail, `py-1.5 px-3` buttons) and circular category icons (`w-11 h-11` instead of `w-14 h-14`) so the 2-column Popular Hardware grid is visible immediately on first paint.
  - **Desktop Hero Slider**: Replace `min-h-[480px] sm:min-h-[520px] md:h-[600px]` with a proportional `aspect-[16/6] min-h-[280px] max-h-[380px]` container, scale the `<h1>` from `md:text-6xl` (`60px`) to `text-2xl lg:text-4xl` (`36px`), subtitle from `md:text-2xl` to `text-xs lg:text-base`, and CTA buttons to `py-2.5 px-5 text-xs`.
  - **`MobileProductCard.tsx`**: Use a `aspect-[4/3]` product image frame (`p-2.5`) and compact typography so more product cards fit per screen.
- **Shop & Brand Catalog (`src/pages/Shop.tsx`)**:
  - Reduce page vertical padding from `py-12` to `py-3 lg:py-6`.
  - Reduce header block spacing from `mb-5 lg:mb-8 pb-5 lg:pb-8` to `mb-3 lg:mb-5 pb-2.5 lg:pb-4` and scale `<h1>` from `text-2xl sm:text-3xl lg:text-4xl` to `text-lg sm:text-xl lg:text-2xl`.
- **Category Pages (`src/pages/Category.tsx`)**:
  - Reduce the Category Hero from `py-8 lg:py-16` to `py-3.5 lg:py-6`, scale the category thumbnail badge from `w-20 h-20 lg:w-32 lg:h-32` to `w-12 h-12 lg:w-16 lg:h-16`, scale `<h1>` from `text-2xl sm:text-4xl md:text-6xl` to `text-xl sm:text-2xl lg:text-3xl`, and tighten grid top spacing from `mt-6 lg:mt-16` to `mt-4 lg:mt-6`.
- **Product Details (`src/pages/ProductDetails.tsx`)**:
  - Scale `<h1>` from `text-2xl md:text-3xl lg:text-4xl mb-4` to `text-lg sm:text-xl lg:text-2xl mb-2`, constrain the primary gallery image to `aspect-[4/3] max-h-[280px] sm:max-h-[380px]`, and tighten layout gaps (`gap-6 lg:gap-10`).

---

## 4. Compact Footer & Collapsed Mobile SEO Accordion (`src/components/FooterAccordion.tsx` & `src/components/Footer.tsx`)
- **`src/components/FooterAccordion.tsx`**:
  - Set `defaultOpenId = null` so all 7 mobile directory accordions start collapsed by default.
  - Reduce accordion trigger headers from `min-h-[48px] px-4 py-3` to `min-h-[38px] px-3.5 py-2 text-[11px]` and render expanded links in a dense 2-column grid (`grid-cols-2 gap-x-2 gap-y-0.5`) with `py-1 text-[11px]` links.
- **`src/components/Footer.tsx`**:
  - Reduce footer vertical padding from `pt-10 lg:pt-12 pb-28 lg:pb-8` to `pt-6 lg:pt-8 pb-16 lg:pb-6`.
  - Tighten desktop column gaps (`gap-6 lg:gap-8 mb-6`), reduce column headings from `text-lg mb-6` to `text-xs lg:text-sm mb-3`, and compact social/contact pills (`px-2.5 py-1.5 text-[11px]`).

---

## 5. Verification
- Run `lint_applet` and `compile_applet` to verify zero TypeScript or build regressions.
- Execute a viewport vertical budget script to verify above-the-fold content visibility across mobile (`375×667`) and desktop (`1366×768`).
