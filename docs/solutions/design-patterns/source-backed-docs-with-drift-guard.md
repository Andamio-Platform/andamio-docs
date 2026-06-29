---
title: Source-backed documentation with a prebuild drift guard
date: 2026-06-29
category: design-patterns
module: docs/protocol/v2 (Surface 2 validators)
problem_type: design_pattern
component: documentation
severity: medium
applies_when:
  - "A docs page must mirror a source-of-truth artifact (compiled blueprint, schema, registry) that lives outside the page"
  - "Machine-derivable facts must be combined with hand-curated annotations on one page"
  - "The page must not silently drift when the source changes"
tags: [drift-guard, code-generation, prebuild, content-collections, source-of-truth, fumadocs]
related_components: [tooling]
---

# Source-backed documentation with a prebuild drift guard

## Context

Auto-generated reference docs rot the moment their source moves. The V2 `validators/` + `tokens/` trees were a 2025 auto-gen experiment of ~40 hand-transcribed stubs that had drifted out of sync with the deployed contracts — nobody could trust them. The redesign needed a single Validators page that **cannot** drift: its authoritative facts (validator names, the redeemer actions each authorizes) come straight from the compiled Aiken blueprint (`plutus.json`), while its human context (which layer a validator belongs to, a one-line purpose, the token it governs) is hand-written.

The repo already had the right precedent in `scripts/check-contract-manifest.ts`: a `prebuild` guard that asserts the hardcoded script hashes in a page still exist in the source-of-truth `params.yaml`, failing `next build` on drift.

## Guidance

Split the page's data into **machine-derived** and **curated**, generate a typed data module from both, render the page from that module, and add a build-time guard that re-runs the generation and compares.

1. **Vendor the source, pinned.** Copy the external source-of-truth artifact into the repo at a recorded git rev rather than pulling it live cross-repo. Record the rev and the re-vendor procedure next to it (`public/yaml/contracts/{plutus.json, PINNED-REV.md}`). "Regenerates on change" means *re-vendor + re-run the generator + commit the diff* — a deliberate, reviewable step, not a fragile build-time dependency on a sibling repo.
2. **Generate, don't hand-transcribe.** A script (`scripts/generate-validators.mjs`) extracts the machine skeleton (here: `validators[].title` → name; `redeemer.schema.$ref` → `definitions[].anyOf[].title` → action list) and **joins** it with a separate curated annotations file. The join is a contract: it fails loudly if a curated key has no machine match or vice versa. Output is a typed data module (`components/protocol/validators-data.ts`) the MDX page imports directly.
3. **Guard at prebuild.** Wire a guard (`scripts/check-validators-manifest.ts`) into the `prebuild` npm script so drift fails `next build` locally and in CI.

## Why This Matters

The non-obvious failure: **a guard that only checks the machine-derived fields is a half-guard.** The first version of our drift guard compared only ids + action lists against the blueprint. That left every curated field (layer, purpose, governed-token) unprotected — a stale edit to an annotation, or a hand-edit of the generated module, would ship green. Worse, an out-of-range `layer` value would make the page's `VALIDATORS.filter(v => v.layer === layer)` match nothing and that validator would **silently vanish** from the rendered page, with no build error.

The fix is to make the guard re-run the *entire* generation pipeline (extract skeleton → load annotations → join) and deep-compare every field of the freshly-joined result against the committed data module. The guard then trusts exactly what the build trusts. This is strictly stronger and catches all three drift vectors: un-regenerated source, stale curated edits, and direct hand-edits of the generated file.

Also harden the extractor: if any item resolves to an **empty** machine-derived value (e.g. a redeemer schema shape the extractor doesn't recognize after a future re-vendor), throw rather than emitting an empty list — otherwise the guard compares `"" === ""` and ships wrong content green.

## When to Apply

- A page restates facts owned by a compiled artifact, schema, swagger, or registry that lives outside the page.
- You want curated prose *and* generated accuracy on the same page.
- Reach for it instead of hand-transcribing source values into prose (which silently rots) or embedding raw source the reader can't parse.

## Examples

Half-guard vs full guard:

```ts
// HALF-GUARD (ships stale curated fields + can silently drop a validator):
const dataById = new Map(VALIDATORS.map(v => [v.id, v.actions]));
// ...only compares ids + actions against the blueprint skeleton

// FULL GUARD — re-run the whole pipeline the build trusts, deep-compare every field:
const skeleton = extractSkeleton(blueprint);          // throws on zero-action shapes
const annotations = loadAnnotations(ANNOTATIONS_PATH);
const expected = joinValidators(skeleton, annotations); // throws on bad layer / missing field
// compare expected[] vs committed VALIDATORS[] on id, name, layer, purpose, governs, actions
```

Tested guardrails (all confirmed to fail `next build`, then pass once reverted):
- a curated `purpose` edited in the generated module but not regenerated → drift caught;
- an annotation `layer` set outside the allowed set → join throws;
- a validator that would extract to zero actions → extractor throws.

## Related

- `scripts/check-contract-manifest.ts` — the one-directional precedent this generalizes (a contract-manifest page guarded against `params.yaml`).
- [Retiring a large docs tree in Fumadocs](../workflow-issues/fumadocs-doc-tree-retirement-redirects.md) — the broader redesign this pattern shipped in (PR #45).
