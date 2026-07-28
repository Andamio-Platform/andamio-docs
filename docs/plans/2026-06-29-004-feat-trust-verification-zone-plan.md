---
type: plan
status: completed
created: 2026-06-29
origin: design-decided handoff, authored in a private planning vault (not team-accessible)
target_repo: andamio-docs
branch: feat/trust-verification-zone
---

# feat: Trust & Verification zone (move trust pages out of Protocol)

## Summary

Promote `contract-verification` and `security-audit` out of `content/docs/protocol/v2/` into a new **top-level "Trust & Verification" zone** — a horizontal divider in the root `meta.json`, peer to the existing Reference zone. These two pages are cross-cutting trust concerns (relevant to API builders, Issuer customers, enterprise evaluators, and protocol readers alike), not API-specific. `cost-estimation` and `whats-new` stay in Protocol as reference/changelog. Old URLs get permanent redirects; in-repo links are repointed.

This is execution of a decided handoff (origin doc above) — contained, ~60 min, no open product questions.

## Problem Frame

The protocol-redesign (#45) left a four-page "Understand cluster" inside Protocol that was a grab-bag, not a category. Two of those pages are *horizontal* trust documents owned by no single product; burying them under Protocol hides them from non-protocol audiences (e.g. the Issuer customer). The fix mirrors the existing pattern: zones are dividers in the root `content/docs/meta.json`, and Reference already holds `glossary` as a top-level file. Trust & Verification becomes a sibling divider using the same mechanism.

## Requirements

- **R1.** A "Trust & Verification" divider exists in root `content/docs/meta.json`, positioned **between `protocol` and the `--- Reference ---` divider**, listing `contract-verification` and `security-audit` as top-level pages.
- **R2.** Both pages live at the docs root (`content/docs/contract-verification.mdx`, `content/docs/security-audit.mdx`); `cost-estimation` and `whats-new` remain in `content/docs/protocol/v2/`.
- **R3.** `content/docs/protocol/v2/meta.json` no longer lists the two moved pages and still lists `cost-estimation` + `whats-new` (plus `index`, `validators`, `sequences`).
- **R4.** Permanent redirects resolve both old URLs to the new top-level URLs in a single hop, with no collision/shadowing against the #45/#46 map.
- **R5.** No stale in-repo links to `/docs/protocol/v2/contract-verification` or `/docs/protocol/v2/security-audit` remain (grep-clean).
- **R6.** Build is green, the two pages are present in content-collections generated output at their new slugs, and the zone renders as its own sidebar section.

## Key Technical Decisions

- **New top-level zone, not a product subsection.** Product roots are vertical (API, Issuer, Protocol); Trust and Reference are horizontal. A root-level divider keeps trust visible to every audience. (see origin)
- **Redirect placement is low-risk.** Verified: the existing `next.config.mjs` map has **no** broad `/docs/protocol/v2/:path*` wildcard — only specific `transactions/:path+`, `tokens/:path+`, `validators/:path+`, and `state-machine/:path+` subtree rules. Neither `contract-verification` nor `security-audit` matches any of them, so the two new exact-match rules cannot be shadowed regardless of array position. Place them in the protocol-redirects block (after the state-machine rules) for locality, as exact sources before any subtree wildcards as a defensive convention.
- **File move = URL change via slug derivation.** Moving `content/docs/protocol/v2/contract-verification.mdx` → `content/docs/contract-verification.mdx` changes its derived slug to `/docs/contract-verification`. No frontmatter slug override is needed; the move alone produces the target URL (mirrors how `glossary.mdx` sits at root → `/docs/glossary`).
- **Use `git mv` for the moves** so history follows the files.

## Implementation Units

### U1. Create the Trust & Verification zone

**Goal:** Move the two pages to the docs root and wire up navigation in both meta.json files.
**Requirements:** R1, R2, R3.
**Dependencies:** none.
**Files:**
- Move `content/docs/protocol/v2/contract-verification.mdx` → `content/docs/contract-verification.mdx` (`git mv`)
- Move `content/docs/protocol/v2/security-audit.mdx` → `content/docs/security-audit.mdx` (`git mv`)
- `content/docs/meta.json` — add the divider
- `content/docs/protocol/v2/meta.json` — remove the two moved entries

**Approach:**
- In root `content/docs/meta.json`, insert between `"protocol"` and `"--- Reference ---"` (one entry per line, matching the file's existing expanded formatting):
  ```
  "--- Trust & Verification ---",
  "contract-verification",
  "security-audit",
  ```
- In `content/docs/protocol/v2/meta.json`, drop `"contract-verification"` and `"security-audit"` from `pages`, leaving `["index", "validators", "sequences", "cost-estimation", "whats-new"]`.
- Drop any "Understand"-style framing from `cost-estimation`/`whats-new` if present (handoff §4); spot-check their frontmatter/headings — no change expected, they were already plain reference pages.

**Patterns to follow:** `glossary.mdx` at root under the `--- Reference ---` divider is the exact template for a horizontal-zone top-level file.

**Test expectation:** none (content/nav move, no behavioral code). Verified via U-level verification below.

**Verification:**
- Both files exist at root, absent from `protocol/v2/`.
- `npm run build` is green.
- Both pages appear in generated output: `grep -E "contract-verification|security-audit" .content-collections/generated/allDocs.js` shows them at the new root slugs (guards against the content-collections silent-drop gotcha).

### U2. Add permanent redirects for the old URLs

**Goal:** Old protocol URLs resolve to the new top-level URLs in one hop.
**Requirements:** R4.
**Dependencies:** U1 (destinations must exist).
**Files:**
- `next.config.mjs` — add two rules

**Approach:** Add to the `redirects()` array (within the protocol block, after the state-machine rules):
```
{ source: '/docs/protocol/v2/contract-verification', destination: '/docs/contract-verification', permanent: true },
{ source: '/docs/protocol/v2/security-audit', destination: '/docs/security-audit', permanent: true },
```
Both are exact-match sources; confirmed no existing rule matches these paths, so no ordering hazard. Keep them above any future `protocol/v2/:path*` catch-all should one ever be added (defensive — none exists today).

**Test expectation:** none (Next.js config, no automated test harness in repo). Verified manually.

**Verification:**
- `npm run build` green (Next validates redirect config at build).
- With dev/prod server running, `GET /docs/protocol/v2/contract-verification` and `/docs/protocol/v2/security-audit` each return a single 308 to the new path (no chained hop).

### U3. Repoint in-repo links to the new top-level URLs

**Goal:** No stale links to the old paths remain anywhere in content/app.
**Requirements:** R5.
**Dependencies:** U1 (move done so the relocation is intentional).
**Files (6 known references — verify with grep before/after):**
- `content/docs/glossary.mdx:111` — `/docs/protocol/v2/security-audit` → `/docs/security-audit`
- `content/docs/protocol/v2/validators.mdx:21` — `/docs/protocol/v2/contract-verification` → `/docs/contract-verification`
- `content/docs/protocol/v2/index.mdx:91` — `/docs/protocol/v2/contract-verification` → `/docs/contract-verification`
- `content/docs/apps-tooling/demo.mdx:25` — `/docs/protocol/v2/security-audit` → `/docs/security-audit`
- `content/docs/contract-verification.mdx` (moved file, was line 8 and 125) — two internal cross-links `/docs/protocol/v2/security-audit` → `/docs/security-audit`

**Approach:** Use targeted edits (not `replace_all` across files — respect the frontmatter-delimiter gotcha). The two links inside the moved `contract-verification.mdx` now point to a sibling at root, so they shorten to `/docs/security-audit`.

**Test expectation:** none (link-text edits). Verified via grep + build.

**Verification:**
- `grep -rn "protocol/v2/contract-verification\|protocol/v2/security-audit" content/ app/` returns **no** hits except inside `next.config.mjs` redirect *sources* (which are intentional) — note that command scopes `content/ app/`, so config is excluded; expect zero hits.
- `npm run build` green.

## Scope Boundaries

**In scope:** the file moves, both meta.json edits, the two redirects, the six link repoints, and verification.

**Not in scope (stay as-is):**
- `cost-estimation` and `whats-new` remain in Protocol — they are reference/changelog, not trust.
- No content rewrites of the trust pages beyond the internal-link repoint and removing any stray "Understand"-cluster framing.
- No changes to the #45/#46 redirect rules.

### Deferred to Follow-Up Work
- None identified. If browser-verification surfaces that the Issuer/API pages would benefit from explicit cross-links into the new Trust zone, capture that as a separate content task.

## Final Verification (maps to handoff "Done when")

1. Root `meta.json` shows the Trust & Verification divider between Protocol and Reference with both pages.
2. Both pages moved out of `protocol/v2/`; `cost-estimation` + `whats-new` remain; protocol `meta.json` updated.
3. `permanent` redirects for both old URLs; single-hop; no collision with #45/#46.
4. Grep-clean of stale `/docs/protocol/v2/{contract-verification,security-audit}` links in `content/`+`app/`.
5. `npm run build` green; both pages in `.content-collections/generated/allDocs.js`; browser-verify the zone renders as its own sidebar section and search returns the pages at their new paths.

## Sources & Research

- Origin handoff: a design-decided handoff authored outside this repo
- Verified directly on branch `feat/trust-verification-zone` (off `main` @ `cc2c547`): root `meta.json` layout, `protocol/v2/meta.json`, file existence, the 6 stale links (grep), and the absence of any `protocol/v2/:path*` wildcard in `next.config.mjs`.
- IA context: memory `project_docs_ia_six_root_roadmap_aligned` (six product roots + horizontal Reference/Trust zones).
- MDX gotchas (from project CLAUDE.md): content-collections silently drops files with invalid frontmatter — verify generated output after moves; never `replace_all` across frontmatter delimiters.
