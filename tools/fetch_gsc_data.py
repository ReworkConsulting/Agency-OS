#!/usr/bin/env python3
"""
fetch_gsc_data.py — Fetch keyword ranking data from Google Search Console.

Outputs clients/{slug}/gsc_data.md with real keyword positions, impressions,
clicks, and CTR. The seo_audit workflow reads this file if present and uses
it as ground truth instead of the firecrawl-search proxy.

Usage:
    python tools/fetch_gsc_data.py --client <slug> --property <gsc-property-url>
    python tools/fetch_gsc_data.py --client aw-puma-home-services --property https://awpumahome.com/ --days 90

Setup:
    1. Create a service account in Google Cloud Console
    2. Enable the Search Console API on the project
    3. Add the service account email as a user (Restricted) on the client's GSC property
    4. Download the service account JSON key
    5. Set GOOGLE_SERVICE_ACCOUNT_JSON=path/to/key.json in .env
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Load .env
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


def fetch_gsc_data(client_slug: str, property_url: str, days: int = 90) -> None:
    """Fetch Search Console data and write to clients/{slug}/gsc_data.md."""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError:
        print("Error: Google API libraries not installed.")
        print("Run: pip install google-auth google-auth-httplib2 google-api-python-client")
        sys.exit(1)

    service_account_path = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    if not service_account_path:
        print("Error: GOOGLE_SERVICE_ACCOUNT_JSON not set in .env")
        print("Set it to the path of your service account JSON key file.")
        sys.exit(1)

    if not Path(service_account_path).exists():
        print(f"Error: Service account file not found: {service_account_path}")
        sys.exit(1)

    # Build the Search Console client
    scopes = ['https://www.googleapis.com/auth/webmasters.readonly']
    credentials = service_account.Credentials.from_service_account_file(
        service_account_path, scopes=scopes
    )
    service = build('searchconsole', 'v1', credentials=credentials, cache_discovery=False)

    # Date range
    end_date = datetime.today()
    start_date = end_date - timedelta(days=days)
    start_str = start_date.strftime('%Y-%m-%d')
    end_str = end_date.strftime('%Y-%m-%d')

    # Fetch top 50 queries by impressions
    print(f"Fetching GSC data for {property_url} ({start_str} to {end_str})...")
    try:
        response = service.searchanalytics().query(
            siteUrl=property_url,
            body={
                'startDate': start_str,
                'endDate': end_str,
                'dimensions': ['query'],
                'rowLimit': 50,
                'orderBy': [{'fieldName': 'impressions', 'sortOrder': 'DESCENDING'}],
            }
        ).execute()
    except Exception as e:
        print(f"Error fetching GSC data: {e}")
        print("\nCommon causes:")
        print("  - Service account not added to this GSC property")
        print("  - Property URL doesn't match exactly (include trailing slash if needed)")
        print("  - Search Console API not enabled on the Google Cloud project")
        sys.exit(1)

    rows = response.get('rows', [])
    if not rows:
        print("No data returned. The property may have no data in this date range.")
        sys.exit(0)

    # Build output
    client_folder = Path(__file__).parent.parent / 'clients' / client_slug
    if not client_folder.exists():
        print(f"Error: Client folder not found: clients/{client_slug}/")
        print("Onboard the client first before fetching GSC data.")
        sys.exit(1)

    output_path = client_folder / 'gsc_data.md'

    lines = [
        f"# GSC Data — {client_slug.replace('-', ' ').title()}",
        f"**Property:** {property_url}",
        f"**Date Range:** {start_str} to {end_str} ({days} days)",
        f"**Fetched:** {datetime.today().strftime('%Y-%m-%d')}",
        f"**Total Queries:** {len(rows)}",
        "",
        "| Keyword | Position | Impressions | Clicks | CTR |",
        "|---------|----------|-------------|--------|-----|",
    ]

    for row in rows:
        keyword = row['keys'][0]
        position = round(row.get('position', 0), 1)
        impressions = int(row.get('impressions', 0))
        clicks = int(row.get('clicks', 0))
        ctr = f"{row.get('ctr', 0) * 100:.1f}%"
        lines.append(f"| {keyword} | {position} | {impressions} | {clicks} | {ctr} |")

    lines += [
        "",
        "---",
        "",
        "## Notes for SEO Audit",
        "",
        "- **Ranking**: Position ≤ 10",
        "- **Weak**: Position 11–30 (page 2–3, needs optimization)",
        "- **Gap**: No impression data for the keyword (not ranking at all)",
        "",
        "_This file is read by `workflows/seo_audit.md` Phase 2.0 when present._",
        "_Rerun this script before each audit to refresh data._",
    ]

    output_path.write_text('\n'.join(lines))
    print(f"\n✅ GSC data saved to: clients/{client_slug}/gsc_data.md")
    print(f"   {len(rows)} keywords fetched")
    print(f"\nNow run the SEO Audit workflow — it will use this data automatically.")


def main():
    parser = argparse.ArgumentParser(description='Fetch Google Search Console keyword data')
    parser.add_argument('--client', required=True, help='Client slug (e.g. aw-puma-home-services)')
    parser.add_argument('--property', required=True, help='GSC property URL (e.g. https://awpumahome.com/)')
    parser.add_argument('--days', type=int, default=90, help='Number of days to look back (default: 90)')
    args = parser.parse_args()

    fetch_gsc_data(args.client, args.property, args.days)


if __name__ == '__main__':
    main()
