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
- `npm run generate-api-docs` - Generate API documentation from OpenAPI schema (legacy, uses express-openapi.yaml)
- `npm run generate-all-api-docs` - Generate Andamio API Gateway documentation
- `npm run generate-andamioscan-docs` - Generate Andamioscan indexer API documentation
- `npm run build-all-docs` - **Pull all APIs and regenerate all documentation** (recommended)
- `npm run docs-coverage` - Check documentation coverage across protocol components

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ANDAMIO_GATEWAY_URL` | Andamio API Gateway URL | `https://dev-api.andamio.io` |
| `NEXT_PUBLIC_ANDAMIOSCAN_URL` | Andamioscan Indexer URL | `https://preprod.andamioscan.io` |

These variables configure the API proxy for interactive documentation testing. The proxy route (`app/api/proxy/route.ts`) uses these to allow cross-origin requests to Andamio APIs.

## Swagger/OpenAPI Documentation Workflow

### Andamio API Gateway Schema
- **Live API Docs**: https://dev-api.andamio.io/api/v1/docs/index.html
- **Schema Endpoint**: https://dev-api.andamio.io/api/v1/docs/doc.json
- **Local Schema**: `/data/andamio-api-gateway.json`
- **Environment**: Dev (as of January 2026)

### Recent Major Changes (October 2024)

**API Restructuring - Migration to Dev:**
- **Endpoint Count**: 113 endpoints (as of January 2026)
- **Host Change**: Migrated to dev-api.andamio.io
- **Atlas TX Builder API Removed**: All `/atlas-tx-builder/` endpoints have been removed from the API Gateway
  - Previously included: ~77 endpoints across 8 categories (contributor, course-creator, general, instance-admin, project-creator, staking-admin, student, user)
  - Transaction builder functionality moved or consolidated elsewhere
- **Remaining APIs**: Authentication, API Key, User, Health, Metrics, General, Node Backend API, Platform API
- **Admin Endpoints**: Now tagged as "Admin" + category (e.g., "Admin, General", "Admin, Health")
- **Node Backend TX Endpoints**: Transaction endpoints for instance admin operations remain at `/node-backend-api/tx/admin/`

**Documentation Impact:**
- Deleted `content/docs/api/atlas-tx-builder/` and `content/docs/api/atlas-tx-builder-api/` directories
- Updated all API Gateway URLs to dev endpoints
- Generated MDX file count: ~113 files

### Complete Workflow
1. **Pull Latest Schema**:
   ```bash
   curl -s https://dev-api.andamio.io/api/v1/docs/doc.json -o data/andamio-api-gateway.json
   ```

2. **Generate Documentation**:
   ```bash
   npm run generate-all-api-docs
   ```
   This will:
   - Convert Swagger 2.0 to OpenAPI 3.0 (saves to `data/andamio-api-gateway-openapi.json`)
   - **Add `servers` field** to OpenAPI schema pointing to API Gateway URL
   - Generate ~113 MDX files (initially flat in `content/docs/api/`)

3. **Organize Documentation**:
   ```bash
   node scripts/organize-api-docs.mjs
   node scripts/add-tags-to-mdx.mjs
   ```
   This will:
   - Create nested directory structure based on OpenAPI tags
   - Move MDX files to appropriate subdirectories
   - Add tags to frontmatter of each MDX file
   - Generate `meta.json` files for each directory
   - Update root `meta.json` with top-level directories
   - Copy OpenAPI schema to `/public/data/` for browser access

4. **Hide Internal Directories**:
   Edit `content/docs/api/meta.json` and remove these from the `pages` array:
   - `admin` - Admin-only endpoints
   - `api-key` - Internal API key management
   - `auth` - Internal auth endpoints
   - `user` - User account/usage endpoints

   Keep only: `apikey`, `authentication`, `courses-(merged)`, `db-api`, `projects-(merged)`, `tx-api`, `tx-state-machine`

5. **Review Output**:
   - Check organized directory structure in `content/docs/api/`
   - Verify hidden directories removed from `meta.json`
   - Nested directories follow tag hierarchy based on OpenAPI tags
   - Each file references `data/andamio-api-gateway-openapi.json` for live rendering

6. **Commit Changes**:
   - Commit raw schema, converted OpenAPI 3.0 file, and all generated/organized docs

### File Locations
- **Raw Schemas**:
  - `/data/andamio-api-gateway.json` (Andamio API Gateway - Swagger 2.0, source)
  - `/data/andamio-api-gateway-openapi.json` (Auto-generated OpenAPI 3.0 conversion)
  - `/data/express-openapi.yaml` (Legacy API schema)
  - `/data/example-swagger.json` (Example API schema)
