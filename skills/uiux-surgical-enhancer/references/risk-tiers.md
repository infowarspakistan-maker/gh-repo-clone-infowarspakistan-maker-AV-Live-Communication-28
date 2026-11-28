# Component Risk Tiers — UIUX Surgical Enhancer v2

Every proposed upgrade in `changes.md` and `proposal.html` **MUST** declare its
component risk tier. Any proposal touching a Tier-0 component is auto-rejected
at plan time before human review.

| Tier | Label | Component Examples | Allowed Change Surface |
| --- | --- | --- | --- |
| **0** | **Frozen** | Logo, wordmark, brand mark, legal footer, privacy/terms disclosures, cookie consent banner | **None.** Zero pixel, DOM, or token edits permitted. Auto-rejected at plan time. |
| **1** | **Styling Only** | Primary navigation bar, hero section (`H1` / subhead / primary CTA), primary action buttons | Color refinement (`ΔE00 <= 3` on brand tokens), spacing/padding rhythm, typography weight/size/leading, elevation, hover/focus states. **Zero layout or DOM restructuring.** |
| **2** | **Structural Within Bounds** | Card grids, feature sections, specification tables, testimonials, pricing blocks | Layout refinement within the section boundary; max **3 restructured components per page** (styling-only changes do not count toward this cap). |
| **3** | **Open (Bounded)** | Secondary pages, empty states, 404 pages, onboarding flows, modal drawers | Broader structural freedom while still strictly governed by `config/bounds.yaml` (<=30% viewport pixels changed, 0 removed interactive elements, WCAG 2.2 AA, and Lighthouse budgets). |

## Plan-Time Enforcement Rules
1. **No Untagged Upgrades**: Every item in `changes.md` Section B must include `[Tier 1]`, `[Tier 2]`, or `[Tier 3]`.
2. **Tier-0 Rejection**: Any inspiration idea affecting logo, wordmark, legal footer, or cookie consent must be logged under `changes.md` Section C (*Explicitly Rejected Ideas*) with reason `Tier 0 Frozen component`.
3. **Token Discipline**: Every Tier 1–3 style change must map to an existing token in `system_mapping.json` (Tailwind utility / CSS custom property / MUI / Chakra / Radix token) unless the user explicitly enables `--allow-escape-hatch`.
