# Workflow: Generate Video Scripts

## Objective

Produce short, high-converting video ad scripts, ad copy, and headline variations for Facebook and Instagram. Every output is grounded in the client's ICP data and processed through three quality layers: `messaging-mastery` (psychology), `direct-response-ad-scripting` (structure and format), and `anti-ai-writing-rules` (final quality gate). Output must sound like a real human wrote it — never AI copy.

---

## SKILL CALLS IN THIS WORKFLOW

```
Phase 2: messaging-mastery       — conditions, amplifiers, audience segment, sophistication, decision-maker type
Phase 3: direct-response-ad-scripting  — hook type selection, ad format selection
Phase 5: anti-ai-writing-rules   — MANDATORY quality gate — never skip
```

---

## Required Inputs

- `target_service` — The service or offer being promoted (e.g. "HVAC Installation", "Solar — Mass Save Rebate")
- `audience_type` — `B2C` (client's customers) or `B2B` (business owners / agency pitch)
- `script_goal` — `Lead Generation` | `Awareness` | `Retargeting` | `Trust Building`
- `script_length` — `15s` | `30s` | `60s` | `90s`
- `script_style` — `UGC` or `Voice Over`
- `output_type` — `videos` | `ad_copy` | `headlines`
- `script_count` — `1` | `3` | `5`
- `price_point` — The offer price or price range (e.g. "$0 free audit", "$2,500/month", "$8,500 system"). Drives qualifying friction level.

## Optional Inputs

- `specific_offer` — Overrides the offer from ICP Profile 3 if provided
- `hook_angle` — A specific emotional angle or insight to open with
- `notes` — Additional context: seasonal timing, objection to address, etc.
- `include_broll_notes` — If true, add `[B-ROLL: description]` cues after each section (Videos output only)
- `audience_segment` — Override: `in-market` | `needs-convinced`. If blank, Phase 2 determines from ICP.
- `decision_maker_type` — Override: `circle` | `triangle` | `square`. Defaults to Circle.

---

## INPUT → BEHAVIOR MAPPING

| Input | Role | Effect on Generation |
|---|---|---|
| `target_service` | Offer mechanism | Drives angle selection; the specific service must appear in the script with a real number or detail from ICP |
| `audience_type` | B2C vs B2B | Loads correct reference examples; determines which ICP buyer profile to read (Profile 2) |
| `script_goal` | Conversion intent | Lead Gen = urgency/consequence. Retargeting = cost of inaction. Awareness = fact/contrast. Trust = earned proof |
| `script_length` | Output ceiling | Hard word count limit (see ceilings below). Controls pacing: 15s = 2 moves, 30s = 4 moves, 60s = 6 moves, 90s = 7 moves |
| `script_style` | Delivery method | UGC = first person, conversational, fragments, personal energy. VO = second/third person, cinematic, editorial |
| `output_type` | Format | Videos = HOOK + BODY + CTA. Ad Copy = long-form primary text. Headlines = 8–12 single-line variations |
| `script_count` | Volume | Number of distinct angles to generate. One angle per script. No two scripts may share an emotional register |
| `price_point` | Qualifying friction | Under $500 = no friction. $500–$5k = light qualifying. $5k+ = intentional qualifying language woven into the script |
| `specific_offer` | Offer override | Replaces ICP Profile 3 offer. Must appear as a specific number in at least one script |
| `hook_angle` | Angle seed | Biases Phase 3 angle selection toward this frame. At least one script must execute this angle if provided |
| `notes` | Run context | Seasonal, objection, or constraint — injected into Phase 3 angle evaluation |
| `audience_segment` | Segment override | Bypasses Phase 2 determination if provided |
| `decision_maker_type` | Register override | Sets Circle/Triangle/Square targeting. Defaults to Circle |
| `include_broll_notes` | Output detail | Adds [B-ROLL: description] cues per section in Videos output only |

---

## STYLE GUIDE — UGC vs Voice Over

This is the single most important creative decision. It changes everything about sentence structure, POV, and energy.

### UGC Style

Written as if a real person — the owner, a technician, or an actor — speaks directly to camera. First person.

**Rules:**
- First person ("I replaced 6 systems last week in Wellesley. Here's what I found.")
- Conversational, natural imperfections, short bursts
- Hook is immediate and personal — the speaker enters mid-thought
- Fragments are correct: "Took 4 hours. Left the house cleaner than I found it."
- Director note matters most: delivery, pace, emotion
- B-Roll shows the real person in action — not stock footage

**UGC voice test:** Read it aloud as if you're the business owner talking to your neighbor at a cookout. If it sounds like a human and not an ad, you're there.

### Voice Over Style

Narration written for a speaker reading over footage, B-roll, or graphics. Second or third person.

**Rules:**
- Second or third person ("Most homeowners in [city] are overpaying by $150 a month.")
- More structured, cinematic pacing — built for editorial rhythm
- Hook can be observational, factual, or contrast-based
- Sentences can be slightly longer than UGC — but never exceed the 18-word cap
- B-Roll notes are critical here — the copy must match specific footage types
- Director note guides VO delivery pace and pause placement

**VO voice test:** Read it aloud as if it's narrating a 60 Minutes segment about a local business. Confident, authoritative, real.

---

## Word Count Ceilings — Videos Only (HARD LIMITS — COUNT EVERY SPOKEN WORD)

```
15s → 35–45 words
30s → 70–90 words
60s → 140–160 words
90s → 200–230 words
```

Count every spoken word before outputting a script. If you exceed the ceiling, cut. Never pad to reach the floor.

---

## Execution Workflow

### PHASE 1 — Context Absorption (Silent — Do NOT output anything)

**Step 1.1 — Absorb Brand Voice (ICP Profile 1)**
- Tone descriptors and vocabulary patterns
- Sentence length — do they use fragments or full sentences?
- Boldness level — how direct is this brand willing to be?

**Step 1.2 — Absorb the Buyer (ICP Profile 2)**

For **B2C**: What is the ideal customer afraid of? What are they telling themselves that is wrong? What triggers the phone call or click?

For **B2B**: What does this business owner believe about marketing that isn't true? What would make them feel stupid for not acting?

Extract their internal monologue. The output will interrupt it.

**Step 1.3 — Absorb the Offer (ICP Profile 3)**
What numbers exist in the ICP data? What is the risk-reversal? If `specific_offer` is provided, use that instead.

**Step 1.4 — Study Reference Examples**
Load up to 3 examples from `examples/scripts/`:
1. Match by `audience_type` (B2C or B2B)
2. Match by client industry (from client overview or ICP)
3. Match by `script_style` and `script_length`
4. Fallback to `general-home-services/` if no industry match
5. Load up to 1 approved script from `clients/{slug}/scripts/approved/` if available

Study hook structure, pacing, transitions, CTA psychology. Mirror the structural energy — do not copy the words.

**Pre-Flight ICP Check:** If `clients/{client-name}/icp.md` does not exist or Profile 2 sections are marked LOW confidence, flag it before proceeding. A thin ICP produces weak conditions analysis and weaker scripts.

**Step 1.5 — Extract Conditions-Relevant Data**
Before leaving Phase 1, extract from the ICP:
- Price point (from `price_point` input or ICP Profile 3)
- Evidence of audience sophistication — high-net-worth / business owners (rich-people triggers) or general consumers (general-public triggers)
- Any CPO data (Circumstances, Problems, Outcomes) explicitly stated in ICP Profiles 2.3–2.9 and Profile 4

This data feeds directly into Phase 2.

---

### PHASE 2 — Messaging Psychology (Silent — Do NOT output anything)

**Apply the `messaging-mastery` skill with the ICP data loaded.**

**Step 2.1 — Run messaging-mastery**

Using the ICP data from Phase 1, the skill must identify:

1. **Conditions** — which of the 5 condition categories describe this buyer's current situation:
   - Financial (cash-flow, debt, scaling constraints, revenue plateau)
   - Time & Energy (bandwidth, burnout, delegation readiness)
   - Emotional & Psychological (frustration level, confidence, urgency to change)
   - Business & Market (growth stage, operational maturity, competitive pressure)
   - Lifestyle & Personal (life event context, identity, what they're protecting)

2. **Sophistication Level** — determine the register:
   - Rich-people triggers: time is the resource, reputation risk, exclusivity, certainty, outcomes not escape, invite don't chase
   - General-public triggers: sick of being stuck, tired of doing it alone, FOMO, price sensitivity, prove themselves, just want something that works

3. **Lead Amplifiers** — select 2–3 from the 6 emotional categories that match the dominant conditions:
   - Fear-Based (FOMO, losing it all, wrong move, regret)
   - Frustration-Based (plateaued, others passing you, burned but not free)
   - Desire-Based (recognition, freedom, control, leverage)
   - Envy & Comparison (peers ahead, competitors winning with worse)
   - Identity & Ego (built for bigger, refuse average, outgrown circle)
   - Urgency & Loss (window closing, every day costs you, momentum slipping)

4. **Audience Segment** — determine from ICP Profile 2 + `script_goal`:
   - In-market (3–4%): already decided they need this category, comparing providers → lead with recognition not education, use Direct Claim or You Already Know hooks, tight proof-dense scripts
   - Needs-convinced (~30%): want the outcome but not committed to the method → more education, future-pain selling, longer scripts preferred for 60s-90s formats
   - Use the `audience_segment` input to override if provided

5. **Decision-Maker Type** — use `decision_maker_type` input or default to Circle:
   - Circle (executives/founders): think big picture, vision, legacy, freedom — care about WHERE not HOW
   - Triangle (management): big picture broken into steps, execution
   - Square (employees): individual tasks, specific actions, details
   Lead with Circle language. Squares will follow. Triangles figure out execution.

**Step 2.2 — Lock Messaging Parameters (Internal)**

Commit these parameters before moving to Phase 3. Every script generated must be consistent with them:

```
Primary condition: [category — specific description]
Lead amplifiers: [2–3 names from the 6 categories]
Audience segment: [in-market / needs-convinced]
Sophistication register: [rich-people / general-public]
Decision-maker type: [Circle / Triangle / Square]
```

**Flag:** If `audience_segment` resolves to needs-convinced AND `script_length` is 15s or 30s — note this tension in the STRATEGY_NOTE. Do not override the user's input. Execute as given and surface the tension.

**Step 2.3 — Set Qualifying Friction**

Based on `price_point`:
- Under $500: no qualifying friction. Broad appeal. Maximize click volume.
- $500–$5,000: light qualifying. ("If you're a homeowner in [area]...") Some self-selection.
- $5,000+: intentional friction. Weave qualifying language naturally into the script body. The prospect must feel they qualify for the service — not that the service is available to anyone.

---

### PHASE 3 — Strategic Framing (Silent — Do NOT output anything)

**Step 3.1 — Angle Generation**

An angle is the strategic emotional frame. The hook executes the angle. Scripts generated without a defined angle produce generic output.

For a run of N scripts, define N distinct angles before writing a single word of copy.

Generate at least `script_count + 2` candidate angles using:
- `script_goal` → conversion mechanism (urgency, proof, consequence, contrast)
- `audience_type` → B2C: fear / savings / local urgency. B2B: ROI / differentiation / cost of status quo
- `target_service` + `specific_offer` → the specific mechanism that makes the angle concrete
- `hook_angle` → if provided, bias at least one angle toward this frame
- `notes` → seasonal, objection, or constraint shaping the angle
- ICP Profile 2 + the locked amplifiers from Phase 2 → the exact internal monologue to interrupt

Each angle is one sentence. Format: **[Emotional frame] — [Specific trigger from ICP or offer data]**

Examples:
- "Financial consequence — homeowner paying $180/month more than neighbors because their unit is 14 years old"
- "Social proof contrast — neighbor just replaced the same system for $400 out of pocket via the rebate"
- "Identity/ego — business owner capable of more, stuck running ops instead of growing"

**Step 3.2 — Evaluate and Discard. Cut any angle that:**

1. Is not specific — could apply to any company in this industry
2. Misaligns with `script_goal` — a Trust Building run needs proof-based angles, not urgency
3. Can't execute in the word count — a 6-move story won't fit in a 15s script
4. Overlaps an already-selected angle — no two scripts may share the same emotional register

**Step 3.3 — Hook Type Selection**

Apply the `direct-response-ad-scripting` skill. For each candidate angle, identify which of the 7 named hook types best executes it:

| Hook Type | Best For |
|---|---|
| You Already Know | In-market audiences who've already decided they need the category |
| You're Doing This, But... | Piggyback on existing behavior, show a better path |
| Circumstance | Life event or timing trigger (recently moved, storm damage, new season) |
| Direct Claim | Lead with specific results — number, timeline, outcome |
| Question | Open a loop the viewer wants closed |
| Contrarian / Myth-Busting | Challenge a belief they hold that's costing them |
| Social Proof | Client transformation story — specific person, specific result |

**Selection rule:** In-market → bias to "You Already Know" and "Direct Claim." Needs-convinced → bias to "Question," "Contrarian," and "Social Proof."

**Step 3.4 — Ad Format Selection**

Apply the `direct-response-ad-scripting` skill. Select the ad format for each script:

| Format | Default Use |
|---|---|
| Talking Head + B-Roll | Default for all talking-head scripts |
| Case Study Snapshot | Specific client story, before/after |
| Demo / Screencast | Product or service in action |
| Objection-First | Address biggest objection head-on in the hook |
| Q&A Format | Authority-building, credibility |
| Two-Person Interview | Accessibility, relatability |
| Skit / Scenario | Before/after emotional arc |

Default to Talking Head + B-Roll if no format can be determined from context. The format selection directly affects DIRECTOR_NOTE content and BROLL_NOTES style.

**Step 3.5 — Assign One Angle Per Script + Internal Constraint Block**

- `script_count = 1`: select the single strongest angle
- `script_count = 3`: cover 3 different emotional registers (consequence + social proof + urgency, etc.)
- `script_count = 5`: 5 angles — no two may share the same emotional frame

For each script, lock an internal constraint block before writing begins:

```
Script N:
- Angle: [one-sentence emotional frame — specific trigger]
- Hook type: [named from the 7]
- Ad format: [named from the 7]
- Primary amplifier: [category + name]
- Audience segment: [in-market / needs-convinced]
- Qualifying friction: [none / light / intentional]
- Sophistication: [rich-people / general-public]
- Decision-maker type: [Circle / Triangle / Square]
```

Every sentence of the script must be consistent with this block.

---

### PHASE 4 — Script Writing

**Step 4.1 — Build the Hook**

Build 3 candidate hooks per script using the assigned angle and hook type from Phase 3. For each candidate:
1. Does it execute the assigned angle? If not, discard.
2. Does it execute the selected hook type? If not, discard.
3. Specificity test — could you put a competitor's name on this hook? If yes, rewrite.
4. Read it aloud — does it interrupt thought?

**Hook validation gate — all three must be yes before using a hook:**
- Does the viewer identify themselves in this hook?
- Does it open a loop they want closed?
- Does it work as a standalone sentence without context?

Pick the strongest. Do not output the others.

**Hook patterns by `script_goal`:**
- **Lead Generation:** State the consequence of the problem the viewer hasn't calculated yet.
- **Awareness:** Open with a number, fact, or contrast that surprises.
- **Retargeting:** Reference the decision they haven't made yet.
- **Trust Building:** Start with the outcome, then earn it.

**Step 4.2 — Write the Body**

Body density depends on audience segment:
- **In-market:** Tight body. Skip category education. Proof points, specific results, specific timelines. One core idea.
- **Needs-convinced:** Longer body. Earn the case before presenting solution. Future-pain selling (make them feel the inevitable consequence of inaction — sensory, specific, emotional). More social proof to bridge desire to method commitment.

**"Written TO, not ABOUT" test:** Every body sentence must be directed AT the viewer. Is this sentence being said TO them? Or is it describing a hypothetical version of them? If "about," rewrite.

**Circle/Triangle/Square register:** Lead with vision and outcome (Circle language). Specifics and process details are supporting evidence — not the hook. The check-signer cares about WHERE, not HOW.

**No Cherry-Picking rule:** Hit all relevant CPO points from ICP Profile 2. Each point can be a half-sentence woven naturally. Do not filter — let the prospect self-select which ones land.

**Conversational transitions:** When moving from problem to solution, use natural connectors — "So here's the deal," "Here's the thing," "And look." Not formal structured connectors.

**Qualifying friction:** For $5k+ price points, weave qualifying language naturally into the body. Not a disclaimer — a conversational qualifier that makes the right person lean in and the wrong person opt out.

**Sentence rules:**
- No spoken sentence may exceed 18 words. Fragments are preferred. Split anything over 18 words.
- Every sentence uses active voice.
- Present tense default.
- Cut `very`, `really`, `quite`, `somewhat`, `basically`, `essentially` unless doing specific rhetorical work.
- Not "heating and cooling system" — "your AC unit." Not "financial benefits" — "$8,500 back."
- One idea per sentence.
- First word of the script is the hook. Never open with: Hey there, Hi everyone, Hello, Hey guys, Welcome to, So today, Alright, OK so.

**Step 4.3 — Write the CTA**

- 3–7 words. Names a specific action. Reduces friction.
- Direct and confident. Not a hint — a direction.
- Must match the funnel destination exactly. The ad promise and the landing page promise must be identical.

**Step 4.4 — Generate Hook Variations (Mandatory — Videos output only)**

After completing the primary script, generate 3–5 hook variations for the same body and CTA. Each variation uses a different hook type from the 7. This is not optional.

---

### PHASE 5 — Anti-AI Quality Gate (MANDATORY — Never Skip)

**Apply the `anti-ai-writing-rules` skill to every script before output.**

The skill enforces:
1. 52-word banned list check (corporate language, AI writing tells)
2. 9 structural pattern checks — including em dash ban, negative parallelism, staccato three-part structures, trailing -ing phrases, "serves as / stands as / marks a / represents a," vague authority, puffery, "this is important" overstatement
3. Mouth test — every line read aloud. Does it feel natural? Would a real person say this? Any stumble points?
4. 13-point final checklist

No script is delivered that has not cleared this gate. If the gate catches violations, rewrite the offending lines and re-run the checklist before outputting.

---

## Output Format — Three Modes

The `output_type` input determines which format to use. Use the correct one exclusively.

---

### OUTPUT TYPE: Videos

For UGC style — write as if the owner is talking directly to camera, first person.
For Voice Over style — write as narration over footage, second/third person.

```
---SCRIPT_START---
LENGTH: [15s | 30s | 60s | 90s]
STYLE: [UGC | Voice Over]
AUDIENCE: [B2C | B2B]
WORD_COUNT: [exact spoken word count]

HOOK:
[1–2 sentences. Must interrupt the viewer's thought. UGC: personal, first-person. VO: observational, factual.]

BODY:
[Spoken sentences. Max 18 words each. At least one specific number. One idea per sentence.]

CTA:
[3–7 words. Names a specific action. Reduces friction.]

BROLL_NOTES:
[Only if include_broll_notes is true. One [B-ROLL: description] per section. Observable, specific, one sentence each.]

DIRECTOR_NOTE:
[1–2 sentences. Delivery instruction — pace, energy, pause placement. UGC: emotional cues for the speaker. VO: narrator pacing and tone.]
---SCRIPT_END---

HOOK_VARIATIONS:
VARIATION 1 — [Hook type name]:
[Hook text]
[One sentence: why this takes a different angle than the primary hook]

VARIATION 2 — [Hook type name]:
[Hook text]
[One sentence: why this takes a different angle than the primary hook]

VARIATION 3 — [Hook type name]:
[Hook text]
[One sentence: why this takes a different angle than the primary hook]

[Add VARIATION 4 and 5 if strong additional angles exist]
```

---

### OUTPUT TYPE: Ad Copy

Facebook/Instagram long-form written copy. This is text — not spoken word. Different rhythm. Different rules.

Structure: Hook sentence → Problem/Pain → Story or Proof → Offer mechanism → Risk-reversal → CTA

For UGC style — first person, feels like a post from a real business owner.
For Voice Over style — third person, feels like editorial about a local business.

Word count: 200–400 words for primary text.

```
---COPY_START---
STYLE: [UGC | Voice Over]
AUDIENCE: [B2C | B2B]

PRIMARY_TEXT:
[Long-form ad copy. Pattern-interrupt first sentence. Pain/story arc. Specific proof or number. Offer with mechanism. Risk-reversal. Written text — not a script being read aloud.]

HEADLINE:
[2–5 words. CTR-optimized. Completes or contrasts the PRIMARY_TEXT opening.]

CTA:
[3–6 words. Named action. Friction-reducing.]
---COPY_END---
```

**Ad Copy Rules:**
- Do not write in the structure of a video script — no HOOK/BODY/CTA sections
- The first sentence must stop the scroll — question, bold claim, or specific number
- Every paragraph earns the next — if a paragraph can be cut, cut it
- The CTA must name the action specifically ("Book a free inspection" not "Learn more")

---

### OUTPUT TYPE: Headlines

CTR-optimized headline variations. One per line. 8–12 headlines. No body copy.

Each headline labeled with its angle. Multiple angles per set.

Available angles: `[CURIOSITY]` `[FEAR]` `[URGENCY]` `[BENEFIT]` `[SOCIAL PROOF]` `[PROBLEM]` `[CHALLENGE]` `[DIRECT]` `[LOCAL]` `[CONTRAST]`

```
---HEADLINES_START---
STYLE: [UGC | Voice Over]
AUDIENCE: [B2C | B2B]

HEADLINES:
[ANGLE] Headline text here
[ANGLE] Headline text here
[ANGLE] Headline text here
[ANGLE] Headline text here
[ANGLE] Headline text here
[ANGLE] Headline text here
[ANGLE] Headline text here
[ANGLE] Headline text here
---HEADLINES_END---
```

**Headline Rules:**
- Each headline is 3–10 words
- At least 2 different angles represented
- At least 1 headline uses a specific number from the ICP data
- No two headlines use the same opening word
- Every headline must be testable on its own — no context assumed

---

### Strategy Note (All Output Types)

After all output blocks:

```
---STRATEGY_NOTE---
ANGLES USED:
Script 1: [Angle name] — [One-sentence description of the emotional frame]
Script 2: [Angle name] — [One-sentence description of the emotional frame]
Script N: [Angle name] — [One-sentence description of the emotional frame]

RATIONALE: [2–3 sentences. Why these angles were selected given the goal and ICP. Which amplifiers were chosen and why. Which audience segment this targets and how that shaped the script density and length. What qualifying friction level was applied. What makes each script non-interchangeable — each must target a different emotional register than the others.]

TENSIONS FLAGGED: [Any audience segment / script length conflicts, thin ICP sections, or other issues worth noting. Leave blank if none.]
---STRATEGY_NOTE_END---
```

**Do not explain the structure. Do not add commentary between blocks. Output the blocks and the strategy note — nothing else.**

---

## Self-Learning Loop

When a script is approved by a client or performs well in the platform:
1. Save it to `clients/{slug}/scripts/approved/` with the standard frontmatter format
2. If it performs exceptionally, promote it to `examples/scripts/` organized by audience type and industry
3. Future runs for this client and similar industries will automatically load it as a reference example

See `examples/scripts/README.md` for file format and naming conventions.
