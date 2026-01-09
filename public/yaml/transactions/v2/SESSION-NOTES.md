# V2 Transaction Documentation Session Notes

**Last Updated**: 2026-01-09
**Status**: In Progress (15 transactions parsed, API restructured, project transactions documented)

## What We're Doing

Building V2 protocol documentation by parsing decoded transaction CBORs from the Atlas API preprod environment. Each transaction reveals validators, policies, and patterns that we cross-validate across the full set.

## API Restructuring (2026-01-09)

The Atlas API was restructured with the following changes:

### Endpoints Removed
- `/v2/tx/course/student/enroll` - Enrollment without commitment no longer supported

### New Endpoints
- `/v2/tx/course/student/assignment/commit` - Replaces enroll, commitment is REQUIRED

### Renamed Endpoints
- `/v2/tx/course/student/assignment/action` → `/v2/tx/course/student/assignment/update`

### Key Design Change
Students can no longer enroll in a course without committing to an assignment. The new `assignment/commit` endpoint:
1. Enrolls the student if not already enrolled (mints course-state token)
2. Creates an active commitment (constructor 1 datum with slt_hash + assignment_info)

This eliminates "enrolled but idle" states and ensures every student enters a course with intent.

## Directory Structure

Transaction files follow the pattern: `{system}/{role}/{tx-name}.yaml`
Transaction IDs follow the pattern: `{system}.{role}.{action}`

```
public/yaml/transactions/v2/
├── address-registry.json
├── cost-registry.json
├── endpoint-registry.json
├── SESSION-NOTES.md
├── global/
│   └── general/
│       └── access-token/
│           └── mint.yaml
├── instance/
│   └── owner/
│       ├── course/
│       │   └── create.yaml
│       └── project/
│           └── create.yaml
├── project/
│   ├── owner/
│   │   ├── managers/
│   │   │   └── manage.yaml
│   │   └── contributor-blacklist/
│   │       └── manage.yaml
│   ├── manager/
│   │   └── tasks/
│   │       ├── manage.yaml
│   │       └── assess.yaml       ← NEW (2026-01-09)
│   └── contributor/
│       ├── task/
│       │   └── commit.yaml
│       └── credential/
│           └── claim.yaml        ← NEW (2026-01-09)
└── course/
    ├── owner/
    │   └── teachers/
    │       └── manage.yaml
    ├── teacher/
    │   ├── modules/
    │   │   └── manage.yaml
    │   └── assignments/
    │       └── assess.yaml
    └── student/
        ├── assignment/
        │   └── commit.yaml        ← Replaces enroll (2026-01-09)
        ├── assignment-update.yaml  ← Legacy path
        └── credential-claim.yaml   ← Legacy path
```

## Files Created This Session

### Registries (living documentation)
- `endpoint-registry.json` - API endpoints with full request/response schemas
- `address-registry.json` - Validators, policies, observers, wallets (with provenance tracking)
- `cost-registry.json` - Transaction fees, protocol fees, min UTxO by output type

### Transaction YAMLs
- `global/general/access-token/mint.yaml` ✅ (global.general.access-token.mint)
- `instance/owner/course/create.yaml` ✅ (instance.owner.course.create)
- `instance/owner/project/create.yaml` ✅ (instance.owner.project.create)
- `project/owner/managers/manage.yaml` ✅ (project.owner.managers.manage)
- `project/owner/contributor-blacklist/manage.yaml` ✅ (project.owner.contributor-blacklist.manage)
- `project/manager/tasks/manage.yaml` ✅ (project.manager.tasks.manage)
- `project/manager/tasks/assess.yaml` ✅ (project.manager.tasks.assess) - NEW 2026-01-09
- `project/contributor/task/commit.yaml` ✅ (project.contributor.task.commit)
- `project/contributor/credential/claim.yaml` ✅ (project.contributor.credential.claim) - NEW 2026-01-09
- `course/owner/teachers/manage.yaml` ✅ (course.owner.teachers.manage)
- `course/teacher/modules/manage.yaml` ✅ (course.teacher.modules.manage)
- `course/teacher/assignments/assess.yaml` ✅ (course.teacher.assignments.assess)
- `course/student/assignment/commit.yaml` ✅ (course.student.assignment.commit) - Replaces enroll
- `course/student/assignment-update.yaml` ✅ (course.student.assignment.update) - legacy path
- `course/student/credential-claim.yaml` ✅ (course.student.credential.claim) - legacy path

## Completed Work (2025-12-09)

