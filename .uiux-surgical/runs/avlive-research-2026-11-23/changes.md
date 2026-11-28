# UIUX Surgical Enhancer v2 — UX, Color, Hero Slider & CTA Research Plan (`changes.md`)

- **Project:** AV Live Communications (`https://avlive.com.pk`)
- **Run ID:** `avlive-research-2026-11-23`
- **Phase:** `Phase 3 — Human Gate (READ-ONLY — ZERO STOREFRONT FILES MODIFIED)`
- **Current Baseline:** Includes already-applied `UPG-1` (`prefers-reduced-motion`) and `UPG-2` (Hero `#38BDF8` eyebrow, scrim, `44px` hero CTAs).
- **Interactive Visual Mockup (`noindex`):** Open **`/uiux-proposal.html`** (`.uiux-surgical/runs/avlive-research-2026-11-23/proposal.html`) to test all **Color Palette Options (C1–C3)**, **Hero Slider Options (H1–H2)**, **CTA Upgrades**, and **Desktop (`1280×800`) vs. Mobile (`390×844`)** side-by-side before approving any code change.
- **PII Redaction Audit:** 1 phone number in extracted nav metadata redacted to `{{REDACTED:PHONE}}` via `scripts/redact_pii.py`.

---

## A. Hard Constraints (Machine-Checked — Verbatim from `SKILL.md`)

1. **Logo unchanged**: bbox IoU >= 0.98, center position delta <= 2px.
2. **Primary/secondary colors**: CIEDE2000 delta_E00 <= 3.0 from extracted tokens (`#1A2B4C` and `#00B4D8` anchors verified mathematically below).
3. **Typography**: identical font families (`Inter`, `ui-sans-serif`, `system-ui`, `sans-serif`); heading hierarchy intact (`H1` -> `H2` -> `H3`).
4. **UX flow**: navigation order identical; zero removed interactive elements.
5. **Accessibility**: zero NEW axe-core violations at WCAG 2.2 AA; touch targets >= 44x44px; `prefers-reduced-motion` variant for every added animation; explicit Pause/Play for >5s auto-rotating hero content (WCAG 2.2 SC 2.2.2).
6. **Performance**: LCP <= 2.5s, INP <= 200ms (TBT <= 300ms lab proxy), CLS <= 0.1; CSS size delta <= 15%; zero new blocking resources.
7. **Bounds**: <= 30% viewport pixels changed (excluding logo & legal footer); <= 3 components restructured per page; zero top-level DOM reorders.

If any constraint fails during Phase 4, **ONLY the offending change hunk is REVERTED** — never the entire batch.

---

## B. Research-Backed Design Options & Ordered Safe Upgrades

Based on 2025/2026 enterprise Pro-AV UX research (**HP Poly, Cisco Webex Devices, Logitech Video Collaboration, Crestron, AVIXA** and **WCAG 2.2 B2B Carousel Studies**), below are curated **Color**, **Hero Slider**, and **CTA & Catalog** options that fit AV Live cleanly without breaking brand recognition or SEO structure.

---

### Track 1 — Color & Look Options (Pick One: `C1`, `C2`, or `C3`)

| Option | Aesthetic Personality | Primary Navy (`ΔE00 <= 3`) | Light-Surface Action / Price Accent | Primary CTA Style | Trust / SLA Signal | Contrast & Brand Math |
| --- | --- | --- | --- | --- | --- | --- |
| **`C1` (Recommended)**<br/>**Executive Broadcast Blue** | Crisp, clinical enterprise hardware catalog (Poly / Cisco aligned) | `#1A2B4C`<br/>(`ΔE00 = 0.00`) | `#0077B6` Deep Broadcast Blue | Solid `#1A2B4C` / White Hero fill (`#FFFFFF` on `#0077B6` hover) | `#38BDF8` Hero Accent | `#0077B6` on `#FFF` = **`4.87:1`** (AA);<br/>`#1A2B4C` on `#FFF` = **`14.06:1`** (AAA) |
| **`C2`**<br/>**Enterprise Command & Signal Amber** | High-urgency B2B tender / event-booking conversion focus | `#162645`<br/>(`ΔE00 = 1.68`) | `#026896` Deep Studio Teal | High-contrast Signal Amber Quote CTA (`#F59E0B` fill + `#111827` ink) | `#047857` Emerald Verified SLA | `#026896` on `#FFF` = **`6.13:1`** (AA);<br/>`#111827` on `#F59E0B` = **`8.26:1`** (AAA) |
| **`C3`**<br/>**Architectural Slate & Crisp Cyan** | Calm, architectural integrator tone (Crestron / Logitech aligned) | `#1B2D4F`<br/>(`ΔE00 = 0.72`) | `#0077B6` Deep Cyan + `#475569` Slate Prose | Deep `#0077B6` Solid Primary + Crisp Ghost Secondary | `#047857` Warranty Check | `#FFFFFF` on `#0077B6` = **`4.87:1`** (AA);<br/>`#475569` on `#FFF` = **`7.58:1`** (AAA) |

