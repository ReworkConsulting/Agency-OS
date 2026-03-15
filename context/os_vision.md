# Agency OS — Architecture Vision

## Purpose

Rework Consulting is building an internal AI-powered Agency Operating System (Agency OS).

This system is built inside Claude Code as the intelligence layer of the agency. The purpose of this system is to centralize the research, strategy, marketing production, and operational workflows used across all clients.

Inside this repository we define:
- Workflows
- Tools
- Research systems
- Client context
- Repeatable processes

These workflows are modular and reusable so they can support multiple clients without rewriting logic each time.

---

## Long-Term Goal: Custom Software Platform

The long-term goal is not just to run these workflows inside Claude Code.

The long-term goal is to convert this entire system into a **custom software platform** used by the Rework Consulting team.

This means the repository being built will eventually power a **web application or internal dashboard**.

The web application will allow the team to run workflows through a clean interface rather than interacting directly with Claude Code.

For example, the future interface may allow team members to click tools such as:
- Generate ICP
- Run SEO Audit
- Generate Facebook Ads
- Write Video Scripts
- Analyze Client Reviews
- Generate Brand Pack
- Produce Marketing Reports

When these tools are used, the interface will trigger the workflows that exist in this repository.

**The interface will not contain the intelligence itself. The intelligence lives here inside the system architecture.**

Claude should therefore always design workflows and tools so they could eventually be triggered by:
- A dashboard button
- An API request
- An automation
- An external application

The logic for how the agency operates should always live inside this repository. The interface will simply call the workflows that already exist.

---

## Client Context System

Each client will have a structured workspace containing their research and context.

Client workspaces may include:
- Website analysis
- Company overview
- Service information
- Google reviews
- Competitor analysis
- ICP profiles
- Brand voice documentation
- Marketing assets
- Strategy notes

Workflows must read this client context before producing outputs. This ensures all outputs are tailored to the specific client rather than producing generic responses.

When possible, workflows should automatically gather missing data such as:
- Website information
- Public reviews
- Competitor data
- Search results

---

## System Modules

The system will eventually contain several major modules that power different parts of the agency.

### Research Module
Builds a deep understanding of the client, their market, their customers, and their competitors.

### ICP Module
Generates detailed ideal customer profiles and messaging insights based on research data.

### SEO Module
Audits client websites, analyzes competitor SEO strategies, identifies keywords, and proposes content strategies.

### Copywriting Module
Generates marketing scripts, Facebook ads, headlines, landing pages, email campaigns, and other marketing copy.

### Creative Module
Produces ad concepts, creative briefs, and image generation prompts for marketing assets.

### Brand Module
Generates professional brand packs including color systems, typography, design rules, and visual direction.

### Reporting Module
Analyzes performance data and generates client-specific reports and insights.

### Operations Module
Helps manage internal agency operations including task tracking, reporting, and workflow monitoring.

---

## Claude's Role

Claude's role is to help design, maintain, and improve this Agency Operating System.

Claude should help:
- Structure workflows
- Design reusable tools
- Identify missing processes
- Improve system architecture
- Maintain clean documentation

Claude should prioritize structured workflows and real client data rather than generating generic responses.

Claude should also consider how every workflow could eventually be triggered by an external application.

The goal is to build a clean, modular backend system that powers the agency's future software platform.
