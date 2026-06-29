---
title: "feat: Remove paper stubs from docs, redirect to the landing"
type: feat
status: completed
created: 2026-06-29
origin: ../../../02-areas/andamio/docs/plans/2026-06-29-docs-remove-papers-to-landing-handoff.md
target_repo: andamio-docs
---

# feat: Remove paper stubs from docs, redirect to the landing

## Summary

The Andamio papers are front-level marketing artifacts that live on the landing
(`www.andamio.io/whitepaper`), not in docs. Two docs pages — `light-paper.mdx` and
`api/building-on-andamio.mdx` — are empty **"Coming soon."** placeholder stubs whose real,
fully-written counterparts already live on the landing. This plan removes those two stubs,
adds permanent cross-domain redirects to the canonical landing papers, repoints the in-repo
links that pointed at them, and drops their navigation entries.

The glossary is deliberately **kept** in docs. Per the execution-time decision (handoff's
"one judgment call"), `content/docs/glossary.mdx` is a substantive 140-line developer term
reference — not an empty stub — so it stays as a live docs-native page. Only the paper framing
leaves; the term lookup remains.

---

## Problem Frame

The decision is already made and locked (papers placement LOCKED 2026-06-20, re-confirmed
2026-06-29 in the origin handoff): papers belong on the landing, docs should *reference and
support* them, never host them. This plan is pure execution against that decision — no product
questions remain open.

What makes this safe (not content loss): the two pages being removed are placeholder stubs
that lead with `> **Coming soon.**`. The real papers already render on the landing at
`/whitepaper` (`light-paper` on the hub root) and `/whitepaper/building-on-andamio`. Readers
who hit the old docs URLs land on real content instead of a placeholder — strictly an upgrade.

The one risk surface is **silent breakage**: content-collections drops invalid/removed MDX
without a build error (404s silently), and stale in-repo links won't fail the build. So the
work must explicitly repoint every reference and verify nothing dangles.

---

## Requirements

- **R1** — Remove the two empty paper stubs from docs: `content/docs/light-paper.mdx` and
  `content/docs/api/building-on-andamio.mdx`.
- **R2** — Add permanent (`permanent: true`) cross-domain redirects for each removed URL,
  pointing at the canonical landing paper (absolute `https://www.andamio.io/...` destinations).
- **R3** — Repoint every in-repo link that targeted a removed page to its landing destination.
- **R4** — Remove the stubs' navigation entries from `meta.json` files without disturbing the
  glossary entry or the Reference divider.
- **R5** — Keep `content/docs/glossary.mdx` live and unchanged; no redirect, no nav change for it.
- **R6** — Build green, search re-indexed with no stub pages, redirects runtime-verified, and
  no dangling in-repo links to removed URLs.

