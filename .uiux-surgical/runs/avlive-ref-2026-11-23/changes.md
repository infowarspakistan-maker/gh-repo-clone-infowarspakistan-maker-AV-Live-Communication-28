# UIUX Surgical Enhancer v2 — Reference-Grounded Design Options (`changes.md`)

- **Project:** AV Live Communications (`https://avlive.com.pk`)
- **Run ID:** `avlive-ref-2026-11-23`
- **Phase:** `Phase 3 — Human Gate (READ-ONLY — ZERO STOREFRONT FILES MODIFIED)`
- **Reference Source Inspected:** `/public/assets/aistudio/image_e982880c.png` (Clean E-Commerce Storefront Layout: Two-Tone Accent Hero + 3-Icon Value Bar, Circular Category Strip, Minimal Action-Square Product Cards, 3-Up Promo Banners, 4-Column Guarantee Bar).
- **Current Baseline:** Already includes `UPG-1`..`UPG-6` + `C1` + `H1` (`Intent-Tabbed Hero`, `Pause/Play`, `#0077B6`/`#38BDF8` WCAG AA contrast).
- **Interactive Visual Mockup (`noindex`):** Open **`/uiux-proposal.html`** (archived at `.uiux-surgical/runs/avlive-ref-2026-11-23/proposal.html`) to preview the attached reference screenshot side-by-side against AV Live **Color (`RC1`–`RC3`)**, **Hero Slider (`R-H1`–`R-H2`)**, and **Catalog/CTA Options (`UPG-7`–`UPG-10`)** across **Desktop (`1280×800`) & Mobile (`390×844`)**.
- **PII Redaction Audit:** 1 phone number in extracted nav metadata redacted to `{{REDACTED:PHONE}}` via `scripts/redact_pii.py`.

---

## A. Hard Constraints (Machine-Checked — Verbatim from `SKILL.md`)

1. **Logo unchanged**: bbox IoU >= 0.98, center position delta <= 2px.
2. **Primary/secondary colors**: CIEDE2000 delta_E00 <= 3.0 from extracted tokens (`#1A2B4C` & `#00B4D8` verified mathematically below).
3. **Typography**: identical font families (`Inter`, `ui-sans-serif`, `system-ui`, `sans-serif`); heading hierarchy intact (`H1` -> `H2` -> `H3`).
4. **UX flow**: navigation order identical; zero removed interactive elements.
5. **Accessibility**: zero NEW axe-core violations at WCAG 2.2 AA; touch targets >= 44x44px; `prefers-reduced-motion` variant for every added animation.
6. **Performance**: LCP <= 2.5s, INP <= 200ms (TBT <= 300ms lab proxy), CLS <= 0.1; CSS size delta <= 15%; zero new blocking resources.
7. **Bounds**: <= 30% viewport pixels changed (excluding logo & legal footer); <= 3 components restructured per page; zero top-level DOM reorders.

If any constraint fails during Phase 4, **ONLY the offending change hunk is REVERTED** — never the entire batch.

---

## B. Reference-Adapted Options & Ordered Safe Upgrades

Every design cue from `image_e982880c.png` is translated into AV Live's enterprise Pro-AV vocabulary and brand hex constraints (`ΔE00 <= 3.0`). Note the `bounds.yaml` **3 restructured components per page cap** — pick **1 Color (`RC1`–`RC3`)**, **1 Hero (`R-H1` or `R-H2` = Struct #1/3)**, and up to **2 remaining structural upgrades** (e.g. `UPG-7` + `UPG-8`, or `UPG-8` + `UPG-9`), plus styling-only `UPG-10`.

---

### Track 1 — Reference-Harmonized Color & CTA Fill Options (Pick One: `RC1`, `RC2`, or `RC3`)

