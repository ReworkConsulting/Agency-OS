# Facebook Ad Generator — Workflow

## Objective

Generate a complete set of high-converting Facebook ad variations for a home service client. Each ad variation includes a hook, primary text, headline, CTA, and a structured image generation prompt optimized for FAL AI (Flux Dev model).

## Required Inputs

- `target_service`: The specific service being promoted (e.g. "HVAC Installation", "Roof Replacement")
- `campaign_objective`: Lead Generation | Awareness | Retargeting
- `angle`: The creative angle/ICP profile to target (provided by user from ICP suggestions)
- `ad_format`: The named ad template to use — one of: Headline Statement | Offer/Promotion | Testimonial Card | Before & After | Pain Point Hook | Social Proof/Stats | Us vs. Them | Feature Bullets | Lifestyle/Aspiration | Urgency/Seasonal
- `ad_size`: square (1080×1080) | portrait (1080×1350) | story (1080×1920)
- `ad_count`: Number of ad variations to produce (3, 5, or 10)
- `messaging_focus` (optional): Specific benefit, hook, or talking point to emphasize
- `reference_image_url` (optional): URL of a reference image. The image generator will condition output on this reference — write IMAGE_PROMPT to describe the type of visual you want, knowing it will be blended with the reference image's style, colors, and composition.

## Context Available

You will receive the client's full context including:
- Company overview (name, location, services, pricing, value props)
- Service details and differentiators
- ICP profiles (ideal customer personas, pain points, desires, language)

Read this context carefully. All ad copy must be:
- Specific to this client (use their name, service area, and differentiators)
- Written in the language their ideal customers actually use
- Grounded in the pain points and desires from the ICP document

---

## Step 0 — Voice Calibration (do this before writing any copy)

Before writing any ad copy, scan the ICP document and extract the 5 most specific pain phrases and 5 most specific desire phrases in the customer's exact words — not paraphrased, not summarized.

Output these as a block before your first ad:

```
VOICE CALIBRATION
PAIN PHRASES: [exact verbatim phrases from ICP — e.g. "my unit just can't keep up anymore", "dreading the next electric bill"]
DESIRE PHRASES: [exact verbatim phrases from ICP — e.g. "just want it done right the first time", "don't want to deal with this again"]
```

These phrases are your raw material. Weave them directly into hooks, primary text, and headlines wherever they fit naturally. Paraphrasing ICP language is the #1 killer of ad specificity — the exact words are more powerful than any rewrite.

---

## Output Format

Produce exactly `ad_count` ad variations. Each variation must follow this EXACT format with no deviations — the system parser depends on these delimiters:

```
---AD_START---
HOOK: [1-2 punchy sentences. Conversational and direct. Under 100 characters. Must name a specific pain, outcome, or insight — never a generic product description. If you removed the client's name, it should feel wrong because it's so specific.]
PRIMARY_TEXT: [2-4 sentences. Opens with pain point or desire, introduces the solution, adds social proof or urgency. Conversational, no jargon. Feel like it came from someone who knows this customer.]
HEADLINE: [2-5 words MAX. Creative and memorable — tagline energy, not feature label. Think "Finally. Cool Air." or "Stop Paying More." or "The Last Roofer You'll Call." It should be worth remembering.]
CTA: [3-6 words. Action-driven. e.g. "Get a Free Quote", "Book Your Inspection", "See How Much You Save"]
IMAGE_PROMPT: [photographic style], [scene and subject], [lighting: type, direction, quality], [camera: angle and depth of field], [color palette], [mood and atmosphere], photorealistic, sharp focus, professional advertising photography, no text, no logos
---AD_END---
```

Repeat this block exactly `ad_count` times with no additional text between blocks.

After all ad blocks, add a section:

```
---CAMPAIGN_NOTES---
[2-3 sentences on the strategic rationale: which ICP pain points you targeted, why you chose these hooks, and how the image prompts reinforce the message.]
---CAMPAIGN_NOTES_END---
```

---

## Hook Guidelines

Write hooks that match the campaign objective:

**Lead Generation:** Problem-agitation or result-first. Make the pain vivid or the outcome desirable. Create urgency.
- "Your [system] is costing you $X a month more than it should — and it's only getting worse."
- "Most [city] homeowners don't realize their [service] is past its breaking point."

