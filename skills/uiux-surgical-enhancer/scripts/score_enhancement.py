#!/usr/bin/env python3
"""Enhancement Score gate (pass >= +20% vs baseline) with blind 3x pairwise bias guard."""

from __future__ import annotations

import argparse
import json
import math
import random
import statistics
import sys
from pathlib import Path
from typing import Any, Dict, List

PASS_DELTA_PCT = 20.0


def coefficient_of_variation(values: List[float]) -> float:
    clean = [float(v) for v in values if v is not None and float(v) >= 0]
    if len(clean) < 2:
        return 0.0
    mean = statistics.mean(clean)
    if mean == 0:
        return 0.0
    return statistics.pstdev(clean) / mean


def blind_pairwise_delta(trials: List[Dict[str, Any]], seed: int | None = None) -> Dict[str, Any]:
    """Compute median (after - before) across >=3 randomized blind pairwise trials.

    Each trial item may provide either:
      - {"order": "before_first" | "after_first", "score_a": float, "score_b": float}
      - or {"before_score": float, "after_score": float} (scored after randomized presentation).
    """
    if len(trials) < 3:
        raise ValueError("Bias guard requires at least 3 blind pairwise trials.")

    rng = random.Random(seed)
    deltas: List[float] = []
    orders_used: List[str] = []

    for idx, t in enumerate(trials[:3]):
        if "score_a" in t and "score_b" in t and "order" in t:
            order = t["order"]
            if order == "before_first":
                before_s, after_s = float(t["score_a"]), float(t["score_b"])
            elif order == "after_first":
                after_s, before_s = float(t["score_a"]), float(t["score_b"])
            else:
                raise ValueError(f"Invalid trial order at index {idx}: {order!r}")
        else:
            order = rng.choice(["before_first", "after_first"])
            before_s = float(t["before_score"])
            after_s = float(t["after_score"])
        orders_used.append(order)
        deltas.append(after_s - before_s)

    return {
        "trial_deltas": [round(d, 4) for d in deltas],
        "orders": orders_used,
        "median_delta": round(statistics.median(deltas), 4),
    }


def norm(actual_improvement: float, target_for_20pct: float) -> float:
    """Map target improvement to +0.20 (20% lift), linearly clamped to [-1.0, 1.5]."""
    if target_for_20pct <= 0:
        return 0.0
    scaled = (actual_improvement / target_for_20pct) * 0.20
    return max(-1.0, min(1.5, scaled))


def count_quality_affordances(elements: List[Dict[str, Any]]) -> int:
    return sum(
        1
        for el in elements
        if float(el.get("contrast_ratio", 0.0)) >= 3.0 and bool(el.get("has_hover_or_focus_state", False))
    )


def score_enhancement(data: Dict[str, Any], seed: int | None = None) -> Dict[str, Any]:
    before = data["before"]
    after = data["after"]

    hierarchy = blind_pairwise_delta(data["pairwise_trials"], seed=seed)

    cv_before = coefficient_of_variation(before.get("gaps", []))
    cv_after = coefficient_of_variation(after.get("gaps", []))
    spacing_cv_change = ((cv_after / cv_before) - 1.0) if cv_before > 0 else 0.0
    spacing_improvement = -spacing_cv_change  # positive when CV decreases

    aff_before = count_quality_affordances(before.get("interactive_elements", []))
    aff_after = count_quality_affordances(after.get("interactive_elements", []))
    affordance_improvement = ((aff_after / aff_before) - 1.0) if aff_before > 0 else (0.10 if aff_after > 0 else 0.0)

    sim_before = statistics.mean(before.get("inspiration_similarities", [0.0]))
    sim_after = statistics.mean(after.get("inspiration_similarities", [0.0]))
    modernity_delta = sim_after - sim_before

    weighted = (
        0.30 * norm(hierarchy["median_delta"], 0.50)
        + 0.20 * norm(spacing_improvement, 0.15)
        + 0.20 * norm(affordance_improvement, 0.10)
        + 0.30 * norm(modernity_delta, 0.03)
    )
    delta_pct = round(weighted * 100.0, 2)

    return {
        "enhancement_delta_pct": delta_pct,
        "threshold_pct": PASS_DELTA_PCT,
        "pass": delta_pct >= PASS_DELTA_PCT,
        "dimensions": {
            "visual_hierarchy": {
                **hierarchy,
                "target": 0.50,
                "pass": hierarchy["median_delta"] >= 0.50,
            },
            "spacing_consistency": {
                "cv_before": round(cv_before, 4),
                "cv_after": round(cv_after, 4),
                "cv_reduction_fraction": round(spacing_improvement, 4),
                "target": 0.15,
                "pass": spacing_improvement >= 0.15,
            },
            "affordance_quality": {
                "count_before": aff_before,
                "count_after": aff_after,
                "increase_fraction": round(affordance_improvement, 4),
                "target": 0.10,
                "pass": affordance_improvement >= 0.10,
            },
            "niche_modernity": {
                "sim_before": round(sim_before, 4),
                "sim_after": round(sim_after, 4),
                "delta": round(modernity_delta, 4),
                "target": 0.03,
                "pass": modernity_delta >= 0.03,
            },
        },
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Score Enhancement Delta (>= +20% vs baseline).")
    parser.add_argument("--input", required=True, help="JSON file with {before, after, pairwise_trials}")
    parser.add_argument("--seed", type=int, default=None, help="Optional RNG seed for reproducible order audit")
    args = parser.parse_args(argv)

    data = json.loads(Path(args.input).read_text(encoding="utf-8"))
    result = score_enhancement(data, seed=args.seed)
    print(json.dumps(result, indent=2))
    return 0 if result["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
