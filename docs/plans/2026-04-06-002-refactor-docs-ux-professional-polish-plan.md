---
title: "refactor: Professional visual polish for docs UX"
type: refactor
status: completed
date: 2026-04-06
---

# refactor: Professional visual polish for docs UX

## Overview

Elevate the visual quality and professionalism of the Andamio docs site through targeted styling improvements. No content changes — only CSS, layout configuration, typography, spacing, and component visual polish.

## Problem Frame

The docs site uses Fumadocs with a custom color scheme but relies heavily on framework defaults and hardcoded Tailwind utilities. The result feels functional but generic. Specific issues: diagram nodes ignore the design token system and break in dark mode, heading colors override globally (affecting Fumadocs internals), the home route is a bare redirect with no brand presence, and console.log statements remain in production components.

## Requirements Trace

- R1. No content changes — only styling, layout, typography, spacing, and visual polish
- R2. Both light and dark modes must look polished and consistent
- R3. Diagram components must use the design token system, not hardcoded color utilities
- R4. The site should feel like a professional product documentation site, not a default template

## Scope Boundaries

- No MDX content changes
- No new pages or routes (except replacing the home redirect with a proper landing)
- No changes to content-collections, data fetching, or API routes
- No dependency additions beyond what's already installed (Inter font variants, etc.)
- Diagram *data/logic* unchanged — only visual presentation

## Context & Research

### Relevant Code and Patterns

- `app/global.css` — All design tokens defined via oklch CSS custom properties, Fumadocs overrides via `--color-fd-*`
- `app/layout.config.tsx` — Nav config with logo and 3 links, no sidebar tabs or footer config
- `app/docs/layout.tsx` — DocsLayout with bare `baseOptions` spread, no sidebar customization
- `app/docs/[[...slug]]/page.tsx` — Docs page with inline badge styling, conditional diagram rendering
- `components/react-flow/transactions/nodes/` — 5 node types all using hardcoded `bg-{color}-100 border-{color}-700` classes
- `components/react-flow/flywheel/` — Separate hardcoded hex palette (`#003C54`, `#007ACC`, `#FF5A5F`, `#00BFA5`)

### Fumadocs Theming

- Fumadocs v15.4.1 with Tailwind v4 — CSS-first configuration via `--color-fd-*` variables
- DocsLayout accepts `sidebar.tabs`, `sidebar.banner`, footer options
- `--fd-layout-width` CSS variable controls content area width
- Fumadocs preset CSS already imported

## Key Technical Decisions

- **Use design tokens throughout, not hardcoded colors**: All diagram nodes will reference CSS custom properties so they adapt to light/dark mode automatically. Rationale: single source of truth for brand colors, dark mode support without per-component overrides.
- **Add semantic diagram color tokens to global.css**: Rather than mapping every diagram element to existing primary/secondary, create a small set of diagram-specific tokens (e.g. `--diagram-node-*`, `--diagram-input-*`, `--diagram-output-*`). Rationale: diagrams need more color differentiation than the main UI, but those colors should still be defined centrally.
- **Replace home redirect with a minimal landing page**: Use Fumadocs HomeLayout (already configured) with a clean hero section. Rationale: first impression matters; a redirect feels unfinished.
- **Tighten the global heading color rule**: Scope the `h1-h6 { color: var(--secondary) }` rule to docs content only, not all headings site-wide. Rationale: prevents unwanted color on Fumadocs sidebar, search, and card headings.
- **Add sidebar tabs for major sections**: Guides, Protocol, Whitepaper — gives the sidebar professional structure. Rationale: Fumadocs supports this natively and it's a free UX win for navigation clarity.

## Open Questions

### Resolved During Planning

- **Font choice**: Keep Inter — it's clean, professional, and widely used in technical docs. No need to add a display font for headings.
- **Layout width**: Keep Fumadocs default. The current width is appropriate for documentation.

### Deferred to Implementation

- **Exact oklch values for diagram tokens**: Will need visual testing to get the right contrast in both modes.
- **Hero section copy/layout**: Will keep it minimal — logo, tagline, CTA button. Exact layout determined during implementation.

