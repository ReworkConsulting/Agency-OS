#!/usr/bin/env python3
"""
fetch_gbp_data.py — Fetch Google Business Profile data via the Business Profile Management API.

Outputs clients/{slug}/gbp_data.md with structured GBP data: categories, review count,
photos, posts, Q&A count, description. The seo_gbp workflow reads this file if present
and uses it instead of scraping via firecrawl-browser.

Usage:
    python tools/fetch_gbp_data.py --client <slug> --account-id <account> --location-id <location>
    python tools/fetch_gbp_data.py --client aw-puma-home-services --account-id 123456789 --location-id 987654321

Setup:
    1. Use the same service account as GSC (or create a new one)
    2. Enable the Business Profile Performance API on the Google Cloud project
    3. Add the service account to the Google Business Profile via the API or GBP Manager
    4. Find account ID and location ID from the GBP API or Google Business Profile dashboard
    5. Set GOOGLE_SERVICE_ACCOUNT_JSON=path/to/key.json in .env

Finding your account/location IDs:
    Run with --list-accounts to discover available accounts:
    python tools/fetch_gbp_data.py --client <slug> --list-accounts
"""

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path


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


def get_credentials():
    try:
        from google.oauth2 import service_account
    except ImportError:
        print("Error: Google API libraries not installed.")
        print("Run: pip install google-auth google-auth-httplib2 google-api-python-client")
        sys.exit(1)

    service_account_path = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    if not service_account_path:
        print("Error: GOOGLE_SERVICE_ACCOUNT_JSON not set in .env")
        sys.exit(1)

    if not Path(service_account_path).exists():
        print(f"Error: Service account file not found: {service_account_path}")
        sys.exit(1)

    scopes = [
        'https://www.googleapis.com/auth/business.manage',
    ]
    return service_account.Credentials.from_service_account_file(
        service_account_path, scopes=scopes
    )


def list_accounts():
    """List all GBP accounts accessible to the service account."""
    try:
        from googleapiclient.discovery import build
    except ImportError:
        print("Error: googleapiclient not installed.")
        sys.exit(1)

    credentials = get_credentials()
    service = build('mybusinessaccountmanagement', 'v1', credentials=credentials, cache_discovery=False)

    try:
        response = service.accounts().list().execute()
        accounts = response.get('accounts', [])
        if not accounts:
            print("No accounts found. The service account may not have access to any GBP accounts.")
            return
        print("Available accounts:")
        for acc in accounts:
            print(f"  Name: {acc['name']}  |  Account number: {acc['name'].split('/')[-1]}")
            print(f"  Type: {acc.get('type', 'unknown')}")
    except Exception as e:
        print(f"Error listing accounts: {e}")
        sys.exit(1)


def fetch_gbp_data(client_slug: str, account_id: str, location_id: str) -> None:
    """Fetch GBP location data and write to clients/{slug}/gbp_data.md."""
    try:
        from googleapiclient.discovery import build
    except ImportError:
        print("Error: googleapiclient not installed.")
        sys.exit(1)

    credentials = get_credentials()

    client_folder = Path(__file__).parent.parent / 'clients' / client_slug
    if not client_folder.exists():
        print(f"Error: Client folder not found: clients/{client_slug}/")
        sys.exit(1)

    # Build API client for Business Information
    biz_service = build('mybusinessbusinessinformation', 'v1', credentials=credentials, cache_discovery=False)

    location_name = f"accounts/{account_id}/locations/{location_id}"
    print(f"Fetching GBP data for {location_name}...")

    try:
        location = biz_service.locations().get(
            name=location_name,
            readMask='name,title,phoneNumbers,categories,websiteUri,regularHours,regularHoursText,profile,serviceItems,storefrontAddress'
        ).execute()
    except Exception as e:
        print(f"Error fetching location: {e}")
        print("\nCommon causes:")
        print("  - Account ID or Location ID is incorrect")
        print("  - Service account doesn't have access to this location")
        print("  - Business Profile Performance API not enabled")
        sys.exit(1)

    # Extract fields
    business_name = location.get('title', 'Unknown')
    phone = location.get('phoneNumbers', {}).get('primaryPhone', 'Not listed')
    website = location.get('websiteUri', 'Not listed')
    description = location.get('profile', {}).get('description', 'No description set')

    # Categories
    categories = location.get('categories', {})
    primary_cat = categories.get('primaryCategory', {}).get('displayName', 'Not set')
    additional_cats = [c.get('displayName', '') for c in categories.get('additionalCategories', [])]

    # Services
    service_items = location.get('serviceItems', [])
    services = [s.get('freeFormServiceItem', {}).get('label', {}).get('displayName', '')
                or s.get('structuredServiceItem', {}).get('serviceTypeId', '')
                for s in service_items]
    services = [s for s in services if s]

    # Build output markdown
    fetched_date = datetime.today().strftime('%Y-%m-%d')
    display_name = client_slug.replace('-', ' ').title()

    lines = [
        f"# GBP Data — {display_name}",
        f"**Account:** accounts/{account_id}",
        f"**Location:** locations/{location_id}",
        f"**Fetched:** {fetched_date}",
        "",
        "## Business Details",
        f"- **Name:** {business_name}",
        f"- **Phone:** {phone}",
        f"- **Website:** {website}",
        f"- **Primary Category:** {primary_cat}",
    ]

    if additional_cats:
        lines.append(f"- **Additional Categories:** {', '.join(additional_cats)}")
    else:
        lines.append("- **Additional Categories:** None set")

    lines += [
        "",
        "## Description",
        f"{description}" if description != 'No description set' else "_No description set — this is a high-priority gap._",
        "",
        "## Services Listed",
    ]

    if services:
        for s in services:
            lines.append(f"- {s}")
    else:
        lines.append("_No services listed in GBP — this is a gap vs. competitors._")

    lines += [
        "",
        "## Data Notes",
        "- Review count, photo count, and post data require the Business Profile Performance API",
        "  which has limited service account access. Check these manually in GBP Manager.",
        "- Photo count: check manually at business.google.com",
        "- Review count / average rating: check manually or via Google Places API",
        "- Post recency: check manually at business.google.com/posts",
        "",
        "---",
        "",
        "_This file is read by `workflows/seo_gbp.md` Phase 1 when present._",
        "_Rerun this script to refresh data before running the GBP workflow._",
    ]

    output_path = client_folder / 'gbp_data.md'
    output_path.write_text('\n'.join(lines))
    print(f"\n✅ GBP data saved to: clients/{client_slug}/gbp_data.md")
    print(f"\nNow run the SEO GBP workflow — it will use this data automatically.")
    print("\n⚠ Note: Manually add review count, photo count, and post recency to the file")
    print("  for a complete picture. These fields require additional API permissions.")


def main():
    parser = argparse.ArgumentParser(description='Fetch Google Business Profile data')
    parser.add_argument('--client', help='Client slug (e.g. aw-puma-home-services)')
    parser.add_argument('--account-id', help='GBP account ID (numeric)')
    parser.add_argument('--location-id', help='GBP location ID (numeric)')
    parser.add_argument('--list-accounts', action='store_true', help='List all accessible GBP accounts and exit')
    args = parser.parse_args()

    if args.list_accounts:
        list_accounts()
        return

    if not args.client:
        parser.error('--client is required')
    if not args.account_id:
        parser.error('--account-id is required')
    if not args.location_id:
        parser.error('--location-id is required')

    fetch_gbp_data(args.client, args.account_id, args.location_id)


if __name__ == '__main__':
    main()
