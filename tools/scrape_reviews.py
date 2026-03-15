#!/usr/bin/env python3
"""
scrape_reviews.py
Scrapes reviews from a URL and saves raw text to .tmp/

Usage:
    python tools/scrape_reviews.py --url "https://..." --client acme --source trustpilot
    python tools/scrape_reviews.py --url "https://..." --client acme --source amazon --output .tmp/reviews.txt

The script fetches the page, extracts all visible text blocks that look like
reviews, and saves them as a plain text file (one review per block).

For sites that require JavaScript rendering, this script will note the
limitation and return what it can from the raw HTML.
"""

import sys
import os
import argparse
import re
import requests
from bs4 import BeautifulSoup

# ── Config ────────────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# CSS selectors to try for common review platforms
# Each entry is (platform_hint, list_of_css_selectors_to_try)
PLATFORM_SELECTORS = [
    ("trustpilot", [
        "[data-service-review-text-typography]",
        ".review-content__text",
        "p[data-review-intro]",
    ]),
    ("amazon", [
        "[data-hook='review-body']",
        ".review-text-content span",
        ".cr-original-review-content",
    ]),
    ("g2", [
        ".pjax-container .formatted-text",
        "[itemprop='reviewBody']",
        ".review-text",
    ]),
    ("yelp", [
        "[class*='raw__']",
        ".comment__373c0__aXsRh",
        "p.comment-content",
    ]),
    ("appstore", [
        ".we-customer-review__body",
        "[class*='review-body']",
    ]),
    ("generic", [
        "[itemprop='reviewBody']",
        "[class*='review-text']",
        "[class*='review-body']",
        "[class*='review-content']",
        "[class*='reviewText']",
        "[class*='reviewBody']",
    ]),
]

MIN_REVIEW_LENGTH = 40  # characters — ignore very short fragments


# ── Core ──────────────────────────────────────────────────────────────────────

def fetch_page(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return response.text
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error fetching {url}: {e}", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}", file=sys.stderr)
        sys.exit(1)


def detect_platform(url, hint=None):
    if hint:
        return hint.lower()
    url_lower = url.lower()
    for platform, _ in PLATFORM_SELECTORS:
        if platform in url_lower:
            return platform
    return "generic"


def extract_reviews(html, platform):
    soup = BeautifulSoup(html, "html.parser")

    # Try platform-specific selectors first, then fall back to generic
    selector_sets = [selectors for p, selectors in PLATFORM_SELECTORS if p == platform]
    selector_sets += [selectors for p, selectors in PLATFORM_SELECTORS if p == "generic"]

    reviews = []
    for selectors in selector_sets:
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                for el in elements:
                    text = el.get_text(separator=" ", strip=True)
                    text = re.sub(r"\s+", " ", text).strip()
                    if len(text) >= MIN_REVIEW_LENGTH:
                        reviews.append(text)
                if reviews:
                    return reviews  # stop at first selector that yields results

    # Last resort: pull all <p> tags with substantial text
    if not reviews:
        for p in soup.find_all("p"):
            text = p.get_text(separator=" ", strip=True)
            text = re.sub(r"\s+", " ", text).strip()
            if len(text) >= MIN_REVIEW_LENGTH:
                reviews.append(text)

    return reviews


def deduplicate(reviews):
    seen = set()
    result = []
    for r in reviews:
        key = r[:100].lower()
        if key not in seen:
            seen.add(key)
            result.append(r)
    return result


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Scrape reviews from a URL.")
    parser.add_argument("--url", "-u", required=True, help="URL of the review page")
    parser.add_argument("--client", "-c", required=True, help="Client name (used for output filename)")
    parser.add_argument("--source", "-s", default="", help="Source platform hint (e.g. trustpilot, amazon, g2)")
    parser.add_argument("--output", "-o", help="Output file path (default: .tmp/{client}_reviews_{source}.txt)")
    args = parser.parse_args()

    # Determine output path
    source_slug = args.source.lower().replace(" ", "_") if args.source else "web"
    default_output = os.path.join(".tmp", f"{args.client}_reviews_{source_slug}.txt")
    output_path = args.output or default_output

    # Ensure .tmp/ exists
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

    print(f"Fetching: {args.url}", file=sys.stderr)
    html = fetch_page(args.url)

    platform = detect_platform(args.url, args.source)
    print(f"Detected platform: {platform}", file=sys.stderr)

    reviews = extract_reviews(html, platform)
    reviews = deduplicate(reviews)

    if not reviews:
        print(
            "Warning: no reviews extracted. The page may require JavaScript rendering.\n"
            "Try exporting reviews manually or using a different source URL.",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Extracted {len(reviews)} reviews", file=sys.stderr)

    output = "\n\n---\n\n".join(reviews)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"Saved to {output_path}", file=sys.stderr)
    print(output_path)  # stdout: path for piping into next tool


if __name__ == "__main__":
    main()
