# ICP Research Document — Framework & Standards

## What This Document Is

The ICP Research Document is the single most important deliverable Rework produces for a client. It is a master intelligence file — not a simple customer avatar, not a list of demographics. It is a deep, research-backed profile of:

1. **Who the client is and how they speak** (Brand Voice)
2. **Who their ideal customer is and how they think** (ICP)
3. **What the client sells and why it works** (Offer Extraction)
4. **How to position and message to the market** (Messaging & Positioning)
5. **Where and how to reach them** (Marketing Channels & Content Strategy)
6. **How the client acquires and converts customers** (Sales Process)

Every downstream deliverable — ad copy, video scripts, email sequences, landing pages — is written using this document as the source. If this document is wrong, everything built from it is wrong.

**The standard:** No AI slop. No hallucinations. Every claim is traceable to a real source. Confidence is rated per section. Gaps are documented honestly.

---

## Source Materials Required

The quality of the output is directly proportional to the quality of the inputs. Before starting, collect as many of these as possible:

| Source | Priority | What It Gives You |
|---|---|---|
| Owner interview transcript ("Grill Them") | **Critical** | Brand voice, real vocabulary, personal story, mission, ideal client in their words |
| Client website (all pages) | **Critical** | Offer structure, positioning claims, existing copy, service details |
| Client's Google reviews (20+) | **Critical** | Real customer language, objections overcome, what they value most |
| Competitor Google reviews (20+ per competitor) | **High** | Market-level pains and desires, gaps in competitor positioning |
| Reddit threads (relevant subreddits) | **High** | Unfiltered ICP voice — what the customer says when no one is selling to them |
| Instagram / social content | **Medium** | Tone, visual brand, community language |
| YouTube channel | **Medium** | Long-form voice, educational approach, proof points |
| Facebook page posts & comments | **Medium** | Tone, community engagement, objections |
| Quora / forums | **Medium** | Research-mode questions the ICP asks before buying |

**Minimum viable:** Owner interview + website + client reviews. Below this threshold, flag all profiles as low confidence.

---

## When the Interview Transcript Is Missing

The "Grill Them" interview is the primary source for Profile 1 (Brand Voice). When it is not available, do not skip Profile 1 — build it from the digital footprint instead, and label every section accordingly.

**No-Transcript Research Protocol (Profile 1):**
1. Scrape the website's About page, team page, and any owner bio content
2. Scrape the client's Facebook business page for posts and captions (public)
3. Check for any YouTube or video content — transcribe titles, descriptions, and any visible scripts
4. Read every Google review response written by the owner — this is their actual voice
5. Check the client's Facebook personal profile (if public) for owner posts
6. Note any quotes attributed to the owner on the website or in press

**Labeling Rules (no transcript):**
- Add a banner at the top of Profile 1: `⚠️ INTERVIEW TRANSCRIPT NOT AVAILABLE — Profile 1 inferred from digital footprint`
- Rate every Profile 1 section MEDIUM or LOW confidence
- At the end of 1.9, add a "Missing Transcript Gap" block: list the 5–8 specific questions the interview would answer (e.g., "Why did you start this business?", "How do you describe a perfect job?", "What do you say when someone asks why they should hire you?")
- Profile 1 should be treated as a working draft until the transcript is collected

---

## Document Structure

Every ICP Research Document follows this exact structure. Section numbers are fixed — do not rename or reorder them.

---

### Header

```
Client Context Profile: {Client Business Name}
Date: {Date}
Source Materials: {List every source used, with volume — "18 Google reviews", "4 website pages", etc.}
Interview Transcript: {Yes — full "Grill Them" transcript / No — inferred from digital footprint}
```

---

### PROFILE 1: BRAND VOICE

The brand voice profile documents how the business owner (or the brand) actually speaks — not how an agency would write for them. This section is built primarily from the owner interview transcript. When the transcript is unavailable, see the No-Transcript Research Protocol above.

**1.1 — Voice Summary**
2–3 paragraph character sketch of the owner/brand. Capture their personality, energy, contradictions, and what drives them. Written in third person, observational. This is not a marketing blurb — it's a character profile.

**1.2 — Tone Spectrum**
Rate each dimension 1–10 with a 1-sentence justification and a direct quote:
- Formality (1 = casual / 10 = corporate)
- Energy (1 = low-key / 10 = high-intensity)
- Boldness (1 = hedging / 10 = direct)
- Warmth (1 = transactional / 10 = relationship-first)
- Technical Depth (1 = surface-level / 10 = expert-dense)

