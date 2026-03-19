---
title: "Fix broken System column links on Protocol V2 overview page"
type: fix
status: active
date: 2026-03-19
---

# Fix broken System column links on Protocol V2 overview page

Reported by Sebastian Pabon. All "System" column links in the Validators, Tokens, and Transactions tables on `/docs/protocol/v2` are broken (404).

## Root Cause

Fumadocs requires an `index.mdx` to resolve a directory URL. None of the system subdirectories under `validators/` or `tokens/` have one. Separately, several transaction links in `index.mdx` use paths that don't match the actual file structure.

## Acceptance Criteria

- [ ] All 6 Validator system links resolve
- [ ] All 6 Token system links resolve
- [ ] All transaction links on the page resolve
- [ ] `npm run build` passes with no broken links

## Fix 1: Create 12 `index.mdx` files

Create a minimal `index.mdx` in each system subdirectory as a landing page. Existing `meta.json` files in `validators/` and `tokens/` already reference these subdirectories — no `meta.json` changes needed.

### Validators — 6 files

| Directory | Child pages |
|-----------|-------------|
| `validators/global-state/` | global-state, global-state-v2 |
| `validators/global/` | local-state-registration |
| `validators/index-validators/` | index-scripts, index-ref |
| `validators/instance/` | instance-scripts, instance-provider-scripts, instance-governance-scripts |
| `validators/course/` | course-state-v2-validator, course-state-v2-scripts, assignment-validator, module-ref-validator + observers |
| `validators/project/` | contributor-state-v2-scripts, escrow1, treasury-scripts + observers |

### Tokens — 6 files

| Directory | Child pages |
|-----------|-------------|
| `tokens/global-state/` | access-token-user, access-token-global-state, access-token-index |
| `tokens/global/` | local-state-registration |
| `tokens/local-state/` | local-state-nft |
| `tokens/instance/` | instance-admin-token |
| `tokens/course/` | course-state-v2-token |
| `tokens/project/` | contributor-state-v2-token |

## Fix 2: Rewrite broken links in `index.mdx`

All changes are in `content/docs/protocol/v2/index.mdx`:

| Line | Current link | Correct link |
|------|-------------|--------------|
| 61 | `/docs/protocol/v2/transactions/general` | `/docs/protocol/v2/transactions/global/general/access-token/mint` |
| 61 | `/docs/protocol/v2/transactions/general/mint-access-token` | `/docs/protocol/v2/transactions/global/general/access-token/mint` |
| 63 | `/docs/protocol/v2/transactions/course/teacher/modules-manage` | `/docs/protocol/v2/transactions/course/teacher/modules/manage` |
| 63 | `/docs/protocol/v2/transactions/course/teacher/assignments-assess` | `/docs/protocol/v2/transactions/course/teacher/assignments/assess` |
| 64 | `/docs/protocol/v2/transactions/course/student/assignment-update` | `/docs/protocol/v2/transactions/course/student/assignment/update` |
| 64 | `/docs/protocol/v2/transactions/course/student/credential-claim` | `/docs/protocol/v2/transactions/course/student/credential/claim` |
| 83 | `/docs/protocol/v2/transactions/user/move-global-state-v1-to-v2` | Remove link, keep text (page doesn't exist yet) |

## Implementation Checklist

1. Create 12 `index.mdx` files (6 validators + 6 tokens)
2. Rewrite 6 transaction links in `index.mdx` to correct paths
3. Remove migration link on line 83, keep the text
4. Run `npm run build` to verify

## Sources

- Bug report: Sebastian Pabon (Discord, 2026-03-19)
- File: `content/docs/protocol/v2/index.mdx`
- Past learning: `docs/solutions/integration-issues/nextjs-fumadocs-pdf-static-asset-serving.md` — MDX + `meta.json` must be atomic
