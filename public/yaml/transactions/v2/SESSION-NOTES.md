# V2 Transaction Documentation Session Notes

**Last Updated**: 2025-12-08
**Status**: In Progress (3/8 transactions parsed)

## What We're Doing

Building V2 protocol documentation by parsing decoded transaction CBORs from the Atlas API preprod environment. Each transaction reveals validators, policies, and patterns that we cross-validate across the full set.

## Files Created This Session

### Registries (living documentation)
- `endpoint-registry.json` - API endpoints with full request/response schemas
- `address-registry.json` - Validators, policies, observers, wallets (with provenance tracking)
- `cost-registry.json` - Transaction fees, protocol fees, min UTxO by output type

### Transaction YAMLs
- `general/mint-access-token.yaml` ✅
- `admin/course-create.yaml` ✅
- `admin/course-teachers-update.yaml` ✅
- `teacher/course-modules-manage.yaml` ⏳
- `teacher/course-assignments-assess.yaml` ⏳
- `student/course-enroll.yaml` ⏳
- `student/course-assignment-update.yaml` ⏳
- `student/course-credential-claim.yaml` ⏳

## How to Resume

1. **Get next CBOR** - Ask for decoded JSON from one of the remaining 5 endpoints
2. **Parse and create YAML** - Decode hex token names, identify validators/policies
3. **Cross-validate** - Check addresses against `address-registry.json`
4. **Update registries** - Add new components, update `inferredFrom` arrays

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

### Policies Identified
| Name | Policy ID Prefix | Tokens |
|------|------------------|--------|
| index-policy | `39b2876b...` | u{alias}, g{alias}, space (0x20) |
| local-state-token-policy | `1b4d9c2a...` | LocalStateToken |
| course-governance-policy | `60e72e5e...` | {courseId} as token name |
| local-state-nft-policy | `68396f15...` | LocalStateNFT (policy ID = courseId!) |

### Observers Identified
| Name | Stake Address Prefix | Used In |
|------|---------------------|---------|
| index-observer | `stake_test17qqz7k43...` | mint-access-token |
| course-observer | `stake_test17zxrdv3h8...` | course-create |

### Fee Structure
| Operation | Tx Fee | Protocol Fee | Treasury |
|-----------|--------|--------------|----------|
| mint-access-token | ~0.37 ADA | 5 ADA | protocol-treasury |
| course-create | ~0.54 ADA | 25 ADA | instance-treasury |
| course-teachers-update | ~0.31 ADA | 5 ADA | instance-treasury |

## Gaps to Address After All 8 Transactions

1. **Datum schemas** - Formalize the structure (currently just examples)
2. **Reference input mapping** - Identify which script each reference UTxO holds
3. **validator-registry-v2.yaml** - Consolidate into formal registry like V1
4. **MDX docs** - Update actual documentation files from YAMLs

## Transaction Patterns Observed

### Pattern: Mint and Create
- `mint-access-token`: Mints 3 tokens, creates index nodes + global state
- `course-create`: Mints 3 tokens, creates LocalStateNFT + LocalStateToken + governance

### Pattern: Spend and Recreate
- `course-teachers-update`: No minting, consumes and recreates UTxOs with updated datum

## Reference Transaction (Script References)
Multiple transactions reference UTxOs from `35d93ccfe17ccd6de427c66818f19eb79d729b7abd825be02441a70dfd769aff`:
- Index 0: mint-access-token
- Index 2: mint-access-token
- Index 3: course-teachers-update
- Index 4: course-create

This appears to be a "script reference" transaction holding validator scripts for reference inputs.

## Swagger Endpoint
- **Live API**: https://atlas-api-preprod-507341199760.us-central1.run.app/swagger.json
- **Note**: Endpoint pattern will change from `/tx/v2/{role}/{system}/{action}` to `/tx/v2/{system}/{role}/{action}`

## Commands to Check State

```bash
# See all V2 transaction files
ls -la public/yaml/transactions/v2/

# Check address registry
cat public/yaml/transactions/v2/address-registry.json | jq '.validators | keys'

# Check which transactions have been parsed
cat public/yaml/transactions/v2/address-registry.json | jq '.validators[].inferredFrom'
```