- **Generated Docs**:
  - `/content/docs/api/` (Andamio API Gateway docs - ~75 MDX files)
- **Generation Scripts**:
  - `scripts/generate-all-api-docs.mjs` (Main script - generates flat MDX files from schema)
  - `scripts/organize-api-docs.mjs` (Organization script - creates directory structure based on tags)
  - `scripts/generate-api-docs.mjs` (Legacy script - single API)
  - `scripts/convert-swagger-to-openapi.mjs` (Standalone converter)
- **OpenAPI Integration**:
  - `app/api/proxy/` - OpenAPI proxy for live API documentation
  - `lib/source.ts` - Content source with OpenAPI integration

### Configuration
API generation is configured in `scripts/generate-all-api-docs.mjs`:
```javascript
const API_CONFIGS = [
  {
    input: './data/andamio-api-gateway.json',
    output: './content/docs/api',
    isOpenAPI: false, // Swagger 2.0, needs conversion
  },
  // ... other configs
];
```

### Directory Organization
API docs are organized by OpenAPI tags into nested directories:
- Single tag → top-level directory (e.g., `admin/`, `health/`)
- Multiple tags → nested directories (e.g., `atlas-tx-builder-api/atlas-instance-admin/atlas-self-service/`)
- Tag names converted to kebab-case for directory names
- Each directory contains `meta.json` with title and `pages: ['...']` for auto-discovery

### Hidden Directories (Post-Generation Cleanup)
After running the organize scripts, remove the following directories from `content/docs/api/meta.json` to hide them from public navigation:

**Directories to hide:**
- `admin` - Admin-only endpoints (usage metrics, user role management)
- `api-key` - Internal API key management (legacy)
- `auth` - Internal auth endpoints (developer login/register)
- `user` - User account endpoints with usage metrics

**Why hide:**
- These endpoints are for internal/admin use only
- Usage metrics endpoints expose sensitive data
- Developer auth flows handled separately

**After organize scripts, update `content/docs/api/meta.json`:**
```json
{
  "pages": [
    "apikey",
    "authentication",
    "courses-(merged)",
    "db-api",
    "projects-(merged)",
    "tx-api",
    "tx-state-machine"
  ]
}
```

Note: The directories and files still exist for reference but won't appear in navigation.

### Interactive API Testing

The API documentation supports interactive testing with the following setup:

**Schema Location:**
- Converted OpenAPI 3.0 schema copied to `/public/data/andamio-api-gateway-openapi.json`
- Accessible to browser at `/data/andamio-api-gateway-openapi.json`
- All MDX files reference `data/andamio-api-gateway-openapi.json` (relative path, no leading slash)
- **CRITICAL**: Schema MUST include `servers` field with API Gateway URL for proxy to work

**Proxy Configuration:**
- OpenAPI proxy configured in `lib/source.ts` and `app/api/proxy/route.ts`
- Allowed origin: `https://dev-api.andamio.io`
- **Server URL** (from schema `servers` field): Derived from swagger host field during conversion
- Proxy endpoint: `/api/proxy` forwards requests to the server URL defined in the schema
- The `servers` field is automatically added during Swagger → OpenAPI conversion in `scripts/generate-all-api-docs.mjs`
- **Header forwarding**: Only essential headers are forwarded (authorization, x-api-key, content-type, accept) to avoid 431 errors

**Authentication Flow:**
1. **Register** → `/auth/register` - Create user account
2. **Login** → `/auth/login` - Get JWT token
3. **Authorize** → Click "Authorize" button, add `Bearer YOUR_JWT_TOKEN` to BearerAuth
4. **Request API Key** → `/apikey/request` - Get API key (store securely!)
5. **Authorize Again** → Add `YOUR_API_KEY` to ApiKeyAuth field
6. **Test Endpoints** → Use "Try it out" on any endpoint page

**User Guide:**
- Complete authentication guide in `/content/docs/api/index.mdx`
- Links to register, login, and API key request endpoints
- Instructions for using the Authorize button in the API docs UI

**Interactive Testing Status:**
- ✅ **Working!** The proxy successfully forwards requests to the API Gateway
- The Andamio API Gateway accepts all incoming routes and CORS is properly configured
- Users can test endpoints directly in the docs using the "Try it out" feature
- Authentication required: Follow the authentication flow above to get JWT and API key tokens

### Maintenance
- **When to regenerate**: After API Gateway deployments or schema changes
- **Full workflow**: Pull schema → Generate docs → Organize into directories → Copy schema to public/
- **What to commit**: Raw schema, converted OpenAPI file (both `/data` and `/public/data`), organized directory structure, and all MDX files
- **Verification**: Check that directory structure matches tag hierarchy and MDX files correctly reference `/data/andamio-api-gateway-openapi.json`

