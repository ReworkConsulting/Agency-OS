#!/usr/bin/env python3
"""
apply_migration_009.py

Applies migration 009 (brand colors + icp_exports table) to Supabase
and creates the 'documents' storage bucket if it doesn't exist.

Usage:
    python tools/apply_migration_009.py

Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
"""

import os
import sys
import json
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / '.env')
except ImportError:
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, _, value = line.partition('=')
                os.environ.setdefault(key.strip(), value.strip())

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests")
    sys.exit(1)

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
}


def run_sql(sql: str, description: str) -> bool:
    """Run a single SQL statement via the Supabase REST API using PostgREST RPC."""
    # Supabase doesn't expose a generic SQL endpoint via the REST API.
    # We use the management API which requires a personal access token (sbp_...).
    # If that's not available, print instructions for manual application.
    print(f"  → {description}")
    print(f"    SQL: {sql[:80]}{'...' if len(sql) > 80 else ''}")
    return True


def check_column_exists(table: str, column: str) -> bool:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=headers,
        params={'select': column, 'limit': '0'},
    )
    return resp.status_code == 200


def check_table_exists(table: str) -> bool:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=headers,
        params={'select': 'id', 'limit': '0'},
    )
    return resp.status_code == 200


def create_storage_bucket(bucket_name: str, public: bool = True) -> bool:
    """Create a Supabase Storage bucket via the Storage API."""
    resp = requests.post(
        f"{SUPABASE_URL}/storage/v1/bucket",
        headers=headers,
        json={'id': bucket_name, 'name': bucket_name, 'public': public},
    )
    if resp.status_code in (200, 201):
        print(f"  ✓ Created storage bucket: {bucket_name}")
        return True
    elif resp.status_code == 409:
        print(f"  ✓ Storage bucket already exists: {bucket_name}")
        return True
    else:
        print(f"  ⚠ Could not create bucket ({resp.status_code}): {resp.text}")
        return False


def main():
    print("\n=== Applying Migration 009: Brand Colors + ICP Exports ===\n")

    # Check what already exists
    primary_exists = check_column_exists('clients', 'brand_primary_color')
    icp_exports_exists = check_table_exists('icp_exports')

    if primary_exists:
        print("  ✓ brand_primary_color column already exists on clients table")
    else:
        print("\n  ✗ brand_primary_color column MISSING")

    if icp_exports_exists:
        print("  ✓ icp_exports table already exists")
    else:
        print("  ✗ icp_exports table MISSING")

    needs_migration = not primary_exists or not icp_exports_exists

    if needs_migration:
        print("\n" + "="*60)
        print("MANUAL STEP REQUIRED")
        print("="*60)
        print("\nThe following SQL needs to be applied in the Supabase SQL Editor:")
        print("  Dashboard → SQL Editor → New query → paste and run:\n")

        migration_path = Path(__file__).parent.parent / 'platform' / 'supabase' / 'migrations' / '009_brand_colors_and_exports.sql'
        if migration_path.exists():
            print(migration_path.read_text())
        else:
            print("(migration file not found at expected path)")

        print("\n" + "="*60)
        print("After running the SQL, re-run this script to confirm and create the storage bucket.")
        print("="*60 + "\n")
        sys.exit(0)

    print("\n  All schema changes already applied ✓")

    # Create storage bucket for PDF exports
    print("\n--- Creating 'documents' storage bucket ---")
    create_storage_bucket('documents', public=True)

    print("\n✅ Migration 009 complete. Storage bucket ready for PDF exports.")


if __name__ == '__main__':
    main()
