#!/usr/bin/env python3
"""
extract_prompts.py

Reads WaffleBrain's master prompts.json and extracts every prompt that
needs converting into a CSV with three columns: ID, Original, Converted.

- Does NOT modify the source JSON in any way (read-only open).
- Preserves the "prompt" text exactly as it appears (including any
  internal newlines / formatting) in the Original column.
- Builds a unique, stable ID for each prompt from its position in the
  JSON: <Level>__<Category>__<3-digit index within that level/category>
  e.g. "A1A2__Everyday_Situations__001"
  This is deterministic and traceable back to the source structure,
  since the source data itself has no explicit per-prompt ID field.
- The Converted column is left blank, ready to be filled in later.

Usage:
    python3 extract_prompts.py [input_json] [output_csv]

Defaults:
    input_json = prompts.json
    output_csv = prompts.csv
"""

import csv
import json
import sys
from pathlib import Path


def make_id(level: str, category: str, index: int) -> str:
    """Build a unique, readable ID from level, category, and index (1-based)."""
    safe_category = category.strip().replace(" ", "_")
    safe_level = level.strip().replace(" ", "_")
    return f"{safe_level}__{safe_category}__{index:03d}"


def extract_prompts(data: dict) -> list[dict]:
    """
    Walk the nested {level: {category: [ {prompt, constraint}, ... ]}} structure
    and return a flat list of rows: {"ID": ..., "Original": ...}.
    """
    rows = []
    for level, categories in data.items():
        if not isinstance(categories, dict):
            continue
        for category, items in categories.items():
            if not isinstance(items, list):
                continue
            for i, item in enumerate(items, start=1):
                if not isinstance(item, dict) or "prompt" not in item:
                    continue
                prompt_id = make_id(level, category, i)
                original_text = item["prompt"]
                rows.append({
                    "ID": prompt_id,
                    "Original": original_text,
                    "Converted": "",
                })
    return rows


def main():
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("prompts.json")
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("prompts.csv")

    # Read-only load; the JSON is never written back to.
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    rows = extract_prompts(data)

    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["ID", "Original", "Converted"],
            quoting=csv.QUOTE_ALL,  # preserve exact text, including any commas/newlines
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Extracted {len(rows)} prompts from '{input_path}' -> '{output_path}'")


if __name__ == "__main__":
    main()
