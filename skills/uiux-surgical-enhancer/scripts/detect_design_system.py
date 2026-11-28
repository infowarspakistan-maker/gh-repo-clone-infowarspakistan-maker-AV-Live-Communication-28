#!/usr/bin/env python3
"""Detect active design system (Tailwind / MUI / Chakra / Radix / custom tokens)
and output system_mapping.json.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Set

SCAN_EXTENSIONS = {".html", ".htm", ".css", ".scss", ".tsx", ".jsx", ".ts", ".js", ".json"}
IGNORE_DIRS = {"node_modules", "dist", "build", ".git", ".next", ".uiux-surgical"}


def detect_from_root(root: Path) -> Dict[str, Any]:
    scores = {"tailwind": 0, "mui": 0, "chakra": 0, "radix": 0, "custom_tokens": 0}
    css_vars: Set[str] = set()
    hex_colors: Dict[str, int] = {}
    font_families: Set[str] = set()
    files_scanned = 0

    pkg_path = root / "package.json"
    pkg_deps: Set[str] = set()
    if pkg_path.is_file():
        try:
            pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
            pkg_deps.update(pkg.get("dependencies", {}).keys())
            pkg_deps.update(pkg.get("devDependencies", {}).keys())
        except Exception:
            pass

    if any("tailwind" in d for d in pkg_deps):
        scores["tailwind"] += 20
    if any(d.startswith("@mui/") for d in pkg_deps):
        scores["mui"] += 20
    if any(d.startswith("@chakra-ui/") for d in pkg_deps):
        scores["chakra"] += 20
    if any(d.startswith("@radix-ui/") for d in pkg_deps):
        scores["radix"] += 20

    targets: List[Path] = []
    if root.is_file():
        targets = [root]
    else:
        for path in root.rglob("*"):
            if any(part in IGNORE_DIRS for part in path.parts):
                continue
            if path.is_file() and path.suffix.lower() in SCAN_EXTENSIONS:
                targets.append(path)
                if len(targets) >= 250:
                    break

    tw_re = re.compile(r"\b(?:flex|grid|text-(?:xs|sm|base|lg|xl|slate|gray)|bg-(?:white|slate|gray)|px-\d|py-\d|rounded-(?:md|lg|xl))\b")
    mui_re = re.compile(r"\bMui[A-Z][A-Za-z]+-root\b")
    chakra_re = re.compile(r"\bchakra-[a-z0-9-]+\b|--chakra-[a-z0-9-]+")
    radix_re = re.compile(r"data-radix-[a-z0-9-]+")
    var_re = re.compile(r"(--(?:tw|brand|ds|color|font|radius|space)[a-zA-Z0-9_-]*)\s*:")
    hex_re = re.compile(r"#[0-9A-Fa-f]{6}\b")
    font_re = re.compile(r"font-family\s*:\s*([^;}{]+)", flags=re.I)

    for fp in targets:
        try:
            text = fp.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        files_scanned += 1
        scores["tailwind"] += min(10, len(tw_re.findall(text)))
        scores["mui"] += min(10, len(mui_re.findall(text)) * 3)
        scores["chakra"] += min(10, len(chakra_re.findall(text)) * 3)
        scores["radix"] += min(10, len(radix_re.findall(text)) * 3)

        for v in var_re.findall(text):
            css_vars.add(v)
            if v.startswith("--tw-"):
                scores["tailwind"] += 2
            else:
                scores["custom_tokens"] += 2

        for h in hex_re.findall(text):
            key = h.upper()
            hex_colors[key] = hex_colors.get(key, 0) + 1

        for ff in font_re.findall(text):
            clean_ff = ff.strip().strip("\"'")
            if clean_ff and len(clean_ff) <= 120:
                font_families.add(clean_ff)

    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    primary_system = ranked[0][0] if ranked and ranked[0][1] > 0 else "custom_tokens"
    secondary_systems = [name for name, sc in ranked[1:] if sc >= 10]
    top_hex = [k for k, _ in sorted(hex_colors.items(), key=lambda kv: kv[1], reverse=True)[:12]]

    return {
        "primary_design_system": primary_system,
        "secondary_systems": secondary_systems,
        "confidence_scores": scores,
        "files_scanned": files_scanned,
        "css_custom_properties": sorted(css_vars)[:50],
        "dominant_hex_tokens": top_hex,
        "detected_font_families": sorted(font_families)[:10],
        "token_enforcement_policy": {
            "require_system_tokens": True,
            "escape_hatch_flag": "--allow-escape-hatch",
        },
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Detect design system and emit system_mapping.json.")
    parser.add_argument("--path", default=".", help="Workspace directory or HTML/CSS file path")
    parser.add_argument("--out", default="", help="Optional output path for system_mapping.json")
    args = parser.parse_args(argv)

    mapping = detect_from_root(Path(args.path))
    rendered = json.dumps(mapping, indent=2)
    if args.out:
        Path(args.out).write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    return 0


if __name__ == "__main__":
    sys.exit(main())
