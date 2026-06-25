---
type: plan
status: completed
created: 2026-06-25
plan_type: fix
origin: "orchestration follow-up brief — badge-anatomy-image-followup (carried into repo 2026-06-25)"
follows: "docs/plans/2026-06-25-001-feat-credential-badge-anatomy-page-plan.md"
tags:
  - plan
  - credential-badges
  - documentation
---

# fix: Use the current Proof Rings badge image on the anatomy page

## Summary

The shipped anatomy page (`/docs/credential-badges`) embeds the **old shield+ribbon**
badge art while its prose correctly describes the **new "Proof Rings"** design — the image
contradicts the words. This is an **image + caption correction only**; the prose is good
and stays. Regenerate a real Proof Rings SVG for *Andamio for Developers, Module 3* using
the landing page's framework-free `buildBadgeSvg` core (the authoritative current
renderer), replace the vendored file, and fix the source caption so it no longer claims the
live URL as the image's origin (the live deployment still serves the old shield).

**Plan depth:** Lightweight (one image swap + a caption edit + verification).

---

## Problem Frame

In the original work, `public/images/credential-badges/credential-badge-sample.svg` was
vendored by copying from `credential-badges/badges/…a045.svg` — verified here as the **old
shield** (`shieldGrad` / `ribbonGrad`, zero ring geometry; md5
`b259aa36854cbf26ab808ed26ba7a2ee`). The page prose describes a Proof Rings shield (outer
ring = `policy_id`, inner = `slt_hash`), so the embedded image is wrong.

**Root cause:** the current design is Proof Rings, but the only authoritative Proof Rings
renderers are the **generators**. The checked-in `credential-badges/badges/*.svg` files and
the live `credentials.andamio.io/badges/…` endpoint are **stale** (not regenerated since the
Proof Rings update, and the live endpoint also serves drifted `<title>`s). So both vendoring
from the repo `badges/` folder and curling the live URL yield the old art — which is exactly
what happened.

---

## Origin & Scope

The follow-up brief is the source of truth. It is verified-with-evidence and prescribes the
fix. This plan carries it forward.

### In scope

- Regenerate a real Proof Rings SVG for a real module and replace the vendored shield file.
- Fix the source caption to be honest about provenance.
- Keep image, `alt`, module title, and the cited `…<policy_id>.<slt_hash>.svg` filename all
  naming the **same real module** and matching the new file.

### Out of scope (non-goals)

- **Prose changes** — the page already describes Proof Rings correctly. Leave it.
- **Regenerating + redeploying `credential-badges`** so `badges/*.svg` and
  `credentials.andamio.io` stop serving the old shield (and titles stop drifting). That is a
  **`credential-badges` task**, tracked in the Credential Badges project — see Deferred.

### Deferred to Follow-Up Work

- **`credential-badges` refresh + redeploy to Proof Rings.** The durable fix that lets the
  docs cite the live URL truthfully. Not this docs change; flag it on the Credential Badges
  project. Until it lands, the docs caption must not claim the live URL serves this image.

---

## Key Technical Decisions

### KTD1 — Generate via the landing `buildBadgeSvg` core (not the stale sources)

Render the new SVG with
`landing-page-and-blog/src/ui/landing/V2Landing/badge` → `buildBadgeSvg(params, palette,
opts?)`. It is a **framework-free, pure** TS module (imports nothing from React/Next; the
primary `buildBadgeSvg` path takes the on-chain `courseId` + `sltHash` hex directly and
needs no Web Crypto), returns a **self-contained** SVG string (fonts embedded via
`fonts.ts`), and is the **inverse of `credential-badges/decode.py`** — i.e. the canonical
current design, the same one demonstrated live in `BadgeBuilderDemo.tsx`.

*Rejected:* reusing `credential-badges/badges/*.svg` or curling the live URL (both stale —
the cause of the bug); `make badges` in `credential-badges` (needs CLI/network/auth, heavier,
and would also require an un-stale checkout).

### KTD2 — Depict Module 3 (App Template), keep prose consistent

