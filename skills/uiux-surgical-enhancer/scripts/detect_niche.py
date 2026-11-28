#!/usr/bin/env python3
"""Extract page metadata, JSON-LD, headings, and nav labels to produce niche_profile.json."""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List

NICHE_TAXONOMY = [
    {
        "industry": "enterprise-av-communications",
        "sub_vertical": "b2b video conferencing, voip & corporate event production",
        "keywords": ["video conference", "poly", "cisco", "logitech", "boardroom", "3cx", "voip", "smd led", "hologram", "av live", "teleprompter"],
        "competitor_set": ["poly.com", "logitech.com/video-collaboration", "webex.com/devices", "avixa.org"],
        "aesthetic_direction": ["enterprise-precision", "crisp-light-catalog", "high-contrast-navy-cyan", "spec-dense-clean"],
    },
    {
        "industry": "fintech",
        "sub_vertical": "b2b treasury & payments",
        "keywords": ["fintech", "treasury", "payroll", "invoice", "banking", "payment", "ledger"],
        "competitor_set": ["ramp", "brex", "mercury", "stripe"],
        "aesthetic_direction": ["restrained-dark", "data-dense", "editorial-type"],
    },
    {
        "industry": "b2b-saas",
        "sub_vertical": "developer & operations platform",
        "keywords": ["saas", "dashboard", "workflow", "automation", "analytics", "api", "cloud"],
        "competitor_set": ["linear", "vercel", "raycast", "posthog"],
        "aesthetic_direction": ["minimal-hairline", "tabular-data", "quiet-chrome"],
    },
    {
        "industry": "ecommerce",
        "sub_vertical": "online retail storefront",
        "keywords": ["shop", "cart", "checkout", "catalog", "price", "sku", "buy", "store"],
        "competitor_set": ["apple.com/shop", "bhphotovideo.com", "cdw.com"],
        "aesthetic_direction": ["editorial-merchandising", "high-clarity-cards", "conversion-focused"],
    },
]


def _extract_signals(html_text: str, extra_text: str = "") -> Dict[str, Any]:
    title_m = re.search(r"<title[^>]*>(.*?)</title>", html_text, flags=re.I | re.S)
    desc_m = re.search(
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']',
        html_text,
        flags=re.I,
    )
    h1s = [html.unescape(re.sub(r"<[^>]+>", "", m)).strip() for m in re.findall(r"<h1[^>]*>(.*?)</h1>", html_text, flags=re.I | re.S)]
    h2s = [html.unescape(re.sub(r"<[^>]+>", "", m)).strip() for m in re.findall(r"<h2[^>]*>(.*?)</h2>", html_text, flags=re.I | re.S)]
    nav_links = [
        html.unescape(re.sub(r"<[^>]+>", "", m)).strip()
        for m in re.findall(r"<nav[^>]*>.*?</nav>", html_text, flags=re.I | re.S)
        for m in re.findall(r"<a[^>]*>(.*?)</a>", m, flags=re.I | re.S)
    ]

    ld_types: List[str] = []
    for block in re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html_text, flags=re.I | re.S):
        try:
            parsed = json.loads(block)
            if isinstance(parsed, dict) and "@type" in parsed:
                ld_types.append(str(parsed["@type"]))
            elif isinstance(parsed, dict) and "@graph" in parsed:
                for node in parsed["@graph"]:
                    if isinstance(node, dict) and "@type" in node:
                        ld_types.append(str(node["@type"]))
        except Exception:
            pass

    title = html.unescape(title_m.group(1)).strip() if title_m else ""
    description = html.unescape(desc_m.group(1)).strip() if desc_m else ""
    corpus = " ".join([title, description, " ".join(h1s[:5]), " ".join(h2s[:8]), " ".join(nav_links[:20]), extra_text]).lower()

    best = NICHE_TAXONOMY[-1]
    best_score = -1
    for entry in NICHE_TAXONOMY:
        sc = sum(1 for kw in entry["keywords"] if kw in corpus)
        if sc > best_score:
            best_score = sc
            best = entry

    queries = [
        f"{best['industry']} {best['sub_vertical']} modern web ui design",
        f"{best['competitor_set'][0]} inspired product catalog clean ui",
        f"{' '.join(best['aesthetic_direction'][:2])} web design system",
    ]

    return {
        "industry": best["industry"],
        "sub_vertical": best["sub_vertical"],
        "competitor_set": best["competitor_set"],
        "aesthetic_direction": best["aesthetic_direction"],
        "inspiration_queries": queries,
        "extracted_signals": {
            "title": title,
            "meta_description": description,
            "h1": h1s[:5],
            "h2": h2s[:8],
            "nav_labels": [n for n in nav_links if n][:15],
            "schema_org_types": sorted(set(ld_types)),
        },
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Classify site niche and emit niche_profile.json.")
    parser.add_argument("--html", default="index.html", help="Path to HTML file (default: index.html)")
    parser.add_argument("--metadata", default="metadata.json", help="Optional metadata.json for additional context")
    parser.add_argument("--out", default="", help="Optional output path for niche_profile.json")
    args = parser.parse_args(argv)

    html_path = Path(args.html)
    html_text = html_path.read_text(encoding="utf-8", errors="ignore") if html_path.is_file() else ""
    extra_text = ""
    meta_path = Path(args.metadata)
    if meta_path.is_file():
        extra_text = meta_path.read_text(encoding="utf-8", errors="ignore")

    profile = _extract_signals(html_text, extra_text)
    rendered = json.dumps(profile, indent=2)
    if args.out:
        Path(args.out).write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    return 0


if __name__ == "__main__":
    sys.exit(main())
