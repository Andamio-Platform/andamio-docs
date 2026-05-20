# audit-docs

Drift detector for the public developer-facing surface of `andamio-docs`.

## What this is

A small Bash script that surfaces stale version pins in MDX by comparing them
against authoritative sources:

- **Gateway tag** ← `devkit/VERSIONS` (`GATEWAY_TAG`)
- **CLI tag**     ← latest git tag in `andamio-cli`

Output is a Markdown checklist. The script is informational by default; pass
`--strict` to make it exit non-zero on drift (e.g., for CI).

## Scope

Deliberately narrow — only the developer-facing surface this repo owns:

| Included | Excluded |
|---|---|
| `content/docs/guides/developers/**` | `content/docs/protocol/v2/transactions/**` (owned by `/v2-docs-audit`, `/transaction-audit`) |
| `content/docs/protocol/v2/state-machine/**` | `content/docs/protocol/v2/validators/**` |
| `content/docs/getting-started.mdx` | `content/docs/protocol/v2/tokens/**` |
| `content/docs/reference/**` | `content/docs/pioneers/**` |
| | `whats-new.mdx`, `glossary.mdx` |

Internal services (`db-api`, `atlas`, `andamioscan`, `sidecar`) are intentionally
out of scope — only `GATEWAY_TAG` and CLI tags are consulted.

## Usage

```bash
.claude/skills/audit-docs/detect-drift.sh           # informational
.claude/skills/audit-docs/detect-drift.sh --strict  # CI mode
```

Override repo paths via env vars when not running from defaults:

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
- When a `devkit/docs/releases/vX.Y/RELEASE_REPORT.md` is being finalized
- Before publishing a `/guide-pipeline` status update
- Quarterly, as a fallback audit

See `docs/solutions/workflow-issues/docs-release-sync-drift-2026-05-20.md` for
the full rationale and the Layer 1 / Layer 2 / Layer 3 implementation order
this script is the Layer 2 piece of.

## Future work

- Layer 1: a devkit-side hook that emits a `PUBLIC_DOCS_DELTA.md` checklist
  from `RELEASE_REPORT.md` at release finalization time.
- Layer 3: a quarterly `/audit-docs` skill that diffs devkit `plans/`,
  `notes/`, and `tx-flows/` against current MDX (this directory is the
  natural home).
