# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbo (http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run generate-api-docs` - Generate API documentation from OpenAPI schema (legacy, uses express-openapi.yaml)
- `npm run generate-all-api-docs` - Generate all API documentation (including Andamio API Gateway)
- `npm run docs-coverage` - Check documentation coverage across protocol components

## Swagger/OpenAPI Documentation Workflow

### Andamio API Gateway Schema
- **Live API Docs**: https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/index.html
- **Schema Endpoint**: https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/doc.json
- **Local Schema**: `/data/andamio-api-gateway.json`

### Complete Workflow
1. **Pull Latest Schema**:
   ```bash
   curl -s https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/doc.json -o data/andamio-api-gateway.json
   ```

2. **Generate Documentation**:
   ```bash
   npm run generate-all-api-docs
   ```
   This will:
   - Convert Swagger 2.0 to OpenAPI 3.0 (saves to `data/andamio-api-gateway-openapi.json`)
   - **Add `servers` field** to OpenAPI schema pointing to `https://andamio-api-308006323670.us-central1.run.app/api/v1`
   - Generate ~140 MDX files (initially flat in `content/docs/api/`)

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

4. **Review Output**:
   - Check organized directory structure in `content/docs/api/`
   - Top-level directories: `admin`, `api-key`, `atlas-tx-builder-api`, `authentication`, `general`, `health`, `metrics`, `node-backend-api`, `platform-api`, `user`
   - Nested directories follow tag hierarchy (e.g., `atlas-tx-builder-api/atlas-instance-admin/atlas-self-service/`)
   - Each file references `data/andamio-api-gateway-openapi.json` for live rendering

5. **Commit Changes**:
   - Commit raw schema, converted OpenAPI 3.0 file, and all generated/organized docs

### File Locations
- **Raw Schemas**:
  - `/data/andamio-api-gateway.json` (Andamio API Gateway - Swagger 2.0, source)
  - `/data/andamio-api-gateway-openapi.json` (Auto-generated OpenAPI 3.0 conversion)
  - `/data/express-openapi.yaml` (Legacy API schema)
  - `/data/example-swagger.json` (Example API schema)
- **Generated Docs**:
  - `/content/docs/api/` (Andamio API Gateway docs - ~140 MDX files)
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

### Interactive API Testing

The API documentation supports interactive testing with the following setup:

**Schema Location:**
- Converted OpenAPI 3.0 schema copied to `/public/data/andamio-api-gateway-openapi.json`
- Accessible to browser at `/data/andamio-api-gateway-openapi.json`
- All MDX files reference `data/andamio-api-gateway-openapi.json` (relative path, no leading slash)
- **CRITICAL**: Schema MUST include `servers` field with API Gateway URL for proxy to work

**Proxy Configuration:**
- OpenAPI proxy configured in `lib/source.ts` and `app/api/proxy/route.ts`
- Allowed origin: `https://andamio-api-308006323670.us-central1.run.app`
- **Server URL** (from schema `servers` field): `https://andamio-api-308006323670.us-central1.run.app/api/v1`
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

## Transaction Token Reference Pattern

Transaction YAML files use a dot notation system to reference tokens and validators defined in `public/yaml/validator-registry-v1.yaml`. This creates clean separation between logical references and blockchain implementation details.

### Token Reference Format
- **Pattern**: `<system>.<token-name>` maps to registry path: `systems > <system> > tokens > <token-name>`
- **Examples**: `global-state.access-token-user`, `course.course-nft`, `project.contributor-state-token`

### Required Header
All transaction files should include this comment:
```yaml
# Token references use dot notation to map to validator-registry-v1.yaml
# Format: <system>.<token-name> maps to registry path: systems > <system> > tokens > <token-name>
```

### Value Field Format
All value fields must use bullet-point list format:
```yaml
value:
  - "5000000 lovelace"
  - "1 global-state.access-token-user"
```

### Minting Operations Format
Transaction files with minting operations must follow this exact structure:

```yaml
mints:
  - id: mint_operation_id
    policy: "system.validator-name"  # Use dot notation for validator reference
    redeemer:
      action: "ActionName"
      # Additional redeemer fields as needed
    tokens:
      - "1 system.token-name"  # Use dot notation for token reference
      - "1 system.other-token"  # Multiple tokens as YAML list
```

**Key Rules**:
- `policy` field: Always use dot notation referencing the minting validator (e.g., `course.module-policy`)
- `tokens` field: Always use dot notation for token references (e.g., `course.module-token`)
- `tokens` must always be a YAML list format, even for single tokens
- Never use policy ID placeholders in mints section - those are only for actual asset-id values in registry

