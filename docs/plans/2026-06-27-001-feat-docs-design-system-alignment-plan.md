---
title: "feat: Align andamio-docs with the marketing design system"
type: feat
status: active
created: 2026-06-27
origin: docs/brainstorms/2026-06-27-docs-design-system-alignment-requirements.md
depth: standard
---

# feat: Align andamio-docs with the marketing design system

Make andamio-docs read as a sibling of the marketing site (`landing-page-and-blog` @ `feat/enterprise-landing-page`) by porting the **brand language** — not the code — into docs' Tailwind v4 / Fumadocs idiom. Two moves: brand tokens (color + a shared display face) at the token layer, and an editorial rebuild of the custom home page. The calm, reading-optimized article experience is left untouched.

Origin requirements: `docs/brainstorms/2026-06-27-docs-design-system-alignment-requirements.md`.

---

## Problem & Scope

The two properties currently look unrelated: the marketing site uses an editorial "specimen sheet" aesthetic (cream + black ink, exact `#FF6B35` orange + `#004E89` blue, Sora display type, mono kickers, hairline rules, watermark numerals); docs uses a calm Stripe-density system (OKLch slate-blue, Mona Sans single-family, no orange in UI). This is not a code lift-and-shift — the stacks differ (marketing is Tailwind v3 / hex / custom Radix+CVA kit; docs is Tailwind v4 `@theme` / OKLch / Fumadocs). What ports is the brand layer, hand-translated.

**In scope:** brand color tokens site-wide (exact hues, current functional roles); Sora display face wired for the home page; full editorial rebuild of `app/(home)/page.tsx`.

**Out of scope (protect the reading experience):**
- Article `.prose` density, heading scale, table/link styling — unchanged.
- In-article `.prose` headings stay Mona Sans; `#nd-page h1` page titles stay Mona Sans (confirmed).
- No framer-motion / scroll-reveal animation on the home page (static / CSS-only).
- No porting the marketing `src/ui/system/kit.tsx` Radix/CVA kit — Fumadocs supplies primitives.
- No editorial motifs pushed into Fumadocs content chrome.
- No changes to Fumadocs surface tokens (`--color-fd-secondary → --muted` stays; search/sidebar/secondary buttons remain neutral).

---

## Key Technical Decisions

1. **Orange is a NEW token, never an overload of `--accent`.** `--accent` (`oklch(0.988 0.008 79.439)`) is a near-white surface tint consumed by Fumadocs hover states and the sidebar; `--color-fd-accent` mirrors it. Brand orange gets its own token (e.g. `--brand`, exposed as `--color-brand` in `@theme`) so it never bleeds into Fumadocs chrome. This is a deliberate departure from the current "orange lives only in the logo" note at `app/global.css:81` — orange becomes an intentional brand accent, used sparingly.

2. **`--primary` retunes to exact Foundation Blue `#004E89`**, keeping its functional role (links, primary CTA, ring). Approximate OKLch `oklch(0.42 0.115 250)` — finalize exact value in implementation. Risk: current `--secondary` (`oklch(0.45 0.115 250)`, difficulty badges) sits very close; if the two collapse visually, nudge `--secondary` to preserve differentiation. Verified via light+dark visual check (see U1 test scenarios).

3. **Sora is applied surgically, not via `--font-heading`.** `--font-heading` feeds both `.prose h1–h6` AND `#nd-page h1` (`app/global.css:166,318`); swapping it globally would push Sora into in-article headings, which the brainstorm explicitly excluded. Instead: add a separate `--font-sora` (and `--color`/`@theme` exposure as `--font-display`), leave `--font-heading = var(--font-mona)`, and apply Sora only on the home page via the font's CSS variable on the home `<main>` subtree.

4. **Dark mode needs lightened variants of both brand hues.** Foundation Blue and Scaffold Orange are tuned for a cream/white ground; on the dark navy background (`oklch(0.188 …)`) both must lighten (marketing precedent: orange `#FF7A52`; blue brightened). Set distinct `.dark` values, mirroring the existing light/dark pattern in `app/global.css`.

5. **Home page keeps the Fumadocs `HomeLayout` shell** (`app/(home)/layout.tsx`, nav from `app/layout.config.tsx`); only the `<main>` is rebuilt. Lowest-risk path to a bold front door without re-implementing nav/theme-toggle.