## Implementation Units

- [ ] **Unit 1: Refine design tokens and global CSS**

  **Goal:** Clean up color tokens, scope heading override, add diagram color tokens, improve typography spacing.

  **Requirements:** R2, R3, R4

  **Dependencies:** None

  **Files:**
  - Modify: `app/global.css`

  **Approach:**
  - Scope `h1-h6` color override to `.prose` or Fumadocs content area instead of global `@layer base`
  - Add diagram-specific CSS custom properties for each node type (input, output, transaction, reference, mint, withdrawal, validator, redeemer) with light and dark mode values
  - Refine spacing: tighten line-height on headings, improve paragraph spacing in content areas
  - Ensure all existing Fumadocs `--color-fd-*` overrides produce good contrast

  **Patterns to follow:**
  - Existing oklch color system in `global.css`
  - Fumadocs `--color-fd-*` variable naming convention

  **Test scenarios:**
  - Happy path: Light mode renders with correct heading colors in content area only
  - Happy path: Dark mode renders with correct contrast for all token values
  - Edge case: Fumadocs sidebar headings should NOT pick up the secondary color override
  - Edge case: Fumadocs search dialog headings render in default foreground color

  **Verification:**
  - `npm run build` passes
  - Headings in sidebar use default foreground, not secondary blue
  - Diagram token variables are defined in both `:root` and `.dark`

- [ ] **Unit 2: Add sidebar tabs and DocsLayout polish**

  **Goal:** Add sidebar tabs for major content sections, giving the docs professional navigation structure.

  **Requirements:** R4

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `app/docs/layout.tsx`
  - Modify: `app/layout.config.tsx`

  **Approach:**
  - Add `sidebar.tabs` configuration to DocsLayout with tabs for Guides, Protocol, and Whitepaper sections
  - Each tab gets a title and description

  **Patterns to follow:**
  - Fumadocs DocsLayout `sidebar.tabs` API (see Context7 docs)
  - Existing `baseOptions` pattern in `layout.config.tsx`

  **Test scenarios:**
  - Happy path: Sidebar shows tabs for each major section
  - Happy path: Clicking a tab navigates to the correct section and highlights it
  - Edge case: Deep-linked pages activate the correct tab

  **Verification:**
  - Sidebar renders tabs in both light and dark mode
  - Navigation between sections works correctly

- [ ] **Unit 3: Replace home redirect with landing page**

  **Goal:** Create a minimal, branded landing page instead of a bare redirect to `/docs`.

  **Requirements:** R4

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `app/(home)/page.tsx`

  **Approach:**
  - Replace the `redirect("/docs")` with a simple hero section: Andamio logo, tagline, primary CTA linking to `/docs`, secondary link to API reference
  - Use existing design tokens for colors and spacing
  - Keep it minimal — this is documentation, not a marketing site
  - Use Fumadocs HomeLayout (already wrapping this page)

  **Patterns to follow:**
  - Existing logo usage in `layout.config.tsx` (light/dark variants)
  - Design token system for all colors

  **Test scenarios:**
  - Happy path: Landing page renders with logo, tagline, and CTA
  - Happy path: Dark mode landing page has correct contrast and visibility
  - Happy path: CTA links navigate correctly to `/docs` and API reference

  **Verification:**
  - Visiting `/` shows the landing page, not a redirect
  - Page uses design tokens, no hardcoded colors