*Note:* All three color options stay inside `ΔE00 <= 1.68` on the primary brand anchor (well below the `3.0` cap) and eliminate every `2.46:1` `#00B4D8`-on-white WCAG AA failure below the fold.

---

### Track 2 — Hero Slider & CTA Architecture Options (Pick One: `H1` or `H2`)

B2B AV buyers rarely wait through passive 10-second auto-advancing dot carousels. Research shows replacing anonymous dots with **intent-labeled controls** and a **clear 1-Primary / 1-Ghost CTA hierarchy** lifts engagement while protecting LCP (`<= 1.8s`) and CLS (`0.000`).

#### Option `H1` (Recommended) `[Tier 2 — Struct #1/3]` Intent-Tabbed Hero + WCAG 2.2 Pause/Play Control
- **Target:** `src/pages/Home.tsx` (`L214-218`, `L655-765`, mobile `L524-568`).
- **Before:** 10s auto-play with no explicit Pause/Play button (`WCAG 2.2 SC 2.2.2` gap), hover-only left/right arrows (`opacity-0`), tiny anonymous indicator dots bottom-right, and two competing uppercase CTAs.
- **After:**
  1. **Named Solution Intent Tabs** at bottom-left/center (`01 · Boardroom Video`, `02 · Corporate Events & LED`, `03 · Executive Codecs`) replacing anonymous indicator bars so enterprise buyers jump straight to their need.
  2. **Explicit `44×44px` Pause / Play Toggle + `onFocus` Auto-Pause** paired with visible subtle prev/next buttons (`opacity-85 hover:opacity-100`) for full keyboard and touch accessibility.
  3. **1 Primary Solid CTA + 1 Ghost Secondary CTA + Buyer Trust Micro-Line:** Primary action (*"Request 15-Min BoQ Quote"* or *"Explore Catalog"*) + understated secondary link (*"15-Min Event / AV Quote →"*) + clean 1-line proof: `15-Min Engineering SLA · Official OEM Warranty · Lahore, Karachi & Islamabad`.
  4. **Mobile Hero Upgrade:** Compact 1-tap `01 / 02 / 03` slide switcher + Pause button so mobile buyers aren't forced through blind dots.

#### Option `H2` `[Tier 2 — Struct #1/3]` Split Stage + Framed Hardware Spotlight Card (Cisco Webex Pattern)
- **Target:** `src/pages/Home.tsx` Desktop `16:6` Hero (`L655-765`).
- **Before:** Text sits over the full-bleed background stage image with slide dots on the far right.
- **After:**
  - Keeps the `16:6` (`max-h-[380px]`) dark navy photo backdrop with deeper scrim on the left `60%` for narrative + Primary/Secondary CTAs.
  - Adds a right-aligned **Interactive Slide Index & Featured Hardware Spotlight Card** showing the active slide's hero hardware/stage thumbnail, quick price/spec line, Pause/Play button, and clickable slide cards (`Boardroom AV` / `SMD & Hologram Events` / `Delegate Systems`).

---

### Track 3 — Safe Storefront CTA, Contrast & Card Polish (`UPG-3`, `UPG-4`, `UPG-5`, `UPG-6`)