| Option | Reference Adaptation & Look | Primary Navy (`ΔE00 <= 3`) | Hero & Promo CTA Style | Light-Surface Links / Accents | Trust / SLA Icons | Contrast & `ΔE00` Proof |
| --- | --- | --- | --- | --- | --- | --- |
| **`RC1` (Recommended)**<br/>**Broadcast Navy & Electric Ice** | Adapts Moveix's dark hero highlight keyword + bright pill CTA cleanly into crisp `#1A2B4C` + `#38BDF8` | `#1A2B4C`<br/>(`ΔE00 = 0.00`) | `#38BDF8` Solid CTA (`#111E36` ink) + Two-Tone `#38BDF8` Headline Highlight | `#0077B6` links & icons on `#FFF` | `#38BDF8` on Dark / `#0077B6` on Light | `#111E36` on `#38BDF8` = **`7.76:1`** (AAA);<br/>`#0077B6` on `#FFF` = **`4.87:1`** (AA) |
| **`RC2`**<br/>**Signature Aqua Pill & Deep Teal** | Mirrors Moveix's bright cyan pill CTA inside dark banners using AV Live's signature `#00B4D8` fill | `#1A2B4C`<br/>(`ΔE00 = 0.00`) | `#00B4D8` Solid Fill (`#1A2B4C` ink) inside Hero & 3-Up Promo Cards | `#026896` links & prices on `#FFF` | `#00B4D8` Fill + `#026896` Light Icons | `#1A2B4C` on `#00B4D8` = **`5.70:1`** (AA);<br/>`#026896` on `#FFF` = **`6.13:1`** (AA) |
| **`RC3`**<br/>**Cobalt Slate & Verified Emerald-Teal** | Brings Moveix's crisp emerald-teal freshness via AA `#0F766E` SLA badges alongside Deep Cobalt navy | `#172848`<br/>(`ΔE00 = 0.99`) | `#38BDF8` Solid Fill (`#111E36` ink) + `#0F766E` Verified Warranty Chips | `#0077B6` links + `#0F766E` SLA checkmarks | `#0F766E` SLA Badges on `#FFF` | `#0F766E` on `#FFF` = **`5.47:1`** (AA);<br/>`#172848` `ΔE00 = 0.99 <= 3.0` |

---

### Track 2 — Hero Slider Adaptations from `image_e982880c.png` (Pick One: `R-H1` or `R-H2` — `[Tier 2 Struct #1/3]`)

#### Option `R-H1` (Recommended) `[Tier 2 — Struct #1/3]` Two-Tone Accent Headline + Pinned 3-Icon SLA Strip + Intent Tabs
- **Inspired by Reference Hero (`image_e982880c.png` Top Banner):** Moveix highlights the key phrase in bright cyan/mint (`Move Smarter / Live Cleaner`), keeps 1 unmistakable Primary Pill CTA (`Shop the Collection ->`), and anchors 3 clean icon badges (`Zero Emissions | Lower Costs | A Greener Future`) right inside the hero floor.
- **Target:** `src/pages/Home.tsx` (`L526-612` mobile, `L675-827` desktop).
- **Before Token / Layout:** Solid white two-line slide title; trust line (`15-Min SLA · OEM Warranty`) sits plain-text to the right of CTAs and disappears below `xl` screens.
- **After Token / Layout:**
  1. **Two-Tone Display Headline:** Splits the slide headline visually so the core outcome phrase glows in `#38BDF8` (e.g., *Video Conference &* **`Event Precision`**), preserving the single visible `<h1>` in the `#111E36` bar above.
  2. **Reference Pill Primary CTA + Calm Ghost Link:** Bright solid pill CTA (`#38BDF8`/`#00B4D8` fill with `#111E36`/`#1A2B4C` bold ink + animated `ArrowRight`) + subtle outlined `15-Min BoQ Quote` ghost button (`>= 44px` height).
  3. **Pinned 3-Icon SLA Micro-Strip + Existing Intent Tabs & Pause/Play:** Compact icon badges (`15-Min Tech SLA`, `Official OEM Warranty`, `Lahore · Karachi · ISB`) integrated cleanly into the hero lower band above/beside the `01 / 02 / 03` Intent Tabs and WCAG 2.2 `Pause/Play` toggle (`max-h-[380px]` preserved, `CLS = 0.000`).

#### Option `R-H2` `[Tier 2 — Struct #1/3]` Reference Two-Tone Left Hero + Right Hardware Cutout Stage Card
- **Inspired by Reference Split Hero + Right Visual Balance:** Pairs the left two-tone headline, pill CTA, and 3-icon strip with a right-hand glass hardware card spotlighting the active slide's product/stage visual + slide number (`01/03`) + direct tab switcher.
- **Target:** `src/pages/Home.tsx` Desktop `16:6` Hero (`L675-827`).
- **Best For:** Showcasing crisp product cutouts (`Poly Studio X70`, `SMD Stage`, `VISSONIC Delegate`) even when CMS hero photos are wide room scenes.

---

### Track 3 — Catalog, Card & Guarantee Adaptations from `image_e982880c.png`