### Transaction Documentation ✅
7 active transactions documented with MDX pages at `content/docs/protocol/v2/transactions/`:
- `general/mint-access-token.mdx`
- `course/admin/create.mdx`, `teachers-update.mdx`
- `course/teacher/modules-manage.mdx`, `assignments-assess.mdx`
- `course/student/assignment-update.mdx`, `credential-claim.mdx`
- Note: `course/student/assignment/commit.mdx` pending (replaces removed enroll.mdx)

### Cost API Endpoint ✅
Created `/api/costs/v2` endpoint serving cost-registry.json:
- `GET /api/costs/v2` - Full registry
- `GET /api/costs/v2?tx=<id>` - Single transaction cost
- `GET /api/costs/v2?loop=<name>` - Loop cost summary
- `GET /api/costs/v2?summary=true` - Summary view

### Verified Wallet Deltas ✅
All costs verified against actual transactions:
- Single credential loop: Student ~1.11 ADA + Teacher ~0.21 ADA = ~1.32 ADA total

## Next Steps

1. **Update V2 validator docs** - Align existing docs with CBOR-discovered validators
2. **Create validator-registry-v2.yaml** - Formal registry like V1
3. **Add missing validator docs** - Some CBOR validators don't have docs yet
4. **Cross-reference links** - Add links between transactions and validators

## Validator Mapping Analysis

### CBOR-Discovered Validators vs Existing Docs

| CBOR Validator Name | Used In Tx Docs | Existing Doc Path | Status |
|---------------------|-----------------|-------------------|--------|
| `index-validator` | mint-access-token | `validators/index-validators/index-scripts.mdx` | ⚠️ Name mismatch |
| `global-state-v2` | mint-access-token, assignment-commit, credential-claim | `validators/global-state/global-state-v2.mdx` | ✅ Match |
| `local-state-nft-validator` | course-create, teachers-update | `validators/global/local-state-registration.mdx` | ⚠️ Different concept? |
| `local-state-token-validator` | course-create | - | ❌ Missing doc |
| `course-governance-validator` | course-create, teachers-update, modules-manage | - | ❌ Missing doc |
| `module-validator` | modules-manage | `validators/course/module-ref-validator.mdx` | ⚠️ Name mismatch |
| `course-state-validator` | assignment-commit, assess, update, claim | `validators/course/course-state-v2-validator.mdx` | ⚠️ Name mismatch |

### CBOR-Discovered Observers vs Existing Docs

| CBOR Observer Name | Used In Tx Docs | Existing Doc Path | Status |
|--------------------|-----------------|-------------------|--------|
| `index-observer` | mint-access-token | `validators/index-validators/observers/init-index-observer-v2.mdx` | ⚠️ Name mismatch |
| `course-observer` | course-create | `validators/course/observers/course-state-v2-cbor-obs.mdx` | ⚠️ Name mismatch |

### Missing Validator Documentation

These validators are referenced in V2 transaction docs but lack dedicated documentation:
1. **local-state-token-validator** - Holds LocalStateToken with embedded script_ref
2. **course-governance-validator** - Manages teacher lists for courses

### Recommended Actions

1. **Standardize naming** - Use CBOR-discovered names as canonical
2. **Create missing docs** for local-state-token-validator and course-governance-validator
3. **Update existing docs** to use CBOR addresses and policy IDs
4. **Add cross-links** from validator docs to transaction docs that use them

## Key Discoveries So Far

### Critical Design Feature
- **courseId = LocalStateNFT policy ID** - The course identifier IS the minting policy that creates the course's LocalStateNFT. Not a separate token.

### Validators Identified
| Name | Address Suffix | Purpose |
|------|----------------|---------|
| index-validator | `...rr84hd` | Linked list for alias index |
| global-state-v2 | `...m4xa2p` | User's global state |
| local-state-nft-validator | `...tucd7n` | Course LocalStateNFT |
| local-state-token-validator | `...pgzxfx` | Course LocalStateToken + embedded script_ref |
| course-governance-validator | `...tt05jv` | Teacher list management |
| module-validator | `...5egxwn` | Holds module tokens with SLT data |
| course-state-validator | `...3trp4k` | Holds student course state tokens |

### Policies Identified
| Name | Policy ID Prefix | Tokens |
|------|------------------|--------|
| index-policy | `39b2876b...` | u{alias}, g{alias}, space (0x20) |
| local-state-token-policy | `1b4d9c2a...` | LocalStateToken |
| course-governance-policy | `60e72e5e...` | {courseId} as token name |
| local-state-nft-policy | `68396f15...` | LocalStateNFT (policy ID = courseId!) |
| module-policy | `0881d005...` | {slt_hash} (32-byte hash of SLT list) |
| course-state-policy | `91e18edd...` | {student_alias} - parameterized per course |

