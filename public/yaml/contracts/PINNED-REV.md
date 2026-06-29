# Vendored blueprint: `plutus.json`

`plutus.json` in this directory is a **verbatim copy** of the compiled Aiken
blueprint from the Andamio on-chain contracts repository. It is the source of
truth for the source-backed Validators page (Surface 2) — the validator names
and their authorized actions are extracted mechanically from this file by
`scripts/generate-validators.mjs`.

## Source

| Field | Value |
|-------|-------|
| Source repo | `andamio-protocol/andamio-aiken-contracts` |
| Pinned rev | `351b267` (commit "fix contributor state") |
| Source path | `plutus.json` (repo root) |
| Date vendored | 2026-06-29 |

## Why it is pinned (vendored, not a live cross-repo pull)

The on-chain code this blueprint describes is **immutable and deployed** — once
contracts are compiled and deployed to the chain, that bytecode does not change.
So a pinned copy is *current* by definition until the contracts are redeployed.

Generating from a vendored copy (rather than reaching into a sibling repo at
build time) is a deliberate decision (KTD-1):

- No fragile build-time dependency on another repo's working tree or git state.
- The blueprint we generate from is reviewable in this repo's own diffs.
- It matches the repo's existing source-data pattern (e.g.
  `scripts/generate-v2-tx-docs.mjs` reads vendored `public/yaml/` data).

A live `andamio-aiken-contracts` → `andamio-docs` sync is intentionally deferred
follow-up work.

## Re-vendor procedure

Do this only when the contracts are **redeployed** (the blueprint changes):

1. Check out `andamio-protocol/andamio-aiken-contracts` at the new rev.
2. Re-copy the file verbatim:
   ```sh
   cp /path/to/andamio-aiken-contracts/plutus.json \
      public/yaml/contracts/plutus.json
   ```
3. Update the **Pinned rev** and **Date vendored** rows in the table above.
4. Re-run the generator:
   ```sh
   npm run docs-validators
   ```
5. Review and commit the diff (the vendored blueprint + any regenerated
   validators data). The `prebuild` drift guard will fail the build if the
   curated validators data diverges from the new blueprint, so a mismatch is
   caught before publish.
