#!/usr/bin/env python3
"""
analyze_reviews.py
Accepts a block of review text, extracts common themes, and outputs structured JSON.

Usage:
    python tools/analyze_reviews.py --input reviews.txt
    python tools/analyze_reviews.py --text "paste reviews directly here"
    cat reviews.txt | python tools/analyze_reviews.py
"""

import sys
import json
import argparse
import anthropic

# ── Config ────────────────────────────────────────────────────────────────────

MODEL = "claude-opus-4-6"

SYSTEM_PROMPT = """You are a customer research analyst. Your job is to read raw reviews
and extract structured insights. Be precise and evidence-based. Only report what is
clearly supported by the text — never invent themes or fabricate quotes."""

ANALYSIS_PROMPT = """Analyze the following customer reviews and extract:

1. **Pains** — frustrations, problems, complaints, things that were broken before
2. **Desires** — outcomes they wanted, what success looks like to them
3. **Objections** — hesitations before buying, doubts, reasons they almost didn't purchase
4. **Themes** — recurring topics that appear across multiple reviews (3–5 key themes)

For each item include:
- A short label (3–6 words)
- A 1-sentence description
- One verbatim quote from the reviews that supports it (exact words only)
- Frequency: how many reviews mention it (approximate count or "multiple")

Return ONLY valid JSON in this exact structure:
{
  "summary": "2-3 sentence overview of what customers are saying overall",
  "review_count": <integer, estimated number of reviews in the input>,
  "confidence": "high | medium | low (low if fewer than 10 reviews)",
  "pains": [
    {"label": "...", "description": "...", "quote": "...", "frequency": "..."}
  ],
  "desires": [
    {"label": "...", "description": "...", "quote": "...", "frequency": "..."}
  ],
  "objections": [
    {"label": "...", "description": "...", "quote": "...", "frequency": "..."}
  ],
  "themes": [
    {"label": "...", "description": "...", "quote": "...", "frequency": "..."}
  ]
}

Reviews to analyze:
---
{reviews}
---"""


# ── Main ──────────────────────────────────────────────────────────────────────

def load_reviews(args):
    """Return review text from file, --text flag, or stdin."""
    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            return f.read().strip()
    if args.text:
        return args.text.strip()
    if not sys.stdin.isatty():
        return sys.stdin.read().strip()
    print("Error: provide reviews via --input <file>, --text '...', or stdin", file=sys.stderr)
    sys.exit(1)


def analyze(review_text):
    api_key = __import__("os").environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY is not set")

    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": ANALYSIS_PROMPT.format(reviews=review_text),
            }
        ],
    )

    raw = response.content[0].text.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)


def main():
    parser = argparse.ArgumentParser(description="Analyze customer reviews with Claude.")
    parser.add_argument("--input", "-i", help="Path to a text file containing reviews")
    parser.add_argument("--text", "-t", help="Review text passed directly as a string")
    parser.add_argument("--output", "-o", help="Save JSON output to this file path")
    args = parser.parse_args()

    review_text = load_reviews(args)

    if not review_text:
        print("Error: review text is empty", file=sys.stderr)
        sys.exit(1)

    print("Analyzing reviews...", file=sys.stderr)
    result = analyze(review_text)

    output_json = json.dumps(result, indent=2)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output_json)
        print(f"Saved to {args.output}", file=sys.stderr)
    else:
        print(output_json)


if __name__ == "__main__":
    main()
