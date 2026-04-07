# Script Reference Library

This is the training library for the video script generation system. Claude loads up to 3 examples per run — it studies structure and style, then applies those patterns to the specific client.

---

## How the System Selects Examples

1. Matches by `audience` type (B2C or B2B)
2. Matches by `industry` (from the client's Supabase record)
3. Matches by `style` and `length`
4. Falls back to `general-home-services/` if no industry match exists
5. Also loads up to 1 approved script from `clients/{slug}/scripts/approved/`
6. Cap is 3 total examples — any more bloats the prompt

**This means:** if a client's industry field is set to `roofing`, Claude will automatically pull scripts from `b2c/roofing/` before falling back to the general folder. If the industry field is blank or unrecognized, it always uses `general-home-services/`.

---

## Supported Industries (B2C)

```
b2c/
├── general-home-services/    ← FALLBACK — works for any local service
├── hvac/
├── solar/
├── roofing/
├── plumbing/
├── pest-control/
├── electrical/
├── windows-siding/
```

To add a new industry: create a new folder inside `b2c/` (lowercase, hyphens) and drop `.md` files in it following the format below.

---

## How to Upload a Winning Script

**Option A — Promote a client-approved script to the global library**

When a script performs well in the field (strong CTR, high conversion, client loves it):

1. Find it in `clients/{slug}/scripts/approved/{filename}.md`
2. Copy it to the correct industry folder here: `examples/scripts/b2c/{industry}/`
3. Update the frontmatter — especially `notes` with the performance data
4. Change `source` to `client-approved`
5. That's it — it will be loaded on the next generation run for any client in that industry

**Option B — Add a script you wrote yourself or sourced externally**

1. Create a new `.md` file in the correct folder
2. Follow the format below exactly (frontmatter is required)
3. Set `source: original` or `source: adapted`
4. Add a `STYLE NOTES:` section explaining what makes it work structurally

**Option C — Per-client only**

If a script should only be used as a reference for one specific client (not globally), put it directly in `clients/{slug}/scripts/approved/` — the loader picks it up automatically for that client's runs only.

---

## File Format (Required)

```markdown
---
length: 30s
style: Pain Hook
audience: B2C
industry: hvac
goal: Lead Generation
word_count: 82
tags: [rebates, financing, emergency]
source: original
approved_date: 2026-03-21
notes: High performer — 2.8% CTR on Facebook video campaign
---

[HOOK]
...

[BODY]
...

[CTA]
...

---
STYLE NOTES: [What makes this script structurally effective. Be specific — hook pattern, transition mechanism, CTA psychology. This is what Claude reads to understand WHY it works.]
```

## Valid Field Values

| Field | Options |
|---|---|
| `length` | `15s` `30s` `60s` `90s` |
| `style` | `Pain Hook` `Results First` `Testimonial Style` `Day-in-Life` `Problem-Agitate-Solve` `Offer Drop` `Myth Bust` `Direct Response` |
| `audience` | `B2C` `B2B` |
| `industry` | `hvac` `solar` `roofing` `plumbing` `pest-control` `electrical` `windows-siding` `general-home-services` `agency-pitch` `service-pitch` |
| `goal` | `Lead Generation` `Awareness` `Retargeting` `Trust Building` |
| `source` | `original` `client-approved` `adapted` |

---

## File Naming Convention

`{length}-{style}-{descriptor}.md`

Examples:
- `30s-pain-hook-storm-damage.md`
- `60s-results-first-bill-comparison.md`
- `15s-offer-drop-financing.md`

---

## The Self-Learning Loop

```
Generate scripts
    → Approve best ones in the platform (ScriptCard → Approve button)
    → System auto-loads approved scripts as references on next run for that client
    → When a script performs well in the real world, promote it here
    → Future clients in the same industry benefit from the proven structure
```

The more quality examples exist here, the better every future generation run gets.