Use the real identifiers for *Andamio for Developers* — `courseId`
`6348bba0f9b7d7e0353715ece5946f3b61de433d314e84dad313a677`, `sltHash`
`a891203913065a08e2c87ea57b808bb0f6efa4e57f36bc1412f7c2cdd846a045` = **Module 3: App
Template** (authoritative title from the badge `<title>`, per the follow-up brief's table —
**trust this, not the live endpoint's drifted titles**). This is the module the page already
cites in its `alt`, title, and filename, so only the art changes and no prose drifts.

### KTD3 — Honest caption; pass `network: "preprod"`

The current caption cites `credentials.andamio.io/badges/…` as the source. Since the live
endpoint serves the old shield, that is no longer true for the new image. Re-caption to
something like *"Rendered from the current Proof Rings generator; the public
`credentials.andamio.io` deployment is mid-refresh to this design"* — leaning on the page's
own (correct) point that **badge art is presentation-layer and mutable**. Pass
`network: "preprod"` to `buildBadgeSvg` to stay consistent with the page's "live on preprod"
framing.

---

## Implementation Units

### U1. Regenerate the Proof Rings SVG and replace the vendored file

**Goal:** Produce a real, current Proof Rings SVG for Module 3 and overwrite the old shield.

**Requirements:** Done-when "badge shown is Proof Rings (visible rings, not shield)"; "no
stale shield art remains."

**Dependencies:** none.

**Files:**
- `public/images/credential-badges/credential-badge-sample.svg` (replace).
- A throwaway generation script (scratch / not committed) that imports `buildBadgeSvg`.

**Approach:** Write a short Node script (run via `npx tsx`) that imports `buildBadgeSvg`,
`PALETTES`, and `withInterior` from
`landing-page-and-blog/src/ui/landing/V2Landing/badge`, calls:

```ts
buildBadgeSvg(
  { courseTitle: "Andamio for Developers", moduleTitle: "Module 3: App Template",
    courseId: "6348bba0…a677", sltHash: "a8912039…a045", network: "preprod" },
  withInterior(PALETTES[/* course palette */], "light"),
)
```

and writes the returned string to the target path. *Directional — confirm the exact
`BadgeParams` field names and the course→palette selection against `badge-generator.ts` /
`BadgeBuilderDemo.tsx` at execution time.*

**Patterns to follow:** the README consumption block in
`landing-page-and-blog/src/ui/landing/V2Landing/badge/README.md` ("Consuming this in
andamio-app-v2" shows the exact real-credential call).

**Test scenarios:**
- Generated file contains ring/tick geometry and **no** `shieldGrad` / `ribbonGrad`.
- File is self-contained (embedded fonts; renders standalone in a browser, no external
  calls) and is a valid `<svg>`.
- md5 differs from `b259aa36854cbf26ab808ed26ba7a2ee` (the old shield).
- Optional integrity check: the rings round-trip to the input hashes via
  `credential-badges/generator/decode.py` (`make verify`) if readily runnable.

**Verification:** The vendored SVG is the Proof Rings design for the real Module 3
identifiers; the old shield is gone.

---

### U2. Correct the caption and confirm citation consistency

**Goal:** Make the image's provenance honest and ensure image/`alt`/title/filename all name
the same real module.

**Requirements:** Done-when "source caption is honest (no claim the live URL serves this
image)"; "image, alt, module title, cited filename all name the same real module and are
true."

**Dependencies:** U1.

**Files:**
- `content/docs/credential-badges/index.mdx` (modify — caption Callout only; do **not** touch
  the anatomy prose).

**Approach:** Replace the source-citation Callout under the image so it no longer presents
`credentials.andamio.io/badges/…` as the origin. State it was rendered from the current
Proof Rings generator and that the public deployment is mid-refresh, reusing the page's
existing mutable-art framing. Confirm the `alt` text, the "Module 3: App Template" title, and
the cited `…<policy_id>.<slt_hash>.svg` filename still match the regenerated file.

**Patterns to follow:** existing `<Callout type="info">` caption style already in the page.

**Test scenarios:**
- The caption makes no claim that the live URL serves the displayed image.
- `alt`, module title, and cited filename all reference Module 3 / `…a045` consistently.
- Test expectation: prose/caption edit — covered by the render check in U3.

**Verification:** Caption is truthful and the citation is internally consistent with the new
image.

---

### U3. Build and visual verification

**Goal:** Confirm the page builds, renders the rings, and nothing regressed.

**Requirements:** Done-when "badge shown is Proof Rings"; "no stale shield art remains."

**Dependencies:** U1, U2.

**Files:** none (verification unit).

**Approach:** Build and view the page; confirm the rings render and the shield is gone.

**Test scenarios:**
- `npm run build` passes; `/docs/credential-badges` renders the new badge (visible rings).
- Page still present in `.content-collections/generated/allDocs.js`.
- `grep -ri "shieldGrad" public/images/credential-badges/` returns nothing.
- Test expectation: none new — this unit is the verification gate.

**Verification:** Clean build; Proof Rings visible on the page; no shield art remains.

---

## Requirements Traceability (follow-up "Done when")

| Follow-up "Done when" | Covered by |
|---|---|
| Badge shown is Proof Rings (visible rings, not shield) | U1, U3 |
| Image, `alt`, title, cited filename name the same real module and are true | U2 |
| No stale shield art remains in `public/images/credential-badges/` | U1, U3 |
| Source caption is honest about provenance | U2, KTD3 |

---

## Risks & Dependencies

- **Generation friction (ESM/tsx/import path).** Importing the landing module into a Node
  script may hit ESM/tsconfig path friction. *Mitigation:* the module is pure and
  zero-coupled (designed to be copied verbatim) — if direct import is awkward, copy the
  `badge/` folder into a scratch dir and run there; last-resort fallback is exporting the SVG
  from the live `BadgeBuilderDemo` in a browser with the real identifiers.
- **Course→palette mapping.** The "correct" per-course palette index isn't pinned in this
  plan. *Mitigation:* match the generator's course→palette rule (`build.py` /
  `BadgeBuilderDemo.tsx`); for a docs sample any valid palette still satisfies "show the
  Proof Rings design," so this is not a blocker.
- **`network` semantics.** `network` may only affect a label/explorer link. *Mitigation:*
  pass `"preprod"` to match the page; verify it doesn't inject a false claim.

**External dependencies:** `landing-page-and-blog` repo (present at a sibling path); optional
`credential-badges/generator/decode.py` for the round-trip integrity check.

---

## Sources & Research

- **Follow-up brief** — verified problem statement, stale-source table, real module/`slt_hash`
  title table, prescribed change.
- **`landing-page-and-blog/src/ui/landing/V2Landing/badge/`** — `buildBadgeSvg` (pure,
  framework-free, self-contained SVG; inverse of `decode.py`), `index.ts`, `README.md`
  (consumption guide), `palettes.ts`, `BadgeBuilderDemo.tsx`.
- **`andamio-docs`** — `public/images/credential-badges/credential-badge-sample.svg`
  (confirmed old shield, md5 `b259aa36…`); `content/docs/credential-badges/index.mdx` (caption
  to fix).
- External research: not run — internal correction against known sources.
