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
- Transaction documentation in `content/docs/protocol/v1/transactions/`
- Validator documentation in `content/docs/protocol/v1/validators/`
- Token documentation in `content/docs/protocol/v1/tokens/`
- Whitepaper content in `content/docs/whitepaper/`

### Special Features
- Mermaid diagram support via `components/mdx/mermaid.tsx`
- OpenAPI documentation integration with proxy endpoint
- Content collections with MDX transformation and meta schema validation

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
- ✅ `mint-access-token` (already complete)
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
  - `/docs/protocol/v1/transactions/general/mint-access-token`

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
    minted-in: "mint-access-token"           # Transaction that creates the token
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

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.