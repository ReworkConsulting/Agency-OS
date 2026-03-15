#!/usr/bin/env python3
"""
build_icp_doc.py
Reads the JSON output from analyze_reviews.py and writes a formatted
ICP document to clients/{client-name}/icp.md

Usage:
    python tools/build_icp_doc.py --input .tmp/acme_analysis.json --client acme
    python tools/build_icp_doc.py --input .tmp/acme_analysis.json --client acme --output clients/acme/icp.md
"""

import sys
import os
import json
import argparse
from datetime import date


# ── Formatting helpers ────────────────────────────────────────────────────────

def section(title):
    return f"\n## {title}\n"


def item_block(entry):
    lines = []
    lines.append(f"**{entry['label']}**")
    lines.append(entry["description"])
    if entry.get("quote"):
        lines.append(f"> \"{entry['quote']}\"")
    if entry.get("frequency"):
        lines.append(f"*Frequency: {entry['frequency']}*")
    return "\n".join(lines)


def build_document(data, client_name):
    today = date.today().strftime("%B %d, %Y")
    confidence = data.get("confidence", "unknown")
    review_count = data.get("review_count", "unknown")

    lines = []

    # Header
    lines.append(f"# Ideal Customer Profile — {client_name.replace('-', ' ').title()}")
    lines.append(f"*Generated: {today} | Reviews analyzed: {review_count} | Confidence: {confidence}*")

    if confidence == "low":
        lines.append(
            "\n> **Low confidence:** Fewer than 10 reviews were analyzed. "
            "These insights are directional only — gather more reviews before using this for strategy."
        )

    # Summary
    lines.append(section("Summary"))
    lines.append(data.get("summary", "No summary available."))

    # Pains
    lines.append(section("Pains"))
    lines.append("*What customers struggled with before finding a solution.*\n")
    for entry in data.get("pains", []):
        lines.append(item_block(entry))
        lines.append("")

    # Desires
    lines.append(section("Desires"))
    lines.append("*What customers wanted to achieve or feel.*\n")
    for entry in data.get("desires", []):
        lines.append(item_block(entry))
        lines.append("")

    # Objections
    lines.append(section("Objections"))
    lines.append("*Hesitations or doubts customers had before buying.*\n")
    for entry in data.get("objections", []):
        lines.append(item_block(entry))
        lines.append("")

    # Themes
    lines.append(section("Key Themes"))
    lines.append("*Recurring topics across the reviews.*\n")
    for entry in data.get("themes", []):
        lines.append(item_block(entry))
        lines.append("")

    return "\n".join(lines)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Build an ICP markdown doc from analysis JSON.")
    parser.add_argument("--input", "-i", required=True, help="Path to the analysis JSON file")
    parser.add_argument("--client", "-c", required=True, help="Client name (e.g. acme or acme-corp)")
    parser.add_argument("--output", "-o", help="Output path (default: clients/{client}/icp.md)")
    args = parser.parse_args()

    # Load analysis JSON
    if not os.path.exists(args.input):
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Determine output path
    client_slug = args.client.lower().replace(" ", "-")
    default_output = os.path.join("clients", client_slug, "icp.md")
    output_path = args.output or default_output

    # Check for existing file
    if os.path.exists(output_path):
        print(
            f"Warning: {output_path} already exists. Saving as icp_v2.md instead.\n"
            "Delete the existing file or use --output to specify a path if you want to overwrite.",
            file=sys.stderr,
        )
        output_path = output_path.replace("icp.md", "icp_v2.md")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Build and write the document
    document = build_document(data, client_slug)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(document)

    print(f"ICP saved to {output_path}", file=sys.stderr)
    print(output_path)  # stdout: path for chaining


if __name__ == "__main__":
    main()
