# Scoring Rubrics — UIUX Surgical Enhancer v2

All visual, brand, accessibility, and performance decisions are governed by
machine-checkable rubrics executed by `scripts/score_fidelity.py`,
`scripts/score_enhancement.py`, `scripts/contrast_ratio.py`,
`scripts/ciede2000.py`, and `scripts/validate_bounds.py`.

---

## 1. Brand Fidelity Score (Pass >= 95 / 100)

| Dimension | Weight | Measurement | Fail Condition | Hard Fail? |
| --- | --- | --- | --- | --- |
| Logo position & bbox IoU | 25 | Pixel/bbox diff of logo region | `IoU < 0.98` OR `center_delta_px > 2.0` | **Yes** |
| Primary / secondary color ΔE00 | 25 | CIEDE2000 in CIELAB (`scripts/ciede2000.py`) | `ΔE00 > 3.0` | No (weighted) |
| Font family + heading hierarchy | 20 | Computed styles + DOM heading tree | Any font family substitution OR heading order break | **Yes** |
| Hero structure (H1 / subhead / CTA) | 20 | DOM relationship graph | Structural relationship broken | No (weighted) |
| Navigation order | 10 | Ordered link list diff | Any link reorder or removal | **Yes** |

### Color Math
1. Linearize each 8-bit sRGB channel $c \in [0, 1]$:
   $$c_{\text{lin}} = \begin{cases} c / 12.92 & c \le 0.04045 \\ ((c + 0.055)/1.055)^{2.4} & c > 0.04045 \end{cases}$$
2. Relative luminance (WCAG 2.2):
   $$L = 0.2126 R_{\text{lin}} + 0.7152 G_{\text{lin}} + 0.0722 B_{\text{lin}}$$
3. Convert linear sRGB -> CIE XYZ (D65) -> CIELAB $(L^*, a^*, b^*)$ -> **CIEDE2000** ($\Delta E_{00}$).
4. Pass threshold for primary and secondary brand tokens: `delta_e00 <= 3.0`.

### Formula
```text
if any(hard_fail_dimension_failed):
    fidelity_score = 0.0
else:
    fidelity_score = sum(weight_i * pass_fraction_i)
```

---

## 2. Enhancement Score (Pass >= +20% vs Baseline)

| Dimension | Weight | Measurement | Pass Target |
| --- | --- | --- | --- |
| Visual hierarchy clarity | 30 | Blind pairwise vision-LLM (before vs after, randomized order), 1–5 rubric | `after - before >= +0.5` median over 3 runs |
| Spacing consistency | 20 | Coefficient of variation (CV) of inter-element gaps from `analyze_ui` | CV decreases `>= 15%` |
| Affordance quality | 20 | Count of interactive elements with `contrast >= 3:1` AND visible hover/focus state | Count increases `>= 10%` |
| Niche modernity | 30 | Mean CLIP-style cosine similarity to top-5 inspiration refs | `after - before >= +0.03` |

### Critical Bias Guard
Pairwise vision-LLM comparison **MUST** randomize the left/right (or A/B)
presentation order on each of the 3 trials and take the median score delta.
Unblinded, fixed-order comparisons exhibit severe after-preference bias and
falsely approve visual regressions.

### Formula
```text
enhancement_delta_pct = (
    0.30 * norm(hierarchy_delta, 0.50) +
    0.20 * norm(-spacing_cv_ratio_delta, 0.15) +
    0.20 * norm(affordance_ratio_delta, 0.10) +
    0.30 * norm(modernity_delta, 0.03)
) * 100
```
Each normalized component maps its target improvement to `0.20` (+20% equivalent
baseline lift) and scales linearly (clamped to `[-1.0, +1.5]`), so hitting the
pass targets across dimensions achieves `>= +20.0%`.

---

## 3. Combined Acceptance Gate

```text
accept_change = (
    fidelity_score >= 95.0
    AND enhancement_delta_pct >= 20.0
    AND axe_new_violations == 0
    AND lighthouse_budgets_pass == True
    AND validate_bounds_exit_code == 0
)
```

## 4. Accessibility & Performance Gates
- **WCAG 2.2 AA (`@axe-core/playwright`)**: `withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])`, `new_violations == 0`.
- **Non-axe checks**: Identical DOM focus order; `prefers-reduced-motion` variant for every added animation; minimum interactive touch target `>= 44x44 px` (WCAG 2.2 SC 2.5.8).
- **Lighthouse CI (3x median)**: `LCP <= 2500ms`, `CLS <= 0.1`, `TBT <= 300ms` (lab proxy for `INP <= 200ms`), `TTI <= 3800ms`, CSS size delta `<= +15%`, zero new render-blocking resources.
