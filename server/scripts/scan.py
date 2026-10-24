#!/usr/bin/env python3
"""Standalone OWASP LLM Top 10 scanner for the Inkloom input surface.

Usage
-----
python server/scripts/scan.py < file.txt
python server/scripts/scan.py "paste copy here"

This is the defensive security pass on its own, without the governance or
visual scanners. It is useful in CI, pre-commit hooks, and manual review.
"""

from __future__ import annotations

import sys

import importlib
import os

_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, _PROJECT_ROOT)

from server.engine.security_scanner import scan


def main(argv: list[str] | None = None) -> int:
    argv = argv or sys.argv[1:]
    if not argv:
        payload = sys.stdin.read()
    else:
        payload = " ".join(argv)

    payload = payload.strip()
    if not payload:
        print("No input provided.", file=sys.stderr)
        return 2

    findings = scan(payload)
    if not findings:
        print("No OWASP LLM Top 10 indicators found.")
        return 0

    print(f"{len(findings)} security indicator(s) found:")
    for finding in findings:
        snippet = finding.flagged_text
        if len(snippet) > 80:
            snippet = snippet[:77] + "..."
        print(f"  - [{finding.rule_id}] {finding.rule_name}")
        print(f"      {snippet!r}")
        print(f"      {finding.ai_rationale}")

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