- [ ] **Unit 4: Migrate diagram nodes to design tokens**

  **Goal:** Replace all hardcoded Tailwind color utilities in React Flow diagram nodes with CSS custom properties from Unit 1.

  **Requirements:** R2, R3

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `components/react-flow/transactions/nodes/TransactionNode.tsx`
  - Modify: `components/react-flow/transactions/nodes/InputNode.tsx`
  - Modify: `components/react-flow/transactions/nodes/OutputNode.tsx`
  - Modify: `components/react-flow/transactions/nodes/ReferenceInputNode.tsx`
  - Modify: `components/react-flow/transactions/nodes/GroupNode.tsx`
  - Modify: `components/react-flow/validators/nodes/ValidatorNode.tsx`
  - Modify: `components/react-flow/validators/nodes/RedeemerNode.tsx`
  - Modify: `components/react-flow/validators/nodes/SystemNode.tsx`
  - Modify: `components/react-flow/flywheel/FlywheelDiagram.tsx`
  - Modify: `components/react-flow/flywheel/LinearDiagram.tsx`

  **Approach:**
  - Replace `bg-gray-100 border-gray-700` patterns with `bg-[var(--diagram-transaction-bg)] border-[var(--diagram-transaction-border)]` (and equivalent for each node type)
  - Replace hardcoded hex values in Flywheel/Linear diagrams with CSS custom properties
  - Remove all `console.log` statements from diagram components
  - Ensure `<pre>` blocks inside nodes also adapt to dark mode

  **Patterns to follow:**
  - CSS custom property usage pattern: `bg-[var(--token-name)]` in Tailwind v4
  - Existing dark mode toggle via class-based approach

  **Test scenarios:**
  - Happy path: Transaction diagram nodes render with correct colors in light mode
  - Happy path: Transaction diagram nodes render with correct colors in dark mode
  - Happy path: Flywheel diagram uses brand-consistent colors from tokens
  - Edge case: Nested `<pre>` blocks inside nodes have readable contrast in dark mode
  - Edge case: Mint/withdrawal sub-nodes inside TransactionNode use correct token colors

  **Verification:**
  - No hardcoded `bg-{color}-{shade}` classes remain in diagram node files
  - No hardcoded hex color values remain in Flywheel/Linear diagram files
  - No `console.log` statements remain in any diagram component
  - Diagrams render correctly in both light and dark mode
  - `npm run build` passes

- [ ] **Unit 5: Polish docs page badges and metadata components**

  **Goal:** Improve the visual quality of access-level badges, tags, and protocol info components.

  **Requirements:** R2, R4

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `app/docs/[[...slug]]/page.tsx`
  - Modify: `components/protocol-info/TxYamlMetadata.tsx`
  - Modify: `components/protocol-info/ValidatorInfo.tsx`
  - Modify: `components/protocol-info/TokenInfo.tsx`

  **Approach:**
  - Replace hardcoded badge color classes with design token references
  - Ensure metadata panels use consistent card styling with proper dark mode support
  - Improve spacing and visual hierarchy of protocol info components

  **Patterns to follow:**
  - Design token system from Unit 1
  - Fumadocs card styling conventions

  **Test scenarios:**
  - Happy path: Access-level badges (public/private/internal) render with correct token-based colors
  - Happy path: Tag badges render consistently
  - Happy path: Metadata panels look correct in both light and dark mode
  - Edge case: Pages with no badges/tags render without empty space

  **Verification:**
  - No hardcoded `bg-{color}-{shade}` classes in badge/tag rendering
  - Protocol info components use design tokens for all colors
  - `npm run build` passes

## System-Wide Impact

- **Interaction graph:** Changes are purely visual — no callbacks, middleware, or data flow affected
- **Error propagation:** N/A — styling changes only
- **State lifecycle risks:** None — no state changes
- **API surface parity:** N/A
- **Integration coverage:** Visual regression is the main risk — both light and dark mode need manual verification for all component types
- **Unchanged invariants:** All MDX content, data fetching, routing, search, and content-collections behavior remain exactly the same

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Diagram colors look wrong after token migration | Test both modes visually; oklch values can be tuned incrementally |
| Heading color scoping breaks Fumadocs internal styling | Test sidebar, search, cards, and breadcrumbs specifically |
| Landing page feels out of place with docs aesthetic | Keep it minimal — logo, one line of text, one button |

## Sources & References

- Fumadocs theming docs: CSS variables with `--color-fd-*` prefix
- Fumadocs DocsLayout sidebar tabs API
- Existing design token system in `app/global.css`