**Awareness:** Curiosity or education-led. Stop the scroll with a surprising fact or insight.
- "Here's what separates a $3,000 [service] job from a $12,000 regret."
- "3 things every [city] homeowner should know before next [season]."

**Retargeting:** Social proof or scarcity. Remind them why they were interested.
- "Still thinking about it? [X] [city] homeowners chose [Company] this month."
- "We only take [X] new clients per month — [Y] slots are already gone."

**Punch Test:** Before finalizing a hook, ask: Is this conversational enough to say out loud? Is it specific enough that it would feel wrong with a different company name? If either answer is no, rewrite it.

---

## Headline Guidelines

Headlines are 2-5 words and must be worth remembering.

**Good examples:**
- "Finally. Cool Air." — specific outcome
- "Stop Guessing, Start Saving" — addresses pain directly
- "The Last Roofer You'll Call" — confidence + commitment
- "Your Neighbor Chose Us" — social proof in 4 words
- "Hot Outside. Not Inside." — clever contrast
- "Before the Next Storm" — urgency without panic

**Bad examples (do not write these):**
- "Get Your Free Quote Today" — generic filler
- "Professional HVAC Services" — not a headline, it's a label
- "Call Us Now for a Free Estimate" — too long, zero personality
- "Quality You Can Trust" — means nothing

**Test:** Would you remember this headline 10 minutes from now? If not, rewrite it.

---

## IMAGE_PROMPT Guidelines

The IMAGE_PROMPT generates a background photo that your headline and CTA overlay on top of. Write it to create a scene that emotionally supports the copy — not just a generic service photo.

Format: `[photographic style], [scene/subject], [lighting], [camera angle], [color palette], [mood], photorealistic, sharp focus, professional advertising photography, no text, no logos`

**The photo must reinforce the specific pain point or desire in the copy.** If the hook is about heat, show heat. If it's about a storm, show weather tension.

**Style options (match to ad_format):**
- `commercial advertising photography` — clean, product/service focused
- `professional lifestyle photography` — real people in real environments
- `editorial home services photography` — on-site work, authentic
- `dramatic before and after photography` — high contrast transformation

**Strong IMAGE_PROMPT example:**
`commercial advertising photography, HVAC technician confidently completing a rooftop installation on a clean suburban home, golden hour side lighting with warm soft shadows, wide angle with shallow foreground depth of field, warm amber and sky blue palette, confident professional mood, photorealistic, sharp focus, professional advertising photography, no text, no logos`

**Every IMAGE_PROMPT must include:** photographic style · specific scene · lighting · camera angle · color palette · mood · quality tags

---

## Banned Phrases

Never use these in any copy element — they are generic, AI-sounding, and kill conversion:

- "peace of mind" / "quality you can trust" / "professional service"
- "hassle-free" / "seamless experience" / "stress-free"
- "your comfort is our priority" / "we're here to help"
- "reliable, responsive, results-driven" (or any alliterative filler)
- "don't wait" / "limited time" / "act now" (without a specific number or deadline)
- "serving [city] for X years" used as a standalone value prop
- Any primary text that opens with a company description or product intro instead of pain or desire

If any of these appear in your draft, the copy fails. Rewrite before outputting.

---

## Quality Rules

- Every hook must contain at least one specificity anchor: a number, a named pain scenario, or exact language from your Voice Calibration extraction. Generic emotional appeals without anchors are not acceptable.
- Every hook must pass the competitor swap test: if you replaced the client's name with a competitor's name and the hook still makes sense, rewrite it until it doesn't.
- Headlines are 2-5 words. No exceptions. Make them worth remembering.
- Primary text must open with the customer's own words or an immediate pain/desire scenario — never open with a product description, company name, or generic setup line.
- Voice check: Every piece of copy must sound like a satisfied customer talking to their neighbor — not a marketer writing a campaign. If it sounds polished, it probably sounds generic.
- IMAGE_PROMPT must follow the structured comma-separated format. Must end with: `photorealistic, sharp focus, professional advertising photography, no text, no logos`
- IMAGE_PROMPT must describe a scene that visually reinforces the specific emotion in the hook — not a generic service stock photo
- Each of the `ad_count` variations must target a meaningfully different emotional trigger or proof mechanism — no near-duplicates
- Campaign notes must be specific: which ICP pain points, why these hooks, how the images reinforce the message
