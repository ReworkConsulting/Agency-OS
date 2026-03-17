# Build ICP Research Document — Platform Workflow

## Important: Platform Context

All available client data has been pre-loaded and is provided in the CLIENT CONTEXT section below. This includes company overview, services list, competitor information, customer reviews, and the owner interview transcript (if available).

**Do NOT simulate tool calls. Do NOT write `<tool_call>` or `<tool_response>` blocks. Do NOT narrate research steps. Begin writing the ICP document immediately.**

The client context you've been given is your only source material. Synthesize what's there. Where information is absent, rate that section MEDIUM or LOW confidence and note what's missing.

---

## Output Instructions

Your entire response must be the ICP document — nothing else. No preamble, no narration, no gap check, no pre-flight section.

Wrap the entire document in these exact markers on their own lines:

```
---ICP_DOCUMENT_START---
[Full six-profile ICP document here]
---ICP_DOCUMENT_END---
```

---

## Document Structure

Write all six profiles in order. Every section number must be present. Use markdown headers exactly as shown.

### Header (before Profile 1)

```
# Client Context Profile: [Company Name]
Date: [Today's date]
Source Materials: [List what was available: interview transcript, website content, reviews, competitor data, etc.]
Interview Transcript: ✅ YES / ❌ NO — [brief note]
```

---

### PROFILE 1: BRAND VOICE

#### 1.1 — Voice Summary
Who is this person? What values drive how they speak? What makes their voice distinct from competitors?
Write 2–3 paragraphs grounded in evidence from the transcript or website copy.

#### 1.2 — Tone Spectrum
Rate each on a 1–10 scale with one sentence of justification:
- Formality (1=casual, 10=corporate)
- Energy (1=flat, 10=high energy)
- Boldness (1=hedged, 10=direct)
- Warmth (1=cold, 10=personal)
- Technical Depth (1=plain, 10=expert)

#### 1.3 — Sentence Structure
Describe the characteristic sentence patterns. Long or short? How does this person open a point? Do they build to conclusions or lead with them? Pull 2–3 direct examples from the transcript or website.

#### 1.4 — Vocabulary & Word Choice
- Vocabulary level
- Signature phrases (verbatim, with source)
- Never use (phrases that would feel wrong in this voice)
- Jargon approach (how they handle technical terms)

#### 1.5 — Speech Patterns (if transcript available)
Filler words, transition phrases, emphasis techniques, storytelling approach.
*If no transcript: mark as INFERRED from website copy.*

#### 1.6 — Punctuation & Formatting
Paragraph length, use of lists/bullets, headers, FAQ preference.

#### 1.7 — Signature Elements
Opening patterns, closing patterns, catchphrases, metaphor domains.

#### 1.8 — What [Owner/Brand] Would and Wouldn't Say
Two clear columns: things they'd say (with examples), things they'd never say (with examples).

#### 1.9 — Brand Voice in 3 Words
Three words only. Then: 3–5 specific, actionable Voice Rules derived from the evidence above.

---

### PROFILE 2: IDEAL CUSTOMER PROFILE

#### 2.1 — Primary ICP Name
One descriptive name for the primary customer type. Example: "The Urgent Homeowner" or "The Eco-Conscious Upgrader."

#### 2.2 — Demographics
Age range, household income, geography, home age/type, household situation. Sourced from reviews, transcript, or stated service areas.

#### 2.3 — Psychographics
How do they think? What's their relationship to this service category? What emotions drive their behavior?

#### 2.4 — Situation Before They Call (The Internal Monologue)
Write this in the customer's voice. What is happening in their life? What are they thinking right before they search for this service? Use language from actual reviews and forum content where available.

#### 2.5 — Private Browsing Patterns
How do they search? What exact terms do they use? Where do they look beyond Google?

#### 2.6 — Community & Social Behavior
Where do they gather? Nextdoor, Facebook groups, neighborhood forums? How do they make referrals?

#### 2.7 — Objections & Reframes
Table format: Objection | Reframe. Minimum 5 objections. Every objection must have a reframe — no orphaned problems.

#### 2.8 — Goals & Desires
What does success look like for them after hiring this company?

#### 2.9 — Secondary ICP (if applicable)
Name, demographics, and 3–4 sentences on what makes them different from the primary ICP.