**1.3 — Sentence Structure**
Document their natural sentence rhythm: average length, fragment usage, emphasis techniques. Include 3–5 direct examples from the transcript or website showing the actual pattern. Note the shift between narrative mode and principle mode if one exists.

**1.4 — Vocabulary & Word Choice**
- Vocabulary level (e.g., "blue-collar direct with business fluency")
- Signature words and phrases (exact, from transcript or content — not invented)
- Words they NEVER use (anti-vocabulary — AI slop words to explicitly ban)
- Jargon approach (how do they handle technical terms?)

**1.5 — Speech Patterns**
- Filler words and connectives
- Transition phrases
- Emphasis techniques
- Storytelling approach (how do they structure a story?)

**1.6 — Punctuation & Formatting**
- Punctuation style
- Paragraph length habits
- Formatting tendencies (bold, bullets, etc.)
- Emoji usage (if relevant)

**1.7 — Signature Elements**
- Opening patterns (how do they start a message, video, or post?)
- Closing patterns
- Catchphrases (confirmed, verbatim — not inferred)
- Metaphor domains (what world do their analogies come from?)

**1.8 — Sample Voice Recreation**
Write 1–3 paragraphs in their voice on a topic relevant to their business. This is the test of whether the above sections work together. It should sound exactly like them — not like a polished agency version of them.

**1.9 — Voice Rules**
Numbered list of 10–15 specific, actionable rules for writing in this voice. Each rule is a directive, not a description. Example: "Use 'The North State' — not 'Northern California'." These rules are passed directly into copywriting prompts.

*If transcript was missing: append a "Missing Transcript Gap" block here — list 5–8 specific questions whose answers would sharpen these rules.*

---

### PROFILE 2: ICP (IDEAL CUSTOMER PROFILE)

The ICP profile documents who the client's ideal customer actually is — based on evidence, not assumption. Built from reviews, Reddit, social comments, and the owner interview.

**2.1 — Overview**
2–3 paragraph summary of who the customer is, including any distinct segments confirmed by the owner or supported by data. Note the primary segment and any secondary segments.

**2.2 — Demographics**
- Age range (core range and extended range)
- Gender split (estimated from reviews/content if not confirmed)
- Income level / household income bracket
- Occupation / role
- Location patterns (specific cities, regions, or area types)
- Life stage

Only include what is supported by evidence. Mark anything inferred as "estimated."

**2.3 — Psychographic Profile**
Three sections:

