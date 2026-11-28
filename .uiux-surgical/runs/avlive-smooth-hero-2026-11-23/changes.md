# UIUX Surgical Enhancer v2 — Hero Redesign & Smooth UI Proposal (`changes.md`)

- **Project:** AV Live Communications (`https://avlive.com.pk`)
- **Run ID:** `avlive-smooth-hero-2026-11-23`
- **Phase:** `Phase 3 — Human Gate (READ-ONLY — ZERO STOREFRONT FILES MODIFIED)`
- **User Brief:** *"our UI is not smooth plus hero slide is not really great — find a better solution and create a mock before implementation through the UI/UX agent"*
- **Interactive Visual Mockup (`noindex`):** Open **`/uiux-proposal.html`** (archived at `.uiux-surgical/runs/avlive-smooth-hero-2026-11-23/proposal.html`) to test live **Hero Slide Options (`HS-1`, `HS-2`, `HS-3`)** and **60/120fps Smooth UI Motion (`SM-1`–`SM-3`)** side-by-side against the current baseline across **Desktop (`1280×800`)** and **Mobile (`390×844`)**.
- **PII Redaction Audit:** 1 phone number in extracted nav metadata redacted to `{{REDACTED:PHONE}}` via `scripts/redact_pii.py`.

---

## Diagnostic Summary (Why Current UI Feels Stiff & Why Hero Slide Underperforms)

1. **Hero Cramping & Vertical Collision (`Home.tsx` `L745–888`):** Desktop hero is capped at `max-h-[380px]` with `pb-14`, squeezing the eyebrow, 2-line `<h2>`, 2-line subtitle, two `44px` CTAs, and 3-icon SLA bar above a `58px` bottom tab bar while `left-3`/`right-3` prev/next arrows float awkwardly mid-margin.
2. **Hard Text Snap & Empty Right 45%:** Background fades (`duration-500`) while hero headline, subtitle, and CTAs swap instantaneously with `0ms` choreography, zero subtle depth/Ken Burns motion, no slide timer feedback, and an empty dim gradient on the right half (`45%` of viewport width).
3. **`transition-all` & Scrollbar Paint Jank (`Home.tsx` + `index.css`):** Cards and sliders use `transition-all` (recalculating box-shadow/border/layout together) instead of GPU-composited `transform` + `opacity` with cubic-bezier `(0.22, 1, 0.36, 1)`. Meanwhile `img[loading="lazy"] { content-visibility: auto; }` + `backdrop-blur-sm` inside horizontal `overflow-x-auto` carousels introduces scroll stutter on trackpads and mobile touch swipes.
4. **Abrupt Tab/Filter State Swaps (`L960–1171`):** Switching `Dual Commercial Pillars` or `Featured Products` category chips (`All Models`, `Video Conferencing`, etc.) snaps cards with zero entrance glide, and carousel prev/next buttons remain `opacity-0` until hovered (invisible on touch devices).

---

## A. Hard Constraints (Machine-Checked — Verbatim from `SKILL.md` & `bounds.yaml`)

1. **Logo unchanged**: bbox IoU >= 0.98, center position delta <= 2px (`Tier 0 Frozen`).
2. **Primary/secondary colors**: CIEDE2000 `delta_E00 <= 3.0` from extracted tokens (`#1A2B4C` Navy, `#00B4D8` Brand Cyan, `#38BDF8` Hero Highlight, `#0077B6` AA Light Accent).
3. **Typography**: identical font families (`Inter, ui-sans-serif, system-ui, sans-serif`); single visible `<h1>` preserved in `#111E36` authority bar.
4. **UX flow**: navigation order identical; zero removed interactive controls (`Pause/Play` WCAG 2.2 SC 2.2.2 preserved).
5. **Accessibility**: zero NEW axe-core violations at WCAG 2.2 AA; all interactive targets `>= 44×44px`; `@media (prefers-reduced-motion: reduce)` disablement on every added animation.
6. **Performance & Motion Bounds**: `LCP <= 2.5s`, `TBT <= 300ms`, `CLS <= 0.1` (`<= 0.000` target); CSS size delta `<= 15%`; **animated properties strictly `transform` and `opacity`** (`max_animated_properties_per_view <= 3`).
7. **Bounds**: `<= 30%` viewport pixels changed; `<= 3` restructured components per page (`Tier 2`); zero top-level DOM reorders.