### Observers Identified
| Name | Stake Address Prefix | Used In |
|------|---------------------|---------|
| index-observer | `stake_test17qqz7k43...` | mint-access-token |
| course-observer | `stake_test17zxrdv3h8...` | course-create |
| project-observer | `stake_test17patezang...` | project-create |
| project-prereq-observer | `stake_test17pxv9jccd...` | project-create |
| project-state-observer | `stake_test17qcucd7rd...` | project-blacklist-manage |
| task-escrow-observer | `stake_test17pk6rqehs...` | project-tasks-manage |
| task-commit-observer | `stake_test17r4gv6wqt...` | project-task-commit |
| task-assess-observer | `stake_test17qpcdvvgr...` | project-tasks-assess |

### Fee Structure
| Operation | Tx Fee | Protocol Fee | Treasury |
|-----------|--------|--------------|----------|
| mint-access-token | ~0.37 ADA | 5 ADA | protocol-treasury |
| course-create | ~0.54 ADA | 100+10×teachers ADA | instance-treasury |
| course-teachers-update | ~0.31 ADA | 10 ADA | instance-treasury |
| project-create | ~1.30 ADA | 100+10×managers ADA | instance-treasury |
| project-managers-manage | ~0.30 ADA | 10 ADA | instance-treasury |
| project-blacklist-manage | ~0.34 ADA | 0 ADA | - |
| project-tasks-manage | ~0.43 ADA | 0 ADA | - |
| project-task-commit | ~0.51 ADA | 0 ADA | - |
| project-tasks-assess | ~0.35 ADA | 0 ADA | - |
| project-credential-claim | ~0.35 ADA | 1 ADA | instance-treasury |
| modules-manage | ~0.27 ADA | 0 ADA | - |
| student-enroll | ~0.40 ADA | 0 ADA | - |
| assignments-assess | ~0.28 ADA | 0 ADA | - |
| assignment-update | ~0.28 ADA | 0 ADA | - |
| credential-claim | ~0.35 ADA | 0 ADA | - |

## Gaps to Address After All 8 Transactions

1. **Datum schemas** - Formalize the structure (currently just examples)
2. **Reference input mapping** - Identify which script each reference UTxO holds
3. **validator-registry-v2.yaml** - Consolidate into formal registry like V1
4. **MDX docs** - Update actual documentation files from YAMLs

## Transaction Patterns Observed

### Pattern: Mint and Create
- `mint-access-token`: Mints 3 tokens, creates index nodes + global state
- `course-create`: Mints 3 tokens, creates LocalStateNFT + LocalStateToken + governance
- `project-create`: Mints 6 tokens, creates LocalStateNFT + LocalStateToken + governance + treasury-script + project-state + treasury
  - Uses 2 observers (project-observer + prereq-observer)
  - Registers stake credential for project treasury
  - REUSES course governance validator/policy for managers (same as teachers)
  - Course prerequisites validated via prereq-observer redeemer

### Pattern: Spend and Recreate
- `course-teachers-update`: No minting, consumes and recreates UTxOs with updated datum
- `project-managers-manage`: IDENTICAL pattern to course-teachers-update
  - Same governance validator (shared between courses and projects)
  - Same 10 ADA protocol fee to instance-treasury
  - Same reference inputs (local-state-nft-validator + governance-validator scripts)

### Pattern: Spend and Recreate with Observer
- `project-blacklist-manage`: Spend and recreate with observer validation
  - Spends local-state-nft-validator + project-state-validator
  - Recreates both UTxOs with updated blacklist in project-state datum
  - Uses project-state-observer (withdrawal) for validation
  - Observer redeemer: {constructor: 1, fields: [projectId, stakeCredHash]}
  - NO protocol fee (unlike managers-manage)
  - ~0.34 ADA transaction fee only

### Pattern: Task Management (No Minting!)
- `project-tasks-manage`: CRITICAL - Does NOT mint tokens!
  - Treasury-tokens were minted during project.create
  - Spends task-escrow-validator, recreates with updated datum
  - Uses task-escrow-observer for validation
  - Observer redeemer: {constructor: 1, fields: [tasks_list, alias]}
  - Token name = contributor_state_id (prerequisite policy)
  - Optional deposit_value to fund treasury alongside task operations
  - ~0.43 ADA transaction fee, no protocol fee