*Self-Perception vs. Reality*
How the customer sees themselves ("we're prepared, we handle things") vs. how they actually are (the gap they haven't addressed). This gap is usually where the sale lives.

*IFMG Breakdown*
- **Interests** — What they do, care about, consume
- **Fears** — Surface fears (will admit) and deep fears (won't say out loud)
- **Motivators** — What triggers action
- **Goals** — Stated goals and unstated identity goals

**2.4 — Internal Monologue Sample**
Write a 150–250 word first-person stream of consciousness as the ICP — their actual internal voice as they research the problem or consider buying. This is not marketing copy. It should feel like overhearing their thoughts.

**2.5 — Private Browsing Patterns**
15 specific search queries the ICP actually types. Ordered from awareness-level to decision-level. These come from: Reddit posts, review language, forum questions, and confirmed acquisition channels. Not invented.

**2.6 — Communities & Content Consumption**
Where does the ICP spend time online? Specific subreddits, YouTube channels, Facebook groups, news sources, apps, etc. Include what they're looking for in each community. Flag confirmed acquisition channels separately.

**2.7 — Emotional Objections & Barriers**
5–7 objections, each documented as:
- The objection (how the customer actually states or thinks it)
- What it really means (the underlying concern)
- The reframe (how to address it without being dismissive)

**2.8 — How They Rationalize Purchases**
5–7 specific statements the customer uses to justify the purchase to themselves or a spouse/partner. These come from review language and the owner's description of their best customers.

**2.9 — Transformation Vision**
Three sections:
- *Current Pain State* — Where they are before buying. Specific, emotional, situational. Not generic.
- *Desired Outcome* — Where they want to be after. The identity shift, not just the result.
- *The Bridge* — One sentence on how the client's offer connects the two states.

**2.10 — Marketing Communication Rules**
8–12 numbered directives for how to communicate to this ICP. These are passed directly into ad copy and content prompts. Format: numbered list, each rule is a directive.

---

### PROFILE 3: OFFER EXTRACTION

The offer extraction documents what the client sells, how it works, why it works, and all the raw material for writing about it credibly.

**3.1 — Offer Summary**
1 paragraph overview of the business, its flagship offer, and its market position. Written for a copywriter who knows nothing about this client.

**3.2 — Architecture**
- Category (what type of business/offer)
- Price (or price range if known)
- Duration (one-time, monthly, project-based)
- Delivery (how it actually gets done)
- Guarantee (what's promised)

**3.3 — What's Included**
Full breakdown of every component in the offer, organized by category. Include product names, specs, and technical details where available. Do not generalize — be specific.

**3.4 — The Mechanism**
What is the core insight or process that makes this offer work? This is the "reason why" — the specific mechanism that produces the result. This is not a benefit statement — it's the explanation of how and why it works. Includes any proprietary framework names.

**3.5 — Positioning**
- Primary promise (the headline-level transformation or outcome)
- Who it's for
- What it's against (the alternative, the old way, the competitor)
- USP (unique selling proposition — the one thing that differentiates it)
- CTA (the primary call to action in the funnel)

**3.6 — Credibility Stack**
All evidence that the offer and business are legitimate:
- Personal credentials (licenses, certifications, background)
- Client results (specific, named, with details)
- Media / endorsements / partnerships
- Social proof signals (review count, ratings, notable quotes)

**3.7 — Bonuses**
Any additional value included that enhances the main offer (free assessments, audits, warranties, follow-up commitments, etc.)

**3.8 — Copy Ammunition**
Numbered list of 10–20 direct verbatim quotes — from the owner transcript, reviews, and website. Each quote is labeled by source. These are used directly in ad copy, video scripts, and landing pages. The number and quality of quotes here determines copy quality downstream.

Format:
```
1. "Exact quote here" — Source (Owner transcript / Google review / Website)
```

**3.9 — Cross-Skill Usage Guide**
Instructions for each downstream use case — how to combine sections from this document when writing for specific formats. Minimum entries:

- For Facebook Ad Scripts: which sections to feed in, how to structure the output
- For Short-Form Video Scripts: which sections, structure notes
- For VSL Scripts: which sections, narrative arc
- For Emails: subject line angles, body structure, sequence logic
- For Landing Pages: above-fold copy, testimonial placement, FAQ structure

---

### PROFILE 4: MESSAGING & POSITIONING

This profile translates the ICP and Offer research into specific messaging frameworks. Everything here is directly copy-paste ready for ad briefs, creative direction, and campaign strategy.

**4.1 — Core Problem Reframe**
The market thinks their problem is X. The reframe is Y. Document:
- The surface-level problem the ICP thinks they have
- The real underlying problem (what's actually causing their frustration)
- The reframe: how to position the client's offer as the solution to the real problem
- What the ICP is really buying (the emotional outcome, not the service)

**4.2 — Top Marketing Angles**
8–12 marketing angles ranked by emotional resonance. Each angle is:
- A short headline or hook concept (not a finished ad — the core idea)
- 1 sentence on why it resonates (what fear/desire/trigger it hits)
- Which ICP segment it speaks to most (from 2.1)

**4.3 — Objections & Reframes Table**

| Objection | Root Emotion | Reframe |
|---|---|---|
| (how the customer states it) | (what's really driving it) | (how to address without dismissing) |

Document 5–8 objections. These map directly to 2.7 but formatted for use in ad copy and sales scripts.

**4.4 — Messaging Rules**
8–12 numbered directives for writing copy that converts for this specific market. These are rules about tone, framing, structure, and language — not just target audience. Examples: "Lead with the problem, not the solution." / "Use specific dollar amounts and timelines, never ranges." These are passed directly into ad copy briefs.

**4.5 — Trust-Building Proof Points**
Ranked list of the 6–10 most powerful credibility signals available to this client. For each:
- The proof point (specific, concrete)
- Where to use it (headline / body copy / ad creative / landing page)

**4.6 — Offer-Specific Copy Angles**
For each major offer or service, provide 3–5 specific copy angles. These are not the same as marketing angles — they're offer-level positioning lines. Examples: "For the [specific service]: [copy angle]." Format them as ready-to-use headline concepts.

---

### PROFILE 5: MARKETING CHANNELS & CONTENT STRATEGY

This profile documents where to reach the ICP and what content strategy to run. Built from 2.5 (browsing patterns), 2.6 (communities), the client's current marketing context, and industry knowledge.

**5.1 — Primary Channels**
Ranked list of channels by expected effectiveness for this client and ICP. For each channel:
- Why it fits this ICP (specific behavioral reason, not generic)
- Current status (active / not running / unknown)
- Priority level (launch first / add later / test)

Minimum channels to evaluate: Facebook Ads, Google LSA, Google Search Ads, YouTube, Instagram, TikTok, Nextdoor, direct mail.

**5.2 — Content Pillars**
5–7 content themes that will resonate with this ICP. For each pillar:
- Theme name
- Why this ICP cares about it
- 3 example content ideas (post, reel, video concepts)

**5.3 — Sample Content Calendar**
One month of content mapped to the content pillars. Format as a table: Month / Theme / Content Type / Platform. This is a starting framework — not a final deliverable.

---

### PROFILE 6: CUSTOMER ACQUISITION & SALES PROCESS

This profile documents how the client currently acquires and converts customers — and what the data implies about optimization. Built from the owner interview, website, and offer structure.

**6.1 — Lead Qualification Tiers**
Document 2–3 lead tiers based on fit:
- High-Value Lead: profile, estimated close rate, average deal size, sales cycle
- Medium-Value Lead: profile, estimated close rate, deal size, cycle
- Low-Probability Lead: who to deprioritize and why

**6.2 — Sales Conversation Framework**
The phases of a typical sales conversation. For each phase:
- Phase name
- What happens (specific questions asked, information shared)
- Approximate duration
- Goal of this phase

**6.3 — Typical Sales Timeline**
Table showing the customer journey from lead submission to conversion. Day-by-day or step-by-step. Include: lead source → first contact → proposal → decision → delivery.

---

### ANALYSIS PASS: GAPS & FLAGS

The final section of every document. This is quality control — it tells the reader what to trust and what to verify.

**Source Material Assessment**
- Volume: Was there enough raw material per section?
- Diversity: Were multiple source types used?
- Recency: How current is the material?

**Section-by-Section Confidence Ratings**
Rate every section across all 6 profiles: HIGH / MEDIUM / LOW. One sentence justification per rating.

**Thin Spots**
List specific missing information that would meaningfully improve the document. Include what's needed and how to get it.

**Contradictions or Inconsistencies**
Flag any places where sources disagreed or where the document contains something that needs verification.

**Recommended Next Steps**
3–5 specific actions to fill gaps, improve confidence, or unlock better copy angles.

---

## Quality Standards

1. **No fabricated quotes.** Every quote must be traceable to a real source. If a quote can't be sourced, it doesn't go in.
2. **Confidence is labeled honestly.** A MEDIUM-confidence section is better than a HIGH-confidence section that was inflated.
3. **Anti-AI vocabulary is enforced.** Each brand gets its own never-use list (1.4). Words like "innovative," "cutting-edge," "revolutionize," "harness," "empower," "unlock," "leverage," "tapestry" are banned by default unless the owner genuinely uses them.
4. **Specificity over generality.** "400–450°F seal point, approximately one hour of protection" is better than "the product withstands extreme heat."
5. **Gaps documented, not hidden.** Thin source material produces a thin document. That's fine — it's honest. Hide the gap and you produce a confident-sounding document that leads to bad ads.
6. **No transcript = flag it.** If Profile 1 was built without an interview, every section in Profile 1 must show its confidence level inline. Do not present inferred voice as confirmed voice.

---

## How This Document Is Used

This document is uploaded as context whenever the AI OS produces anything for this client:

- **Ad copy:** Feed 1.8 + 1.9 + 2.4 + 3.8 + 4.2 angles + relevant 2.10 and 4.4 rules
- **Video scripts:** Feed 1.3 + 1.7 + 1.9 + 3.4 + 3.8 quotes + 4.2 angles
- **VSL scripts:** Feed full Profile 1 + Profile 2 + Profile 3 + 4.3 objections
- **Emails:** Feed 2.5 + 2.7 + 1.9 + 3.8 quotes + 4.6 angles
- **Landing pages:** Feed 3.1–3.5 + 4.5 proof points + 2.7 objections + 3.8 quotes
- **Campaign strategy:** Feed Profile 4 + Profile 5 + 6.1 lead tiers
- **Sales scripts:** Feed Profile 6 + 2.7 objections + 4.3 reframes + 3.8 quotes

The Cross-Skill Usage Guide in 3.9 specifies exactly which sections to feed into which outputs for each client.
