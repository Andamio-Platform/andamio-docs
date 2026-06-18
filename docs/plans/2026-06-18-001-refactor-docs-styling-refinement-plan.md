---
title: "refactor: Styling refinement pass for docs.andamio.io (typography, color, chrome)"
type: refactor
status: active
date: 2026-06-18
deepened:
---

# refactor: Styling refinement pass for docs.andamio.io

**Target repo:** `andamio-docs` (this plan lives in `andamio-docs/docs/plans/`). All paths below are repo-relative to `andamio-docs/`.

---

## Problem Frame

The docs site reads "juvenile" and its text sizes feel "inconsistent." This is a **pure-styling** pass — no content, no information architecture, no navigation/sidebar restructuring, no copy changes. The goal is to make the Fumadocs theme layer feel **sleek, professional, and industry-standard**, anchored on the Stripe/Vercel "refined-minimal" register (quiet, high-contrast, generous whitespace, restrained color, impeccable typography).

Two concrete sources of the current feeling, confirmed by reading `app/global.css`:

1. **No type system.** The heading sizes are hand-tuned ad-hoc rem values (`h1 1.75 / h2 1.3 / h3 1.1 / h4 0.95rem`). The step-ratios are 1.35 → 1.18 → 1.16 — inconsistent and compressed, so h3/h4 barely separate from body and hierarchy collapses. This *is* the "inconsistent text sizes" complaint.
2. **Dated, generic chrome.** Body font is Inter (the #1 generic/"AI-slop" tell). Headings carry a 2010s-era underline rule under `h2` and uppercase-muted-gray `h4`–`h6` — both read as amateur/template defaults. The brand orange is high-chroma ("candy-bright") and applied broadly.

This is the **second** styling pass. The prior completed plan (`docs/plans/2026-04-06-002-refactor-docs-ux-professional-polish-plan.md`) already shipped the design-token architecture, the diagram color-token system, the scoped-heading fix, and a minimal landing page — and deliberately **kept Inter** and **punted on a type scale**. That punt is exactly the residue this pass resolves.

---

## Scope Boundaries

**In scope (styling only):**
- Typography system: a single consistent modular scale replacing the ad-hoc values; heading treatment; fonts.
- Font character: adopt a distinctive display/heading font + a refined professional body font, dropping Inter. Keep Geist Mono for code.
- Color: retune the brand orange/blue shades (same identity, more premium) and refine the neutral ramp; restrain accent application.
- Component chrome: cards, callouts, code blocks, steps, the guide-header badge row, the home hero — radius, borders, spacing, weight, density.

**Out of scope (James's explicit constraint):**
- No MDX content changes; no copy edits.
- No content hierarchy / information-architecture changes; no nav or sidebar **structure** changes (cosmetic token-level styling of existing sidebar/nav chrome is fine, restructuring is not).
- No new pages or routes; no changes to `content-collections`, data fetching, or API routes.
- Diagram *data/logic* unchanged. Diagram color *tokens* may be retuned for contrast against the new neutrals, but the token system itself is extended, never replaced.

### Deferred to Follow-Up Work
- A formal `docs/solutions/` entry capturing the Fumadocs theming + type-scale + scoped-heading knowledge (the learnings base currently has zero theming entries — knowledge lives only in plan files). Capture with `/ce-compound` when this lands.
- Restyling Fumadocs callouts via a component wrapper *if* token-level retuning proves insufficient (see U5 — start with the cheaper path).

---

## Decision Inputs (locked with James, 2026-06-18)

1. **Font strategy → distinctive pairing.** Adopt a characterful display/heading font + a refined professional body font (not Inter). Keep Geist Mono. Adds one (or two, self-hosted) font dependency.
2. **Color latitude → retune brand shades too.** Same orange/blue identity, but the exact oklch values are adjustable for a more premium, less candy-bright feel. **James reviews the swatches before merge.**
3. **Reference aesthetic → Stripe/Vercel refined-minimal.** Quiet, high-contrast, generous whitespace, color used sparingly, crisp type hierarchy.

---

## Context & Research

### How Fumadocs theming actually works (verified against installed `fumadocs-ui@15.4.1` source)

- **Fonts.** Fumadocs exposes **no `--font-*` API**. It inherits the body font from Tailwind's `--font-sans` and mono from `--font-mono` (via `--default-font-family` / `--default-mono-font-family`). **There is no heading-font hook** — a distinct heading font must be applied through a custom `.prose` override. The repo's existing `--font-heading` token + `.prose h1..h6 { font-family: var(--font-heading) }` is the correct (if non-idiomatic) way to do this. Keep it; document it as a local convention.
- **Type scale.** Fumadocs ships its **own** typography plugin (not upstream `@tailwindcss/typography`); the class is **`prose`** (not `fd-prose`). Heading sizes are baked into the compiled component CSS, but every rule is wrapped in zero-specificity `:where()`, so a plain `.prose h2 {}` selector (specificity 0,1,1) **always wins without `!important`**. This is the supported override layer — the repo's approach does not fight the framework.
- **Color tokens.** Exactly **16 overridable `--color-fd-*` tokens** (background, foreground, muted, muted-foreground, popover[-foreground], card[-foreground], border, primary[-foreground], secondary[-foreground], accent[-foreground], ring). The repo overrides all 16 in `@theme inline`. Diff tokens (`--color-fd-diff-add/remove[-symbol]`) exist and are currently left at defaults. Note: `--input`/`--destructive` are shadcn-convention tokens **not** consumed by Fumadocs chrome.
- **Callouts have no `data-*` hook** — they use literal Tailwind color classes (`border-s-blue-500/50`, etc.). Token-level retuning (or a component wrapper) is required; matching literal classes is brittle.
- **Layout / radius.** `--fd-layout-width` controls docs content max-width (documented knob). Fumadocs components use `rounded-lg` = `--radius-lg`, so changing the radius ladder reshapes cards/callouts/code blocks consistently.
- **Tailwind v4 correctness.** The repo's `@theme inline` usage (tokens that reference other CSS vars) is **mandatory and correct** — without `inline`, the `.dark` reassignments wouldn't propagate. Two flags: (a) the repo's `@custom-variant dark (&:is(.dark *))` duplicates the preset's own dark variant — remove it; (b) `inter.className` on `<html>` hard-pins the body font and can mask `--font-sans` — drop it when switching body fonts.
- **Brittle selectors to replace:** `[class*="nd-page"]` (internal/unstable class) and positional card selectors (`> div:last-child`). Prefer stable hooks: `.prose`, `[data-card]`, `.not-prose`.

### Recommended type scale (base 16px, ratio 1.25 "major third", h1 capped for long-form)

| Token | Size | Line-height | Weight | Letter-spacing |
|---|---|---|---|---|
| caption / small | 0.8125rem (13px) | 1.5 | 400 | 0 |
| body | 1rem (16px) | 1.6–1.65 | 400 | 0 |
| lead / description | 1.125rem (18px) | 1.6 | 400 | 0 |
| h6 / eyebrow | 0.8125rem (13px) | 1.4 | 600 | +0.01em |
| h5 | 0.875rem (14px) | 1.4 | 600 | 0 |
| h4 | 1rem (16px) | 1.4 | 600 | 0 |
| h3 | 1.25rem (20px) | 1.35 | 600 | 0 |
| h2 | 1.5rem (24px) | 1.3 | 650–700 | −0.01em |
| h1 | 1.875rem (30px) | 1.2 | 700 | −0.02em |

Hierarchy is carried by **size + weight + space** — asymmetric heading margins (large `margin-top`, small `margin-bottom`) so a heading visually belongs to the content below it. Negative tracking on h1/h2 is the single highest-leverage "premium" signal and is entirely absent today.

### Recommended fonts

Both keep **Geist Mono** for code (counts as the conventional third face for code only). Final pick is a **James swatch-review checkpoint** — the plan ships both wired-ready and James chooses:

- **Recommended — Hubot Sans (display) + Mona Sans (body).** GitHub's own developer-facing pair: Mona Sans is an industrial grotesque proven as a 14–16px body workhorse; Hubot is its geometric, technical display sibling. Reads native-to-infrastructure, unmistakably not-Inter, lowest risk for a protocol/dev audience. Both OFL, variable, **self-hosted** via `next/font/local` (not on Google Fonts).
- **Alternative — Fraunces (display) + Mona Sans (body).** A variable serif with an optical-size axis for a more *authored*, editorial feel that differentiates from every other sans-using Cardano/dev site. Fraunces is OFL on `next/font/google`. Use if James wants more distinctiveness than the grotesque pair.

### Recommended color direction (James reviews swatches)

- **Warm neutral ramp.** A warm brand needs warm grays — give neutrals a tiny chroma (~0.004–0.01) at hue ~50–70 rather than the current cool/near-zero grays (a cool gray under an orange brand is a subtle temperature clash that reads "template"). Critical contrast relationship: `--border` must be *much* lighter than `--muted-foreground` (hairline borders ~step 200; legible secondary text ~step 500+, WCAG AA).
- **Premium orange.** Pull chroma **down** (from ~0.18–0.20 toward ~0.14–0.16 — high chroma at mid-high lightness is what reads "candy/neon") and nudge hue from 38 toward **~45–50** (amber/terracotta, less "safety-cone"). Provide a **darker variant** `oklch(~0.45 0.15 45)` for link text on light backgrounds (the bright fill version often fails AA as text). Near-black text should be near-black-not-`#000` with a warm tint, e.g. `oklch(~0.22 0.01 60)`.
- **Restrain accent application.** Brand orange used like seasoning: links, active nav item, one primary button, focus rings. **Not** on section borders, card backgrounds, scattered icons, or multiple competing fills. Blue secondary gets a single semantic role (e.g. info/diagrams), not general chrome.

### Spacing / radius / density (refined-minimal norms)

- Reading measure **65–75ch**; set/confirm via `--fd-layout-width`.
- Radius **8px surfaces / 6px controls** (up from the current sharp 4px, which reads utilitarian; below 12px which reads consumer/playful). Apply consistently.
- **1px hairline borders** in `--border`; flat callouts with no decorative shadows; at most one barely-perceptible shadow reserved for genuinely floating UI.

### Prior-plan invariants to preserve (do not regress)

- Diagram nodes use the centralized `--diagram-*` token system (migrated off hardcoded `bg-{color}-100` utilities and a hardcoded Flywheel hex palette). Extend, never reintroduce hardcoded colors.
- Every token defined in **both `:root` and `.dark`**; manually verify both modes.
- Keep heading-color overrides **scoped to `.prose`/content** — a previous site-wide `h1-h6` color rule leaked into the sidebar, search dialog, and card headings. Re-verify those surfaces don't inherit after this pass.
- Nested `<pre>` inside diagram nodes needs explicit dark-mode contrast — watch it when neutrals change.

---

## Key Technical Decisions

- **Replace the ad-hoc heading values with one modular scale (1.25, base 16px), capped h1.** Rationale: a single ratio is what makes hierarchy read intentional; it directly fixes the "inconsistent sizes" complaint. Implemented as `.prose` overrides (which win via the plugin's `:where()`).
- **Drop Inter; adopt a distinctive display + body pairing via `next/font`.** Rationale: Inter is the dominant generic tell; the font pairing is the one memorable, defensible choice that moves the site off "default template." Self-host the recommended OFL pair through `next/font/local` for zero-FOUT/zero-CLS.
- **Carry the heading font through the existing `--font-heading` convention; route body through `--font-sans`, mono through `--font-mono`.** Rationale: matches the only supported Fumadocs surface; no framework ejection.
- **Retune brand oklch values + warm the neutral ramp, then gate on James's swatch review.** Rationale: the "premium vs candy" difference is almost entirely chroma + neutral temperature; James owns brand identity so the swatches are a review checkpoint, not an autonomous change.
- **Modernize heading treatment: remove the h2 underline and the uppercase-gray h4–h6; carry hierarchy with size/weight/space + tightened tracking.** Rationale: both current treatments are documented dated/amateur tells.
- **Retune callouts at the token/Tailwind-color level first; only wrap the component if that's insufficient.** Rationale: cheapest path that avoids matching brittle literal classes; wrapper is the deferred fallback.
- **Framework hygiene: remove the duplicate `@custom-variant dark`, drop `inter.className`, replace `[class*="nd-page"]` and positional card selectors with stable hooks.** Rationale: removes real Tailwind-v4 footguns and brittleness uncovered in research.

---

## Implementation Units

### U1. Wire the new fonts and rationalize font tokens

**Goal:** Replace Inter with the chosen display + body pairing, flowing correctly into Fumadocs prose, sidebar, and nav.
**Dependencies:** none.
**Files:** `app/layout.tsx`, `app/global.css`, (new) `app/fonts/` if self-hosting `.woff2` for Hubot/Mona Sans.
**Approach:**
- Load body + display fonts via `next/font` (self-hosted `next/font/local` for Hubot/Mona Sans; `next/font/google` for the Fraunces alternative). Expose each as a CSS variable (`--font-body`/`--font-display`), mirroring the existing Geist wiring.
- In `app/layout.tsx`: add the new `.variable` classes to `<html>` and **remove `inter.className`** so `--font-sans` drives the body font through Fumadocs.
- In `app/global.css` `@theme inline`: point `--font-sans` at the body font and `--font-heading` at the display font; keep `--font-mono: var(--font-geist-mono)`.
- Wire **both** candidate pairings behind a single swap point (a comment-documented one-line var change) so the swatch review (U4) can flip fonts without structural edits.
- Remove the redundant `@custom-variant dark` line.
**Patterns to follow:** the existing Geist/Inter `next/font` + `@theme inline` wiring in `app/layout.tsx` and `app/global.css` (the correct pattern — just swap the faces).
**Test scenarios:** Test expectation: none — pure font/config swap, verified visually in U7. Confirm no FOUT/layout-shift on load (network-throttled reload) and that sidebar, nav, search dialog, and prose all render the new body font.
**Verification:** Body text site-wide renders in the new body font; headings in the display font; code in Geist Mono; no console font errors; both light/dark unaffected structurally.

### U2. Establish the modular type scale

**Goal:** Replace the ad-hoc heading sizes with the consistent 1.25 scale (table above) and fix brittle selectors.
**Dependencies:** U1.
**Files:** `app/global.css`.
**Approach:**
- Rewrite `.prose h1..h6` size/line-height/weight/letter-spacing to the recommended scale; add negative tracking to h1/h2.
- Apply asymmetric heading margins (large top, small bottom) for vertical rhythm.
- Replace the brittle `[class*="nd-page"]` page-header rules with stable selectors (`.prose`, documented page-header structure) carrying the same scale, so the `DocsTitle` H1 and description match the in-prose scale.
- Keep the existing `.prose > h1:first-child { display: none }` hide (DocsTitle renders the page H1 separately).
- Body paragraph: line-height 1.6–1.65, paragraph spacing ~0.75–1em.
**Patterns to follow:** the existing `.prose h1..h6` override block (extend, retune values) — it already wins via the plugin's `:where()`.
**Test scenarios:** Test expectation: none (styling). Verify on a long doc page with all heading levels that step-to-step contrast is visible and consistent, and that h4 is clearly distinct from body.
**Verification:** Every heading level is visually distinguishable; ratios are uniform; no heading collides with body weight/size; page-title H1 matches the prose scale.

### U3. Modernize heading & anchor treatment

**Goal:** Remove dated treatments and let type carry hierarchy.
**Dependencies:** U2.
**Files:** `app/global.css`.
**Approach:**
- Remove the `border-bottom` rule under `.prose h2`.
- Remove the `text-transform: uppercase` + muted-gray treatment on `.prose h4..h6`; use weight + size + (for h6 only) tight tracking instead.
- Keep heading color at `--foreground` (near-black), body one step lighter — **never** gray-out h1–h4.
- Add a subtle fade-in `#` anchor link on heading hover in the muted color (modern docs pattern), if not already provided by Fumadocs.
- **Keep all heading-color overrides scoped to `.prose`/content** and re-verify sidebar/search/card headings don't inherit.
**Patterns to follow:** prior-plan scoped-heading fix (the central framework-fight to respect).
**Test scenarios:** Test expectation: none (styling). Verify: no rule under h2; no uppercase micro-headings; sidebar, search dialog, breadcrumbs, and card titles are unaffected by content heading rules in **both** modes.
**Verification:** Headings read as a clean size/weight hierarchy with no borders or uppercase-gray; anchors appear on hover; no color leak into chrome.

### U4. Retune brand + neutral color tokens (swatch-review gated)

**Goal:** A premium, restrained palette — warmer neutrals, lower-chroma amber-leaning orange, single-role blue.
**Dependencies:** none (parallelizable with U1–U3), but **merge-gated on James's swatch review**.
**Files:** `app/global.css` (the 16 `--color-fd-*` in `@theme inline`; the `:root` and `.dark` oklch value blocks; optionally `--color-fd-diff-*`).
**Approach:**
- Warm the neutral ramp: small chroma (~0.004–0.01) at hue ~50–70 across background/card/muted/border/foreground in both modes.
- Enforce the contrast relationship: `--border` much lighter than `--muted-foreground`.
- Retune `--primary` (orange): chroma ~0.14–0.16, hue ~45–50; add/confirm a darker link-text variant `oklch(~0.45 0.15 45)` meeting AA on light backgrounds. Retune `--secondary` (blue) for harmony and restrict its usage role.
- Near-black `--foreground` warm-tinted, not pure black.
- Define every change in **both `:root` and `.dark`**; re-check diagram `--diagram-*` tokens and nested `<pre>` contrast against the new neutrals (retune diagram tokens only if contrast regresses — do not replace the system).
- Produce a **swatch comparison** (before/after, both modes) for James before merge.
**Patterns to follow:** prior-plan dual `:root`/`.dark` token convention; diagram-token system.
**Test scenarios:** Test expectation: none (styling). Manually verify WCAG AA for body text, muted text, and link text on background in both modes; verify diagram nodes and nested `<pre>` still legible in dark mode.
**Verification:** James approves swatches; AA holds for text/links/muted; brand still recognizably Andamio; no diagram regression in either mode.

### U5. Restrain accent application + component chrome polish

**Goal:** Apply the seasoning-not-paint accent rule and bring cards/callouts/code/steps/guide-header to refined-minimal density.
**Dependencies:** U4 (uses retuned tokens).
**Files:** `app/global.css`, `components/mdx/guide-header.tsx`, possibly `mdx-components.tsx` (only if a callout wrapper proves necessary).
**Approach:**
- Radius: set the ladder so surfaces ≈8px, controls ≈6px (`--radius`/`--radius-lg`); apply consistently to cards, callouts, code blocks, buttons.
- Borders: 1px hairlines in `--border`; remove any border+shadow+fill stacking; flatten callout/card shadows.
- Cards: rationalize the heavy `[data-card][data-card]` / `:has(> div.not-prose)` overrides against the new scale; keep only stable hooks (`[data-card]`, `.not-prose`); replace positional `> div:last-child` selectors where feasible.
- Callouts: retune at the token/Tailwind-color level so info/warn/success/error read as muted type colors (not brand orange). If token-level proves insufficient, wrap `Callout` in `mdx-components.tsx` with a `className` (this wrapper is the deferred fallback, not default work).
- Guide-header badge row: reduce candy-ness — the level pills should use the retuned, restrained accent/neutral treatment; align padding/radius/type with the new scale.
- Restrict accent to links, active nav, one primary button, focus rings.
**Patterns to follow:** existing `[data-card]` styling and `guide-header.tsx` badge structure.
**Test scenarios:** Test expectation: none (styling). Verify cards, all four callout types, code blocks (with title bar + line numbers), Steps, and the guide-header render consistently with the new radius/border/accent in both modes; confirm orange is absent from non-accent chrome.
**Verification:** One consistent radius/border language; callouts read mature; accent appears only in its allowed roles; guide-header no longer reads juvenile.

### U6. Home hero polish

**Goal:** Bring the landing hero up to the new type/color/spacing system.
**Dependencies:** U1, U2, U4.
**Files:** `app/(home)/page.tsx`.
**Approach:** Apply the new display font + scale to the tagline; align button radius/weight/accent with U5; tighten spacing to refined-minimal rhythm. No new sections or copy — restyle the existing logo + tagline + two CTAs.
**Patterns to follow:** existing hero in `app/(home)/page.tsx` (Fumadocs `HomeLayout` minimal hero kept from prior plan).
**Test scenarios:** Test expectation: none (styling). Verify hero in both modes: type matches the scale, primary CTA uses the retuned accent, spacing is balanced.
**Verification:** Hero feels of-a-piece with the docs; no leftover Inter/old-radius/candy-orange.

### U7. Visual verification pass (both modes, key surfaces)

**Goal:** Prove the whole pass holds together and nothing regressed.
**Dependencies:** U1–U6.
**Files:** none (verification only).
**Approach:** Run `npm run dev` and screenshot, in **both light and dark**: a long guide page (all heading levels + GuideHeader + Steps + a callout + a code block), a page with a diagram (Flywheel/Linear/transaction), the home hero, and the sidebar/search dialog. Compare against the refined-minimal target and the before state. Confirm the prior-plan invariants (scoped headings, diagram tokens, nested `<pre>`).
**Patterns to follow:** prior plan's "manually check both modes — no automated coverage" note; the project has no visual regression tests, so screenshots are the gate.
**Test scenarios:** Test expectation: none — this unit *is* the verification. Checklist: (1) consistent type scale across all levels; (2) new fonts everywhere incl. sidebar/nav; (3) no h2 underline / no uppercase-gray headings; (4) accent only in allowed roles; (5) AA contrast for text/muted/links; (6) diagrams + nested `<pre>` legible in dark; (7) no heading-color leak into chrome; (8) one consistent radius/border language.
**Verification:** All eight checklist items pass in both modes; James signs off on the overall feel.

---

## System-Wide Impact

- **Single styling surface.** Nearly all changes land in `app/global.css` plus `app/layout.tsx` (fonts) and small component touches (`guide-header.tsx`, `app/(home)/page.tsx`). No data, routing, or content surface is touched.
- **Affected viewers:** every docs reader and the home visitor — purely visual.
- **Risk concentration:** color/neutral retune (U4) and the heading-scope discipline (U3) are where a regression would leak into Fumadocs chrome. Both are gated by explicit re-verification of sidebar/search/cards in both modes.

---

## Risks & Mitigations

- **Brand drift from the orange/blue retune.** → Swatch-review checkpoint (U4) before merge; keep same hue family/identity.
- **Heading-color leak into sidebar/search/cards** (the prior known framework-fight). → Keep overrides scoped to `.prose`; explicit re-verification in U3 and U7.
- **Dark-mode regressions** (nested `<pre>`, diagram nodes vs new neutrals). → Every token in both `:root`/`.dark`; U4 + U7 check dark explicitly.
- **Font load FOUT/CLS.** → `next/font` self-hosting + `adjustFontFallback` (automatic); verified in U1.
- **No automated visual coverage.** → U7 screenshot gate is mandatory, not optional.
- **Brittle selectors reappearing.** → U2/U5 replace `[class*="nd-page"]` and positional card selectors with stable hooks.

---

## Verification Strategy

This is styling work with no behavioral change, so verification is **visual, in both light and dark modes**, per the U7 checklist. There are no unit/integration tests to add (the repo has no visual-regression harness). The merge gate is: U7 checklist passes in both modes **and** James approves the U4 swatches and final font pick.