**Production domain:** `www.andamio.io` (the landing's own source uses `https://www.andamio.io`).
**Landing slugs** (from `landing-page-and-blog/src/lib/papers.ts`): `light-paper` renders on the
`/whitepaper` hub root; `building-on-andamio` at `/whitepaper/building-on-andamio`.

---

## Key Technical Decisions

- **Glossary stays in docs (decision confirmed at execution).** `content/docs/glossary.mdx` is a
  real term reference, not a stub, and is only inbound-linked from the homepage card + nav — not
  heavily linked, but genuinely useful to developers reading docs. It remains a live docs page;
  only the two paper stubs are removed. This means the Reference zone in `meta.json` does **not**
  empty out (glossary remains), so the `--- Reference ---` divider **stays** — the origin's
  "remove the divider if the zone empties" branch does not fire.

- **Collapse the existing two-hop redirect chain.** `next.config.mjs` already contains
  `{ source: '/docs/building-on-andamio', destination: '/docs/api/building-on-andamio' }`
  (from the Phase 2 IA move). Once `/docs/api/building-on-andamio` redirects to the landing, the
  old top-level path becomes a 2-hop chain (`/docs/building-on-andamio` → `/docs/api/building-on-andamio`
  → landing). Repoint that existing rule directly at the landing URL so both legacy paths resolve
  in a single hop. (see origin: handoff "Repoint in-repo links" step — extended here to redirect chains.)

- **Absolute external destinations are correct and supported.** These redirects cross domains
  (`docs.andamio.io` → `www.andamio.io`), so destinations are full absolute URLs, not in-app paths.
  Next.js `redirects()` supports absolute URLs in `destination`; this config sets no `basePath`,
  so no `basePath: false` flag is needed. Place the new paper redirects alongside the existing
  array entries (order only matters for overlapping path patterns; these are exact, non-overlapping
  sources).

- **`issuer` is out of scope and correct as-is.** `content/docs/issuer/` is now a real Product
  section (4 pages), not a paper stub — the old `andamio-issuer.mdx` already became the section
  (an `/docs/andamio-issuer` → `/docs/issuer` redirect already exists). The CLAUDE.md reference to
  `content/docs/andamio-issuer.mdx` as a "paper placeholder" is stale. Do not touch issuer.

---

## Scope Boundaries

**In scope:** removing the two stub MDX pages, their redirects, their in-repo links, and their
nav entries; collapsing the building-on-andamio redirect chain; build + runtime verification.

### Deferred to Follow-Up Work
- **Re-sync landing papers from `ee/papers` canonical** — the landing is one commit behind
  (missing the 2026-06-24 "fence cross-issuer composability as roadmap" fix, #56). Owner-side work
  in `landing-page-and-blog` + `scripts/sync-papers.sh`. Redirect targets are correct regardless
  (landing already hosts the papers). (see origin: "Out of scope")
- **Docs references + supports the papers' story (Phase 2)** — net-new doc content supporting the
  paper narrative (e.g. fresh API "Concepts" supporting Building-on-Andamio). Separate workstream,
  after the source of truth is solid. (see origin: "Out of scope")

### Outside this change's identity
- The glossary's content, structure, or its own internal `/docs/...` links — untouched.
- The `issuer` Product section — untouched.
- Any CLAUDE.md cleanup of the stale `andamio-issuer.mdx` mention — not required for this change
  (noted for awareness only).

---

## Implementation Units

### U1. Remove the two paper stubs and drop their nav entries

**Goal:** Delete the two empty placeholder pages and remove their navigation entries, leaving the
glossary and the Reference divider intact.

**Requirements:** R1, R4, R5

**Dependencies:** none

**Files:**
- Delete `content/docs/light-paper.mdx`
- Delete `content/docs/api/building-on-andamio.mdx`
- Modify `content/docs/meta.json` — remove the `"light-paper"` entry from the Reference zone;
  **keep** `"glossary"` and **keep** the `"--- Reference ---"` divider (the zone is not empty).
- Modify `content/docs/api/meta.json` — remove the `"building-on-andamio"` entry from `pages`.

**Approach:** Straight deletion plus targeted JSON array edits. The root `meta.json` Reference
zone currently lists `glossary` then `light-paper` between the `--- Reference ---` and
`--- External ---` dividers; remove only `light-paper`. Do not touch the divider strings or the
glossary entry. In `api/meta.json`, remove only the trailing `building-on-andamio` page.

**Patterns to follow:** existing `meta.json` array-of-strings nav format already in both files.

**Test scenarios:**
- After deletion + regen, `grep 'light-paper' .content-collections/generated/allDocs.js` returns
  nothing (page gone from the generated bundle).
- After deletion + regen, `grep 'building-on-andamio' .content-collections/generated/allDocs.js`
  returns nothing.
- `grep 'glossary' .content-collections/generated/allDocs.js` still returns the glossary doc
  (kept page survives).
- Root `meta.json` still contains both `"--- Reference ---"` and `"glossary"` (divider + glossary
  preserved); no longer contains `"light-paper"`.
- `api/meta.json` `pages` no longer contains `"building-on-andamio"`.

**Verification:** `npm run build` succeeds; the docs sidebar Reference section renders with the
Glossary entry present and no Light Paper entry; the API section has no Building-on-Andamio entry.

---

### U2. Add cross-domain redirects in next.config.mjs

**Goal:** Permanently redirect the two removed docs URLs to their canonical landing papers, and
collapse the pre-existing building-on-andamio redirect chain to a single hop.

**Requirements:** R2

**Dependencies:** U1 (pages must be gone so the redirect, not the page, serves the URL)

**Files:**
- Modify `next.config.mjs` — inside the existing `redirects()` array.

**Approach:** Add two new entries with absolute destinations and `permanent: true`:
- `/docs/light-paper` → `https://www.andamio.io/whitepaper`
- `/docs/api/building-on-andamio` → `https://www.andamio.io/whitepaper/building-on-andamio`

Then update the **existing** entry (currently
`{ source: '/docs/building-on-andamio', destination: '/docs/api/building-on-andamio', permanent: true }`)
to point directly at `https://www.andamio.io/whitepaper/building-on-andamio`, eliminating the
2-hop chain. Group the two new paper redirects under a short comment (e.g. "Papers live on the
landing — old docs stubs redirect to the canonical whitepaper pages"). Sources are exact paths and
do not overlap existing wildcard rules, so array position is not load-bearing.

**Patterns to follow:** the existing redirect entries in `next.config.mjs:18-112` — same object
shape `{ source, destination, permanent: true }`.

**Test scenarios:**
- `next.config.mjs` `redirects()` returns an entry mapping `/docs/light-paper` →
  `https://www.andamio.io/whitepaper` with `permanent: true`.
- `next.config.mjs` returns an entry mapping `/docs/api/building-on-andamio` →
  `https://www.andamio.io/whitepaper/building-on-andamio` with `permanent: true`.
- The pre-existing `/docs/building-on-andamio` entry now points directly at the landing URL (no
  longer at the in-app `/docs/api/building-on-andamio` path) — no 2-hop chain remains.
- Config still parses: `npm run build` completes without a config error.

**Verification:** With a production build/served instance, requesting `/docs/light-paper`,
`/docs/api/building-on-andamio`, and `/docs/building-on-andamio` each returns a 308/permanent
redirect to the correct absolute landing URL in a single hop.

---

### U3. Repoint in-repo links on the homepage

**Goal:** Update the homepage references that pointed at the removed pages so readers (and the
in-app router) go to the landing papers instead of dead docs paths.

**Requirements:** R3

**Dependencies:** U2 (destinations should exist as redirects; links point at final landing URLs)

**Files:**
- Modify `content/docs/index.mdx`

**Approach:** Three edits in `content/docs/index.mdx`:
- Line ~24 — the prose link `[Building on Andamio](/docs/api/building-on-andamio)` → point its
  href at `https://www.andamio.io/whitepaper/building-on-andamio`.
- Line ~49 — the `<Card title="Light Paper" href="/docs/light-paper">` → point href at
  `https://www.andamio.io/whitepaper`.
- Line ~52 — the `<Card title="Glossary" href="/docs/glossary">` — **leave unchanged** (glossary
  stays in docs).

Use direct, targeted edits (not `replace_all`) to avoid touching the glossary card or unrelated
content.

**Patterns to follow:** existing Fumadocs `<Card href=...>` and markdown link usage already in
`index.mdx`. External absolute URLs are already used elsewhere in the nav (e.g. the meta.json
External zone links to `https://api.andamio.io`).

**Test scenarios:**
- `grep -n '/docs/light-paper' content/docs/index.mdx` returns nothing (light-paper link gone).
- `grep -n '/docs/api/building-on-andamio' content/docs/index.mdx` returns nothing.
- The Light Paper card and Building-on-Andamio prose link now contain the absolute
  `https://www.andamio.io/whitepaper...` URLs.
- `grep -n '/docs/glossary' content/docs/index.mdx` still returns the Glossary card (unchanged).

**Verification:** Homepage renders; the Light Paper card and Building-on-Andamio link navigate to
the landing; the Glossary card still navigates to the in-docs `/docs/glossary` page.

---

### U4. Verify build, regen, search, and redirects end-to-end

**Goal:** Prove the change is clean — no dangling links, no orphaned generated entries, search
re-indexed without the stubs, and redirects resolve at runtime.

**Requirements:** R6

**Dependencies:** U1, U2, U3

**Files:** none (verification only)

**Approach:** Run the production build and a site-wide sweep for any remaining references to the
removed URLs across `content/`, `app/`, `components/`, `lib/`. Confirm the generated
content-collections bundle no longer contains the stub slugs. Spot-check the served redirects.

**Test scenarios:**
- `Test expectation: none -- verification-only unit, no behavioral code added.`
- `npm run build` exits 0.
- Site-wide `grep` for `/docs/light-paper` and `/docs/api/building-on-andamio` across
  `content/ app/ components/ lib/` returns no matches (the in-repo refs are gone; the only
  remaining mentions are the redirect `source` strings in `next.config.mjs`, which are expected).
- `.content-collections/generated/allDocs.js` contains neither stub slug and still contains
  `glossary`.
- Served instance: `/docs/light-paper`, `/docs/api/building-on-andamio`, and
  `/docs/building-on-andamio` each redirect (single hop) to the correct landing URL.
- Search index (rebuilt on build) returns no result for the removed paper stubs.

**Verification:** Build green; grep sweep clean; all three redirects land on the right absolute
landing URL; glossary page still resolves at `/docs/glossary`.

---

## Risks & Dependencies

- **Stale-link silent breakage** — content-collections 404s silently and the build won't flag
  stale in-repo links. Mitigated by U3's targeted repoint plus U4's site-wide grep sweep as a
  hard gate.
- **Redirect chain regression** — leaving the old `/docs/building-on-andamio` rule pointing at the
  now-removed in-app path would create a 2-hop redirect (still functional, but worse). Mitigated by
  the U2 collapse to a direct landing destination.
- **External dependency: landing must host the papers** — the redirect targets assume the landing
  serves `/whitepaper` and `/whitepaper/building-on-andamio`. This is already true (verified in the
  origin handoff grounding); the deferred re-sync does not change the URLs, only their content
  freshness, so it does not block this change.
- **Cross-domain redirect support** — relies on Next.js honoring absolute external `destination`
  values; standard and already used implicitly. The `npm run build` config-parse check in U2 is the
  guard.

---

## Sources & Research

- Origin handoff: `../../../02-areas/andamio/docs/plans/2026-06-29-docs-remove-papers-to-landing-handoff.md`
- Stub pages confirmed empty (`> **Coming soon.**`): `content/docs/light-paper.mdx`,
  `content/docs/api/building-on-andamio.mdx`.
- Existing redirects + the building-on-andamio chain: `next.config.mjs:18-112` (chain at line 37).
- In-repo references (complete set): `content/docs/index.mdx:24,49,52`; `content/docs/meta.json`
  (Reference zone); `content/docs/api/meta.json` (`building-on-andamio`).
- Glossary inbound-link audit: only `content/docs/index.mdx:52` (homepage card) + nav — not heavily
  linked, supporting the keep-in-docs decision.
- `issuer` is a live Product section (`content/docs/issuer/` — 4 pages), not a removable stub.
