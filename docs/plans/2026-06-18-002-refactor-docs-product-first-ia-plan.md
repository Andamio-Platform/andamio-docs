---
title: "refactor: Product-first docs IA — API + Issuer up top, protocol layer demoted"
type: refactor
status: active
date: 2026-06-18
---

# refactor: Product-first docs IA

**Target repo:** `andamio-docs`. Paths are repo-relative to `andamio-docs/`.

---

## Problem Frame

The docs used to be a **protocol spec** (deep on-chain mechanics). The product has moved on: the job now is *show people how to use the API, and soon how to use Andamio Issuer*. The sidebar should say that — API and Issuer own the top; the protocol internals become a clearly-marked **advanced annex**, preserved but out of the main flow.

This is pure IA + framing. No protocol content is deleted — it might still be useful; it just stops being the front door.

## Audit — what's in `protocol/` (83 pages)

| Layer | Pages | Disposition |
|---|---|---|
| Overview / reference — `protocol` intro, `Protocol V2`, `What's New in V2`, `V2 Cost Estimation`, `Security Audit` | 5 | **Keep lightly accessible** in the main sidebar (under Understand) |
| State machine (per-role state transitions) | 17 | **Demote** → Protocol tab |
| Transactions (per-role tx docs) | 21 | **Demote** → Protocol tab |
| Validators (on-chain validator reference) | 29 | **Demote** → Protocol tab |
| Tokens (token policy reference) | 11 | **Demote** → Protocol tab |

~78 of 83 pages are the deep "inner workings." The 5 overviews are a higher tier and stay.

## Decision (locked with James, 2026-06-18)

**Split.** Keep the 5 protocol overviews lightly accessible in the main sidebar; move the 78 deep internals into a **separate "Protocol" tab** (Fumadocs sidebar tab via the existing switcher). Everything preserved; deep mechanics one click out of the main flow and marked *advanced*.

## Target Sidebar

**Main tab (the product surface):**
```
Home
═ Use the API ═          ← #1
  API Quickstart · Developer Guides · SDK
  Mainnet API ↗ · Preprod API ↗ · API Reference ↗
═ Issue Credentials ═    ← #2 — own top section, ready to grow
  Andamio Issuer   (+ future issuer guides)
═ Use the Platform ═     Course / Project / Contributor guides · wallet · roles
═ Understand ═           Building on Andamio · Light Paper · Glossary
                         Protocol overview · What's New · Cost Estimation · Security Audit
═ Resources ═            Repositories · Pioneers · Live demo · links
```

**Protocol tab (advanced annex, one click away in the switcher):**
```
Protocol ▾
  State machine · Transactions · Validators · Tokens   (78 pages)
  ⓘ advanced — for protocol integrators; most builders want the API + Issuer
```

---

## Key Technical Decisions

- **Use Fumadocs sidebar tabs + a tab root for the protocol internals.** The layout already defines one tab (`app/docs/layout.tsx` → `sidebar.tabs`). Add a **Protocol** tab and mark the internals folder as a tab root (Fumadocs `root: true` meta) so it renders as its own sidebar root, out of the main tree. Rationale: native Fumadocs mechanism; zero content loss; clean audience separation.
- **Relocate the deep internals under one tab-root folder.** Group `state-machine` / `transactions` / `validators` / `tokens` under a single root (e.g. keep them under `protocol/v2/` and make `protocol` the tab root) so one tab covers all 78. Rationale: one tab boundary, minimal moves.
- **Keep the 5 overviews in the main sidebar.** Reference them in the root `meta.json` under **Understand**. If Fumadocs cannot reference pages that live inside a tab-root from the main root, **physically relocate the 5 overview pages** to a main-sidebar location (e.g. `content/docs/protocol-overview/` or under an existing main folder) and add redirects. Rationale: the overviews are genuinely useful; they must not get pulled into the tab.
- **Deprecation framing, not deletion.** Add a shared *advanced / protocol-internals* banner to the Protocol tab landing (a `Callout`, optionally driven by a frontmatter flag) — "This documents the on-chain protocol internals. Most builders should use the API and Issuer." Rationale: signals tier without removing anything.
- **Give Issuer its own top-level section now.** Even though it's one page today, slot "Issue Credentials" as a top section so the coming Issuer guides have a home. Rationale: matches the stated near-term direction.

## Implementation Units

