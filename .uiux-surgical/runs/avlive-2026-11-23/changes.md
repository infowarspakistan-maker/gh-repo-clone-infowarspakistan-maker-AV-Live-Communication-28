# UIUX Surgical Enhancer v2 — Enhancement Plan (`changes.md`)

- **Project:** AV Live Communications (`https://avlive.com.pk`)
- **Run ID:** `avlive-2026-11-23`
- **Phase:** `Phase 3 — Human Gate (READ-ONLY — ZERO STOREFRONT FILES MODIFIED)`
- **Detected Design System:** `tailwind` + `custom_tokens` (`171` files scanned, `12` dominant hex tokens)
- **Detected Niche:** `enterprise-av-communications` (`b2b video conferencing, voip & corporate event production`)
- **Interactive Preview Mockup:** `.uiux-surgical/runs/avlive-2026-11-23/proposal.html` (also previewable at `/uiux-proposal.html`, `noindex`)
- **PII Redaction Audit:** 1 phone number in extracted nav signal redacted to `{{REDACTED:PHONE}}` via `scripts/redact_pii.py` prior to persistence.

---

## A. Hard Constraints (Machine-Checked — Verbatim from `SKILL.md`)

1. **Logo unchanged**: bbox IoU >= 0.98, center position delta <= 2px.
2. **Primary/secondary colors**: CIEDE2000 delta_E00 <= 3.0 from extracted tokens (`#1A2B4C` -> `#1A2B4C` ΔE00 = `0.00`; `#00B4D8` -> `#00B4D8` ΔE00 = `0.00`).
3. **Typography**: identical font families (`Inter`, `ui-sans-serif`, `system-ui`, `sans-serif`); heading hierarchy intact (`H1` -> `H2` -> `H3`).
4. **UX flow**: navigation order identical; zero removed interactive elements.
5. **Accessibility**: zero NEW axe-core violations at WCAG 2.2 AA; touch targets >= 44x44px; `prefers-reduced-motion` variant for every added animation.
6. **Performance**: LCP <= 2.5s, INP <= 200ms (TBT <= 300ms lab proxy), CLS <= 0.1; CSS size delta <= 15%; zero new blocking resources.
7. **Bounds**: <= 30% viewport pixels changed (excluding logo & legal footer); <= 3 components restructured per page; zero top-level DOM reorders.

If any constraint fails during Phase 4, **ONLY the offending change hunk is REVERTED** — never the entire batch.

---

## B. Ordered Safe Upgrades (System-Token Mapped, Zero Off-System Hex)

All proposed tokens are drawn strictly from AV Live's already-detected Tailwind & `system_mapping.json` palette (`#1A2B4C`, `#00B4D8`, `#0077B6`, `#38BDF8`, `#F8F9FA`, `#FFFFFF`, `#E2E8F0`). Planned `validate_bounds.py` preflight: **0 violations** (`16%` estimated viewport pixel diff, `3/3` Tier-2 restructured components, `4%` CSS delta, `44px` min touch target).

### 1. `[Tier 1 — Styling Only]` Global Reduced-Motion Guard (`src/index.css`)
- **Target:** `.animate-marquee` and `.page-transition-enter-active` in `src/index.css`.
- **Before Token:** Unconditional CSS marquee animation (`animation: marquee 120s linear infinite`) and page-transition transforms with no reduced-motion fallback.
- **After Token:** Append `@media (prefers-reduced-motion: reduce)` pausing `.animate-marquee` (`animation-play-state: paused`) and clamping transition durations (`transition-duration: 0.01ms !important`), keeping CSS delta at `~4%` (cap: `15%`).
- **Color / A11y Proof:** Satisfies WCAG 2.2 SC 2.3.3 and `bounds.yaml` `motion.requires_reduced_motion_variant: true`. Zero layout shift (`CLS = 0.000`).
- **Inspiration Ref:** Cisco Webex Devices & AVIXA enterprise accessibility standard.

### 2. `[Tier 1 — Styling Only]` Desktop & Mobile Hero Presentation & Touch Targets (`src/pages/Home.tsx` L524–591, L656–765)
- **Target:** Mobile compact hero promo card and Desktop `16:6` (`max-h-[380px]`) hero banner.
- **Before Token:**
  - Desktop kicker wrapped in solid cyan micro-badge (`bg-[#00B4D8] px-3 py-1 rounded-md text-[9px]`); mobile kicker wrapped in `rounded-full bg-white/10`.
  - Mobile CTAs: `min-h-[34px] py-1.5` (**34px — fails 44px touch target floor**).
  - Desktop CTAs: `min-h-[36px] py-2` (**36px**).
  - Scrim: `from-[#1A2B4C]/95 via-[#1A2B4C]/75 to-transparent`.