### UTXO Conservation Rule
If there's an input token, it must appear in outputs unless it's being burned. Always add wallet outputs for input tokens that aren't consumed.

## Registry Usage Field Management

**CRITICAL**: When working on transaction files, ALWAYS update the corresponding token usage fields in `public/yaml/validator-registry-v1.yaml`:

### Usage Field Definitions
- **`minted-in`**: Token appears with positive value in `mints:` section
- **`used-in`**: Token appears in `inputs:` section 
- **`referenced-in`**: Token appears in `reference_inputs:` section
- **`burned-in`**: Token appears with negative value in `mints:` section

### Required Process for Each Transaction
1. **Fix transaction file** (token references, format, patterns)
2. **Verify registry alignment** (all token references exist in registry)
3. **Update usage fields** (add transaction name to appropriate minted-in/used-in/referenced-in/burned-in lists)

### Example Updates
```yaml
# Before
access-token-user:
  used-in: 
    - "contributor-mint-project-state"

# After adding new transaction
access-token-user:
  used-in:
    - "contributor-mint-project-state"
    - "course-creator-accept-assignment"
```

### Completed Transaction Usage Updates
The following transactions have been fully processed with usage field updates:
- ✅ `access-token-mint` (already complete)
- ✅ `admin-add-course-creators` 
- ✅ `admin-add-project-creators`
- ✅ `admin-init-course`
- ✅ `admin-init-project-step-1` and `admin-init-project-step-2`
- ✅ `admin-rm-course-creators` and `admin-rm-project-creators`
- ✅ All 6 contributor transactions (mint/burn/commit/unlock/get-rewards/add-info)
- ✅ `course-creator-accept-assignment`

## Documentation Linking System

A comprehensive linking system has been established to connect all documentation components. This system ensures consistent cross-references between transactions, validators, and tokens.

### Documentation URL Patterns

All documentation follows standardized URL patterns for predictable linking:

#### **Transaction Documentation**
- **Pattern**: `/docs/protocol/v1/transactions/<role>/<transaction-name>`
- **Examples**:
  - `/docs/protocol/v1/transactions/admin/add-course-creators`
  - `/docs/protocol/v1/transactions/contributor/mint-project-state`
  - `/docs/protocol/v1/transactions/student/burn-local-state`
  - `/docs/protocol/v1/transactions/general/access-token-mint`

#### **Token Documentation**
- **Pattern**: `/docs/protocol/v1/tokens/<system>/<token-name>`
- **Examples**:
  - `/docs/protocol/v1/tokens/global-state/access-token-user`
  - `/docs/protocol/v1/tokens/course/course-state-token`
  - `/docs/protocol/v1/tokens/project/treasury-token`

#### **Validator Documentation**
- **Pattern**: `/docs/protocol/v1/validators/<system>/<validator-name>` or `/docs/protocol/v1/validators/<system>/observers/<observer-name>`
- **Examples**:
  - `/docs/protocol/v1/validators/global-state/global-state`
  - `/docs/protocol/v1/validators/course/assignment-validator`
  - `/docs/protocol/v1/validators/project/observers/treasury-cbor-obs`

### File Organization Structure

The documentation file structure matches the URL patterns:

```
content/docs/protocol/v1/
├── transactions/
│   ├── admin/               # Instance admin transactions (7 files)
│   ├── contributor/         # Contributor transactions (6 files)
│   ├── course-creator/      # Course creator transactions (3 files)
│   ├── project-creator/     # Project creator transactions (6 files)
│   ├── student/            # Student transactions (5 files)
│   └── general/            # General transactions (1 file)
├── tokens/
│   ├── global-state/       # Global state tokens (3 files)
│   ├── index-validators/   # Index validator tokens (2 files)
│   ├── instance/          # Instance tokens (10 files)
│   ├── course/            # Course tokens (6 files)
│   └── project/           # Project tokens (7 files)
└── validators/
    ├── global-state/      # Global state validators + observers/
    ├── index-validators/  # Index validators + observers/
    ├── instance/         # Instance validators
    ├── course/           # Course validators + observers/
    └── project/          # Project validators + observers/
```

### Transaction File Organization

Transaction YAML files are organized by role with dot notation IDs:

```
public/yaml/transactions/
├── admin/                 # admin.* transaction IDs
├── contributor/           # contributor.* transaction IDs  
├── course-creator/        # course-creator.* transaction IDs
├── project-creator/       # project-creator.* transaction IDs
├── student/              # student.* transaction IDs
└── general/              # general.* transaction IDs
```

