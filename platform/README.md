# Agency OS — Platform

The web interface for Rework Consulting's Agency Operating System. The platform provides a UI for triggering AI-powered workflows, managing client data, generating ad creatives, and viewing outputs — all backed by Supabase and powered by Claude.

---

## What This Is

The platform is the **trigger layer** of the Agency OS. The intelligence lives in the workflow markdown files at the repo root (`../workflows/`). The platform reads those files, assembles client context from Supabase, streams them through Claude, and persists the outputs.

```
Browser UI  →  /api/workflows/run  →  workflow runner
                                         ├── loads ../workflows/*.md
                                         ├── fetches client context from Supabase
                                         └── streams Claude response → saves output
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres + Auth + Storage) |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Image Generation | FAL AI (Flux model) |
| Web Scraping | Firecrawl |

---

## Local Setup

**1. Install dependencies**
```bash
cd platform
npm install
```

**2. Set up environment variables**
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
FAL_KEY=your-fal-key
```

**3. Run the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database

Schema lives in `supabase/migrations/`. Migrations are applied in order, tracked by number prefix.

| Migration | Description |
|-----------|-------------|
| 001_initial.sql | Core schema: clients, competitors, reviews, icp_documents, workflow_runs, workflow_outputs |
| 002_ad_creatives.sql | Ad creative storage with image generation fields |
| 003_ad_generator_enhancements.sql | Reference images, library tagging |
| 004_auth_settings.sql | Agency settings, user profiles, RBAC |
| 005_brand_ads.sql | Brand ad library and storage |
| 006_brand_logo.sql | Logo field on brand ads |
| 007_allowed_menus.sql | Per-user menu access control |
| 008_workflow_versioning.sql | Workflow file hash tracking on runs |

Apply migrations via the Supabase dashboard SQL editor or the Supabase CLI.

---

## Key Directories

```
platform/
├── src/
│   ├── app/
│   │   ├── (app)/          ← Protected routes (dashboard, clients, ads, settings)
│   │   ├── (auth)/         ← Auth routes (login)
│   │   └── api/            ← API routes
│   ├── components/         ← Reusable React components
│   ├── lib/
│   │   ├── claude/         ← Claude streaming client
│   │   ├── context-loader/ ← Assembles client context from Supabase for AI prompts
│   │   ├── tool-registry/  ← Tool definitions (maps tools → workflow files)
│   │   ├── workflow-runner/← Core execution engine
│   │   └── supabase/       ← Supabase client helpers
│   └── types/              ← TypeScript interfaces
├── supabase/
│   └── migrations/         ← SQL migration files (apply in order)
└── scripts/
    └── create-admin.ts     ← Creates the initial admin user
```

---

## Adding a New Tool

1. Create a workflow SOP at `../workflows/your_workflow.md`
2. Create a tool definition at `src/lib/tool-registry/tools/your-tool.ts`
3. Register it in `src/lib/tool-registry/index.ts`
4. Add a UI page at `src/app/(app)/clients/[slug]/your-tool/page.tsx`

---

## Client Data

Clients are stored in Supabase. To sync from the markdown files in `../clients/`:

```bash
# Sync one client
cd ..
python tools/sync_client_to_supabase.py <client-slug>

# Sync all clients at once
python tools/import_all_clients.py
```
