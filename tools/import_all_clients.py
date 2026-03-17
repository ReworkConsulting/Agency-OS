#!/usr/bin/env python3
"""
import_all_clients.py

One-time migration: reads every client folder in clients/ (excluding _template)
and upserts all of them into Supabase.

Run this once to bring Supabase in sync with the existing markdown client files.
After this, use sync_client_to_supabase.py for individual clients going forward.

Usage:
    python tools/import_all_clients.py

    # Dry run (shows what would be synced, writes nothing)
    python tools/import_all_clients.py --dry-run

Requires:
    - SUPABASE_URL in .env
    - SUPABASE_SERVICE_ROLE_KEY in .env
"""

import sys
import os
from pathlib import Path

# Load .env from repo root
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

# Reuse all parsing and upsert logic from sync_client_to_supabase
sys.path.insert(0, str(Path(__file__).parent))
from sync_client_to_supabase import build_client_record, upsert_client, sync_competitors


def import_all(dry_run: bool = False) -> None:
    repo_root = Path(__file__).parent.parent
    clients_dir = repo_root / 'clients'

    if not clients_dir.exists():
        print(f"ERROR: clients/ directory not found at {clients_dir}")
        sys.exit(1)

    # Find all client slugs (exclude _template and hidden dirs)
    slugs = [
        d.name for d in sorted(clients_dir.iterdir())
        if d.is_dir() and not d.name.startswith('_') and not d.name.startswith('.')
    ]

    if not slugs:
        print("No client folders found in clients/")
        return

    print(f"Found {len(slugs)} client(s): {', '.join(slugs)}")
    if dry_run:
        print("\n[DRY RUN] No changes will be written to Supabase.\n")

    results = {'success': [], 'skipped': [], 'failed': []}

    for slug in slugs:
        client_dir = clients_dir / slug
        overview_path = client_dir / 'overview.md'
        services_path = client_dir / 'services.md'

        if not overview_path.exists():
            print(f"  [{slug}] SKIP — no overview.md found")
            results['skipped'].append(slug)
            continue

        try:
            overview = overview_path.read_text()
            services = services_path.read_text() if services_path.exists() else ''

            record = build_client_record(slug, overview, services)
            company_name = record.get('company_name', slug)

            if dry_run:
                print(f"  [{slug}] WOULD UPSERT: {company_name} ({len(record)} fields)")
                for k, v in sorted(record.items()):
                    val_str = str(v)[:60] + ('...' if len(str(v)) > 60 else '')
                    print(f"    {k}: {val_str}")
                results['success'].append(slug)
                continue

            saved = upsert_client(record)
            client_id = saved.get('id')
            print(f"  [{slug}] ✓ {company_name} (id: {client_id})")

            # Sync competitors
            competitors_path = client_dir / 'competitors.md'
            if competitors_path.exists() and client_id:
                sync_competitors(client_id, competitors_path.read_text())

            # If ICP exists, import it too
            icp_path = client_dir / 'icp.md'
            if icp_path.exists() and client_id:
                icp_content = icp_path.read_text()
                # Only import if it's a real ICP (more than 100 lines = not a skeleton)
                if icp_content.count('\n') > 100:
                    sync_icp(client_id, icp_content, dry_run=False)

            results['success'].append(slug)

        except Exception as e:
            print(f"  [{slug}] FAILED — {e}")
            results['failed'].append(slug)

    print(f"\n--- Import Summary ---")
    print(f"  ✓ Success:  {len(results['success'])} — {', '.join(results['success']) or 'none'}")
    print(f"  - Skipped:  {len(results['skipped'])} — {', '.join(results['skipped']) or 'none'}")
    print(f"  ✗ Failed:   {len(results['failed'])} — {', '.join(results['failed']) or 'none'}")

    if results['failed']:
        sys.exit(1)


def sync_icp(client_id: str, icp_content: str, dry_run: bool = False) -> None:
    """Import an ICP document from icp.md into icp_documents table."""
    import requests
    import os

    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
    }

    if dry_run:
        print(f"    WOULD IMPORT ICP ({icp_content.count(chr(10))} lines)")
        return

    # Mark all existing ICPs as not current
    requests.patch(
        f"{SUPABASE_URL}/rest/v1/icp_documents",
        headers={**headers, 'Prefer': ''},
        params={'client_id': f'eq.{client_id}'},
        json={'is_current': False},
    )

    # Insert the new ICP (upsert on client_id + version)
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/icp_documents",
        headers=headers,
        params={'on_conflict': 'client_id,version'},
        json={
            'client_id': client_id,
            'version': 1,
            'is_current': True,
            'icp_content': icp_content,
            'has_transcript': 'interview_transcript' in icp_content.lower(),
            'confidence_level': 'HIGH',
            'source_materials': ['overview.md', 'services.md', 'reviews_raw.md'],
        },
    )

    if resp.status_code in (200, 201):
        print(f"    ✓ ICP document imported")
    else:
        print(f"    WARNING: ICP import failed ({resp.status_code}): {resp.text}")


if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    import_all(dry_run=dry_run)
