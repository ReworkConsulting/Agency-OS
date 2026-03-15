# Workflow: Onboard Client

## Objective
Create a new client workspace and populate baseline data. The onboarding process uses a paste-in intake template. Claude parses what you provide, identifies what's missing by priority tier, asks for the gaps in one message, then builds the client files with whatever is confirmed.

---

## How to Use This Workflow

1. Copy the intake template from `context/intake_template.md`
2. Fill in whatever you have — skip anything you don't know
3. Paste it here and say "onboard this client"
4. Claude will check for missing high-priority fields and ask for them
5. Provide what you can, confirm what you don't have, and Claude builds everything

---

## Step 1 — Parse the Intake

Read the pasted intake content. Extract every field that has a real value (not blank or "N/A"). Build a mental map of what's been provided.

---

## Step 2 — Gap Check by Priority Tier

Compare what was provided against the three priority tiers below. Identify every field that is missing or unclear.

### Tier 1 — Critical (ask if missing — these directly enable research)
- Company name
- Website URL
- Google Business Profile URL
- Service area
- Industry / primary service

### Tier 2 — Very Important (ask if missing — significantly improves ICP quality)
- Owner / primary contact name
- Phone number
- Owner interview transcript ("Grill Them")
- Facebook page URL
- Instagram URL
- YouTube channel URL
- Full list of services
- Financing available?
- Average job value

### Tier 3 — Important (ask if missing — fills out the full picture)
- Email
- Address
- Time zone
- Competitor names or URLs
- Starting ad spend
- Biggest marketing challenge
- Main goal (6–12 months)
- How they heard about Rework
- Why they hired Rework
- Facebook Ad Account ID

---

## Step 3 — Ask for Missing Fields in One Message

After parsing the intake, send **one message** that covers all gaps. Do not ask question by question — batch everything into a single clean ask.

Format it clearly:

```
Got it — here's what I have for [Client Name]:

✅ Captured
[list every field with a real value in bullet form]

⚠️ Missing — can you provide any of these?

Must have:
- [list any Tier 1 gaps]

Would significantly help the ICP:
- [list any Tier 2 gaps]

Nice to have:
- [list any Tier 3 gaps]

For anything you don't have, just say "don't have it" and I'll mark it TBD and move on.
```

Wait for the user's response before building the files.

---

## Step 4 — Confirm and Proceed

After the user responds:
- Add any new info to the intake data
- For anything the user confirms they don't have: note it as TBD
- Say: "Got it — building [Client Name]'s workspace now."

---

## Step 5 — Build the Client Folder

Create `clients/<client-name>/` using the company name, lowercase with hyphens.

Example: "Smith Roofing" → `clients/smith-roofing/`

Copy all five files from `clients/_template/`:
- `overview.md`
- `services.md`
- `competitors.md`
- `reviews_raw.md`
- `icp.md`

---

## Step 6 — Populate the Client Files

**`overview.md`** — Fill in every field from the confirmed intake data. Mark anything still unknown as `TBD`. Do not omit fields.

**`services.md`** — Populate primary service, full service list, service area, pricing notes, financing.

**`competitors.md`** — Add any competitor names or URLs the client provided.

If an interview transcript was provided, save it to `clients/<client-name>/interview_transcript.txt` and update the Grill Them Interview fields in `overview.md`.

---

## Step 7 — Scrape Google Reviews

Use the `firecrawl-browser` skill on the Google Business Profile URL.

Capture: full review text, star rating, reviewer first name, approximate date. Capture all reviews if fewer than 50 exist.

Also capture: any responses written by the owner — this is voice data for the ICP.

Save to `clients/<client-name>/reviews_raw.md`. Update the header:
- **Source URL:**
- **Scraped On:**
- **Total Reviews:**

If the browser scrape fails: try `firecrawl-search` with `"[Business Name]" reviews`. If still blocked, note it in `reviews_raw.md` and ask the user to manually export from their Google Business dashboard.

---

## Output

`clients/<client-name>/` is ready with:
- [x] `overview.md` — fully populated (TBD for confirmed unknowns)
- [x] `services.md` — populated
- [x] `competitors.md` — populated with any names provided
- [x] `reviews_raw.md` — populated with available reviews
- [ ] `icp.md` — skeleton ready, waiting for ICP research workflow

Confirm to the user:
1. Folder created at `clients/<client-name>/`
2. How many reviews were collected
3. Which Tier 1 or Tier 2 fields are still TBD (so they know what to gather before the ICP)
4. "Ready to run the ICP whenever you are. Run `workflows/build_icp.md` to start research."

---

## Edge Cases

- **No intake pasted — user just names a client:** Ask them to paste the intake template filled out. Share the template from `context/intake_template.md`.
- **Google Business URL not provided or not found:** Note "No GBP" in `overview.md` and skip the review scrape. Flag it — Google reviews are critical for the ICP.
- **Scrape fails on Google reviews:** Note the failure in `reviews_raw.md` with instructions for manual export.
- **Client name has special characters:** Strip them. Use only lowercase letters, numbers, and hyphens.
- **Interview transcript provided:** Save to `clients/<client-name>/interview_transcript.txt`. Note it in `overview.md`.
- **Client folder already exists:** Ask the user — update the existing folder or create a new one?
