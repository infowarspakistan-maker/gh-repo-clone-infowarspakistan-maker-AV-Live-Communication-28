#!/usr/bin/env python3
"""CIEDE2000 (Delta E 2000) brand color fidelity gate wrapper.

Prefers vetted libraries (`pyciede2000` or `colour-science`) when installed,
and falls back to an exact ISO/CIE 11664-6:2014 implementation so the gate
remains executable in minimal environments.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from typing import Tuple

from contrast_ratio import parse_color, _lin

Lab = Tuple[float, float, float]
RGB = Tuple[float, float, float]


def rgb_to_lab(rgb: RGB) -> Lab:
    """Convert sRGB (0..255) to CIE L*a*b* (D65 illuminant, 2-degree observer)."""
    r, g, b = (_lin(v) for v in rgb)
    x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047
    y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000
    z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883

    eps = 216.0 / 24389.0
    kappa = 24389.0 / 27.0

    def f(t: float) -> float:
        return t ** (1.0 / 3.0) if t > eps else (kappa * t + 16.0) / 116.0

    fx, fy, fz = f(x), f(y), f(z)
    l_star = 116.0 * fy - 16.0
    a_star = 500.0 * (fx - fy)
    b_star = 200.0 * (fy - fz)
    return (l_star, a_star, b_star)


def _ciede2000_fallback(lab1: Lab, lab2: Lab) -> float:
    l1, a1, b1 = lab1
    l2, a2, b2 = lab2

    c1 = math.hypot(a1, b1)
    c2 = math.hypot(a2, b2)
    c_bar = 0.5 * (c1 + c2)
    c_bar7 = c_bar ** 7
    g = 0.5 * (1.0 - math.sqrt(c_bar7 / (c_bar7 + 25.0 ** 7)))

    a1_p = (1.0 + g) * a1
    a2_p = (1.0 + g) * a2
    c1_p = math.hypot(a1_p, b1)
    c2_p = math.hypot(a2_p, b2)

    def hp(b_val: float, a_val: float) -> float:
        if b_val == 0.0 and a_val == 0.0:
            return 0.0
        deg = math.degrees(math.atan2(b_val, a_val))
        return deg + 360.0 if deg < 0.0 else deg

    h1_p = hp(b1, a1_p)
    h2_p = hp(b2, a2_p)

    dl_p = l2 - l1
    dc_p = c2_p - c1_p

    if c1_p * c2_p == 0.0:
        dh_p = 0.0
    else:
        diff = h2_p - h1_p
        if abs(diff) <= 180.0:
            dh_p = diff
        elif diff > 180.0:
            dh_p = diff - 360.0
        else:
            dh_p = diff + 360.0

    d_big_h_p = 2.0 * math.sqrt(c1_p * c2_p) * math.sin(math.radians(dh_p / 2.0))

    l_bar_p = 0.5 * (l1 + l2)
    c_bar_p = 0.5 * (c1_p + c2_p)

    if c1_p * c2_p == 0.0:
        h_bar_p = h1_p + h2_p
    else:
        if abs(h1_p - h2_p) <= 180.0:
            h_bar_p = 0.5 * (h1_p + h2_p)
        elif (h1_p + h2_p) < 360.0:
            h_bar_p = 0.5 * (h1_p + h2_p + 360.0)
        else:
            h_bar_p = 0.5 * (h1_p + h2_p - 360.0)

    t = (
        1.0
        - 0.17 * math.cos(math.radians(h_bar_p - 30.0))
        + 0.24 * math.cos(math.radians(2.0 * h_bar_p))
        + 0.32 * math.cos(math.radians(3.0 * h_bar_p + 6.0))
        - 0.20 * math.cos(math.radians(4.0 * h_bar_p - 63.0))
    )

    d_theta = 30.0 * math.exp(-(((h_bar_p - 275.0) / 25.0) ** 2))
    c_bar_p7 = c_bar_p ** 7
    r_c = 2.0 * math.sqrt(c_bar_p7 / (c_bar_p7 + 25.0 ** 7))
    l_term = (l_bar_p - 50.0) ** 2
    s_l = 1.0 + (0.015 * l_term) / math.sqrt(20.0 + l_term)
    s_c = 1.0 + 0.045 * c_bar_p
    s_h = 1.0 + 0.015 * c_bar_p * t
    r_t = -math.sin(math.radians(2.0 * d_theta)) * r_c

    return math.sqrt(
        (dl_p / s_l) ** 2
        + (dc_p / s_c) ** 2
        + (d_big_h_p / s_h) ** 2
        + r_t * (dc_p / s_c) * (d_big_h_p / s_h)
    )


def delta_e00(lab1: Lab, lab2: Lab) -> float:
    """Compute CIEDE2000 delta E between two (L*, a*, b*) colors."""
    try:
        from pyciede2000 import ciede2000  # type: ignore

        return float(ciede2000(lab1, lab2))
    except ImportError:
        pass
    try:
        from colour.difference import delta_E_CIE2000  # type: ignore

        return float(delta_E_CIE2000(lab1, lab2))
    except ImportError:
        pass
    return _ciede2000_fallback(lab1, lab2)


def delta_e00_hex(color1: str, color2: str) -> float:
    return delta_e00(rgb_to_lab(parse_color(color1)), rgb_to_lab(parse_color(color2)))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Compute CIEDE2000 Delta E between two colors.")
    parser.add_argument("--color1", required=True, help="Baseline color (#RRGGBB or r,g,b)")
    parser.add_argument("--color2", required=True, help="Candidate color (#RRGGBB or r,g,b)")
    parser.add_argument("--threshold", type=float, default=3.0, help="Max allowed Delta E00 (default 3.0)")
    args = parser.parse_args(argv)

    de = delta_e00_hex(args.color1, args.color2)
    passed = de <= args.threshold
    print(
        json.dumps(
            {
                "color1": args.color1,
                "color2": args.color2,
                "delta_e00": round(de, 4),
                "threshold": args.threshold,
                "pass": passed,
            },
            indent=2,
        )
    )
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