### U1. Restructure the main sidebar top (API + Issuer first)

**Goal:** Root `meta.json` reordered to the product-first structure above.
**Files:** `content/docs/meta.json`.
**Approach:** New section order — Use the API / Issue Credentials / Use the Platform / Understand / Resources. Promote `andamio-issuer` to its own "Issue Credentials" section. Move the SDK external link grouping as today. Remove the blanket `protocol` folder ref (protocol moves to its own tab in U2); add the 5 overview refs under Understand (see U3).
**Verification:** Main sidebar shows API + Issuer at top; no deep protocol trees in the main tab.
**Test expectation:** none — nav config.

### U2. Create the Protocol tab for the internals

**Goal:** The 78 deep pages render in a separate "Protocol" tab, not the main sidebar.
**Files:** `app/docs/layout.tsx` (add the tab), `content/docs/protocol/meta.json` (+ `protocol/v2/*` metas) — mark the protocol root as a tab root (`root: true`).
**Approach:** Add a `Protocol` entry to `sidebar.tabs` pointing at the protocol root URL; set `root: true` on the protocol tab-root folder so Fumadocs treats it as a separate sidebar root. Confirm the existing single "Guides" tab still behaves (it may become the implicit main tab).
**Patterns to follow:** the existing `sidebar.tabs` config in `app/docs/layout.tsx`.
**Verification:** the tab switcher shows Main + Protocol; switching to Protocol shows only state-machine/transactions/validators/tokens; all 78 routes 200.
**Test expectation:** none — nav config. **Execution note:** verify Fumadocs tab/`root: true` behavior on a throwaway run before committing — this is the one config uncertainty.

### U3. Keep the 5 protocol overviews in the main sidebar (Understand)

**Goal:** `Protocol overview`, `Protocol V2`, `What's New in V2`, `V2 Cost Estimation`, `Security Audit` appear under **Understand** in the main tab.
**Files:** `content/docs/meta.json`; possibly new locations for the 5 pages + `next.config.mjs` redirects if relocation is required.
**Approach:** First try referencing the overview pages by path from the main root under Understand. If a tab-root prevents cross-root references (likely), relocate the 5 `.mdx` to a main-sidebar folder and add `permanent` redirects from the old `/docs/protocol/v2/*` URLs.
**Verification:** the 5 overviews are reachable from the main sidebar; old URLs (if moved) 308-redirect.
**Test expectation:** none — nav/content move.

### U4. Deprecation / advanced framing on the protocol tab

**Goal:** Anyone landing in the protocol tab sees it's the advanced, internals layer.
**Files:** `content/docs/protocol/index.mdx` (or the tab landing) — add a `Callout`; optionally a small shared component / frontmatter flag if we want the banner on every protocol page.
**Approach:** One clear advanced-tier `Callout` on the protocol landing pointing builders back to the API + Issuer. Keep it light — don't stamp a deprecation banner on all 78 pages unless we later decide to.
**Verification:** banner renders on the protocol landing in both themes.
**Test expectation:** none — content/styling.

### U5. Safety + verification

**Goal:** Nothing breaks; nothing is orphaned.
**Files:** none (checks) + any redirects from U3.
**Approach:** Run `python3 attachments/find-orphan-routes.py` (extend it for multi-tab roots if needed) → expect 0 orphaned; `npm run docs-headings` passes; dev-server spot-checks across main + protocol tab; refresh the orch sidebar map.
**Verification:** 0 orphans, guard green, all routes 200 (main + protocol tab), redirects 308.
**Test expectation:** none — verification unit.

---

## Risks & Mitigations

- **Fumadocs tab / `root: true` mechanics** (the main uncertainty) → verify on a throwaway run before committing (U2 execution note); fall back to "bottom Advanced section" if tabs misbehave.
- **Cross-root references for the 5 overviews** → if unsupported, relocate the files + redirect (U3).
- **URL changes** for any relocated overview pages → `permanent` redirects in `next.config.mjs` (pattern already established by the repos flatten).
- **Orphans** from partitioning the tree → the orphan detector is the gate (U5); extend it to understand tab roots.
- **The existing single "Guides" tab** may interact oddly with a second tab → confirm both tabs behave; relabel the main tab if needed.

## Out of Scope

- Deleting or rewriting any protocol content.
- Reworking the API / Issuer page *content* (this is IA + framing only).
- The Pioneers deep tree (separate, optional).
