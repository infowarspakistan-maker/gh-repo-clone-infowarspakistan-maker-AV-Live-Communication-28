#!/usr/bin/env python3
"""Redact PII from OCR/text/JSON artifacts and strip EXIF metadata from screenshots."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

PII_PATTERNS: List[Tuple[str, re.Pattern[str]]] = [
    ("EMAIL", re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")),
    ("IBAN", re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b")),
    ("CNIC", re.compile(r"\b\d{5}-\d{7}-\d\b")),
    ("CARD", re.compile(r"\b(?:\d[ -]*?){13,16}\b")),
    ("PHONE", re.compile(r"(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}\b")),
    ("ADDRESS", re.compile(r"\b(?:Block\s+[A-Z0-9]+|House\s+#?\d+|Plot\s+#?\d+|Street\s+#?\d+|Suite\s+#?\d+)\b", flags=re.I)),
]


def redact_text(text: str) -> Tuple[str, Dict[str, int]]:
    counts: Dict[str, int] = {}
    redacted = text
    for label, pattern in PII_PATTERNS:
        matches = pattern.findall(redacted)
        if matches:
            counts[label] = counts.get(label, 0) + len(matches)
            redacted = pattern.sub(f"{{{{REDACTED:{label}}}}}", redacted)
    return redacted, counts


def redact_obj(obj: Any) -> Tuple[Any, Dict[str, int]]:
    totals: Dict[str, int] = {}
    if isinstance(obj, str):
        return redact_text(obj)
    if isinstance(obj, list):
        out_list = []
        for item in obj:
            cleaned, c = redact_obj(item)
            out_list.append(cleaned)
            for k, v in c.items():
                totals[k] = totals.get(k, 0) + v
        return out_list, totals
    if isinstance(obj, dict):
        out_dict = {}
        for k, v in obj.items():
            cleaned, c = redact_obj(v)
            out_dict[k] = cleaned
            for ck, cv in c.items():
                totals[ck] = totals.get(ck, 0) + cv
        return out_dict, totals
    return obj, totals


def strip_exif(image_path: Path, out_path: Path) -> bool:
    """Strip EXIF/metadata from PNG/JPEG screenshots when Pillow is installed."""
    try:
        from PIL import Image  # type: ignore

        with Image.open(image_path) as img:
            data = list(img.getdata())
            clean = Image.new(img.mode, img.size)
            clean.putdata(data)
            clean.save(out_path)
        return True
    except ImportError:
        return False


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Redact PII from artifacts and optionally strip image EXIF.")
    parser.add_argument("--input", help="Path to text or JSON artifact to redact")
    parser.add_argument("--text", help="Inline text string to redact")
    parser.add_argument("--out", help="Optional path to write redacted output")
    parser.add_argument("--strip-exif", help="Optional screenshot image path to strip EXIF metadata")
    args = parser.parse_args(argv)

    report: Dict[str, Any] = {"redacted": False, "counts": {}, "warning": None}

    if args.strip_exif:
        img_p = Path(args.strip_exif)
        target = Path(args.out) if args.out else img_p
        stripped = strip_exif(img_p, target)
        report["exif_stripped"] = stripped
        if not stripped:
            report["warning"] = "Pillow not installed; EXIF strip skipped."

    if args.input or args.text is not None:
        raw = Path(args.input).read_text(encoding="utf-8") if args.input else (args.text or "")
        try:
            parsed = json.loads(raw)
            cleaned_obj, counts = redact_obj(parsed)
            cleaned_str = json.dumps(cleaned_obj, indent=2)
        except json.JSONDecodeError:
            cleaned_str, counts = redact_text(raw)

        if args.out and not args.strip_exif:
            Path(args.out).write_text(cleaned_str + "\n", encoding="utf-8")

        report["redacted"] = sum(counts.values()) > 0
        report["counts"] = counts
        report["output_preview"] = cleaned_str[:500]
        if report["redacted"]:
            report["warning"] = (
                "PII detected and replaced with {{REDACTED:<type>}} tokens. Raw unredacted artifacts were not persisted."
            )

    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
