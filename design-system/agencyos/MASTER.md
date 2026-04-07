# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** AgencyOS
**Generated:** 2026-04-06 18:21:27
**Category:** Micro SaaS

---

## Global Rules

### Color Palette

> The platform uses a **zinc monochrome** palette with CSS custom properties for light/dark mode. Do NOT introduce new brand colors — work within this system.

| Role | Light Mode | Dark Mode | CSS Variable (platform) |
|------|-----------|-----------|------------------------|
| Background | `#fafafa` | `#0a0a0a` | `--bg` |
| Card/Surface | `#ffffff` | `#111111` | `--bg-card` |
| Hover surface | `#f4f4f5` | `#1a1a1a` | `--bg-hover` |
| Subtle surface | `#f4f4f5` | `#171717` | `--bg-subtle` |
| Text primary | `#09090b` | `#fafafa` | `--text-1` |
| Text secondary | `#52525b` | `#a1a1aa` | `--text-2` |
| Text tertiary | `#71717a` | `#71717a` | `--text-3` |
| Text quaternary | `#a1a1aa` | `#52525b` | `--text-4` |
| Border | `#e4e4e7` | `rgba(255,255,255,0.08)` | `--border` |
| Accent (primary action) | `#09090b` | `#ffffff` | `--accent` |
| Accent foreground | `#ffffff` | `#09090b` | `--accent-fg` |

**Color Notes:** Zinc monochrome. Always reference platform CSS variables — never hardcode hex in components. shadcn/ui tokens (`--background`, `--foreground`, `--primary`) are mapped to match these values in `globals.css`.

### Typography

- **Current Font:** Geist (loaded via `next/font/google` in `layout.tsx`) — keep as-is
- **Mood:** Clean, modern, technical, professional — identical to Vercel's design language
- **Type scale:** 11px (meta), 12px (labels), 13px (body), 14px (body-lg), 16px (subheading), 18px (heading-sm), 20px (heading), 24px (heading-lg)
- **Weights:** 400 (body), 500 (medium/labels), 600 (semibold/headings), 700+ (reserved for hero/marketing)
- **Future consideration:** Fira Code / Fira Sans is a strong alternative for a more data-dashboard personality — evaluate when redesigning the platform header

**Font rule:** Never use Inter, Arial, or system-ui — Geist only for body/UI. Monospace elements (code, KPI numbers) can use `font-mono` (Geist Mono).

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button — use shadcn/ui Button variant="default" */
/* background: var(--accent), color: var(--accent-fg), radius: 6px, font-weight: 500 */

/* Secondary Button — use shadcn/ui Button variant="outline" */
/* background: transparent, border: 1px solid var(--border), color: var(--text-1) */

/* Ghost Button — use shadcn/ui Button variant="ghost" */
/* background: transparent on rest, var(--bg-hover) on hover */

/* Destructive — use shadcn/ui Button variant="destructive" */
/* Always visually separated from primary actions (spacing or color) */

/* All buttons: transition 150ms ease, cursor-pointer, min-height 32px (compact) or 36px (default) */
```

### Cards

```css
/* Card — background: var(--bg-card), border: 1px solid var(--border), radius: 8px, padding: 16px */
/* Hover: background shifts to var(--bg-hover), transition 150ms ease */
/* Never use box-shadow on cards in dark mode — use border instead for depth */
/* Interactive cards only: add cursor-pointer and subtle hover lift (translateY -1px max) */
```

### Inputs

```css
/* Input — use shadcn/ui Input component */
/* border: 1px solid var(--border), radius: 6px, height: 32px (compact) or 36px */
/* focus: border-color var(--accent), ring: 1.5px solid var(--accent) with 2px offset */
/* placeholder: var(--text-4), text: var(--text-1), background: var(--bg) */
```

### Modals

```css
/* Modal/Dialog — use shadcn/ui Dialog or Sheet component */
/* overlay: rgba(0,0,0,0.5) with backdrop-filter: blur(4px) */
/* content: background var(--bg-card), border: 1px solid var(--border), radius: 10px */
/* max-width: 480px (standard), 640px (large), 100% on mobile */
/* Sheet (side panel): width 420px, slides in from right */
/* Always: focus trap, escape to close, aria-modal="true" */
```

---

## Style Guidelines

**Style:** Flat Design

**Keywords:** 2D, minimalist, bold colors, no shadows, clean lines, simple shapes, typography-focused, modern, icon-heavy

**Best For:** Web apps, mobile apps, cross-platform, startup MVPs, user-friendly, SaaS, dashboards, corporate

**Key Effects:** No gradients/shadows, simple hover (color/opacity shift), fast loading, clean transitions (150-200ms ease), minimal icons

### Page Pattern

**Pattern Name:** Minimal & Direct + Demo

- **CTA Placement:** Above fold
- **Section Order:** Hero > Features > CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Complex onboarding flow
- ❌ Cluttered layout

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