**Key Conventions**:
- **File Names**: Role prefix removed (e.g., `add-course-creators.yaml` not `admin-add-course-creators.yaml`)
- **Transaction IDs**: Use dot notation (e.g., `admin.add-course-creators`)
- **MDX tx_file References**: Point to role-based paths (e.g., `"admin/add-course-creators.yaml"`)

### Registry-Based Documentation Links

The validator registry (`public/yaml/validator-registry-v1.yaml`) contains `doc` fields that define the documentation path for each validator:

```yaml
validators:
  global-state:
    name: "Global State"
    doc: "protocol/v1/validators/global-state/global-state"  # Maps to URL
    purpose: "spend"
```

**Documentation Patterns**:
- **Individual validators**: Get their own `.mdx` files
- **Observer validators**: Located in `observers/` subdirectories  
- **Combined validators**: Related validators/policies documented together in "scripts" files (e.g., `course-state-scripts.mdx` covers both `course-state-validator` and `course-state-policy`)

### Token Usage Tracking

Each token in the registry tracks its usage across transactions:

```yaml
tokens:
  access-token-user:
    asset-id: "<access_token_policyid>.222<alias>"
    minted-in: "access-token-mint"           # Transaction that creates the token
    used-in: ["contributor-mint-project-state", ...]  # Transactions that consume the token
    referenced-in: []                        # Transactions that reference the token
    burned-in: null                         # Transactions that destroy the token
```

This enables automatic cross-linking between token documentation and transaction documentation.

### Cross-Reference Implementation

The documentation system supports bidirectional linking:

1. **From Transactions**: Link to validators used and tokens consumed/minted
2. **From Validators**: Link to transactions that use the validator
3. **From Tokens**: Link to transactions in minted-in, used-in, referenced-in, and burned-in lists
4. **Registry Integration**: All references are maintained in the central registry for consistency

This linking system provides comprehensive navigation between all protocol components, making the documentation highly interconnected and discoverable.

## Concept Validation Game

The Concept Validation Game is a collaborative learning exercise for iteratively refining and validating Claude's understanding of Andamio terms and concepts. The working glossary is located at `docs/reference/GLOSSARY.md`.

### How the Game Works

1. **Agent Presents**: Claude shares current understanding of a term/concept including definition and characteristics
2. **Human Validates/Corrects**: Human provides feedback with corrections and additional context
3. **Agent Updates**: Claude incorporates feedback and updates understanding
4. **Iteration**: Process repeats to refine understanding further

### Starting the Game

- **Human Chooses**: "Let's run an example with [term/concept]"
- **Agent Suggests**: Claude identifies concepts that need validation
- **Organic Discovery**: During conversation when uncertainty arises about a term

### Best Practices for Claude

- **Be honest about confidence levels**: "I'm uncertain about..."
- **Look for patterns**: "I notice this term appears with..."
- **Ask about relationships**: "How does [TERM A] relate to [TERM B]?"
- **Surface inconsistencies**: "I see this used two different ways..."
- **Update docs in real-time** while context is fresh
- **Ask clarifying questions** when uncertain
- **Provide context-specific corrections** rather than just saying "wrong"
- **Build iteratively** through multiple short rounds

### Example Opening

"I'd like to validate my understanding of your terminology. I've noticed some terms that could use clarification:
1. **[Term]** - I see this used frequently but am unsure if it means X or Y
2. **[Term]** - This seems to have a specific meaning in your context
3. **[Term]** - I've seen inconsistent usage of this

Should we start with one of these, or would you prefer a different term?"

### Benefits

- **Accuracy Improvement**: Corrects misunderstandings and knowledge gaps
- **Contextualization**: Learns Andamio-specific meanings and nuances
- **Confidence Calibration**: Better understanding of certainty levels
- **Knowledge Audit**: Surfaces what Claude understands correctly vs incorrectly
- **Real-time Documentation**: Updates happen while context is fresh

Use this game whenever terminology seems unclear or when starting work on new aspects of the Andamio protocol.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
- docs/reference/GLOSSARY.md is a team-facing document and can include "private" sections. However content/docs/glossary.mdx is public facing and only includes  - Core Protocol Concepts (Access Token, SSOI, Credentials, Local State, Global State, Validators, Contributors, Student, Project Creator, Project, Project
   Treasury, Prerequisites, Escrow Validator)
  - Technical Architecture (Protocol V2, Transaction API, Transaction Sponsorship, Service Fees, SDK)
  - Acronyms & Abbreviations (streamlined list)
- Glossary Game and Concept Game mean the same thing. When playing, assume the player is a team member and can discuss both private and public glossary docs.