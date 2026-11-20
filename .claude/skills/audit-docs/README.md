# audit-docs

Drift detector for the public developer-facing surface of `andamio-docs`.

## What this is

A small Bash script that surfaces stale version pins in MDX by comparing them
against authoritative sources:

- **Gateway tag** ← the dev-kit's version pins (`GATEWAY_TAG` in its `VERSIONS` file)
- **CLI tag**     ← latest git tag in an `andamio-cli` checkout

Output is a Markdown checklist. The script is informational by default; pass
`--strict` to make it exit non-zero on drift (e.g., for CI).

## Scope

Deliberately narrow — only the developer-facing surface this repo owns:

| Included | Excluded |
|---|---|
| `content/docs/(developer)/api/guides/**` | `content/docs/developer-community/pioneers/**` |
| `content/docs/(developer)/api/getting-started.mdx` | `glossary.mdx` |
| `content/docs/(developer)/api/reference/**` | |

Internal services' version pins are intentionally out of scope — only
`GATEWAY_TAG` and CLI tags are consulted.

## Usage

```bash
.claude/skills/audit-docs/detect-drift.sh           # informational
.claude/skills/audit-docs/detect-drift.sh --strict  # CI mode
```

Both source paths are optional env vars:

- `DEVKIT_REPO` — a dev-kit checkout holding `VERSIONS`. Unset or unreadable:
  the gateway-tag check is skipped.
- `CLI_REPO` — an `andamio-cli` git checkout. Unset or not a git checkout: the
  CLI check is skipped.

Each skipped check prints a warning (to stderr and in the report); the exit
code stays 0 unless `--strict` finds drift.

```bash
DEVKIT_REPO=/path/to/devkit \
CLI_REPO=/path/to/cli \
.claude/skills/audit-docs/detect-drift.sh
```

## Allowlist

Add intentional historical references to `.drift-allowlist` (one literal
substring per line, `#` comments allowed). The script skips any finding whose
`relative/path:line:match` string contains an allowlist entry.

## When to run

- After a sibling repo cuts a tag bump crossing a minor version
- When a platform release report is being finalized
- Before publishing a `/guide-pipeline` status update
- Quarterly, as a fallback audit

See `docs/solutions/workflow-issues/docs-release-sync-drift-2026-05-20.md` for
the full rationale and the Layer 1 / Layer 2 / Layer 3 implementation order
this script is the Layer 2 piece of.

## Future work

- Layer 1: a release-side hook that emits a public-docs delta checklist
  from the release report at release finalization time.
- Layer 3: a quarterly `/audit-docs` skill that diffs the platform's
  release notes and transaction-flow docs against current MDX (this
  directory is the natural home).
