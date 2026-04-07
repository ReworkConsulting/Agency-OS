# Workflow: Generate Video Scripts

## Objective

Produce short, high-converting copy for Facebook and Instagram ads. Output type determines the format — video scripts, long-form ad copy, or headline variations. Every output must sound like a real human — not AI copy. Every output must be grounded in the client's ICP, brand voice, and specific offer.

## Required Inputs

- `target_service` — The service or offer being promoted (e.g. "HVAC Installation", "Solar — Mass Save Rebate")
- `audience_type` — `B2C` (client's customers) or `B2B` (business owners / agency pitch)
- `script_goal` — `Lead Generation` | `Awareness` | `Retargeting` | `Trust Building`
- `script_length` — `15s` | `30s` | `60s` | `90s`
- `script_style` — `UGC` or `Voice Over`
- `output_type` — `videos` | `ad_copy` | `headlines`
- `script_count` — `1` | `3` | `5`

## Optional Inputs

- `specific_offer` — Overrides the offer from ICP Profile 3 if provided
- `hook_angle` — A specific emotional angle or insight to open with
- `notes` — Additional context: seasonal timing, objection to address, etc.
- `include_broll_notes` — If true, add `[B-ROLL: description]` cues after each section (Videos output only)

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

## ANTI-SLOP RULES — READ BEFORE WRITING ANYTHING

These are hard constraints. Violations require a rewrite of the containing sentence.

### Banned Phrases — Tier 1 (Corporate Filler — Zero Tolerance)

`tailored solutions`, `comprehensive`, `seamless experience`, `world-class`, `innovative`, `cutting-edge`, `leveraging`, `delve into`, `harness the power`, `game-changer`, `paradigm shift`, `in today's fast-paced world`, `in today's world`, `look no further`, `your one-stop shop`, `state-of-the-art`, `best-in-class`, `holistic approach`, `synergy`, `robust`, `scalable`, `moving forward`, `at the end of the day`, `take it to the next level`

### Banned Phrases — Tier 2 (Weak Ad Copy)

`Don't miss out`, `Limited time offer`, `Act now`, `Don't wait`, `We've got you covered`, `Your dream [anything]`, `We pride ourselves on`, `With years of experience`, `Quality you can trust`, `you don't want to miss this`, `if X then Y` (as an opening structure), `no fluff`

### Banned Phrases — Tier 3 (AI Writing Tells — Hard Disqualifiers)

`Imagine a world where`, `Picture this:`, `In conclusion`, `First and foremost`, `It's important to note that`, `It goes without saying`, `Needless to say`, `As a matter of fact`, `When it comes to`, `The fact of the matter is`, `That being said`, `With that in mind`, `Having said that`, `Not only X, but also Y` (as a sentence structure), opening any sentence with `Certainly` or `Absolutely`

### Structural Rules (Violations Require Rewrite)

**S1 — Sentence Length:** No spoken sentence may exceed 18 words. Fragments are preferred. Split anything over 18 words.

**S2 — Active Voice Only:** Every sentence must use active voice. No passive constructions.

**S3 — Present Tense Default:** "Most homeowners are paying too much" beats "Most homeowners have been paying too much."

**S4 — No Pointless Qualifiers:** Cut `very`, `really`, `quite`, `somewhat`, `basically`, `essentially` unless they do specific rhetorical work.

**S5 — Specificity Over Category:** Not "heating and cooling system" — "your AC unit." Not "financial benefits" — "$8,500 back."

**S6 — One Idea Per Sentence:** Each sentence carries one idea. Do not chain. Split everything else.

**S7 — No Throat-Clearing:** The first word of the script is the hook. Never open with: `Hey there`, `Hi everyone`, `Hello`, `Hey guys`, `Welcome to`, `So today`, `Alright`, `OK so`.

**S8 — The Read-Aloud Test:** Would a non-actor read this naturally on camera without stumbling? If no, rewrite.

---

## Execution Workflow

### INPUT → BEHAVIOR MAPPING (Read Before Any Phase)

Every input has an exact role. Nothing is a suggestion. Confirm each is bound before proceeding.

| Input | Role | Effect on Generation |
|-------|------|---------------------|
| `target_service` | Offer mechanism | Drives angle selection; the specific service must appear in the script with a real number or detail from ICP |
| `audience_type` | B2C vs B2B | Loads correct winning scripts reference file; determines which ICP buyer profile to read (Profile 2) |
| `script_goal` | Conversion intent | Lead Gen = urgency/consequence. Retargeting = cost of inaction. Awareness = fact/contrast. Trust = earned proof |
| `script_length` | Output ceiling | Hard word count limit (see ceilings above). Controls pacing: 15s = 2 moves, 30s = 4 moves, 60s = 6 moves, 90s = 7 moves |
| `script_style` | Delivery method | UGC = first person, conversational, fragments, personal energy. VO = second/third person, cinematic, editorial |
| `output_type` | Format | Videos = HOOK + BODY + CTA. Ad Copy = long-form primary text (200–400 words). Headlines = 8–12 single-line variations |
| `script_count` | Volume | Number of distinct angles to define in Phase 1.5. One angle per script. No two scripts may share an emotional register |
| `specific_offer` | Offer override | Replaces ICP Profile 3 offer. If provided, must appear as a specific number in at least one script |
| `hook_angle` | Angle seed | Biases Phase 1.5 angle selection toward this frame. If provided, at least one script must execute this angle |
| `notes` | Run context | Seasonal, objection, constraint — injected into Phase 1.5 angle evaluation |
| `include_broll_notes` | Output detail | Adds [B-ROLL: description] cues per section in Videos output only |

---

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
If winning scripts or reference examples were provided: study hook structure, pacing, transitions, CTA psychology.
Mirror the structural energy. Do not copy the words.

---

### PHASE 1.5 — Angle Definition (Internal — No Output)

An angle is the strategic emotional frame. The hook executes the angle. Scripts generated without a defined angle produce generic output — the hook becomes the angle by accident, not by design.

For a run of N scripts, define N angles before writing a single word of copy.

**Step 1.5.1 — Generate candidate angles**

Use the following inputs to generate angles:
- `script_goal` → determines the conversion mechanism (urgency, proof, consequence, contrast)
- `audience_type` → B2C: fear / savings / local urgency. B2B: ROI / differentiation / cost of status quo
- `target_service` + `specific_offer` → provides the specific mechanism that makes the angle concrete
- `hook_angle` → if provided, bias at least one angle toward this frame
- `notes` → seasonal, objection, or constraint that should shape the angle
- ICP Profile 2 → the exact internal monologue to interrupt

Each angle is one sentence. Format: **[Emotional frame] — [Specific trigger from ICP or offer data]**

Examples:
- "Financial consequence — homeowner paying $180/month more than neighbors because their unit is 14 years old"
- "Social proof contrast — neighbor just replaced the same system for $400 out of pocket via the rebate"
- "Risk realization — the failed inspection that costs $12,000 because they ignored a $300 fix"
- "Authority credibility — the one thing every HVAC tech knows but clients never hear until it's too late"

Generate at least `script_count + 2` candidate angles.

**Step 1.5.2 — Evaluate each angle. Discard if:**

1. **Not specific**: The angle could apply to any company in this industry. Generic = discard.
2. **Wrong goal**: A Trust Building run needs proof-based angles, not urgency. Misaligned = discard.
3. **Can't execute in word count**: A 6-move story won't fit in a 15s script. Unexecutable = discard.
4. **Overlaps another angle already selected**: Two scripts with the same emotional register = wasted variation.

**Step 1.5.3 — Assign one angle per script**

- `script_count = 1`: select the single strongest angle
- `script_count = 3`: cover 3 different emotional registers (e.g. consequence + social proof + urgency)
- `script_count = 5`: 5 angles — no two may share the same emotional frame

Each assigned angle becomes the governing constraint for that script through Phases 2–output.

---

### PHASE 2 — Hook Construction (Internal — Do Not Output)

Hooks are built FROM the assigned angle, not invented independently. The angle is the strategy. The hook is the opening line that activates it.

Generate 3 candidate hooks per script. For each:
1. Does it execute the assigned angle? If not, discard.
2. Run the Slop Test — any banned phrase?
3. Run the Specificity Test — could you put a competitor's name on this? If yes, rewrite.
3. Say it aloud — does it interrupt thought?

Pick the strongest. Do not output the others.

**Hook patterns by `script_goal`:**
- **Lead Generation:** State the consequence of the problem the viewer hasn't calculated yet.
- **Awareness:** Open with a number, fact, or contrast that surprises.
- **Retargeting:** Reference the decision they haven't made yet.
- **Trust Building:** Start with the outcome, then earn it.

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

**Ad Copy Anti-Rules:**
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

After all output blocks, document the angle decisions made in Phase 1.5:

```
---STRATEGY_NOTE---
ANGLES USED:
Script 1: [Angle name] — [One-sentence description of the emotional frame]
Script 2: [Angle name] — [One-sentence description of the emotional frame]
Script N: [Angle name] — [One-sentence description of the emotional frame]

RATIONALE: [2–3 sentences. Why these angles were selected given the goal and ICP. What makes each script non-interchangeable — each must target a different emotional register than the others.]
---STRATEGY_NOTE_END---
```

**Do not explain the structure. Do not add commentary between blocks. Output the blocks and the strategy note — nothing else.**

---

## Quality Standard

Every output must pass:

1. Real person could read or use it — no AI tells
2. Wrong to put a competitor's name on it — it's specific to this client
3. Contains at least one number grounded in the ICP data
4. Zero banned phrases
5. Every sentence uses active voice
6. Nothing can be removed without losing something important
7. The style (UGC vs Voice Over) is consistent throughout — no drift
