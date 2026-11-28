#!/usr/bin/env python3
"""Brand Fidelity Score gate (pass >= 95 / 100; hard-fail dimensions force 0)."""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any, Dict, Tuple

from ciede2000 import delta_e00_hex

WEIGHTS = {
    "logo_iou": 25.0,
    "color_de00": 25.0,
    "type_hierarchy": 20.0,
    "hero_structure": 20.0,
    "nav_order": 10.0,
}
HARD_FAIL = {"logo_iou", "type_hierarchy", "nav_order"}
PASS_THRESHOLD = 95.0


def bbox_iou_and_center_delta(b1: Dict[str, float], b2: Dict[str, float]) -> Tuple[float, float]:
    x1, y1, w1, h1 = b1["x"], b1["y"], b1["width"], b1["height"]
    x2, y2, w2, h2 = b2["x"], b2["y"], b2["width"], b2["height"]

    ix1, iy1 = max(x1, x2), max(y1, y2)
    ix2, iy2 = min(x1 + w1, x2 + w2), min(y1 + h1, y2 + h2)
    inter = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
    union = (w1 * h1) + (w2 * h2) - inter
    iou = inter / union if union > 0 else 0.0

    cx1, cy1 = x1 + w1 / 2.0, y1 + h1 / 2.0
    cx2, cy2 = x2 + w2 / 2.0, y2 + h2 / 2.0
    center_delta = math.hypot(cx2 - cx1, cy2 - cy1)
    return iou, center_delta


def score_fidelity(before: Dict[str, Any], after: Dict[str, Any], tokens: Dict[str, Any]) -> Dict[str, Any]:
    logo_iou, logo_center_delta = bbox_iou_and_center_delta(before["logo_bbox"], after["logo_bbox"])
    logo_ok = logo_iou >= 0.98 and logo_center_delta <= 2.0

    de_primary = delta_e00_hex(tokens["primary"], after["colors"]["primary"])
    de_secondary = delta_e00_hex(tokens["secondary"], after["colors"]["secondary"])
    max_de = max(de_primary, de_secondary)
    color_pass_fraction = 1.0 if max_de <= 3.0 else max(0.0, 1.0 - (max_de - 3.0) / 10.0)

    type_ok = (
        before.get("font_families") == after.get("font_families")
        and before.get("heading_hierarchy") == after.get("heading_hierarchy")
    )

    hero_before = before.get("hero_structure", {})
    hero_after = after.get("hero_structure", {})
    hero_keys = ("has_h1", "has_subhead", "has_primary_cta", "order")
    hero_matches = sum(1 for k in hero_keys if hero_before.get(k) == hero_after.get(k))
    hero_fraction = hero_matches / len(hero_keys)

    nav_ok = before.get("nav_links", []) == after.get("nav_links", [])

    dimensions = {
        "logo_iou": {
            "iou": round(logo_iou, 4),
            "center_delta_px": round(logo_center_delta, 3),
            "pass": logo_ok,
            "pass_fraction": 1.0 if logo_ok else 0.0,
        },
        "color_de00": {
            "primary_de00": round(de_primary, 4),
            "secondary_de00": round(de_secondary, 4),
            "max_de00": round(max_de, 4),
            "pass": max_de <= 3.0,
            "pass_fraction": round(color_pass_fraction, 4),
        },
        "type_hierarchy": {
            "pass": type_ok,
            "pass_fraction": 1.0 if type_ok else 0.0,
        },
        "hero_structure": {
            "pass": hero_fraction == 1.0,
            "pass_fraction": round(hero_fraction, 4),
        },
        "nav_order": {
            "pass": nav_ok,
            "pass_fraction": 1.0 if nav_ok else 0.0,
        },
    }

    hard_failed = [k for k in HARD_FAIL if not dimensions[k]["pass"]]
    if hard_failed:
        total = 0.0
    else:
        total = sum(WEIGHTS[k] * dimensions[k]["pass_fraction"] for k in WEIGHTS)

    return {
        "fidelity_score": round(total, 2),
        "threshold": PASS_THRESHOLD,
        "pass": total >= PASS_THRESHOLD and not hard_failed,
        "hard_fail_dimensions": hard_failed,
        "dimensions": dimensions,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Score Brand Fidelity (>= 95/100).")
    parser.add_argument("--input", required=True, help="JSON file with {before, after, tokens}")
    args = parser.parse_args(argv)

    data = json.loads(Path(args.input).read_text(encoding="utf-8"))
    result = score_fidelity(data["before"], data["after"], data["tokens"])
    print(json.dumps(result, indent=2))
    return 0 if result["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
