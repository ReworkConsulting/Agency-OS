#!/usr/bin/env python3
"""
sync_client_to_supabase.py

Reads a client's overview.md and services.md files and upserts the client
record into Supabase. Run after the onboard_client workflow creates the
markdown files.

Usage:
    python tools/sync_client_to_supabase.py <client-slug>

Example:
    python tools/sync_client_to_supabase.py aw-puma-home-services

The script reads from clients/<client-slug>/overview.md and services.md,
parses the markdown fields, and upserts into the Supabase clients table.

Requires:
    - SUPABASE_URL in .env
    - SUPABASE_SERVICE_ROLE_KEY in .env
    - pip install requests python-dotenv
"""

import sys
import os
import re
import json
from pathlib import Path

# Load .env from repo root
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / '.env')
except ImportError:
    # Fallback: read .env manually
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, _, value = line.partition('=')
                os.environ.setdefault(key.strip(), value.strip())

import requests
from typing import Optional, List

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=representation',
}


def parse_md_field(content: str, field: str) -> Optional[str]:
    """Extract a value from a markdown field like '**Company Name:** Acme Inc'"""
    patterns = [
        rf'\*\*{re.escape(field)}:\*\*\s*(.+)',
        rf'- \*\*{re.escape(field)}:\*\*\s*(.+)',
        rf'#{1,3}\s+{re.escape(field)}\s*\n(.+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            if value and value.upper() not in ('TBD', 'N/A', 'NONE', '—', '-'):
                return value
    return None


def parse_bool_field(content: str, field: str) -> Optional[bool]:
    value = parse_md_field(content, field)
    if value is None:
        return None
    return value.lower() in ('yes', 'true', '1')


def parse_number_field(content: str, field: str) -> Optional[float]:
    value = parse_md_field(content, field)
    if value is None:
        return None
    # Strip currency symbols, commas, text after space (e.g. "$1,500 one-time")
    cleaned = re.sub(r'[^0-9.]', '', value.split()[0])
    try:
        return float(cleaned)
    except (ValueError, IndexError):
        return None


def parse_list_field(content: str, section_header: str) -> List[str]:
    """Extract a bullet list under a given section header."""
    pattern = rf'(?:#{1,3}\s+{re.escape(section_header)}|{re.escape(section_header)})[^\n]*\n((?:[-*]\s+.+\n?)+)'
    match = re.search(pattern, content, re.IGNORECASE)
    if not match or not match.group(1):
        return []
    items = re.findall(r'[-*]\s+(.+)', match.group(1))
    return [i.strip() for i in items if i.strip()]


def build_client_record(slug: str, overview: str, services: str) -> dict:
    """Parse markdown files into a Supabase clients row."""

    record: dict = {'slug': slug, 'status': 'active'}

    # Basic identity
    record['company_name'] = parse_md_field(overview, 'Company Name') or slug.replace('-', ' ').title()
    record['owner_name']   = parse_md_field(overview, 'Owner / Primary Contact') or parse_md_field(overview, 'Owner')
    record['phone']        = parse_md_field(overview, 'Phone')
    record['email']        = parse_md_field(overview, 'Email')
    record['address']      = parse_md_field(overview, 'Address')
    record['time_zone']    = parse_md_field(overview, 'Time Zone') or parse_md_field(overview, 'Timezone')
    record['website_url']  = parse_md_field(overview, 'Website URL') or parse_md_field(overview, 'Website')
    record['gbp_url']      = parse_md_field(overview, 'Google Business Profile URL') or parse_md_field(overview, 'GBP URL')
    record['industry']     = parse_md_field(overview, 'Industry') or parse_md_field(overview, 'Primary Service')

    # Social
    record['facebook_url']  = parse_md_field(overview, 'Facebook')
    record['instagram_url'] = parse_md_field(overview, 'Instagram')
    record['youtube_url']   = parse_md_field(overview, 'YouTube')
    record['tiktok_url']    = parse_md_field(overview, 'TikTok')
    record['linkedin_url']  = parse_md_field(overview, 'LinkedIn')

    # Marketing context
    record['biggest_marketing_challenge'] = parse_md_field(overview, 'Biggest Marketing Challenge') or parse_md_field(overview, 'Biggest Challenge')
    record['ideal_client_description']    = parse_md_field(overview, 'Ideal Client')
    record['main_goal']                   = parse_md_field(overview, 'Main Goal') or parse_md_field(overview, '6-12 Month Goal')

    spend = parse_number_field(overview, 'Starting Ad Spend')
    if spend is not None:
        record['starting_ad_spend'] = int(spend)

    # Services (from services.md preferentially, fall back to overview)
    src = services if services else overview
    record['primary_service'] = parse_md_field(src, 'Primary Service')
    record['service_area']    = parse_md_field(src, 'Service Area')

    job_value = parse_number_field(src, 'Average Job Value') or parse_number_field(src, 'Average Ticket')
    if job_value is not None:
        record['average_job_value'] = int(job_value)

    record['financing_available'] = parse_bool_field(src, 'Financing Available') or parse_bool_field(src, 'Financing')
    record['financing_details']   = parse_md_field(src, 'Financing Details') or parse_md_field(src, 'Financing Notes')

    services_list = parse_list_field(src, 'Services Offered') or parse_list_field(src, 'Service List') or parse_list_field(src, 'Services')
    if services_list:
        record['services_list'] = services_list

    # Strip None values — Supabase treats missing keys as NULL
    return {k: v for k, v in record.items() if v is not None}


def upsert_client(record: dict) -> dict:  # type: ignore[return]
    """Upsert client record into Supabase. Returns the saved row."""
    url = f"{SUPABASE_URL}/rest/v1/clients"
    resp = requests.post(url, headers=HEADERS, json=record, params={'on_conflict': 'slug'})

    if resp.status_code not in (200, 201):
        raise RuntimeError(f"Supabase upsert failed ({resp.status_code}): {resp.text}")

    rows = resp.json()
    return rows[0] if rows else record


def sync_client(slug: str) -> None:
    repo_root = Path(__file__).parent.parent
    client_dir = repo_root / 'clients' / slug

    if not client_dir.exists():
        print(f"ERROR: Client folder not found: {client_dir}")
        sys.exit(1)

    overview_path = client_dir / 'overview.md'
    services_path = client_dir / 'services.md'

    if not overview_path.exists():
        print(f"ERROR: overview.md not found in {client_dir}")
        sys.exit(1)

    overview = overview_path.read_text()
    services = services_path.read_text() if services_path.exists() else ''

    print(f"Parsing client data for: {slug}")
    record = build_client_record(slug, overview, services)

    print(f"Fields captured: {', '.join(record.keys())}")
    print(f"Upserting to Supabase...")

    saved = upsert_client(record)
    print(f"✓ Client '{saved.get('company_name', slug)}' saved to Supabase (id: {saved.get('id', 'unknown')})")

    # Sync competitors if competitors.md exists
    competitors_path = client_dir / 'competitors.md'
    if competitors_path.exists():
        sync_competitors(saved['id'], competitors_path.read_text())


def sync_competitors(client_id: str, content: str) -> None:
    """Parse competitors.md and upsert competitor records."""
    # Match lines like: - **Name:** Akian | GBP: https://... | Website: https://...
    pattern = r'[-*]\s+\*\*(.+?)\*\*(?:\s*\|\s*GBP:\s*(\S+))?(?:\s*\|\s*Website:\s*(\S+))?'
    # Also match simpler: - Akian (https://...)
    simple_pattern = r'[-*]\s+([A-Z][^\n|]+?)(?:\s*\((\S+)\))?$'

    rows = []

    for match in re.finditer(pattern, content, re.MULTILINE):
        name = match.group(1).strip()
        gbp_url = match.group(2)
        website_url = match.group(3)
        if name:
            row: dict = {'client_id': client_id, 'name': name}
            if gbp_url:
                row['gbp_url'] = gbp_url
            if website_url:
                row['website_url'] = website_url
            rows.append(row)

    if not rows:
        # Try simple pattern
        for match in re.finditer(simple_pattern, content, re.MULTILINE):
            name = match.group(1).strip()
            url = match.group(2)
            if name and len(name) < 80:
                row = {'client_id': client_id, 'name': name}
                if url and url.startswith('http'):
                    row['website_url'] = url
                rows.append(row)

    if not rows:
        print("  No competitors found in competitors.md — skipping.")
        return

    url = f"{SUPABASE_URL}/rest/v1/competitors"
    resp = requests.post(url, headers=HEADERS, json=rows)

    if resp.status_code not in (200, 201):
        print(f"  WARNING: Competitor sync failed ({resp.status_code}): {resp.text}")
    else:
        print(f"  ✓ {len(rows)} competitor(s) synced to Supabase")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python tools/sync_client_to_supabase.py <client-slug>")
        print("Example: python tools/sync_client_to_supabase.py aw-puma-home-services")
        sys.exit(1)

    sync_client(sys.argv[1])