- **After Token:**
  - Replace pill kicker box with crisp unboxed typographic eyebrow (`text-[#38BDF8] text-xs font-bold tracking-[0.14em] uppercase`) preserving identical copy and `H2` -> subhead -> CTA DOM order.
  - Upgrade both Mobile & Desktop CTAs to `min-h-[44px] py-2.5 px-5 rounded-xl` with `text-balance` on the hero `H2`.
  - Tighten scrim to `from-[#1A2B4C]/96 via-[#1A2B4C]/80 to-[#1A2B4C]/25` so headline legibility remains crisp across all 3 hero slides.
- **Color / A11y Proof:**
  - `#38BDF8` on `#1A2B4C` = **`6.56:1`** (`wcag_aa_pass: true`, verified by `scripts/contrast_ratio.py`).
  - `#1A2B4C` on `#FFFFFF` primary CTA = **`14.06:1`** (`wcag_aaa_pass: true`).
  - Touch targets raised from `34px`/`36px` to **`44px`** (`>= 44px` WCAG 2.2 AA).
  - Primary `#1A2B4C` $\Delta E_{00} = 0.00$; Secondary `#00B4D8` $\Delta E_{00} = 0.00$.
- **Inspiration Ref:** `webex.com/devices` dark editorial hero scrim + balanced display headline containment.

### 3. `[Tier 2 — Structural Within Bounds #1/3]` Dual Commercial Pillars & Service Cards (`src/pages/Home.tsx` L785–867)
- **Target:** "Dual Commercial Pillars" section header, 2-button pillar switcher, and 3-column service/shop cards.
- **Before Token:**
  - Eyebrow kicker: `text-[#00B4D8]` on `bg-white` (**2.46:1 — WCAG AA FAIL**).
  - Pillar switcher: two detached `rounded-full bg-gray-100 uppercase tracking-widest` capsule pills.
  - Service cards: `bg-gray-50 rounded-3xl p-8 border border-gray-100`; CTA links in `text-[#00B4D8]` on `#F9FAFB` (**2.35:1 — WCAG AA FAIL**).
- **After Token:**
  - Eyebrow kicker & card CTA links upgraded to existing system token `text-[#0077B6]` (`hover:text-[#1A2B4C]`).
  - Pillar switcher refactored into a single crisp segmented control (`inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80`) with `min-h-[44px] px-5 rounded-lg` active white elevated tab (`bg-white text-[#1A2B4C] shadow-xs`) — preserving exact button handlers and labels.
  - Service cards unified to `bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#1A2B4C]/25 hover:shadow-md transition-all motion-reduce:transition-none` with uniform `gap-6` grid spacing.
- **Color / A11y Proof:**
  - `#0077B6` on `#FFFFFF` = **`4.87:1`** (`wcag_aa_pass: true`) vs `#00B4D8` = **`2.46:1`** (`FAIL`).
  - `#0077B6` on `#F8F9FA` = **`4.62:1`** (`wcag_aa_pass: true`).
  - Spacing CV across card padding/gaps reduced by `> 30%` (threshold: `>= 15%`).
- **Inspiration Ref:** `logitech.com/video-collaboration` segmented B2B switcher + crisp hairline white cards.

### 4. `[Tier 2 — Structural Within Bounds #2/3]` Featured Product Carousel Cards (`src/pages/Home.tsx` L870–1018)
- **Target:** Featured hardware section kicker, product cards, Brand/SKU metadata row, and PKR price footer.
- **Before Token:**
  - Section kicker `text-[#00B4D8]` on white (**2.46:1 — WCAG AA FAIL**).
  - Cards: `rounded-3xl border-gray-100 hover:-translate-y-2` with boxed Brand and SKU chip borders (`border border-gray-200 px-2 py-0.5 rounded-sm`) and non-tabular PKR price text.
