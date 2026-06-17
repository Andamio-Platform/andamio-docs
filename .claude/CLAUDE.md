# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skills System

Specialized tasks are organized into skills located in `.claude/skills/`. Each skill folder contains:
- `SKILL.md` - Instructions for invoking the skill
- Supporting docs - Context and reference materials for the skill

### Available Skills

| Skill | Description | Folder |
|-------|-------------|--------|
| **analyze-transaction** | Parse and document V2 transaction CBORs from Atlas API | `.claude/skills/analyze-transaction/` |
| **transaction-audit** | Orchestrate V2 CBOR analysis, track progress against swagger | `.claude/skills/transaction-audit/` |
| **v2-docs-audit** | Orchestrate V2 MDX documentation coverage and quality | `.claude/skills/v2-docs-audit/` |
| **v2-docs-review** | Review individual V2 transaction MDX for completeness | `.claude/skills/v2-docs-review/` |
| **glossary-game** | Collaborative terminology validation and refinement | `.claude/skills/glossary-game/` |
| **scribe-walkthrough** | Convert Scribe markdown into polished MDX walkthrough pages | `.claude/skills/scribe-walkthrough/` |
| **guide-pipeline** | Track guide writing progress, manage blockers, and publish pipeline | `.claude/skills/guide-pipeline/` |

When working on tasks that match a skill's domain, read the skill's `SKILL.md` for specific instructions and supporting docs for context.

### Documented Solutions

