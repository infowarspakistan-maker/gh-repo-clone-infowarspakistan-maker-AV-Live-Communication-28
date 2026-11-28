# UIUX Surgical Enhancer v2 — Horion-Inspired 3D Room Designer Deep-Dive (`changes.md`)

- **Project:** AV Live Communications — 3D Conference Room Designer (`/room-designer`)
- **Inspiration Source:** `https://global.horion.com/solutions-corporate/` (Smart Corporate Space Verticals, Anti-Glare Minimalist Executive UI, 4-Split Wireless Casting, Smart Whiteboard, & 135"+ Exhibition LED Solutions)
- **Run ID:** `avlive-horion-room3d-2026-11-23`
- **Phase:** `Phase 3 — Human Gate (READ-ONLY — ZERO STOREFRONT FILES MODIFIED)`
- **Interactive Visual Mockup (`noindex`):** Open **`/room-designer-proposal.html`** (archived at `.uiux-surgical/runs/avlive-horion-room3d-2026-11-23/proposal.html`) to test **Color Themes (`HC1`, `HC2`, `HC3`)**, **4 Corporate Verticals**, **3D Lighting Modes**, and **Live Display Content (`4-Split Cast`, `Whiteboard`, `4-Cam`, `CMS Signage`)** before approving implementation.

---

## A. Hard Constraints (Machine-Checked — Verbatim from `SKILL.md` & `Three.js Skill`)

1. **Tier 0 Frozen Assets:** Site navbar logo, legal footer, and `/room-designer` canonical URL/JSON-LD schema untouched.
2. **Brand Color Fidelity:** Primary `#1A2B4C` / `#00B4D8` retained (`#162544` `ΔE00 = 2.02 <= 3.0`); dark 3D studio stage `#0F172A` passes **`17.85:1`** (white text) & **`8.33:1`** (`#38BDF8` telemetry).
3. **Three.js Architecture & Software-WebGL Compliance:** All new lighting/materials preserve `isSoftwareGl` performance guards, `RoomEnvironment` PMREM reflections, bottom-center collapsible dock (zero floating left/right panels covering the 3D scene), `THREE.MathUtils.damp` smooth camera transitions, and full GPU disposal on rebuild.
4. **No Pulsating Dots / Zero 404s:** All new Horion 4-split, Whiteboard, and Exhibition CMS screen textures are 100% procedural HTML5 `CanvasTexture` (`SRGBColorSpace` + max anisotropy).
5. **Accessibility & Touch:** WCAG 2.2 AA (`>= 4.5:1`), `>= 44×44px` controls, `prefers-reduced-motion` compliance.

---

## B. Horion-Inspired Deep Dive: Color, Corporate Verticals & 3D Architecture

### Track 1 — Color & Studio Atmosphere Options (Pick One: `HC1`, `HC2`, or `HC3`)

| Option | Aesthetic Reference (`global.horion.com/solutions-corporate`) | Outer Workspace | 3D Stage Canvas Backdrop | Inspector & Dock Accents | Contrast & `ΔE00` Proof |
| --- | --- | --- | --- | --- | --- |
| **`HC1` (Recommended)**<br/>**Horion Architectural Slate** | Contrasts crisp executive white UI cards against an obsidian architectural 3D viewport (`#0F172A` -> `#1A2B4C`) so screen glow, brushed aluminum bezels, wood slats, and cyan FOV cones pop cleanly. | `#F8F9FA` + Crisp White Inspector | Deep Slate Gradient `#0F172A` -> `#162544` (`ΔE00 = 2.02`) | `#1A2B4C` Dock + `#38BDF8` Active Telemetry | `#FFF` on `#0F172A` = **`17.85:1`** (AAA); `#38BDF8` on `#0F172A` = **`8.33:1`** (AAA) |
| **`HC2`**<br/>**Executive Obsidian Pro** | Full dark-studio Horion showroom palette (`#0B1220` workspace, `#111E36` cards, `#38BDF8` ice highlights) matching broadcast & luxury CAD tools. | `#0B1220` Dark Studio | `#090F1C` Obsidian Void | `#111E36` Inspector + `#00B4D8` Active Pills | `#FFF` on `#0B1220` = **`18.7:1`** (AAA) |
| **`HC3`**<br/>**Daylight Nordic Studio** | Preserves current bright `#F8F9FA` workspace, shifting only the 3D viewport rim to `#1E293B` slate blue-grey with soft floor vignette. | `#F8F9FA` Light | Soft Slate `#CBD5E1` -> `#E2E8F0` | `#1A2B4C` + `#0077B6` AA Links | `#0077B6` on `#FFF` = **`4.87:1`** (AA) |

---

### Track 2 — Corporate Vertical & 3D Scene Upgrades (`RD-1`..`RD-4`)

| ID | Risk Tier | Horion Feature Adapted | Concrete Enhancement across `/room-designer` |
| --- | --- | --- | --- |
| **`RD-1`** | `Tier 3` (Secondary Tool Page) | **4 Corporate Space Verticals** (`Executive Office`, `Conference / Boardroom`, `Training Room`, `Exhibition / Corporate Lobby`) | Add structured **Corporate Vertical Archetype** tabs alongside room sizes (`Executive Office` with walnut/obsidian glass privacy cabin & Horion 65"/75" mobile-stand or wall IFPD; `Training Room` with dual-row classroom desks & Horion 86" Interactive Board; `Exhibition Hall / Lobby` with 135"+ seamless `500×500mm` SMD LED wall & digital signage mode). |
| **`RD-2`** | `Tier 3` | **Live Interactive Horion Screen Modes + 3D Hardware Geometry** | Add **Display Content Switcher** inside the 3D dock (`4-Cam Meeting`, `4-Split Wireless Cast`, `Smart Whiteboard UI`, `Lobby CMS Signage`) rendered via crisp procedural `CanvasTexture`. Upgrade `formFactor: 'smart-board'` in `ConferenceRoom3DCanvas.tsx` with brushed-aluminum bezel, top 48MP AI camera pod, under-screen acoustic soundbar, and toggleable **Rolling U-Stand vs Wall Mount**. |
| **`RD-3`** | `Tier 3` | **3-Mode Studio Lighting & Screen Glow (`Studio` / `Daylight` / `Keynote`)** | Add quick lighting temperature toggle in the 3D dock: *Daylight Glass Office* (`5600K` high-key), *Executive Warm Studio* (`3500K` walnut accent), and *Keynote / SMD Immersion* (dimmed ambient + display emission bounce light on table). Also add subtle dark wood-charcoal carpet weave option matching Executive Dark rooms. |
| **`RD-4`** | `Tier 3` | **Deep-Dive Acoustic RT60 & Legibility Engineering Readout** | Expand top/bottom engineering metrics with **Estimated RT60 Reverb (`0.42s Optimal` vs `0.95s Glass Echo`)** dynamically linked to `wallStyle` + `includeAcousticPanels`, **4K Font Legibility Distance (`4/6/8 Rule`)**, and **Horion 86" K6A** added to `ROOM_ENDPOINTS` alongside 65" K6A. |

---

## C. Explicitly Rejected Ideas

| Rejected Idea | Reason / Constraint |
| --- | --- |
| Replacing `/room-designer`'s existing HP Poly, Cisco, & Logitech hardware catalog with Horion-only SKUs | Breaks multi-vendor AV Live B2B authority; Horion is elevated cleanly alongside Poly, Cisco, and Logitech. |
| Adding floating side-overlay HUD panels over the center of the 3D WebGL canvas | Violates Three.js Skill Section 5 ("Collapsible Bottom Dock — Zero Viewport Occlusion"). |
| Loading external GLB/PNG textures from `horion.com` URLs | Violates Three.js Skill zero-404 directive and causes CORS/WebGL taint failures on PDF export. |

---

## Human Gate — How to Approve

Open **`/room-designer-proposal.html`** to test **Color Themes (`HC1`–`HC3`)**, **Corporate Verticals**, **Display Content (`4-Split Cast`, `Whiteboard`, `CMS Signage`)**, and **Lighting Modes**, then reply with:
- **`APPROVE HC1, RD-1, RD-2, RD-3, RD-4`** *(Recommended — Architectural Slate 3D viewport + all 4 Horion verticals, smart-board 3D model, lighting & RT60 depth)*
- **`APPROVE HC2, RD-1, RD-2, RD-3, RD-4`** *(Full Obsidian Dark Studio CAD theme + all upgrades)*
- **`APPROVE HC3, RD-1, RD-2`** *(Light theme kept + Horion Verticals & 3D Smart Board upgrades only)*
- **`EDIT <notes>`** or **`REJECT`** to clean up the mockup.