---

## Implementation Units

### U1. Brand color tokens

**Goal:** Introduce exact brand hues into the token system without disturbing Fumadocs surfaces.
**Requirements:** Brand-token alignment; exact hues / current roles (origin: Decisions, In scope A).
**Dependencies:** none.
**Files:**
- `app/global.css` (`@theme inline`, `:root`, `.dark` blocks)

**Approach:**
- Retune `--primary` (light + dark) to exact Foundation Blue `#004E89` in OKLch, keeping `--primary-foreground`, `--ring`, `--sidebar-primary` consistent with the new hue.
- Add a new `--brand` token (light: Scaffold Orange `#FF6B35` ≈ `oklch(0.70 0.187 39)`; dark: lightened ≈ `oklch(0.74 0.16 42)`) plus `--brand-foreground`. Expose as `--color-brand` in the `@theme inline` block so `text-brand` / `bg-brand` utilities exist.
- Do **not** touch `--accent`, `--color-fd-accent`, `--color-fd-secondary`, or `--secondary`'s role. If U1's `--primary` change crowds `--secondary`, adjust `--secondary` only enough to keep difficulty badges distinct.
- Keep all existing comments accurate: update the `app/global.css:81` "orange lives only in the logo" note to reflect the new intentional-accent policy.

**Patterns to follow:** existing light/dark token pairing and `@theme inline` exposure already in `app/global.css`.

**Test scenarios:**
- Covers brand-alignment. Light mode: primary-colored elements (doc body links, "Get Started" CTA, focus ring) render as Foundation Blue `#004E89`; confirm against the marketing `#004E89`.
- Dark mode: primary renders as the lightened blue, legible on the navy background; `--brand` orange legible on both grounds.
- Regression: Fumadocs search box, sidebar, and secondary buttons remain neutral gray (unchanged from before) in both themes — proves `--color-fd-secondary`/`--accent` were untouched.
- Differentiation: a difficulty badge (`--secondary`) and a primary link sit visibly distinct side by side in both themes.

**Verification:** `npm run dev`; visually diff home + a representative doc page in light and dark against the marketing palette; Fumadocs chrome visibly unchanged.

---

### U2. Sora display face wiring

**Goal:** Load Sora and make it available to the home page without affecting any in-article or page-title headings.
**Requirements:** Adopt Sora for headlines; keep Mona Sans body (origin: Decisions).
**Dependencies:** none (independent of U1).
**Files:**
- `app/layout.tsx`
- `app/global.css` (`@theme inline` font exposure)

**Approach:**
- Add Sora via `next/font/google` (weights 600, 700), assigned to a CSS variable `--font-sora`. Attach the variable class to `<html>` alongside the existing `monaSans.variable` / `GeistMono.variable`.
- In `@theme inline`, add `--font-display: var(--font-sora)` so a `font-display` utility exists. **Leave `--font-heading: var(--font-mona)` unchanged** — this is the guard that keeps `.prose` headings and `#nd-page h1` on Mona Sans.
- Do not modify the `.prose h1–h6` or `#nd-page h1` selectors.

**Patterns to follow:** existing `localFont` + `GeistMono.variable` wiring in `app/layout.tsx:8–24`; existing `--font-*` exposure in `@theme`.

**Test scenarios:**
- Sora loads (network shows the woff2; `font-display` utility resolves to Sora) and renders on a probe element.
- Regression: an in-article H2 and a doc page title (`#nd-page h1`) still render in Mona Sans, unchanged weight/tracking — proves Sora did not leak through `--font-heading`.
- No CLS/FOIT regression on the home route (font `display: swap` behavior acceptable).

**Verification:** `npm run dev`; inspect computed `font-family` on the home headline (Sora) vs. an article heading (Mona Sans).

---

### U3. Editorial home page rebuild

**Goal:** Rebuild the docs landing page in the marketing spec-sheet style using the new tokens + Sora.
**Requirements:** Editorial home page; mono kicker, Sora headline, hairline sections, watermark numerals, static specimen frame (origin: In scope B).
**Dependencies:** U1 (brand tokens), U2 (Sora).
**Files:**
- `app/(home)/page.tsx` (rewrite)
- `public/` (add one static credential "specimen" image — see Dependencies)

