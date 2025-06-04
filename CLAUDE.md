# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbo (http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run generate-api-docs` - Generate API documentation from OpenAPI schema

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
- Transaction documentation in `content/docs/transactions/`
- Whitepaper content in `content/docs/whitepaper/`

### Special Features
- Mermaid diagram support via `components/mdx/mermaid.tsx`
- OpenAPI documentation integration with proxy endpoint
- Content collections with MDX transformation and meta schema validation

## Validator Documentation System

The `diagrams/graphviz/generate/` directory contains a comprehensive validator and transaction documentation system:

### Registry System
- **`yaml/registry.yaml`**: Central source of truth for all validators and redeemers
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
- When updating validators, always sync registry.yaml first as source of truth
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

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context or otherwise consider it in your response unless it is highly relevant to your task. Most of the time, it is not relevant.