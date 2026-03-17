---
title: "Add security audit report PDF and documentation page to Andamio docs"
date: 2026-03-17
category: integration-issues
tags:
  - documentation
  - pdf-serving
  - fumadocs
  - mdx
  - navigation
  - security-audit
  - public-assets
severity: medium
component: content/docs/protocol/v2
symptom: "No security audit report published on docs site; external partners unable to verify audit status for institutional evaluation"
root_cause: "Audit report existed in separate repo but had no public-facing documentation page or download path on the docs site"
resolution_time: "30m"
confidence: high
---

# Publishing a PDF Document on a Fumadocs Site

## Problem

GitHub Issue [#12](https://github.com/Andamio-Platform/andamio-docs/issues/12): The TxPipe V2 smart contract audit report needed to be published on the Andamio docs site. External partners (Intersect OSC) required it for institutional evaluation before treasury management (~600k ADA). The docs site had:

- No existing pattern for serving PDF documents
- No security/audit section in the V2 protocol docs
- Stale glossary text saying V2 was "currently in audit"

## Root Cause

The audit report PDF existed in the `andamio-pioneers-cohort-001` repo but had never been integrated into the public documentation site. No `public/documents/` directory or PDF serving convention existed.

## Solution

Four coordinated changes:

### 1. Establish PDF serving pattern

Created `public/documents/` and placed the PDF there (532KB). Served as a static asset at `/documents/andamio-v2-audit.pdf`.

This is the first PDF in the repo. `public/documents/` is now the canonical location for downloadable documents, distinct from `public/yaml/` (structured data) and `public/images/` (visual assets).

### 2. Create MDX documentation page

`content/docs/protocol/v2/security-audit.mdx` with:
- Frontmatter (`title`, `description`)
- Audit summary (who, when, what)
- Download link using raw HTML for new-tab behavior
- Scope description of the two validator sets
- Findings table (6 findings by severity)

### 3. Update navigation

Added `"security-audit"` to the end of the pages array in `content/docs/protocol/v2/meta.json`.

### 4. Fix stale glossary text

Changed "currently in audit" to `[independently audited](/docs/protocol/v2/security-audit) by TxPipe` in `content/docs/glossary.mdx`.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Placed audit at end of V2 sidebar | Reference/assurance content, not part of core learning path |
| Inline findings table in MDX | PDFs are opaque to site search and AI agents; inline table makes audit results discoverable |
| `public/documents/` not `public/audit/` | General-purpose directory supports future PDFs (whitepapers, compliance docs) |
| Raw HTML `<a>` tag for download link | MDX markdown links don't support `target="_blank"` |

## Code Examples

**PDF download link in MDX** (raw HTML needed for new-tab):

```html
<a href="/documents/andamio-v2-audit.pdf" target="_blank" rel="noopener noreferrer">
  **Download Audit Report (PDF)**
</a>
```

**Navigation entry** (append to `meta.json` pages array):

```json
{
  "pages": ["...existing entries...", "security-audit"]
}
```

**Glossary status update** (replace stale temporal language with link):

```markdown
[independently audited](/docs/protocol/v2/security-audit) by TxPipe
```

## Prevention Strategies

### Stale Status Text

Prose like "currently in audit" becomes incorrect silently. After any milestone completes, grep content for related temporal language:

```bash
grep -r "currently\|in progress\|coming soon\|planned" content/docs/
```

Prefer evergreen phrasing: "Audited by TxPipe in 2025" over "currently being audited."

### Orphaned Pages (No Navigation Entry)

Treat MDX file creation and `meta.json` update as an atomic pair. After adding a page, verify it appears in the dev server sidebar before considering the task done.

### Cross-Reference Drift

After adding a new section, grep for sibling section names to find pages that enumerate sections and may need updating. The glossary is a frequent cross-reference target.

## Checklist for Adding New Doc Sections

1. Create MDX file with complete frontmatter (`title`, `description`)
2. Update parent `meta.json` with new page slug
3. Grep `content/docs/` for related terms that may need cross-reference updates
4. Fix any stale status text (temporal language about the topic)
5. Place downloadable assets in `public/documents/`
6. Write an inline summary for any linked PDF (for search and agent accessibility)
7. Use raw `<a>` tags for links needing `target="_blank"`
8. Match sibling page style (H1 usage, frontmatter fields, components)
9. Verify in dev server: page renders, appears in nav, assets download

## Related

- **PR:** [#13 — Add TxPipe V2 smart contract security audit report](https://github.com/Andamio-Platform/andamio-docs/pull/13)
- **Issue:** [#12 — Add TxPipe smart contract audit report to docs](https://github.com/Andamio-Platform/andamio-docs/issues/12)
- **Plan:** `docs/plans/2026-03-17-feat-publish-txpipe-audit-report-plan.md`
- **Architecture ref:** `.claude/CLAUDE.md` (content organization, URL patterns)
- **Similar pattern:** `docs/plans/2026-03-13-feat-txsm-architecture-patterns-plan.md` (adding new content sections)
