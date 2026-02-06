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

When working on tasks that match a skill's domain, read the skill's `SKILL.md` for specific instructions and supporting docs for context.

## Development Commands

- `npm run dev` - Start development server with Turbo (http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run docs-coverage` - Check documentation coverage across protocol components

## External API Documentation

Developer-facing API documentation is hosted externally:
- **Production**: https://api.andamio.io
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
- Transaction documentation in `content/docs/protocol/v1/transactions/`
- Validator documentation in `content/docs/protocol/v1/validators/`
- Token documentation in `content/docs/protocol/v1/tokens/`
- Whitepaper content in `content/docs/whitepaper/`

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

## Validator Documentation System

The `diagrams/graphviz/generate/` directory contains a comprehensive validator and transaction documentation system:

### Registry System
- **`yaml/validator-registry-v1.yaml`**: Central source of truth for all validators and redeemers
  - Maps validators to their script purposes (spend/mint/withdraw/cert/reward)
  - Defines redeemer types and their associated actions
  - Links transactions to specific validator actions

### Validator Documentation
- **`yaml/validators/`**: Individual YAML files for each validator (24 total)
  - Each file includes: validator name, blueprint source, script purpose, and redeemers
  - Script purposes are sourced from blueprint analysis of `../andamio-atlas-api/blueprints/`
  - Validator names follow `underscore_case` convention

### Transaction Documentation  
- **`yaml/transactions/`**: Individual YAML files for each transaction type (28 total)
  - UTxOs with redeemers are mapped to their corresponding validators
  - Address field format: `address: "<validator-name>"` (not "string")
  - Redeemer titles follow registry format: `ValidatorAction.SpecificAction`

### Key Validator Mappings
- **Assignment operations** → `Assignment_Validator` (AssignmentDecisionAction: Accept/Reject/Update)
- **Treasury operations** → `treasury_scripts` (TreasuryAction: AddFunds/CommitProject/GetRewards/ManageTreasury)
- **Global state operations** → `global_state` (GlobalStateAction: AddTokenInformation/UpdateTokenInformation/AddAllowedCsTn/UpdateGlobalInfo/ChangeIndexData)
- **Course state operations** → `course_state_scripts`
- **Observer operations** → corresponding `*_cbor_obs` validators

### Blueprint Integration
Script purposes are derived from blueprint files in `../andamio-atlas-api/blueprints/`:
- `course.plutus`, `global.plutus`, `index.plutus`, `instance.plutus`, `project.plutus`
- Blueprint analysis shows parameter purposes that determine validator functionality
- All redeemer purposes are "spend" but parameter purposes vary (spend/mint/withdraw)

### Maintenance Notes
- When updating validators, always sync validator-registry-v1.yaml first as source of truth
- Transaction files should reference validators by exact name from registry
- Blueprint changes in andamio-atlas-api should trigger purpose updates here
- Validator documentation system enables automated diagram generation

## Diagram Asset Management

All diagram images in `public/diagrams/` have corresponding MDX documentation files. Image references follow this pattern:
- Transaction diagrams: `/diagrams/transactions/{transaction-name}.png`
- Validator diagrams: `/diagrams/validators/{validator-name}.png`

**IMPORTANT**: When checking diagram references, verify exact filename matches between `public/diagrams/` and MDX files. Common errors include:
- Using dots instead of dashes in filenames (e.g., `course-creator-accept.assignment.png` should be `course-creator-accept-assignment.png`)
- Mismatched transaction/validator names between YAML sources and generated images

## V1 Transaction Documentation

V1 transaction YAML files use a dot notation system to reference tokens and validators. For detailed patterns and audit workflows, see the **transaction-audit** skill in `.claude/skills/transaction-audit/`.

Key files:
- `public/yaml/validator-registry-v1.yaml` - Central source of truth for validators and tokens
- `public/yaml/transactions/` - Transaction YAML files organized by role

## Documentation Linking System

Documentation follows standardized URL patterns for predictable linking:

### URL Patterns
- **Transactions**: `/docs/protocol/v1/transactions/<role>/<transaction-name>`
- **Tokens**: `/docs/protocol/v1/tokens/<system>/<token-name>`
- **Validators**: `/docs/protocol/v1/validators/<system>/<validator-name>`

### File Organization

```
content/docs/protocol/v1/
├── transactions/          # Organized by role (admin/, contributor/, student/, etc.)
├── tokens/                # Organized by system (global-state/, course/, project/, etc.)
└── validators/            # Organized by system with observers/ subdirectories

public/yaml/transactions/  # V1 YAML files organized by role
```

### Registry-Based Links

The validator registry (`public/yaml/validator-registry-v1.yaml`) contains:
- `doc` fields mapping validators to documentation paths
- Token usage tracking (`minted-in`, `used-in`, `referenced-in`, `burned-in`)

For detailed token reference patterns and registry management, see the **transaction-audit** skill.

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

# Important Reminders

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- When a task matches a skill's domain, read the skill's `SKILL.md` first for specialized instructions
- Glossary Game and Concept Game mean the same thing - see `.claude/skills/glossary-game/` for details