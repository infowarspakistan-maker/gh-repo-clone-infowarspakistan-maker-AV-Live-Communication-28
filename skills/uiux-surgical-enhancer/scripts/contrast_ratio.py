#!/usr/bin/env python3
"""WCAG 2.2 relative luminance & contrast ratio calculator (SC 1.4.3 / SC 1.4.11)."""

from __future__ import annotations

import argparse
import json
import re
import sys
from typing import Iterable, Tuple

RGB = Tuple[float, float, float]


def parse_color(value: str) -> RGB:
    """Parse '#RRGGBB', '#RGB', or 'r,g,b' into an (r, g, b) tuple in 0..255."""
    s = value.strip()
    if s.startswith("#"):
        hex_str = s[1:]
        if len(hex_str) == 3:
            hex_str = "".join(ch * 2 for ch in hex_str)
        if len(hex_str) != 6 or not re.fullmatch(r"[0-9a-fA-F]{6}", hex_str):
            raise ValueError(f"Invalid hex color: {value!r}")
        return (
            float(int(hex_str[0:2], 16)),
            float(int(hex_str[2:4], 16)),
            float(int(hex_str[4:6], 16)),
        )
    parts = [p.strip() for p in re.sub(r"^rgba?\(|\)$", "", s, flags=re.I).split(",")]
    if len(parts) < 3:
        raise ValueError(f"Invalid RGB color: {value!r}")
    return (float(parts[0]), float(parts[1]), float(parts[2]))


def _lin(c: float) -> float:
    c = c / 255.0 if c > 1.0 else c
    c = max(0.0, min(1.0, c))
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(rgb: Iterable[float]) -> float:
    r, g, b = (_lin(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(fg: RGB, bg: RGB) -> float:
    l1, l2 = relative_luminance(fg), relative_luminance(bg)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def wcag_aa_pass(cr: float, large_text: bool = False) -> bool:
    return cr >= 3.0 if large_text else cr >= 4.5  # WCAG 2.2 SC 1.4.3


def wcag_aaa_pass(cr: float, large_text: bool = False) -> bool:
    return cr >= 4.5 if large_text else cr >= 7.0  # WCAG 2.2 SC 1.4.6


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Compute WCAG 2.2 contrast ratio.")
    parser.add_argument("--fg", required=True, help="Foreground color (#RRGGBB or r,g,b)")
    parser.add_argument("--bg", required=True, help="Background color (#RRGGBB or r,g,b)")
    parser.add_argument("--large", action="store_true", help="Evaluate large text / UI component (3.0:1)")
    args = parser.parse_args(argv)

    fg_rgb = parse_color(args.fg)
    bg_rgb = parse_color(args.bg)
    cr = contrast_ratio(fg_rgb, bg_rgb)
    passed = wcag_aa_pass(cr, large_text=args.large)

    payload = {
        "fg": args.fg,
        "bg": args.bg,
        "contrast_ratio": round(cr, 4),
        "threshold": 3.0 if args.large else 4.5,
        "wcag_aa_pass": passed,
        "wcag_aaa_pass": wcag_aaa_pass(cr, large_text=args.large),
    }
    print(json.dumps(payload, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