`docs/solutions/` — past problems and their fixes (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`). Relevant when implementing or debugging in documented areas.

## Development Commands

- `npm run dev` - Start development server with Turbo (http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run docs-coverage` - Check documentation coverage across protocol components
- `npm run docs-drift` - Detect stale version pins in developer guides vs devkit/CLI source-of-truth tags (see `.claude/skills/audit-docs/`)

## External API Documentation

Developer-facing API documentation is hosted externally:
- **Production**: https://mainnet.api.andamio.io
- **Preprod**: https://preprod.api.andamio.io

This documentation site focuses on high-level protocol descriptions. When developers are ready to build, they are directed to the live API docs.

## Architecture Overview

This is a Next.js documentation site built with Fumadocs, using content collections for MDX content management.

### Content Management
- **Content Collections**: Uses `@content-collections/core` to manage MDX files in `content/docs/`
- **Document Structure**: Two collections defined in `content-collections.ts`:
  - `docs`: All `.mdx` files for documentation content
  - `meta`: `meta.json` files for navigation and metadata
- **Content Source**: `lib/source.ts` provides the content adapter

### Key Components
- **Layout Configuration**: `app/layout.config.tsx` contains shared layout options including navigation title with Andamio logo

### Route Structure
- `app/(home)/` - Landing page and home routes
- `app/docs/` - Documentation layout and pages
- `app/api/search/` - Search functionality

### Content Organization
- Protocol documentation in `content/docs/protocol/`
- Transaction documentation in `content/docs/protocol/v2/transactions/`
- Validator documentation in `content/docs/protocol/v2/validators/`
- Token documentation in `content/docs/protocol/v2/tokens/`
- The Andamio papers (placeholders, drafts in progress): `content/docs/light-paper.mdx`, `content/docs/andamio-issuer.mdx`, `content/docs/building-on-andamio.mdx`

### Special Features
- Mermaid diagram support via `components/mdx/mermaid.tsx`
- Content collections with MDX transformation and meta schema validation

### Custom MDX Components
The documentation system includes several custom React components for interactive visualizations:

- **`<TransactionDiagram>`** - Renders interactive transaction flow diagrams from YAML files
  - Props: `txFile` (path to YAML), `title`, `description`
  - Example: `<TransactionDiagram txFile="admin/add-course-creators.yaml" />`

- **`<ValidatorDiagram>`** - Renders validator system architecture diagrams
  - Props: `system` (required), `validator` (optional), `title`, `description`
  - Example: `<ValidatorDiagram system="global-state" validator="global-state" />`

- **`<Mermaid>`** - Renders Mermaid diagram syntax
  - Used for flowcharts, sequence diagrams, and other visualizations

- **Other diagram components**: `flywheel-diagram`, `linear-diagram`, `protocol-diagram`

### MDX Gotchas

- **Never use `replace_all` with strings that appear in frontmatter delimiters** (e.g. replacing `--` will corrupt `---` frontmatter fences). Always use targeted edits.
- Content-collections silently drops MDX files with invalid frontmatter — no build error, just a missing page (404). Always verify with `grep 'path/to/file' .content-collections/generated/allDocs.js` after changes.
- Em dash characters (`—`) are fine in MDX content. The issue is always frontmatter or JSX syntax.
- To debug MDX build failures: simplify file to minimal content, then add sections back incrementally.

### MDX Frontmatter Schema
MDX files support custom frontmatter fields defined in `content-collections.ts`:

- **`tx_file`** (string, optional) - Path to transaction YAML file for automatic diagram rendering
  - Example: `tx_file: "admin/add-course-creators.yaml"`

- **`validator_system`** (string, optional) - Validator system identifier
  - Example: `validator_system: "global-state"`

- **`validator_id`** (string or array, optional) - Validator identifier(s)
  - Example: `validator_id: "global-state"` or `validator_id: ["validator-1", "validator-2"]`

### TypeScript Configuration
- **Path aliases**: Use `@/*` to import from project root (e.g., `import { Component } from "@/components/..."`)
- **Content collections**: Auto-generated types available at `content-collections` import path

## Documentation Linking System

Documentation follows standardized URL patterns for predictable linking:

### URL Patterns
- **Transactions**: `/docs/protocol/v2/transactions/<scope>/<role>/<transaction-name>`
- **Tokens**: `/docs/protocol/v2/tokens/<system>/<token-name>`
- **Validators**: `/docs/protocol/v2/validators/<system>/<validator-name>`

### File Organization

```
content/docs/protocol/v2/
├── transactions/          # Organized by scope/role
├── tokens/                # Organized by system
└── validators/            # Organized by system with observers/ subdirectories

public/yaml/transactions/v2/  # V2 YAML files
```

## Glossary and Terminology

For collaborative terminology validation and refinement, see the **glossary-game** skill in `.claude/skills/glossary-game/`.

Key files:
- `docs/reference/GLOSSARY.md` - Team-facing working glossary (can include private sections)
- `content/docs/glossary.mdx` - Public-facing glossary (core concepts only)

## V2 Protocol Documentation

V2 protocol documentation is built by parsing decoded transaction CBORs from the Atlas API. For detailed analysis workflows, see the **analyze-transaction** skill in `.claude/skills/analyze-transaction/`.

### Key Files

**Registry Files** (source of truth):
- `public/yaml/transactions/v2/SESSION-NOTES.md` - Full session context, validator mapping, swagger sync workflow
- `public/yaml/transactions/v2/address-registry.json` - Validators, policies, observers
- `public/yaml/transactions/v2/cost-registry.json` - Fee structures with loop costs
- `public/yaml/transactions/v2/endpoint-registry.json` - API schemas (aligned with swagger)

**Public Docs**:
- `content/docs/protocol/v2/transactions/` - MDX documentation pages

**API Endpoints**:
- `/api/transaction-v2?file=<path>&format=v1` - Get transaction YAML data
- `/api/costs/v2` - Get cost registry

## Andamio Pioneers Session Archival

When processing a new live coding transcript, follow this process:

### 1. Create Session Summary

Create `content/docs/pioneers/live-coding/archive/sessions/session-XXX.mdx` using this template:

```mdx
---
title: "Session #X: [Title]"
description: "[One-line description] - [Date]"
---

# Session #X: [Title]

**Date**: [Month Day, Year]
**Duration**: ~X hour(s)
**Attendees**: [List names]

## Summary
[2-3 sentences describing what happened]

## Key Topics
### 1. [Topic Name]
[Description]

### 2. [Topic Name]
[Description]

## Questions Raised
### [Question]
[Context and current thinking]

## Technical Walkthrough
[Numbered list of what was demoed/built]

## Action Items
[Bullet list from the session]

## Resources
- [Full Transcript](./transcripts/YYYYMMDDHHMM-transcript.md)
- [Other relevant links]

## Next Session
Weekly sessions on Wednesdays at **14:00 UTC** and **20:00 UTC**. Additional spontaneous sessions may happen in the Andamio Network Discord.
```

### 2. Store Raw Transcript

Place raw transcript at `content/docs/pioneers/live-coding/archive/transcripts/YYYYMMDDHHMM-transcript.md`

Filename format: `YYYYMMDDHHMM` = year, month, day, 24hr time (UTC)

### 3. Update Archive Index

Add row to the session summaries table in `content/docs/pioneers/live-coding/archive/index.mdx`:

```markdown
| X | YYYY-MM-DD | [Title](./sessions/session-XXX) | Brief summary |
```

### 4. Update Sessions meta.json

Add new session to `content/docs/pioneers/live-coding/archive/sessions/meta.json`:

```json
{
    "title": "Sessions",
    "pages": [
        "session-001",
        "session-002"  // Add new session
    ]
}
```

### Session Summary Best Practices

**Extract from transcript:**
- Key discussion topics (technical AND philosophical)
- Questions raised but not answered (these are valuable!)
- Action items mentioned
- Technical walkthrough steps
- Attendee names

**Keep it scannable:**
- Summary should be 2-3 sentences max
- Use headers liberally
- Bullet points over paragraphs
- Link to full transcript for details

**Capture the philosophy:**
- Andamio Pioneers explores both technical AND social/philosophical questions
- Questions like "how should AI contributions be tracked?" are feature content, not noise
- The "source of truth" discussion is protocol design, not just UX

## Notion Integration (Soft Launch)

Claude Code now has access to the Andamio Notion workspace via MCP. This enables:
- Reading/writing to the Dev Sprint Board and Epics
- Syncing documentation progress with Product and Ecosystem circles
- Sharing pipeline status with non-technical team members

**Key Notion locations:**
- [Dev Sprint Board](https://www.notion.so/andamio/06d10f28dd394f2bbcd5a4a5be19c07d) — task tracking
- [Projects](https://www.notion.so/andamio/65e009324ad34d13ad345a483d9edcb5) — parent page with Epics, Sprints, OKRs

**To soft-start:**
1. When a guide moves through the pipeline (draft → review → published), consider noting it in Notion
2. Link documentation work to the relevant Epic
3. Share pipeline dashboards with Product/Ecosystem circles as needed

**Coming soon (post-launch):** Automatic sync between guide-tracker.json status and Notion.

## Cross-Repo: Onboarding Guide Pipeline

The `/guide-pipeline` skill in this repo coordinates with the app repo's `/ux-readiness` skill.

**Shared tracker:** `.claude/skills/guide-pipeline/guide-tracker.json` (this repo owns it)

**Pipeline flow:**
1. App repo: `/ux-readiness assess <guide-id>` evaluates routes, writes UX scores here
2. This repo: `/guide-pipeline` gates writing on UX scores — blocked guides can't proceed
3. Guides flow: `not-started` → `draft` → `review` → `published`
4. Issues in app repo tagged `documentation,ux-readiness` track blockers

**Current status:** 1 published (Getting Started), 1 in draft, 8 not started, 9 not yet assessed.

See [Notion: Onboarding Documentation Pipeline](https://www.notion.so/30244d820e1d81468748ee7e6e0511e1) for team-facing overview.

# Important Reminders

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- When a task matches a skill's domain, read the skill's `SKILL.md` first for specialized instructions
- Glossary Game and Concept Game mean the same thing - see `.claude/skills/glossary-game/` for details