### Pattern: Task Commit (Contributor Enrollment)
- `project-task-commit`: Project equivalent of course enrollment
  - MINTS contributor-state token (unlike tasks-manage!)
  - Token name = contributor alias
  - Updates global-state-v2 with project credential
  - Spends task-escrow + deposit UTxOs
  - Creates contributor-state output with task commitment
  - Uses task-commit-observer for validation
  - Observer redeemer: {constructor: 0, fields: [alias, task_definition, [], task_info]}
  - Mint redeemer includes prerequisite verification (course credentials)
  - Parameterized validators: addresses vary per project
  - ~0.51 ADA transaction fee, no protocol fee

### Pattern: Task Assessment
- `project-tasks-assess`: Project equivalent of course assignment assessment
  - NO minting - spend and recreate pattern
  - Manager spends contributor-state UTxO
  - Datum changes: constructor 1 (active) → constructor 0 (completed)
  - Completed task added to completed_tasks list
  - Uses task-assess-observer for validation
  - Spend redeemer: {constructor: 2, fields: []} - constructor 2 = assess
  - Observer redeemer: {constructor: 1, fields: [stakeCredHash, projectId, alias, decisions_list]}
  - Can batch multiple assessment decisions
  - ~0.35 ADA transaction fee, no protocol fee

### Pattern: Project Credential Claim (Burn)
- `project-credential-claim`: Project equivalent of course credential claim
  - Contributor-state token BURNED (quantity = -1)
  - Global state updated with credential hash
  - Spends global-state-v2 + contributor-state UTxOs
  - Global state redeemer: {constructor: 1, fields: [projectId, 0, '', csId, credential_hash]}
  - Contributor state redeemer: {constructor: 1, fields: []} - claim action
  - Mint redeemer: {constructor: 3, fields: [alias, completed_tasks]} - burn proof
  - 1 ADA protocol fee to instance-treasury
  - NET GAIN for contributor: ~13+ ADA (deposit released - fees)
  - No observer - direct validator logic
  - Credential hash permanently stored in global state

### Pattern: Module Minting
- `modules-manage`: Mints module tokens to module-validator, spends governance to verify teacher authorization
  - Token name = hash of SLT strings
  - Redeemer contains full SLT text (hash computed on-chain)
  - No protocol fee to treasury in simple case

### Pattern: Assignment Commit (formerly Student Enrollment)
- `assignment-commit`: Mints course state token (if new), commits to assignment
  - Spends global state UTxO to update local_state_information map
  - Course state token name = student alias
  - Course state policy is parameterized per course
  - Commitment is REQUIRED (slt_hash + assignment_info)
  - Course state datum is always constructor 1 (has active commitment)
  - No service fee for enrollment/commitment
  - If already enrolled, spends existing course state and recreates with new commitment

### Pattern: Assignment Assessment
- `assignments-assess`: Spend and recreate - no minting
  - Teacher spends student's course state UTxO
  - Datum changes from constructor 1 (pending) to constructor 0 (completed)
  - Completed SLT hash added to list in datum
  - Redeemer constructor 2 = assess action, includes teacher alias
  - Can batch multiple decisions in one transaction
  - No service fee for assessments

### Pattern: Assignment Update
- `assignment-update`: Spend and recreate - no minting
  - Student spends their own course state UTxO
  - Datum stays as constructor 1 (pending) - only assignment_info field changes
  - SLT hash unchanged between input and output
  - Redeemer constructor 1 = update action, contains nested constructor 0 with new data
  - No service fee for updates
  - Different from new assignment commit which would change SLT hash

### Pattern: Credential Claim (Burn)
- `credential-claim`: Burns course state token, updates global state
  - Course state token BURNED (negative mint quantity)
  - Global state datum updated: courseId map value changes to credential_hash
  - Course state redeemer constructor 3 = burn/claim
  - Mint redeemer constructor 4 = burn with proof (alias + completed SLTs list)
  - Student gets NET GAIN (~1.38 ADA unlocked - 0.35 fee = ~1 ADA back)
  - Credential hash permanently stored in global state

## Reference Transaction (Script References)
Multiple transactions reference UTxOs from `35d93ccfe17ccd6de427c66818f19eb79d729b7abd825be02441a70dfd769aff`:
- Index 0: mint-access-token
- Index 2: mint-access-token
- Index 3: course-teachers-update
- Index 4: course-create

This appears to be a "script reference" transaction holding validator scripts for reference inputs.

## Swagger Endpoint & Sync Workflow