| ID | Risk Tier | Target Section | Reference Pattern (`image_e982880c.png`) | Before (`Home.tsx`) | After (Token-Mapped) |
| --- | --- | --- | --- | --- | --- |
| **`UPG-7`** | `Tier 2` (Struct #2/3) | **Category Strip** (`L830-844` & Mobile `L615-647`) | *"Shop by Category"* circular `#F8F9FA` avatars + Title + 2-word descriptor + right-aligned `View All Categories ->` | Plain icon tiles with no section title or sub-descriptor | Clean header (`Shop by Category` + `View All Categories ->` in `#0077B6`), crisp `w-16 h-16 rounded-full bg-[#F8F9FA] border-slate-200` hardware/icon rings + Title + short 2-word capability tag (`4K AI Bars`, `PoE HD Voice`, `4K 30x Zoom`) |
| **`UPG-8`** | `Tier 2` (Struct #3/3) | **Featured Product Cards** (`L991-1066`) | *"Featured Rides"* clean card: soft image box, 1-line model + 1-line category, bold price left + square action icon right | Multi-line rich-text description + wide `Specs & Quote` button compressing card footer | Crisp `#F8F9FA` product box (`aspect-[4/3]`), bold Model Title + 1-line `Brand · Category` label (prose removed from card face, preserved on PDP), bottom row: `tabular-nums` PKR Price left + **`44×44px` Quick-Quote / View Square (`rounded-xl`)** right |
| **`UPG-9`** | `Tier 2` (Alt Struct #3/3)* | **3-Up Commercial Promo Trio** (Between Featured & Bento `~L1082`) | *"Ride Further Together / Safety / Urban Freedom Bundles"* 3 dark-scrim horizontal promo cards | Not present on homepage (straight jump from carousel to Bento grid) | 3 compact `h-48` rounded-2xl dark-scrim photo cards (`Boardroom Turnkey Kits`, `SMD LED & 3D Hologram Events`, `Enterprise VoIP & Delegate Bundles`) with two-tone headline + `#00B4D8`/`#38BDF8` CTA pill |
| **`UPG-10`** | `Tier 1` (Styling) | **4-Pillar Engineering Guarantee Strip** (`L1217-1267` or above Setup Banner) | *"Free Delivery · 1-Year Warranty · Easy Returns · Future"* crisp 4-column horizontal icon strip | Engineering trust points sit only inside tall dark stats section | Crisp light `#FFFFFF` / `border-slate-200/80` 4-column horizontal trust bar (`Same-Day Lahore Dispatch`, `1-to-3 Yr OEM Warranty`, `PPRA & FBR GST Ready`, `15-Min Engineering SLA`) |

> **\*3-Component Structural Cap Note (`bounds.yaml`):** Because `max_restructured_per_page: 3`, choose **Hero (`R-H1` or `R-H2`) = #1/3** + **any TWO of `UPG-7`, `UPG-8`, or `UPG-9`** (`#2/3` & `#3/3`), plus styling-only **`UPG-10`** (Tier 1 does not consume a structural slot). **Recommended Bundle:** **`RC1 + R-H1 + UPG-7 + UPG-8 + UPG-10`** (or swap `UPG-7` for `UPG-9` if you prioritize the 3-up promo banners!).

---

## C. Explicitly Rejected Ideas (Auto-Blocked by Risk Tiers & Hard Constraints)

| Rejected Idea from Reference Image | Violated Constraint / Risk Tier |
| --- | --- |
| Replace AV Live navy/cyan (`#1A2B4C` / `#00B4D8`) with Moveix forest-black & neon mint (`#0D1F18` / `#3DD598`) | **Hard Constraint #2** — Exceeds `ΔE00 <= 3.0` brand color threshold (`ΔE00 > 35.0`). |
| Replace `AV Live` header lockup or add Moveix top black announcement bar over our `<h1>` bar | **Tier 0 Frozen Component & Hard Constraint #3/#4** — Logo bbox IoU must be `>= 0.98`; preserves `#111E36` `<h1>` Authority Bar & nav links. |
| Add Moveix's `"What Our Riders Say"` synthetic `"Ali R. / Sana K."` 5-star review cards | **Brand Integrity & No-Mock-Data Policy** — AV Live already showcases authentic enterprise deployments (`RealProjectsAndClients`: Meta, World Bank, UNDP, Nestlé); never fabricate testimonial quotes. |
| Add Moveix bottom newsletter email capture form or redesign footer columns/payment badges | **Tier 0 Frozen Component** — Legal footer, social links, and payment/contact structure are frozen; AV Live routes leads to Setup Wizard & 15-Min BoQ Quote. |
| Remove `heroSlides` multi-slide rotation or delete `Pause/Play` button | **Hard Constraint #4 & WCAG 2.2 SC 2.2.2** — Keeps dynamic CMS slides and keyboard/touch Pause control intact. |

---

## Human Gate — How to Approve Your Preferred Reference-Adapted Stack
Open **`/uiux-proposal.html`** to visually inspect `image_e982880c.png` side-by-side against interactive **Color (`RC1`/`RC2`/`RC3`)**, **Hero (`R-H1`/`R-H2`)**, and **Sections (`UPG-7`–`UPG-10`)**, then reply with:
- **`APPROVE RC1, R-H1, UPG-7, UPG-8, UPG-10`** (Recommended clean catalog + hero upgrade)
- **`APPROVE RC2, R-H1, UPG-8, UPG-9, UPG-10`** (Aqua CTA + product cards + 3-up promo banners)
- **`EDIT <notes>`** to customize wording, badge copy, or section mix before Phase 4 runs
- **`REJECT`** to clean up the preview and keep storefront code as-is.
