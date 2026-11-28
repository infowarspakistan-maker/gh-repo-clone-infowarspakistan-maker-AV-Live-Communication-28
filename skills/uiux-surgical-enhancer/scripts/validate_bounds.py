#!/usr/bin/env python3
"""Hard numeric bounds gate driven by config/bounds.yaml.

Returns exit code 0 when all bounds pass, or exit code 1 with a structured
violation list on any breach.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List


def _parse_scalar(val: str) -> Any:
    val = val.split("#", 1)[0].strip()
    if val.startswith("[") and val.endswith("]"):
        inner = val[1:-1].strip()
        if not inner:
            return []
        return [_parse_scalar(item) for item in inner.split(",")]
    if val.lower() == "true":
        return True
    if val.lower() == "false":
        return False
    if re.fullmatch(r"-?\d+", val):
        return int(val)
    if re.fullmatch(r"-?\d+\.\d+", val):
        return float(val)
    return val.strip("\"'")


def load_bounds(bounds_path: Path) -> Dict[str, Any]:
    text = bounds_path.read_text(encoding="utf-8")
    try:
        import yaml  # type: ignore

        return yaml.safe_load(text)
    except ImportError:
        pass

    result: Dict[str, Any] = {}
    current_section: str | None = None
    for raw_line in text.splitlines():
        line = raw_line.split("#", 1)[0].rstrip()
        if not line.strip():
            continue
        if not line.startswith(" ") and line.endswith(":"):
            current_section = line[:-1].strip()
            result[current_section] = {}
        elif current_section and ":" in line:
            key, val = line.strip().split(":", 1)
            result[current_section][key.strip()] = _parse_scalar(val)
    return result


def validate_bounds(metrics: Dict[str, Any], bounds: Dict[str, Any], allow_escape_hatch: bool = False) -> Dict[str, Any]:
    violations: List[Dict[str, Any]] = []

    def fail(rule: str, actual: Any, limit: Any) -> None:
        violations.append({"rule": rule, "actual": actual, "limit": limit})

    px_cap = float(bounds.get("pixel_change", {}).get("max_fraction_of_viewport", 0.30))
    px_actual = float(metrics.get("viewport_pixel_diff_fraction", 0.0))
    if px_actual > px_cap:
        fail("pixel_change.max_fraction_of_viewport", px_actual, px_cap)

    comp_cfg = bounds.get("components", {})
    restructured = int(metrics.get("components_restructured", 0))
    max_restructured = int(comp_cfg.get("max_restructured_per_page", 3))
    if restructured > max_restructured:
        fail("components.max_restructured_per_page", restructured, max_restructured)

    dom_reorders = int(metrics.get("top_level_dom_reorders", 0))
    max_reorders = int(comp_cfg.get("max_dom_reorders_top_level", 0))
    if dom_reorders > max_reorders:
        fail("components.max_dom_reorders_top_level", dom_reorders, max_reorders)

    removed_interactive = int(metrics.get("removed_interactive_elements", 0))
    max_removed = int(comp_cfg.get("max_removed_interactive", 0))
    if removed_interactive > max_removed:
        fail("components.max_removed_interactive", removed_interactive, max_removed)

    css_cfg = bounds.get("css", {})
    css_delta = float(metrics.get("css_delta_fraction", 0.0))
    max_css_delta = float(css_cfg.get("max_delta_fraction_of_original", 0.15))
    if css_delta > max_css_delta:
        fail("css.max_delta_fraction_of_original", css_delta, max_css_delta)

    new_blocking = int(metrics.get("new_blocking_resources", 0))
    max_blocking = int(css_cfg.get("max_new_blocking_resources", 0))
    if new_blocking > max_blocking:
        fail("css.max_new_blocking_resources", new_blocking, max_blocking)

    hardcoded_hex = int(metrics.get("hardcoded_hex_over_system_token", 0))
    if not allow_escape_hatch and hardcoded_hex > 0:
        fail("css.forbidden.hardcoded_hex_when_system_token_exists", hardcoded_hex, 0)

    motion_cfg = bounds.get("motion", {})
    animated_props: List[str] = list(metrics.get("animated_properties", []))
    max_anim = int(motion_cfg.get("max_animated_properties_per_view", 3))
    allowed_anim = set(motion_cfg.get("allowed_properties", ["transform", "opacity"]))
    if len(animated_props) > max_anim:
        fail("motion.max_animated_properties_per_view", len(animated_props), max_anim)
    disallowed = [p for p in animated_props if p not in allowed_anim]
    if disallowed:
        fail("motion.allowed_properties", disallowed, sorted(allowed_anim))
    if animated_props and bool(motion_cfg.get("requires_reduced_motion_variant", True)):
        if not bool(metrics.get("has_reduced_motion_variant", False)):
            fail("motion.requires_reduced_motion_variant", False, True)

    min_touch = int(bounds.get("touch", {}).get("min_target_px", 44))
    actual_min_touch = int(metrics.get("min_touch_target_px", min_touch))
    if actual_min_touch < min_touch:
        fail("touch.min_target_px", actual_min_touch, min_touch)

    max_iter = int(bounds.get("iterations", {}).get("max_per_section", 3))
    iter_count = int(metrics.get("section_iteration", 1))
    if iter_count > max_iter:
        fail("iterations.max_per_section", iter_count, max_iter)

    tier = metrics.get("risk_tier")
    if tier == 0:
        fail("risk_tier.tier_0_frozen", 0, ">= 1")

    return {
        "pass": len(violations) == 0,
        "violation_count": len(violations),
        "violations": violations,
    }


def main(argv: list[str] | None = None) -> int:
    default_bounds = Path(__file__).resolve().parent.parent / "config" / "bounds.yaml"
    parser = argparse.ArgumentParser(description="Validate surgical UI/UX change metrics against bounds.yaml.")
    parser.add_argument("--input", required=True, help="JSON file with change metrics")
    parser.add_argument("--bounds", default=str(default_bounds), help="Path to bounds.yaml")
    parser.add_argument("--allow-escape-hatch", action="store_true", help="Permit hardcoded hex outside system tokens")
    args = parser.parse_args(argv)

    bounds = load_bounds(Path(args.bounds))
    metrics = json.loads(Path(args.input).read_text(encoding="utf-8"))
    result = validate_bounds(metrics, bounds, allow_escape_hatch=args.allow_escape_hatch)
    print(json.dumps(result, indent=2))
    return 0 if result["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