### Live API
- **Swagger**: https://atlas-api-preprod-507341199760.us-central1.run.app/swagger.json
- **Local Copy**: `public/yaml/transactions/v2/atlas-api-swagger.json`
- **Note**: Endpoint pattern may change from `/tx/v2/{role}/{system}/{action}` to `/tx/v2/{system}/{role}/{action}`

### Sync Workflow (When Swagger Updates)

1. **Download updated swagger**:
   ```bash
   curl -s "https://atlas-api-preprod-507341199760.us-central1.run.app/swagger.json" \
     -o public/yaml/transactions/v2/atlas-api-swagger.json
   ```

2. **Check for new V2 endpoints**:
   ```bash
   cat public/yaml/transactions/v2/atlas-api-swagger.json | \
     jq '.paths | keys | map(select(contains("/tx/v2/")))'
   ```

3. **Compare request schemas** - For each endpoint, extract and compare:
   ```bash
   # Example: Get schema for mint-access-token
   cat public/yaml/transactions/v2/atlas-api-swagger.json | \
     jq '.paths["/tx/v2/general/mint-access-token"].post.parameters[0].schema'
   ```

4. **Update endpoint-registry.json** if schemas changed

5. **Update MDX docs** - Request body sections in:
   - `content/docs/protocol/v2/transactions/{system}/{role}/{tx-name}.mdx`

6. **Test API endpoint works**:
   ```bash
   curl -s "http://localhost:3000/api/transaction-v2?file={system}/{role}/{tx-name}.yaml&format=v1" | jq '.diagramData.name'
   ```

### Files to Update When Adding New Transactions

1. **YAML file**: `public/yaml/transactions/v2/{system}/{role}/{tx-name}.yaml`
   - Must have `metadata:` block with `role`, `system`, `description`, `api_endpoint`
   - Inputs/outputs use `type:`, `validator:` or `label:` fields

2. **MDX doc**: `content/docs/protocol/v2/transactions/{system}/{role}/{tx-name}.mdx`
   - Frontmatter: `tx_file: "{system}/{role}/{tx-name}.yaml"`
   - Request body JSON example matching swagger

3. **Registries** (if new validators/policies discovered):
   - `address-registry.json` - Add new validators/policies
   - `cost-registry.json` - Add transaction costs
   - `endpoint-registry.json` - Add API schema

4. **meta.json files** - Add new page to navigation

### Current Schema Alignment (2026-01-09)

| Endpoint | Swagger | MDX | Status |
|----------|---------|-----|--------|
| `/v2/tx/global/general/access-token/mint` | `alias, initiator_data` | Pending | ⚠️ |
| `/v2/tx/instance/owner/course/create` | `alias, teachers[]` | Pending | ⚠️ |
| `/v2/tx/instance/owner/project/create` | `alias, managers[], course_prereqs, deposit_value` | Pending | ⚠️ |
| `/v2/tx/course/owner/teachers/manage` | `alias, course_id, teachers_to_add/remove[]` | Pending | ⚠️ |
| `/v2/tx/course/teacher/modules/manage` | `alias, course_id, modules_to_mint/update/burn` | Pending | ⚠️ |
| `/v2/tx/course/teacher/assignments/assess` | `alias, course_id, assignment_decisions[]` | Pending | ⚠️ |
| `/v2/tx/course/student/assignment/commit` | `alias, course_id, slt_hash, assignment_info` | **NEW** | ✅ YAML |
| `/v2/tx/course/student/assignment/update` | `alias, course_id, assignment_info` | Pending | ⚠️ |
| `/v2/tx/course/student/credential/claim` | `alias, course_id` | Pending | ⚠️ |
| `/v2/tx/project/contributor/task/commit` | `alias, project_id, contributor_state_id, task_hash, task_info` | **NEW** | ✅ YAML + MDX |
| `/v2/tx/project/manager/tasks/assess` | `alias, project_id, contributor_state_id, task_decisions[]` | **NEW** | ✅ YAML + MDX |
| `/v2/tx/project/contributor/credential/claim` | `alias, project_id, contributor_state_id` | **NEW** | ✅ YAML + MDX |
| ~~`/v2/tx/course/student/enroll`~~ | REMOVED | DEPRECATED | ❌ |

## Commands to Check State

```bash
# See all V2 transaction files
ls -la public/yaml/transactions/v2/

# Check address registry
cat public/yaml/transactions/v2/address-registry.json | jq '.validators | keys'

# Check which transactions have been parsed
cat public/yaml/transactions/v2/address-registry.json | jq '.validators[].inferredFrom'
```