## Unified API Documentation System

The Andamio platform has multiple API sub-services that will eventually be unified under a single API Gateway. Currently documented sub-services:

### API Sub-Services

| Service | Description | Swagger URL | Local Schema |
|---------|-------------|-------------|--------------|
| **Andamio API Gateway** | Auth, user management, platform services | [Swagger UI](https://dev-api.andamio.io/api/v1/docs/index.html) | `data/andamio-api-gateway.json` |
| **Andamioscan** | Indexer for on-chain data queries | [Swagger UI](https://preprod.andamioscan.io/api) | `data/andamioscan-swagger.json` |
| **Atlas TX Builder** | V2 transaction building | [Swagger UI](https://atlas-api-preprod-507341199760.us-central1.run.app/swagger/index.html) | `public/yaml/transactions/v2/atlas-api-swagger.json` |

### Build All Documentation

To pull all API specs and regenerate all documentation:

```bash
npm run build-all-docs
```

This command:
1. Pulls latest swagger specs from all enabled API services
2. Converts Swagger 2.0 → OpenAPI 3.0 where needed
3. Generates MDX documentation with cross-references
4. Updates meta.json navigation files
5. Verifies all expected files exist

Options:
- `npm run build-all-docs -- --skip-pull` - Use existing local specs
- `npm run build-all-docs -- --skip-generate` - Only pull specs, don't generate

### Cross-Reference System

The Andamioscan generator (`scripts/generate-andamioscan-docs.mjs`) maintains cross-references to V2 transaction documentation:

```javascript
const CROSS_REFERENCES = {
  transactionTypes: {
    'UserAccessTokenMint': '/docs/protocol/v2/transactions/general/mint-access-token',
    'AdminCourseCreate': '/docs/protocol/v2/transactions/course/admin/create',
    // ... other mappings
  },
  related: {
    transactions: '/docs/protocol/v2/transactions',
    costs: '/docs/protocol/v2/cost-estimation',
  }
};
```

**Update CROSS_REFERENCES when:**
- New transaction types are added to Andamioscan
- V2 transaction documentation paths change
- New cross-references are needed between services

### Adding New API Services

To add a new API sub-service to the build system:

1. Add entry to `API_SOURCES` in `scripts/build-all-docs.mjs`:
   ```javascript
   {
     name: 'New Service',
     swaggerUrl: 'https://example.com/swagger.json',
     localPath: './data/new-service-swagger.json',
     generateScript: 'generate-new-service-docs',
     enabled: true,
     notes: 'Description of service'
   }
   ```

2. Create generator script (copy `scripts/generate-andamioscan-docs.mjs` as template)

3. Add npm script to `package.json`

4. Run `npm run build-all-docs` to test

## Architecture Overview

This is a Next.js documentation site built with Fumadocs, using content collections for MDX content management.

### Content Management
- **Content Collections**: Uses `@content-collections/core` to manage MDX files in `content/docs/`
- **Document Structure**: Two collections defined in `content-collections.ts`:
  - `docs`: All `.mdx` files for documentation content
  - `meta`: `meta.json` files for navigation and metadata
- **Content Source**: `lib/source.ts` provides the content adapter with OpenAPI integration

### Key Components
- **Layout Configuration**: `app/layout.config.tsx` contains shared layout options including navigation title with Andamio logo
- **OpenAPI Integration**: Uses fumadocs-openapi for API documentation generation from `data/express-openapi.yaml`
- **API Docs Generation**: `scripts/generate-api-docs.mjs` generates MDX files from OpenAPI schema into `content/docs/apis/reference/`

### Route Structure
- `app/(home)/` - Landing page and home routes
- `app/docs/` - Documentation layout and pages
- `app/api/search/` - Search functionality
- `app/api/proxy/` - OpenAPI proxy for API documentation

### Content Organization
- Protocol documentation in `content/docs/protocol/`
- API reference in `content/docs/apis/reference/` (auto-generated)
- Transaction documentation in `content/docs/protocol/v1/transactions/`
- Validator documentation in `content/docs/protocol/v1/validators/`
- Token documentation in `content/docs/protocol/v1/tokens/`
- Whitepaper content in `content/docs/whitepaper/`

### Special Features
- Mermaid diagram support via `components/mdx/mermaid.tsx`
- OpenAPI documentation integration with proxy endpoint
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

- **`tags`** (array, optional) - Tags for API documentation organization
  - Example: `tags: ["admin", "authentication"]`

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