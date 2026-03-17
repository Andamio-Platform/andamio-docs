---
title: "Publish TxPipe Smart Contract Audit Report"
type: feat
status: completed
date: 2026-03-17
---

# Publish TxPipe Smart Contract Audit Report

Resolves [#12](https://github.com/andamio-platform/andamio-docs/issues/12). The TxPipe V2 smart contract audit is complete and the report PDF needs to be published on the docs site. External partners (Intersect OSC — Ryan, Matt Davis) need this for institutional evaluation of Andamio's smart contract security before treasury management (~600k ADA).

## Acceptance Criteria

- [x] Audit PDF served from the docs site at a stable URL
- [x] New "Security Audit" page under Protocol V2 section with summary and download link
- [x] Navigation updated — audit page appears in V2 sidebar
- [x] Glossary updated — V2 description changed from "currently in audit" to reflecting completion
- [ ] Issue #12 closed

## Implementation

### 1. Copy PDF to public assets

Source: `~/projects/01-projects/andamio-pioneers-cohort-001/andamio-v2-audit.pdf`
Destination: `public/documents/andamio-v2-audit.pdf`

This establishes `public/documents/` as the pattern for serving PDF documents (no precedent exists in this repo).

### 2. Create MDX page

`content/docs/protocol/v2/security-audit.mdx`

Frontmatter and content should include:
- Title: "Security Audit"
- Description referencing TxPipe as the auditor
- Brief summary of what was audited (V2 smart contracts/validators)
- Download link to `/documents/andamio-v2-audit.pdf`
- Context on why the audit matters (institutional adoption, treasury management)

### 3. Update V2 navigation

`content/docs/protocol/v2/meta.json` — add `"security-audit"` to the pages array. Place it after `"on-chain-reconstruction"` or at the end of the list, depending on desired reading order.

### 4. Update glossary

`content/docs/glossary.mdx` line ~111 — change "currently in audit" to reflect that the audit is complete, with a link to the new security audit page.

## Context

- **No existing PDF pattern** — this is the first PDF served from the docs site
- **No TxPipe references** exist anywhere in the codebase currently
- The `v2-docs-audit` skill is about documentation coverage, not security audits — unrelated

## Sources

- GitHub Issue: [#12 — Add TxPipe smart contract audit report to docs](https://github.com/andamio-platform/andamio-docs/issues/12)
- PDF location: `andamio-pioneers-cohort-001/andamio-v2-audit.pdf`
- Navigation config: `content/docs/protocol/v2/meta.json`
- Glossary: `content/docs/glossary.mdx:111`