- **After Token:**
  - Section kicker & hover accents upgraded to `text-[#0077B6]` (`4.87:1`).
  - Card container refined to `rounded-2xl border-slate-200/80 hover:border-[#1A2B4C]/25 hover:shadow-md hover:-translate-y-1 motion-reduce:transform-none` with clean `bg-[#F8F9FA] border-b border-slate-100` hardware photo stage.
  - Replace boxed Brand + SKU pills with clean unboxed typographic metadata (`POLY · SKU 7200-87820-001` separated by `·`) — zero pill clutter!
  - Apply `tabular-nums` to PKR pricing and keep all interactive elements intact (wishlist button, product link, filter buttons — `0` removed controls).
- **Color / A11y Proof:**
  - `#0077B6` on `#FFFFFF` = **`4.87:1`**; `#1A2B4C` price on `#FFFFFF` = **`14.06:1`**.
  - Motion strictly restricted to `transform` & `opacity` with `motion-reduce:transform-none`.
- **Inspiration Ref:** `poly.com` enterprise hardware spec cards (clean neutral image bay, unboxed SKU line, tabular prices).

### 5. `[Tier 2 — Structural Within Bounds #3/3]` Flagship Video Conferencing Bento Grid (`src/pages/Home.tsx` L1022–1100)
- **Target:** 4-column Poly X70 & Cisco Room Kit bento cards and PKR pricing typography.
- **Before Token:**
  - PKR prices rendered in `text-[#00B4D8] font-black` on `#FFFFFF` (**2.46:1 — WCAG AA FAIL**).
  - Cards use heavy `rounded-3xl border-gray-100` with inconsistent vertical spacing.
- **After Token:**
  - Upgrade PKR price typography to `text-[#0077B6] font-extrabold tabular-nums` (`4.87:1` WCAG AA pass) and card frames to `rounded-2xl border-slate-200/80 hover:border-[#1A2B4C]/25 hover:shadow-md motion-reduce:transition-none`, matching the unified 16px (`rounded-2xl`) enterprise radius scale across the homepage.
- **Color / A11y Proof:**
  - Contrast lifted from **`2.46:1` (FAIL)** to **`4.87:1` (WCAG 2.2 AA PASS)**.
  - Total Tier-2 restructured components = **`3 / 3`** (strictly within `bounds.yaml` cap).
- **Inspiration Ref:** `avixa.org` + `poly.com` specification bento grid.

---

## C. Explicitly Rejected Ideas (Auto-Blocked by Risk Tiers & Hard Constraints)

| Rejected Idea | Violated Constraint / Risk Tier |
| --- | --- |
| Restyle or enlarge the `AV Live` header logo lockup into a full-bleed dark bar | **Tier 0 Frozen Component** — Logo bbox IoU must stay `>= 0.98`, center delta `<= 2px`. |
| Reorder top navigation links or collapse the mega-menu categories into a hamburger on desktop | **Hard Constraint #4** — Navigation order must remain identical; zero removed interactive elements; breaks `AGENTS.md` $\le 2$-click crawl depth. |
| Replace `#1A2B4C` navy primary palette with pure obsidian `#050301` dark mode across the storefront | **Hard Constraint #2 & #7** — Primary color $\Delta E_{00} \gg 3.0$ and viewport pixel diff would exceed `30%`. |
| Swap `Inter` font family for an editorial serif (`Playfair Display` / `Fraunces`) | **Hard Constraint #3** — Identical font families required (refinement of weight, size, leading, and `tabular-nums` only). |
| Redesign or compact the legal footer / sitemap columns | **Tier 0 Frozen Component** — Legal footer is frozen and required for `166/166` SEO silo reachability. |
| Remove the top `#111E36` H1 Authority Bar to increase hero height | **Hard Constraint #3 & `AGENTS.md` §6.2** — Preserves the single visible `<h1>` across mobile & desktop for Mobile-First Indexing and zero DOM reorder. |
| Remove the card Wishlist `<button>` because its handler is currently a no-op | **Hard Constraint #4** — `max_removed_interactive: 0`; kept intact in Phase 3/4 (can be wired in a separate functional task). |

---

## Human Gate Status
**STOPPED AT PHASE 3.** Zero storefront files (`src/*`) have been edited.
Reply **`APPROVE`** to unlock Phase 4 (isolated implementation + closed-loop fidelity/enhancement/WCAG/Lighthouse verification), **`EDIT <notes>`** to adjust any upgrade item, or **`REJECT`** to abort cleanly.
