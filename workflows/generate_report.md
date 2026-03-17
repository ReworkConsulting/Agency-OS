# Generate Monthly Report Workflow

## Objective
Produce a clean, professional monthly performance report for a Rework client. The report summarizes campaign results, highlights wins, surfaces risks, and provides clear next-month recommendations. It is designed to be sent directly to the client.

## Prerequisites
- Client record must exist in the system (overview, services loaded)
- Ad performance data for the reporting period should be provided as input or available in the system

## Required Inputs
- `reporting_period` — The month and year being reported on (e.g. "March 2026")

## Optional Inputs
- `include_recommendations` — Whether to include a next-month recommendation section (default: true)

---

## Phase 0: Pre-Flight Check

Before starting, verify:
1. Client overview and services are loaded
2. Reporting period is valid and clearly specified

If no ad performance data is available in the system, include a placeholder section and note that metrics should be pasted in before sending to the client.

---

## Phase 1: Gather Context

From the client context loaded into this session:
- Confirm the client's primary service, service area, and marketing goals
- Note the client's target CPL (cost per lead) and revenue goal if available
- Review the most recent ICP document (if available) to frame wins and losses in terms of ICP alignment

---

## Phase 2: Build the Report

Produce the report in this exact structure:

---

### [Client Name] — Monthly Performance Report
**Period:** [Reporting Period]
**Prepared by:** Rework Consulting

---

### Executive Summary
3-5 sentences. What happened this month in plain English. Lead with the result the client cares most about (leads generated, cost per lead, appointments booked, revenue from ads).

Do not start with "This month we..." — lead with the outcome.

Example: "March delivered 47 qualified leads at an average CPL of $38 — 22% below your target of $49. HVAC installation campaigns outperformed heat pump campaigns by 2.1x on lead volume."

---

### Campaign Results

| Campaign | Spend | Impressions | Clicks | Leads | CPL | vs. Target |
|----------|-------|-------------|--------|-------|-----|------------|

If metrics are not available, use this placeholder row:
| [Campaign Name] | $X,XXX | — | — | — | $XX | Pending |

---

### What Worked
3-5 bullet points. Each one should:
- State a specific result (not a vague positive)
- Explain why it worked (hypothesis)
- Be actionable (what does this tell us to keep doing?)

Example:
- **Heat pump urgency ads outperformed awareness ads by 3.1x on CPL.** Pain-point framing ("Is your heat pump failing?") converted better than educational framing this month — lean into urgency in April.

---

### What Didn't Work
2-4 bullet points. Honest assessment of what underperformed and why.

Example:
- **Retargeting campaigns generated only 3 leads at $112 CPL.** Audience size is too small (< 500 people) to run efficient retargeting. We recommend pausing until the pixel pool grows.

---

### Audience & Creative Insights
- What ICP profiles were most responsive this month?
- Which ad formats (image, video, carousel) performed best?
- Any notable creative fatigue or audience overlap?

---

### Next Month Plan
Only include if `include_recommendations` is true.

3-5 specific recommendations. Each should be:
- Tied to a result from this month
- Concrete and executable (not vague)
- Assigned a priority: **High / Medium / Low**

Example:
- **[HIGH] Launch two new heat pump ad variations** — current ads have been running 6 weeks and CTR dropped 18%. Refresh with new hooks from ICP Profile 1 (eco-conscious angle).

---

### Notes & Open Items
List any outstanding action items, approvals needed, or follow-up questions for the client.

---

## Phase 3: Quality Check

Before delivering:
- [ ] All numbers are accurate and sourced — no estimates presented as actuals
- [ ] "What Worked" section leads with outcomes, not activity (not "we launched 3 campaigns")
- [ ] Recommendations are specific, not generic
- [ ] Tone matches the client's brand voice (reference ICP Profile 1 if available)
- [ ] No agency jargon the client won't understand
- [ ] Report can be sent directly to the client without edits

---

## Output Format
Save as a `workflow_output` of type `report`.

The report should be delivered as clean markdown. The team will copy it into a Google Doc or branded report template before sending to the client.
