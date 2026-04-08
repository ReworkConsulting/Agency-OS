#!/usr/bin/env python3
"""
keyword_research.py — Fetch real keyword search volumes and SERP positions via DataForSEO.

This is an opt-in tool. If DATAFORSEO_API_KEY is not set in .env, the script exits
with instructions. If set, it fetches real data from the DataForSEO SERP API.

Cost: ~$0.001 per SERP query. A full 30-keyword audit costs ~$0.03.

Outputs clients/{slug}/keyword_data.md with search volumes per keyword.
The seo_audit workflow reads this file if present and adds real search volumes
to the keyword clustering tables.

Usage:
    python tools/keyword_research.py --client <slug> --keywords "keyword 1,keyword 2,keyword 3" --location "Boston, MA"
    python tools/keyword_research.py --client aw-puma-home-services --keywords "heat pump installation Boston,mini split installation Boston,HVAC contractor Boston" --location "Boston, MA"

Setup:
    1. Register at dataforseo.com (free trial available)
    2. Get your API key from the DataForSEO dashboard
    3. Set DATAFORSEO_API_KEY=your_key in .env
    4. Set DATAFORSEO_API_LOGIN=your_login in .env
"""

import argparse
import base64
import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    import urllib.request
    import urllib.parse
except ImportError:
    pass


def load_env():
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, value = line.partition('=')
                    os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

load_env()


def dataforseo_request(endpoint: str, payload: list) -> dict:
    """Make a DataForSEO API POST request."""
    login = os.environ.get('DATAFORSEO_API_LOGIN')
    password = os.environ.get('DATAFORSEO_API_KEY')

    if not login or not password:
        print("Error: DATAFORSEO_API_LOGIN and DATAFORSEO_API_KEY must be set in .env")
        print("Register at dataforseo.com and add your credentials.")
        sys.exit(1)

    credentials = base64.b64encode(f"{login}:{password}".encode()).decode()
    data = json.dumps(payload).encode('utf-8')

    req = urllib.request.Request(
        f"https://api.dataforseo.com/v3/{endpoint}",
        data=data,
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
        }
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode())


def fetch_keyword_data(client_slug: str, keywords: list[str], location: str) -> None:
    """Fetch search volumes for a list of keywords and save to keyword_data.md."""
    api_login = os.environ.get('DATAFORSEO_API_LOGIN')
    api_key = os.environ.get('DATAFORSEO_API_KEY')

    if not api_key or not api_login:
        print("DataForSEO not configured — keyword volume data unavailable.")
        print("\nTo enable real search volumes:")
        print("  1. Register at dataforseo.com (free trial available)")
        print("  2. Add to .env:")
        print("     DATAFORSEO_API_LOGIN=your_login")
        print("     DATAFORSEO_API_KEY=your_api_key")
        print("  3. Re-run this script")
        print("\nWithout this, the SEO audit will mark volumes as 'Est.' (estimated).")
        sys.exit(0)

    client_folder = Path(__file__).parent.parent / 'clients' / client_slug
    if not client_folder.exists():
        print(f"Error: Client folder not found: clients/{client_slug}/")
        sys.exit(1)

    print(f"Fetching search volumes for {len(keywords)} keywords in {location}...")
    print(f"Estimated cost: ~${len(keywords) * 0.001:.3f}")

    # DataForSEO Google Keyword Data API (search volume)
    payload = [
        {
            "keywords": keywords,
            "location_name": location,
            "language_name": "English",
        }
    ]

    try:
        result = dataforseo_request('keywords_data/google_ads/search_volume/live', payload)
    except Exception as e:
        print(f"Error calling DataForSEO API: {e}")
        sys.exit(1)

    if result.get('status_code') != 20000:
        print(f"DataForSEO API error: {result.get('status_message')}")
        sys.exit(1)

    tasks = result.get('tasks', [])
    if not tasks or tasks[0].get('status_code') != 20000:
        error_msg = tasks[0].get('status_message') if tasks else 'No tasks returned'
        print(f"Task error: {error_msg}")
        sys.exit(1)

    keyword_results = tasks[0].get('result', [])

    # Build output
    fetched_date = datetime.today().strftime('%Y-%m-%d')
    display_name = client_slug.replace('-', ' ').title()

    lines = [
        f"# Keyword Data — {display_name}",
        f"**Location:** {location}",
        f"**Source:** DataForSEO Google Keyword Data API",
        f"**Fetched:** {fetched_date}",
        f"**Keywords:** {len(keyword_results)}",
        "",
        "| Keyword | Monthly Volume | Competition | CPC |",
        "|---------|---------------|-------------|-----|",
    ]

    volume_map: dict[str, int] = {}
    for item in keyword_results:
        keyword = item.get('keyword', '')
        volume = item.get('search_volume', 0) or 0
        competition = item.get('competition_level', 'UNKNOWN')
        cpc = f"${item.get('cpc', 0):.2f}" if item.get('cpc') else 'N/A'
        lines.append(f"| {keyword} | {volume:,} | {competition} | {cpc} |")
        volume_map[keyword] = volume

    lines += [
        "",
        "---",
        "",
        "## Usage",
        "",
        "The `seo_audit.md` workflow reads this file when present and adds real search volumes",
        "to the Keyword Clustering tables (Phase 2.5). Keywords not in this file are marked 'Est.'",
        "",
        "_Rerun this script after adding new keywords from the audit._",
    ]

    output_path = client_folder / 'keyword_data.md'
    output_path.write_text('\n'.join(lines))
    print(f"\n✅ Keyword data saved to: clients/{client_slug}/keyword_data.md")
    print(f"   {len(keyword_results)} keywords processed")

    # Show top 5 by volume
    sorted_kw = sorted(keyword_results, key=lambda x: x.get('search_volume', 0) or 0, reverse=True)
    print("\nTop keywords by volume:")
    for item in sorted_kw[:5]:
        print(f"  {item.get('keyword')}: {item.get('search_volume', 0):,}/mo")


def main():
    parser = argparse.ArgumentParser(description='Fetch keyword search volumes via DataForSEO')
    parser.add_argument('--client', required=True, help='Client slug')
    parser.add_argument('--keywords', required=True, help='Comma-separated list of keywords')
    parser.add_argument('--location', required=True, help='Location (e.g. "Boston, MA")')
    args = parser.parse_args()

    keywords = [k.strip() for k in args.keywords.split(',') if k.strip()]
    if not keywords:
        print("Error: No keywords provided")
        sys.exit(1)

    fetch_keyword_data(args.client, keywords, args.location)


if __name__ == '__main__':
    main()
