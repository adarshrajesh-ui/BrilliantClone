#!/usr/bin/env python3
"""Merge detailed problem bodies from prd-before into generated 15-problem PRD."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[3]
BEFORE = ROOT / "docs/prompt-first/2026-06-24-sync-15-problems-ux/prd-before.md"
PRD = ROOT / "prd.md"

# Old section title -> new section title prefix (first line match)
MERGE = [
    ("Lesson 1, Problem 2 — Unequal Spinner Simulation", "Lesson 1, Problem 2 — Unequal Section Game"),
    ("Lesson 1, Problem 4 — Compare Two Spinners", "Lesson 1, Problem 3 — Compare Two Carnival Games"),
    ("Lesson 2, Problem 1 — Build the Weighted Average", "Lesson 2, Problem 1 — Build the Weighted Average"),
    ("Lesson 2, Problem 2 — Match Outcomes to Probabilities", "Lesson 2, Problem 2 — Match Outcomes to Probabilities"),
    ("Lesson 2, Problem 4 — Diagnose Bad EV Setups", "Lesson 2, Problem 3 — Diagnose Bad EV Setups"),
    ("Lesson 3, Problem 1 — Mystery Box Outcomes", "Lesson 3, Problem 1 — Mystery Box Outcomes"),
    ("Lesson 3, Problem 2 — Calculate EV from the Table", "Lesson 3, Problem 2 — Calculate EV from the Table"),
    ("Lesson 3, Problem 4 — Prize Bag EV Table", "Lesson 3, Problem 3 — Prize Bag EV Table"),
    ("Lesson 4, Problem 1 — Expected Payout vs Expected Profit", "Lesson 4, Problem 1 — Expected Payout vs Expected Profit"),
    ("Lesson 4, Problem 2 — Fair, Favorable, or Unfavorable?", "Lesson 4, Problem 2 — Fair, Favorable, or Unfavorable?"),
    ("Lesson 4, Problem 4 — Choose the Better Game After Cost", "Lesson 4, Problem 3 — Choose the Better Game After Cost"),
    ("Lesson 5, Problem 1 — Build the Whole EV Model", "Lesson 5, Problem 1 — Build the Whole EV Model"),
    ("Lesson 5, Problem 2 — Same Expected Value, Different Risk", "Lesson 5, Problem 2 — Same Expected Value, Different Risk"),
    ("Lesson 5, Problem 4 — Final Capstone EV Decision", "Lesson 5, Problem 3 — Final Carnival Decision"),
]

SKIP_PREFIXES = (
    "Stable problem ID:",
    "Legacy ID mapping:",
    "Instructional role:",
    "Estimated completion time:",
    "Desktop workspace arrangement",
    "Mobile workspace arrangement",
    "Exact control placement",
    "Accessibility behavior",
    "Review-mode state",
    "Restart behavior",
    "Validation cases",
    "Source-grounded",
    "Source pattern",
)


def extract_section(text: str, title: str) -> str | None:
    pattern = re.compile(rf"^{re.escape(title)}\s*\n(.*?)(?=^Lesson \d, Problem \d|^MVP only:|^Expected Value Lab|^Lesson \d of 5:|\Z)", re.M | re.S)
    m = pattern.search(text)
    return m.group(1).strip() if m else None


def extract_workspace(text: str, title: str) -> str | None:
    idx = text.find(title)
    if idx < 0:
        return None
    chunk = text[idx:]
    ws = re.search(r"(Desktop workspace arrangement.*?Validation cases\nSee Appendix[^\n]+\.)", chunk, re.S)
    return ws.group(1).strip() if ws else None


def main():
    before = BEFORE.read_text()
    prd = PRD.read_text()

    for old_title, new_title in MERGE:
        body = extract_section(before, old_title)
        if not body:
            print(f"WARN: no section for {old_title}")
            continue
        workspace = extract_workspace(prd, new_title) or ""

        # Build merged block: keep new header lines from prd, then old body, then workspace
        header_match = re.search(
            rf"({re.escape(new_title)}.*?Estimated completion time: [^\n]+\n)",
            prd,
            re.S,
        )
        if not header_match:
            print(f"WARN: no new header for {new_title}")
            continue
        header = header_match.group(1)

        # Strip duplicate Concept/Scenario from old if header already has metadata — old body starts at Concept
        merged = header + "\n" + body + "\n\n" + workspace + "\n"

        # Replace from new_title through next Lesson/problem or MVP only
        pat = re.compile(
            rf"{re.escape(new_title)}.*?(?=\nLesson \d, Problem \d|\nMVP only:|\nExpected Value Lab - MVP PRD Page|\Z)",
            re.S,
        )
        if not pat.search(prd):
            print(f"WARN: no replace target for {new_title}")
            continue
        prd = pat.sub(merged + "\n", prd, count=1)
        print(f"Merged {old_title} -> {new_title}")

    PRD.write_text(prd)
    print(f"Updated {PRD} ({len(prd.splitlines())} lines)")


if __name__ == "__main__":
    main()