**Approach:**
- Replace the centered-logo hero with an editorial layout:
  - **Kicker:** mono-uppercase label (`ANDAMIO / DOCUMENTATION`) using `font-mono`, small size, wide letter-spacing, muted color.
  - **Headline:** large Sora (`font-display`) with tight negative tracking; one word/phrase accented in `--brand` orange (echo the marketing "upgrade" treatment).
  - **Sections:** hairline top rules (`border-t border-border`) between blocks; light 12-column feel via a max-width container with generous vertical rhythm. Keep the existing two CTAs ("Get Started" → `/docs`, "API Reference" → `api.andamio.io`), restyled to the spec-sheet button look.
  - **Watermark numerals:** large, ultra-light, tabular numerals (`tabular-nums`, very low-contrast color) marking 1–2 home sections.
  - **Specimen frame:** a framed static credential image with a mono caption/metadata strip (`FIG. 01 — SPECIMEN`), echoing the marketing hero. Static `<Image>`, no live widget.
- Static / CSS-only. No framer-motion, no scroll listeners.
- Respect light + dark: the editorial frame and rules read correctly on both grounds (the home page inherits the site theme; no forced light island required).

**Patterns to follow:** marketing editorial kit `src/ui/system/kit.tsx` (Kicker, Display, NumberWatermark, SpecimenReveal — as *visual* reference only, reimplemented in plain JSX + Tailwind); aesthetic reference `landing-page-and-blog/screenshots/explore/final-full.png`, `06-hero.png`.

**Test scenarios:**
- Home page renders kicker (mono), Sora headline with an orange-accented span, hairline-ruled sections, and at least one watermark numeral.
- Both CTAs present and link to `/docs` and `https://api.andamio.io` respectively; hover states use brand tokens.
- Specimen image renders with `next/image` (priority), correct alt text, no layout shift.
- Light and dark both legible; no horizontal overflow at mobile (375px), tablet, and desktop widths.
- Regression: navigating from home into `/docs` shows the article reading experience visually unchanged from before this plan.

**Verification:** `npm run dev`; place the home page beside the marketing hero — kicker, headline type, color, and specimen motif read as the same brand; `npm run build` succeeds.

---

## Dependencies / Prerequisites

- **Static specimen image:** no credential/badge asset currently exists in `public/` (only logos). The implementer needs one static credential image for U3 — export from the marketing repo (e.g. a badge preview frame under `landing-page-and-blog/`) or capture from the deployed credential. If unavailable at implementation time, ship U3 with the framed metadata strip around a placeholder and backfill the image (tracked, non-blocking).
- **Sora license:** OFL via Google Fonts — no blocker for `next/font/google`.

---

## System-Wide Impact

- **Token layer (U1/U2):** affects every page through `--primary`, `--ring`, sidebar primary, and the new `--brand`/`--font-display` utilities. Bounded by deliberately not touching `--accent`/`--color-fd-*` surfaces. Difficulty badges (`GuideHeader`, `components/mdx/guide-header.tsx`) read `--primary`/`--secondary` — verify their colors still read correctly after the retune.
- **Home page (U3):** self-contained; no shared-component changes.
- No content/MDX changes; no build-pipeline changes.

---

## Deferred to Implementation

- Exact OKLch values for Foundation Blue, Scaffold Orange, and their dark-mode variants (tune against the marketing hex on-screen).
- Whether `--secondary` needs nudging once `--primary` lands (resolve by visual check, not in advance).
- Final home-page section count, copy, and the watermark-numeral placement (compose against the reference shots during implementation).
- Sourcing/cropping of the specimen image.

---

## Verification Strategy

1. `npm run dev` — visual review of home + a representative doc page in light and dark.
2. Side-by-side with the marketing hero (`landing-page-and-blog` @ `feat/enterprise-landing-page`, or its `screenshots/explore/` shots) to confirm brand sibling-hood.
3. Confirm the three regression guards: Fumadocs chrome neutral, in-article headings Mona Sans, article reading experience unchanged.
4. `npm run build` succeeds; `npm run docs-drift` / existing prebuild checks unaffected.
