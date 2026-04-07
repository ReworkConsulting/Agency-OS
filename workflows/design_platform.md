# Workflow: Design Platform UI

## Objective

Define when and how to use the design stack when building or improving the Agency OS platform UI. This produces consistent, professional, accessible interfaces that match the platform's design constitution.

**This workflow applies ONLY to platform UI work.**

---

## When to Use This Workflow

**TRIGGER if the task involves:**
- Building a new platform page or route
- Redesigning or improving an existing platform component
- Adding new UI features to the platform (new page, new modal, new form, new list)
- Creating client-facing design outputs inside the platform

**DO NOT use for:**
- Client research or onboarding
- ICP generation
- Ad copy or image generation
- Video script generation
- SEO audits
- Monthly reports
- Any workflow that produces client deliverables (not platform UI)

---

## Pre-Flight Checklist

Before building or redesigning anything:
- [ ] Confirm the task is platform UI (not a client deliverable)
- [ ] Read `design-system/agencyos/MASTER.md` — understand the color palette, typography, animation specs, and anti-patterns
- [ ] Identify the component type: form, list/table, card, modal/dialog, page layout, data display
- [ ] Identify if a shadcn/ui component exists for this pattern (check `platform/src/components/ui/`)

---

## Step-by-Step Execution

### Step 1 — Load the Design Constitution
Read `design-system/agencyos/MASTER.md`. Extract:
- Color tokens to use (always CSS variables, never hardcoded hex)
- Animation timing (150–200ms ease for interactions, 0.18s for page transitions)
- Anti-patterns to avoid (no cluttered layouts, no complex onboarding, no emojis as icons)

If a page-specific override exists at `design-system/agencyos/pages/[page-name].md`, prioritize those rules.

### Step 2 — Run ui-ux-pro-max Search
Run the design intelligence search for the component type you're building:

```bash
# Examples:
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "data table SaaS dashboard" --domain ux
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "form validation internal tool" --domain ux
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "modal dialog" --domain ux
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --stack nextjs
```

Review the output for: accessibility requirements, interaction patterns, and anti-patterns specific to this component type.

### Step 3 — Choose the Right Component Base

Use this decision tree:

| Component needed | Use |
|---|---|
| Button (primary, secondary, ghost, destructive) | `shadcn/ui Button` — `@/components/ui/button` |
| Text input, textarea | `shadcn/ui Input`, `Textarea` |
| Select / dropdown | `shadcn/ui Select` or `DropdownMenu` |
| Modal / confirmation dialog | `shadcn/ui Dialog` |
| Side panel (settings, detail view) | `shadcn/ui Sheet` |
| Toast notification | `shadcn/ui Sonner` |
| Badge / status pill | `shadcn/ui Badge` |
| Data table | `shadcn/ui Table` |
| Tab navigation | `shadcn/ui Tabs` |
| Search / command palette | `shadcn/ui Command` |
| Loading placeholder | `shadcn/ui Skeleton` |
| User avatar | `shadcn/ui Avatar` |
| Hover tooltip | `shadcn/ui Tooltip` |
| Sidebar / top navigation | Hand-rolled (don't replace — Sidebar.tsx and TopBar.tsx are stable) |
| Page layout, section headers | Hand-rolled with platform CSS variables |
| Data cards, stat blocks | Hand-rolled using `--bg-card`, `--border`, `--text-1` tokens |
| One-off creative / marketing | Use `frontend-design` skill instead |

**Rule:** Always use shadcn/ui when a matching component exists. Only hand-roll if the pattern isn't covered.

### Step 4 — Apply Platform CSS Variables

Never hardcode colors or use Tailwind color classes (e.g. `text-zinc-900`). Always use platform tokens:

```tsx
// Correct:
style={{ background: 'var(--bg-card)', color: 'var(--text-1)', borderColor: 'var(--border)' }}
className="text-[var(--text-2)]"

// Incorrect:
className="text-zinc-900 bg-white"
style={{ background: '#ffffff' }}
```

Key tokens:
- `--bg` / `--bg-card` / `--bg-hover` / `--bg-subtle` — backgrounds
- `--text-1` (primary) / `--text-2` (secondary) / `--text-3` (muted) / `--text-4` (faint)
- `--border` / `--border-dim` — borders
- `--accent` / `--accent-fg` — primary action color pair

### Step 5 — Add Animation with Framer Motion

Page-level transitions are handled automatically by `PageTransitionWrapper` in `layout.tsx`. Do NOT add `animate-fade-in` to page wrappers.

For component-level animations:

```tsx
import { motion } from 'framer-motion'

// Card hover lift
<motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>

// Staggered list
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0, transition: { duration: 0.15 } } }

// Button press
<motion.button whileTap={{ scale: 0.97 }} transition={{ duration: 0.08 }}>
```

Animation rules (from MASTER.md):
- Interactions: 150–200ms ease
- Avoid animating width/height — use opacity + transform only
- Respect `prefers-reduced-motion`
- Never animate persistent nav (sidebar, topbar)

### Step 6 — Creative Direction (When Needed)

For new page designs where you need strong visual direction (dashboard redesigns, new major features), use the `frontend-design` skill after the design system parameters are set:

1. First establish: which shadcn components, which CSS variables, what animation timing
2. Then use `frontend-design` to execute with maximum creative quality within those constraints

`frontend-design` excels at: layout composition, spacing rhythm, type hierarchy, visual polish. It should operate within the design system defined in Steps 1–4, not replace it.

### Step 7 — Pre-Delivery Validation

Before shipping any UI code, verify this checklist (from MASTER.md):

- [ ] No emojis used as icons — use SVG (Heroicons, Lucide, or inline)
- [ ] All icons from a consistent icon set (same stroke width throughout a component)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states use smooth transitions (150–200ms)
- [ ] Text contrast meets 4.5:1 minimum in both light and dark modes
- [ ] Focus states are visible (ring via `*:focus-visible` is set globally — don't suppress it)
- [ ] No layout-shifting hover effects (avoid scale on containers with sibling layout impact)
- [ ] `prefers-reduced-motion` respected — wrap animations in a conditional or use CSS
- [ ] Responsive at 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)

---

## Design Stack Reference

| Tool | When to Reach For It |
|---|---|
| `design-system/agencyos/MASTER.md` | Every task — read it first |
| `ui-ux-pro-max` skill | Searching for UX patterns, component specs, anti-patterns |
| `shadcn/ui` (`platform/src/components/ui/`) | Any standard interactive component |
| `framer-motion` | Page transitions (automatic via PageTransitionWrapper) + component micro-interactions |
| `frontend-design` skill | Creative direction, layout composition, visual polish on new major pages |

---

## Component Migration Priority

When editing existing components, evaluate whether to migrate:

**High priority (migrate when touched):**
- Custom modals → `shadcn/ui Dialog`
- Custom side panels → `shadcn/ui Sheet`
- Custom form inputs → `shadcn/ui Input`
- Custom toast notifications → `shadcn/ui Sonner`

**Low priority (leave alone unless redesigning):**
- `Sidebar.tsx` — complex, well-tested, leave it
- `TopBar.tsx` — stable, leave it
- `ClientNav.tsx` — stable, leave it

---

## Do Not Use This Workflow For

If the request is about generating client deliverables (ads, ICPs, scripts, SEO, reports), route to the appropriate client workflow instead. Design intelligence tools add no value to content generation tasks and add unnecessary steps.
