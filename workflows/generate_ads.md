# Facebook Ad Generator — Workflow

## Objective

Generate a complete set of high-converting Facebook ad variations for a home service client. Each ad variation includes a hook, primary text, headline, CTA, and a detailed image generation prompt suitable for FAL AI (Flux model).

## Required Inputs

- `target_service`: The specific service being promoted (e.g. "HVAC Installation", "Roof Replacement")
- `campaign_objective`: Lead Generation | Awareness | Retargeting
- `angle`: The creative angle/ICP profile to target (provided by user from ICP suggestions)
- `ad_format`: The named ad template to use — one of: Headline Statement | Offer/Promotion | Testimonial Card | Before & After | Pain Point Hook | Social Proof/Stats | Us vs. Them | Feature Bullets | Lifestyle/Aspiration | Urgency/Seasonal
- `ad_size`: square (1080×1080) | portrait (1080×1350) | story (1080×1920)
- `ad_count`: Number of ad variations to produce (3, 5, or 10)
- `messaging_focus` (optional): Specific benefit, hook, or talking point to emphasize
- `reference_image_url` (optional): URL of a reference image. If provided, use it as visual inspiration for IMAGE_PROMPT composition — match its aesthetic, color temperature, layout style, and mood. Do not copy it literally or reference competitor brands.

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

## Output Format

Produce exactly `ad_count` ad variations. Each variation must follow this EXACT format with no deviations — the system parser depends on these delimiters:

```
---AD_START---
HOOK: [The hook — 1-2 punchy sentences, written as it would appear on the ad or be spoken. Under 125 characters ideally.]
PRIMARY_TEXT: [The primary text body — 2-4 sentences. Opens with a pain point or desire, introduces the solution, adds social proof or urgency. Conversational, no jargon.]
HEADLINE: [Short headline — 3-7 words. Direct and benefit-led.]
CTA: [Call to action — 3-6 words. e.g. "Get a Free Quote", "Book Your Inspection", "See How Much You Save"]
IMAGE_PROMPT: [Detailed image generation prompt for FAL AI Flux model. Include: subject/scene, visual style, lighting, color palette, composition, mood. Must match the ad_format's composition rules below. Do NOT include text or logos in the prompt. Be specific enough that the image supports the hook and angle without referencing competitor brands or real people.]
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
- "Your [system] is working 40% harder than it should — and you're paying for every wasted hour."
- "Most [city] homeowners don't realize their [service] is costing them $X more per month than it should."

**Awareness:** Curiosity or education-led. Stop the scroll with a surprising fact or insight.
- "Here's what separates a $3,000 [service] job from a $12,000 regret."
- "3 things every [city] homeowner should know before next [season]."

**Retargeting:** Social proof or scarcity. Remind them why they were interested.
- "Still thinking about it? [X] [city] homeowners chose [Company] this month."
- "We only take [X] new clients per month — [Y] slots are already gone."

---

## Image Composition Rules by Ad Format

The `ad_format` input determines the visual approach for every IMAGE_PROMPT you write. Follow these rules precisely.

**Headline Statement:** Bold, typography-forward composition. Strong color block background (navy, charcoal, or brand color). Minimal scene — subject is small or abstract. Copy-dominant aesthetic. High contrast. Think direct-response print ad. No clutter.

**Offer/Promotion:** Price or deal element visually prominent — large number or callout shape (badge, burst, ribbon). Clean white space. Service imagery softened in background. Crisp, retail-inspired. Even lighting. Professional.

**Testimonial Card:** Portrait-orientation friendly. Warm, slightly lo-fi aesthetic for authenticity. Happy homeowner or family in their home environment. Soft natural light. Credible and approachable. Review stars implied by composition warmth.

**Before & After:** Split composition (left = problem, right = solution) OR dramatic single transformation shot. Left side: worn, damaged, dirty, struggling. Right side: new, clean, modern, gleaming. Extreme contrast between panels. Bold dividing line.

**Pain Point Hook:** Visceral problem visualization. Damaged roof in a storm. Dripping sweat from a broken AC. Overflowing gutters. High-contrast, slightly dramatic. The viewer should feel the problem. Not alarming — relatable.

**Social Proof/Stats:** Clean, professional. Large number or data point as visual anchor. Graph, radial, or bold typographic number overlay on a neutral background. Service team or finished job in background. Conveys scale and credibility.

**Us vs. Them:** Vertical split composition. Left panel: muted gray tones, generic/tired imagery representing "the competition." Right panel: vibrant brand colors, sharp professional imagery representing the client. Clear winner composition.

**Feature Bullets:** Product or service hero shot as center subject. Clean background. Implied space at left or bottom for 3-5 checklist items. Arrows or callout lines pointing to key features. Clean, instructional, benefit-focused.

**Lifestyle/Aspiration:** Warm golden-hour light. Family comfort scene — relaxing in a cool home, gathering around a fireplace, watching a storm from a dry living room. Emotionally resonant. Aspirational but attainable. Natural, candid feel.

**Urgency/Seasonal:** Strong seasonal context — summer sun beating down on a house, winter storm outside warm windows, fall leaves clogging a gutter. Time-pressure visual mood. Slightly dramatic weather. Vivid seasonal color palette.

---

## Ad Size Composition Notes

**Square (1080×1080):** Balanced composition. Subject centered or rule-of-thirds. Works for feed ads.

**Portrait (1080×1350):** Vertical emphasis. More visual real estate. Hero image top, implied text space bottom. Works for feed + stories.

**Story (1080×1920):** Full vertical immersion. Bold visual that fills the frame. Top and bottom thirds may have text overlay space — keep the center clear and striking.

---

## Quality Rules

- Every hook must be specific to this client and service — no generic copy
- Use the client's actual service area, company name, or differentiators where relevant
- Primary text should feel like it was written by someone who understands this customer, not marketing copy
- Image prompts must be detailed enough to generate a compelling, relevant image (minimum 50 words)
- Do NOT write image prompts that include text, logos, or specific people
- Each of the `ad_count` variations must target a meaningfully different emotional trigger or proof mechanism — no near-duplicates
- Campaign notes must be substantive and specific, not generic observations
