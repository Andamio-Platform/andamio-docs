# Requirements: Align andamio-docs with the marketing design system

**Date:** 2026-06-27
**Status:** Requirements — ready for planning
**Scope tier:** Standard / Deep-feature (inherits existing product shape)

## Problem

The marketing site (`landing-page-and-blog`, branch `feat/enterprise-landing-page`) has a strong, intentional brand language — an editorial "technical specimen sheet" aesthetic. andamio-docs has its own deliberate but *different* look (calm Stripe-density, OKLch slate-blue). The two read as separate properties. We want docs to read as a sibling of the marketing site without sacrificing its reading-optimized body experience.

This is **not** a code lift-and-shift. The two repos live in different worlds (see Constraints). What ports is the **brand language** — color, type pairing, the mono-kicker / hairline / watermark motifs — re-expressed in docs' own idiom.

## Goal

Two moves:
1. **Brand tokens, site-wide** — bring exact brand color + a shared display face into the docs token system, keeping docs' current functional usage.
2. **Editorial home page** — rebuild the custom docs landing page in the marketing spec-sheet style. The home page is not under Fumadocs' prose constraints, so it is the safe place to go bold.

Docs **article/reading pages stay calm and unchanged.**

## Decisions (locked during brainstorm)

| Decision | Choice |
|---|---|
| Target altitude | Tokens site-wide + editorial home page. Docs body untouched. |
| Headline font | Adopt **Sora** for the home headline + headings; keep **Mona Sans** body, Geist/JetBrains mono. |
| Color mapping | **Exact** brand hues (`#004E89` Foundation Blue, `#FF6B35` Scaffold Orange), **current roles kept** (blue functional/links, orange brand accent). Body + surfaces stay calm grays. |

## In scope

**A. Brand tokens (`app/global.css`, `app/layout.tsx`)**
- Convert `#004E89` and `#FF6B35` to OKLch and set as `--primary` / accent in the `:root` + `.dark` blocks and the `@theme` block. Approximate targets (finalize exact values in planning):
  - `#FF6B35` ≈ `oklch(0.70 0.19 38)`
  - `#004E89` ≈ `oklch(0.40 0.12 250)`
- Derive lightened dark-mode variants of both (marketing precedent: orange `#FF7A52`, a brighter blue for dark surfaces).
- Add **Sora** via `next/font` (Google) wired to `--font-heading`; keep `--font-sans` = Mona Sans.
- Mirror into `--color-fd-*` only where the existing file already does. Leave `--color-fd-secondary → --muted` as-is (intentional neutral surfaces).

**B. Editorial home page (`app/(home)/page.tsx`, `app/(home)/`)**
- Mono-uppercase **kicker** label (e.g. `ANDAMIO / DOCUMENTATION`).
- Large **Sora** headline with tight tracking.
- **Hairline-ruled** sections; light **12-column grid** feel.
- **Watermark numerals** (big, ultra-light, tabular) on section markers.
- Optional: a credential **"specimen" frame** echoing the marketing hero (static image, not the live widget).
- Static / CSS-only. No framer-motion.

## Out of scope (protect the reading experience)

- Docs article prose: density, heading scale, table styling, link styling — **unchanged**.
- No editorial motifs pushed into Fumadocs content chrome (kickers on doc pages, restyled GuideHeader, etc.) — the rejected "Tier 3" option.
- No framer-motion scroll reveals / specimen scroll animation.
- No porting the marketing `src/ui/system/kit.tsx` Radix/CVA component kit — Fumadocs supplies its own primitives.
- No dark-navy "V2 landing" aesthetic; we take the editorial system, not the SaaS-dark one.

## Constraints / translation realities

These are the actual hard part, all on the docs side:
1. **Stack gap** — marketing is Tailwind **v3** (JS config, hex); docs is Tailwind **v4** (CSS `@theme`, OKLch, no config file). Tokens must be hand-translated, not imported.
2. **Color space** — every docs color is OKLch in `:root`/`.dark`. New brand hues must be converted and must hold up under the existing dark-mode inversion approach.
3. **Fumadocs coupling** — `--color-fd-*` is embedded in compiled Fumadocs CSS. Changing `--primary` cascades into fd tokens; verify search box, sidebar, secondary buttons stay neutral. Do not naively override fd tokens.
4. **Two grotesques coexisting** — Sora (headlines) + Mona Sans (body) must be visually compatible; confirm at the home/heading boundary.

## Success criteria

- Docs home page placed beside the marketing hero reads as the **same brand** — color, headline type, kicker motif all align.
- Docs **article pages are visually unchanged** in density and readability.
- No Fumadocs UI regressions: search, sidebar, secondary buttons remain neutral; light/dark both correct.
- No meaningful perf regression on the home page (no heavy JS added).

## Open assumptions (resolve in planning)

- Exact OKLch conversions for both brand colors + their dark-mode variants.
- Sora loading: `next/font/google` (recommended, matches docs' font model) vs self-host.
- Whether docs body **headings** also switch to Sora, or only the home page + page titles. Default assumption: home page + page titles use Sora; in-article H2–H6 stay Mona Sans to protect reading rhythm — confirm.
- Whether the "specimen" frame on the home page uses a static credential image or links to the live badge component.

## Source reference

- Marketing design system: `landing-page-and-blog` @ `feat/enterprise-landing-page`
  - Tokens: `src/styles/globals.css`, `tailwind.config.ts`
  - Editorial kit (the relevant one): `src/ui/system/kit.tsx`, `src/ui/system/tokens.ts`
  - Aesthetic reference shots: `screenshots/explore/final-full.png`, `06-hero.png`
- Docs target files: `app/global.css`, `app/layout.tsx`, `app/(home)/page.tsx`, `app/layout.config.tsx`