#### 2.10 — Who Is NOT the Customer
Explicitly define who to deprioritize. Helps ad targeting and sales qualification.

---

### PROFILE 3: OFFER EXTRACTION

#### 3.1 — Core Offer
One paragraph: what this company actually sells, the primary mechanism, and who it's for.

#### 3.2 — Primary Services
Bulleted list of all services offered with one-line descriptions.

#### 3.3 — The Hook / Lead Offer
What's the primary entry point for new customers? (Free quote, emergency call, consultation, rebate consultation, etc.)

#### 3.4 — The Mechanism
HOW does this company deliver results differently? Not what they offer — how it works. This is the reason their outcome is believable.

#### 3.5 — Unique Differentiators
Minimum 5. Must be specific and ownable — not generic claims like "great customer service." Each one should be defensible with evidence.

#### 3.6 — Proof & Credentials
Licenses, certifications, years in business, review stats, brands served, awards, memberships.

#### 3.7 — Pricing & Economics
Pricing model, any rebate programs, financing offers, guarantees. Use `[UNKNOWN — request from client]` for anything not confirmed.

#### 3.8 — Copy Ammunition
Minimum 8 verbatim quotes. Format each as:
> "Exact quote here."
> — Source label, context

Never paraphrase. Every quote needs a source label (customer review, owner interview, website testimonial, etc.)

#### 3.9 — Objection Handlers
Table: Objection | Handler. Pull from the differentiators and guarantees. This is the sales-ready version of 2.7.

---

### PROFILE 4: MESSAGING & POSITIONING

#### 4.1 — Core Positioning Statement
One sentence: who this company is for, what they do, and what makes them different from all other options.

#### 4.2 — Category & Competitive Landscape
What category are they in? Who are they competing against? Where do they sit in the market (premium/value/local/enterprise)?

#### 4.3 — Competitor Analysis
For each competitor: name, size/reputation, primary weakness, what their reviews reveal about customer complaints. Minimum 2 competitors with real data.

#### 4.4 — Positioning Angles
Minimum 3 angles with 2–3 sentences each on how to position against specific competitor types.

#### 4.5 — Messages That Resonate
Table: Theme | Message. Minimum 5 themes. Each message should be usable as ad copy directly.

#### 4.6 — Messages to Avoid
Explicit list with brief reasoning. What would damage trust or attract the wrong customer?

---

### PROFILE 5: MARKETING CHANNELS

#### 5.1 — Paid Channel Priority
Table: Channel | Why It Fits This ICP | Target Audience Segment

#### 5.2 — Organic & Owned Channel Priority
Table: Channel | Why | Priority Level

#### 5.3 — Channel Strategy Notes
2–3 paragraphs on the most important channel insights — what matters most, what's being missed, and what the single highest-leverage move is.

---

### PROFILE 6: SALES PROCESS

#### 6.1 — Lead to Close Sequence
Numbered steps from first contact to job completion and follow-up.

#### 6.2 — Key Sales Principles
What does the owner or company believe about how sales should work? Minimum 4 principles directly from the evidence.

#### 6.3 — Close Triggers
Table: Trigger | Effect. What specific things cause a customer to say yes?

---

### ANALYSIS PASS

#### Data Confidence Table
| Section | Confidence | Source | Notes |
|---|---|---|---|
[Rate every section: HIGH / MEDIUM / LOW with one-sentence source justification]

#### Key Insights
3–5 bullet points of the most strategically important findings from this research. These should inform everything downstream.

#### Gaps to Fill
Numbered list of what's missing, what it would unlock, and how to get it. Be specific.

---

## Quality Rules

- No fabricated quotes — every quote in 3.8 has a source label
- No AI vocabulary — "world-class," "passionate," "unparalleled," "seamless," "transformative" are never used
- All voice rules in 1.9 are specific and actionable, not generic
- All objections in 2.7 and 3.9 have reframes (not just a list of problems)
- Internal Monologue (2.4) uses actual language from sources where available
- Marketing angles in 4.2 are ranked — most emotionally resonant first
- Channel recommendations in 5.1 explain why they fit this specific ICP

Do not truncate any section. Produce the complete document in one response.