---

## B. Ordered Safe Upgrades (System-Token Mapped)

> Pick **1 Hero Option (`HS-1`, `HS-2`, or `HS-3`)** + **UI Smoothness Layer (`SM-1` + `SM-2`, plus optional `SM-3`)**. Total restructured (`Tier 2`) slots used: **1–2 out of 3 max**.

### Track 1 — Hero Slide Solutions (Pick One: `HS-1`, `HS-2`, or `HS-3`)

| ID | Risk Tier | Inspiration Source | Layout & UX Upgrade | Before Token / Behavior | After Token / Behavior | Contrast & `ΔE00` Proof |
| --- | --- | --- | --- | --- | --- | --- |
| **`HS-1` (Recommended)** | **`Tier 2` (Struct #1/3)** | `poly.com` & `webex.com/devices` | **Flagship Split-Stage Hero:** Breathing room (`lg:h-[440px]`), left two-tone editorial stack (`transform + opacity` staggered enter) + **Right 40% Floating Hardware Spotlight Card** (active kit image, PKR starting tier, Zoom/Teams/SIP chips) + subtle Ken Burns zoom (`1.04 -> 1.00`) + **Animated Timer Bar** on active `01/02/03` tab & unified Prev/Next/Pause capsule + mobile touch swipe. | `max-h-[380px]` cramped stack, 0ms text snap, empty right scrim, disconnected arrows | `lg:h-[440px]`, split 7/5 grid, right glass spotlight card (`bg-[#111E36]/75 border-white/15`), integrated bottom dock with 10s progress indicator | `#FFFFFF` on `#111E36` = **`16.63:1`** (AAA); `#111E36` on `#38BDF8` = **`7.76:1`** (AAA); `#38BDF8` on `#1A2B4C` = **`6.56:1`** (AA) |
| **`HS-2`** | **`Tier 2` (Struct #1/3)** | `logitech.com/video-collaboration` | **Spatial "Choose Your Space" Hero:** Full-bleed darkened stage canvas (`lg:h-[430px]`) on left + **Interactive 3-Card Room Deployment Selector** on right (*Huddle & Small Rooms*, *Executive Boardrooms 8–20 Seats*, *Corporate Events & SMD Walls*) that smoothly switches hero slide on click/focus. | Static `01/02/03` text tabs at bottom edge only | Right-rail interactive spatial switcher (`min-h-[44px]` cards with active `#38BDF8` rail) + smooth GPU slide crossfade | `#E2E8F0` on `#1A2B4C` = **`11.40:1`** (AAA); `#1A2B4C` `ΔE00 = 0.00` |
| **`HS-3`** | **`Tier 1` (Styling Only — 0 Struct Slots)** | Motion Audit | **Pure Smooth Motion Hero Polish:** Preserves exact current single-column hero structure, relaxes height (`lg:h-[420px]`), adds coordinated `translateY + opacity` text choreography, Ken Burns backdrop zoom, active tab progress fill, and unified corner Prev/Next/Pause dock. | Abrupt text cut + tight `pb-14` bottom tab overlap | `transform + opacity` cubic-bezier `(0.22, 1, 0.36, 1)` transitions + progress pill dock | Zero token changes (`ΔE00 = 0.00`) |

---

### Track 2 — 60/120fps Smooth UI Layer (`SM-1`, `SM-2`, `SM-3`)

| ID | Risk Tier | Target Scope | Smoothness & Micro-Interaction Fix | Before (`Home.tsx` / `index.css`) | After (Token-Mapped & GPU-Only) | Compliance & Motion Proof |
| --- | --- | --- | --- | --- | --- | --- |
| **`SM-1` (Essential)** | **`Tier 1` (Styling Only)** | `src/index.css` + `src/pages/Home.tsx` cards & category scrollers | **GPU Compositor Hygiene:** Replace `transition-all` with `transition-[transform,opacity,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`; scope `content-visibility: auto` OFF horizontal scroll carousels; remove `backdrop-blur-sm` inside fast-scrolling product cards; add smooth overscroll containment (`overscroll-x-contain`). | `transition-all`, lazy `content-visibility` jitter inside horizontal scroll strips, blurred button layers over scrolling cards | Strictly `transform` + `opacity` composited transitions; silky 60/120fps horizontal scroll & card lift | Follows `bounds.yaml`: `allowed_properties: [transform, opacity]`, full `prefers-reduced-motion` disablement |
| **`SM-2` (Essential)** | **`Tier 1` (Styling Only)** | `Dual Commercial Pillars` (`L960+`) & `Featured Filters` (`L1038+`) | **Fluid Tab & Filter Crossfade:** Add keyframed entrance animation (`opacity: 0 -> 1`, `translateY: 8px -> 0`, `260ms cubic-bezier(0.22, 1, 0.36, 1)`) keyed to `activeIntentTab` and `activeFilter`, plus tactile `active:scale-[0.98]` press feedback on all pill buttons. | Instantaneous 0ms DOM swap with zero visual continuity | Smooth upward settle (`transform + opacity`) on tab/filter change + soft `scale-[0.98]` press spring | `<= 2` animated properties (`transform, opacity`), `0ms` CLS |
| **`SM-3` (Recommended)** | **`Tier 2` (Struct #2/3)** | `Featured Products Carousel` (`L1025–1178`) | **Always-Visible Tactile Carousel Controls + Edge Fade:** Move Prev/Next `44×44px` circular controls beside `View All 53 Models` (always discoverable on touch & desktop instead of hidden `opacity-0` edge circles), add subtle right-edge scroll fade cue (`from-white to-transparent`), and keep hover image scale ultra-fluid (`duration-500 ease-out`). | `opacity-0 group-hover/slider:opacity-100` floating arrows invisible on touch/trackpads | Clean header stepper dock (`←` `→` + `View All 53 Models`) + edge-fade scroll cue | `>= 44×44px` touch targets, `#0077B6` on `#FFFFFF` = **`4.87:1`** (AA) |

---

## C. Explicitly Rejected Ideas (Blocked by Hard Constraints & Risk Tiers)

| Rejected Idea | Violated Constraint / Risk Tier |
| --- | --- |
| Full-screen `100vh` cinematic parallax video hero pushing categories below the fold | **Performance & Core Web Vitals (`LCP <= 2.5s`)** — Increases LCP and pushes high-intent B2B SKUs below viewport fold. |
| JavaScript spring physics library (`framer-motion` runtime animation wrapper on every product card) | **JS Bundle / TBT Budget (`TBT <= 300ms`) & `bounds.yaml`** — Pure CSS `transform` + `opacity` cubic-bezier keyframes deliver identical 60/120fps fluidity with zero extra main-thread JS overhead. |
| Auto-playing continuous marquee/bounce on cards or infinite scroll-jacking (`wheel` interception) | **WCAG 2.2 SC 2.2.2 & Native Scroll Smoothness** — Scroll-jacking causes trackpad fight; native momentum scroll + `overscroll-x-contain` stays crisp and predictable. |
| Modifying Header Logo, Top Authority `<h1>` Bar links, or Legal Footer | **Tier 0 Frozen Component & Hard Constraints #1 / #3 / #4**. |

---

## Human Gate — How to Approve

Open **`/uiux-proposal.html`** in your browser to test the interactive Hero (`HS-1`, `HS-2`, `HS-3`) and Smooth UI (`SM-1`–`SM-3`) toggles across **Desktop (`1280×800`)** and **Mobile (`390×844`)**, then reply with:
- **`APPROVE HS-1, SM-1, SM-2, SM-3`** *(Recommended — Flagship Split-Stage Hero + full 60fps UI & Carousel polish)*
- **`APPROVE HS-2, SM-1, SM-2, SM-3`** *(Spatial "Choose Your Space" Hero + full 60fps UI polish)*
- **`APPROVE HS-3, SM-1, SM-2`** *(Zero structural change — styling & GPU smoothness polish only)*
- **`EDIT <notes>`** to adjust layout details or copy before Phase 4 runs
- **`REJECT`** to remove the preview cleanly and keep current storefront untouched.
