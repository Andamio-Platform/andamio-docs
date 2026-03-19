---
title: "Fixed broken directory links in Fumadocs V2 overview page"
date: 2026-03-19
category: integration-issues
problem_type: broken-internal-links
severity: high
module: content/docs/protocol/v2/
symptoms:
  - All "System" column links in Validators, Tokens, and Transactions tables return 404
  - Users unable to navigate from V2 overview to system-level documentation
root_cause:
  - Fumadocs requires index.mdx to resolve directory URLs; system subdirectories had none
  - Transaction links used assumed flat paths that didn't match actual nested file structure
technologies:
  - Fumadocs
  - Next.js
  - MDX
  - content-collections
---

# Broken Directory Links in Fumadocs

## Problem

All "System" column links on the Protocol V2 overview page (`/docs/protocol/v2`) returned 404. Reported by Sebastian Pabon (2026-03-19). Three tables affected: Validators (6 links), Tokens (6 links), and Transactions (1 link + 5 individual transaction links).

## Root Cause

Two distinct issues:

1. **Missing `index.mdx` files.** Fumadocs resolves a directory URL like `/docs/protocol/v2/validators/global-state` only if `content/docs/protocol/v2/validators/global-state/index.mdx` exists. All system subdirectories under `validators/` and `tokens/` had child pages but no `index.mdx`.

2. **Incorrect transaction link paths.** Links in the overview used flat names (e.g., `/transactions/course/teacher/modules-manage`) but actual files used subdirectories (`/transactions/course/teacher/modules/manage.mdx`).

## Solution

### For multi-item systems: create `index.mdx` landing pages

Systems with 3+ child pages get a minimal `index.mdx` that lists children:

```mdx
---
title: "Global State Validators"
description: "Core protocol state management validators"
---

# Global State Validators

Core protocol state management:

- [Global State](/docs/protocol/v2/validators/global-state/global-state) - V1 compatibility validator
- [Global State V2](/docs/protocol/v2/validators/global-state/global-state-v2) - Enhanced V2 state management
```

7 files created: `validators/{global-state, index-validators, instance, course, project}/index.mdx` and `tokens/global-state/index.mdx`.

### For single-item systems: direct-link the child page

Systems with only 1 child page don't need a landing page. Change the overview link to point directly to the child:

```markdown
<!-- Before (broken — directory has no index.mdx) -->
| [Global](/docs/protocol/v2/tokens/global) | local-state-registration |

<!-- After (works — points to actual page) -->
| [Global](/docs/protocol/v2/tokens/global/local-state-registration) | local-state-registration |
```

5 links updated: `validators/global`, `tokens/{global, local-state, instance, course, project}`.

### Fix transaction link paths

6 links corrected to match actual file structure:

| Old path | Actual path |
|----------|-------------|
| `transactions/general` | `transactions/global/general/access-token/mint` |
| `course/teacher/modules-manage` | `course/teacher/modules/manage` |
| `course/teacher/assignments-assess` | `course/teacher/assignments/assess` |
| `course/student/assignment-update` | `course/student/assignment/update` |
| `course/student/credential-claim` | `course/student/credential/claim` |

### Remove links to non-existent pages

The migration link (`/transactions/user/move-global-state-v1-to-v2`) pointed to a directory that doesn't exist. Removed the link, kept the text.

## Key Decision

**Don't create `index.mdx` for single-child directories.** A landing page that says "here is the one thing in this folder" adds a click for no navigational value. Direct-link instead. This reduced 12 potential new files to 7.

## Prevention Strategies

1. **Verify file paths before writing links.** The URL pattern is derived from file structure — always check `ls` before linking. Don't assume URL structure matches your mental model.

2. **Treat MDX + `meta.json` as atomic.** When adding a new content directory, create both the `index.mdx` and the `meta.json` entry in the same commit. (See also: `docs/solutions/integration-issues/nextjs-fumadocs-pdf-static-asset-serving.md`)

3. **Use `npm run build` to catch broken routes.** Fumadocs build will succeed even with broken links, but the page count in build output reveals missing pages. Compare expected vs actual page count.

4. **For placeholder content, keep text but remove link syntax.** If a page doesn't exist yet, don't link to it. Use plain text until the target page is created.

## Checklist: Adding a New Content Section

- [ ] Create directory with `index.mdx` (if multi-item) or plan to direct-link (if single-item)
- [ ] Add entry to parent `meta.json`
- [ ] Verify all internal links point to existing files
- [ ] Run `npm run build` and verify page count
- [ ] Check dev server: page renders, appears in sidebar

## Related

- `docs/solutions/integration-issues/nextjs-fumadocs-pdf-static-asset-serving.md` — MDX + meta.json atomicity pattern
- Bug report: Sebastian Pabon (Discord, 2026-03-19)
- File modified: `content/docs/protocol/v2/index.mdx`