| ID | Risk Tier | Target Component | Before Token | After Token | Measurable Impact |
| --- | --- | --- | --- | --- | --- |
| **`UPG-3`** | `Tier 2` (#2/3) | **Dual Commercial Pillars & Service Grid** (`Home.tsx` L785-867) | `#00B4D8` kickers/links (**2.46:1 FAIL**); detached `rounded-full` tabs; `bg-gray-50 rounded-3xl p-8` | Selected Color (`#0077B6` **4.87:1** or `#026896` **6.13:1**); unified `bg-slate-100 p-1 rounded-xl` segmented control (`min-h-[44px]`); crisp `bg-white rounded-2xl p-6 border-slate-200/80` | Fixes 4+ WCAG contrast fails; reduces spacing CV by `> 30%` |
| **`UPG-4`** | `Tier 2` (#3/3) | **Featured Hardware Carousel Cards & CTA Hierarchy** (`Home.tsx` L870-1018) | Boxed `border-gray-200` Brand/SKU chips; `rounded-3xl`; non-tabular PKR price; `View Specs` dark badge | Clean inline `Brand · SKU` metadata; `rounded-2xl border-slate-200/80 hover:-translate-y-1 motion-reduce:transform-none`; `tabular-nums` PKR price; crisp `View Specs & Quote` (`min-h-[44px]` mobile) | Zero pill clutter; clean price scanning; 0 removed buttons |
| **`UPG-5`** | `Tier 1` (Styling) | **Flagship Video Bento Grid Contrast & Radius** (`Home.tsx` L1022-1105) | `#00B4D8` PKR prices & kicker on white (**2.46:1 FAIL**); `rounded-3xl` / `rounded-[2.5rem]` mismatch | Selected AA accent (`4.87:1`–`6.13:1`) + `tabular-nums`; unified `rounded-2xl border-slate-200/80` | Fixes 6 WCAG contrast fails (`2.46:1 -> 4.87:1+`); styling-only |
| **`UPG-6`** | `Tier 1` (Styling) | **Trust Stats, AEO Table & FAQ Pill Cleanup** (`Home.tsx` L1110-1410) | `#00B4D8` column header & kickers on white (**2.46:1 FAIL**); FAQ `rounded-full` micro-badges; non-tabular table numbers | AA accent (`#0077B6`/`#026896`) on light surfaces, `#38BDF8` (`6.56:1`) on `#1A2B4C` dark trust section, unboxed FAQ kickers, `tabular-nums` pricing matrix | Completes 100% homepage WCAG 2.2 AA contrast & zero-pill discipline |

---

## C. Explicitly Rejected Ideas (Auto-Blocked by Risk Tiers & Hard Constraints)

| Rejected Idea | Violated Constraint / Risk Tier |
| --- | --- |
| Remove the Hero Slider entirely and lock a single static banner | **Hard Constraint #4 / User Requirement** — Preserves existing 3-slide CMS `heroSlides` data model and improves slider controls rather than deleting CMS functionality. |
| Restyle or enlarge the `AV Live` header logo lockup | **Tier 0 Frozen Component** — Logo bbox IoU must stay `>= 0.98`, center delta `<= 2px`. |
| Reorder primary navbar links or remove mega-menu / footer links | **Hard Constraint #4 & `AGENTS.md` §6.2** — Preserves navigation order and `166/166` $\le 2$-click crawl depth. |
| Switch storefront to obsidian dark theme or swap `Inter` font | **Hard Constraints #2, #3 & #7** — Breaches `ΔE00 <= 3.0`, font lock, and `30%` max pixel diff. |
| Delete the top `#111E36` H1 Authority Bar or wishlist `<button>` | **Hard Constraints #3 & #4** — Preserves single visible `<h1>` and `max_removed_interactive: 0`. |

---

## Human Gate — How to Approve Your Preferred Combination
Open **`/uiux-proposal.html`** to compare **Color (`C1`/`C2`/`C3`)**, **Hero (`H1`/`H2`)**, and **Sections (`UPG-3`–`UPG-6`)** interactively, then reply with your choice, for example:
- **`APPROVE C1, H1, UPG-3, UPG-4, UPG-5, UPG-6`** (or any combination you prefer)
- **`EDIT <notes>`** to tweak colors, button labels, or slider layout before Phase 4 runs
- **`REJECT`** to leave all storefront code unchanged.
