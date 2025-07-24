# Validator Documentation Audit Report

## Summary
This audit compares validators defined in `public/yaml/validator-registry-v1.yaml` with MDX documentation files in `content/docs/protocol/v1/validators/`.

## Registry Analysis

### Validators by System (from validator-registry-v1.yaml)

#### global-state system (3 validators)
- `params-ref-validator` - purpose: "spend"
- `global-state` - purpose: "spend"  
- `init-global-state-observer` - purpose: "withdraw" ⚠️ (should be in observers/)

#### index-validators system (5 validators)
- `index-ref` - purpose: "spend"
- `index-scripts` - purpose: ["spend", "mint", "withdraw"]
- `index-staking` - purpose: "withdraw" ⚠️ (should be in observers/)
- `init-index-observer` - purpose: "withdraw" ⚠️ (should be in observers/)
- `init-index-policy` - purpose: "mint"

#### instance system (3 validators)
- `instance-governance-scripts` - purpose: "withdraw" ⚠️ (should be in observers/)
- `instance-provider-scripts` - purpose: ["spend", "mint"]
- `instance-scripts` - purpose: ["spend", "mint"]

#### course system (8 validators)
- `assignment-cbor-obs` - purpose: "withdraw" ⚠️ (should be in observers/)
- `assignment-validator` - purpose: "spend"
- `course-state-cbor-obs` - purpose: "withdraw" ⚠️ (should be in observers/)
- `course-state-validator` - purpose: "spend"
- `course-state-policy` - purpose: "mint"
- `module-cbor-obs` - purpose: "withdraw" ⚠️ (should be in observers/)
- `module-ref-validator` - purpose: "spend"
- `module-policy` - purpose: "mint"

#### project system (6 validators)
- `contributor-state-cbor-obs` - purpose: "withdraw" ⚠️ (should be in observers/)
- `contributor-state-scripts` - purpose: ["spend", "mint"]
- `escrow1` - purpose: "spend"
- `escrow1-cbor-obs` - purpose: "withdraw" ⚠️ (should be in observers/)
- `treasury-cbor-obs` - purpose: "withdraw" ⚠️ (should be in observers/)
- `treasury-scripts` - purpose: "spend"
- `treasury-token` - purpose: "mint"
- `treasury-token-cbor-obs` - purpose: "withdraw" ⚠️ (should be in observers/)

**Total Registry Validators: 25**

## Documentation File Analysis

### Existing MDX Files by System

#### global-state system
✅ **Correctly placed:**
- `global-state/params-ref-validator.mdx` (spend)
- `global-state/global-state.mdx` (spend)
- `global-state/observers/init-global-state-observer.mdx` (withdraw) ✓

#### index-validators system  
✅ **Correctly placed:**
- `index-validators/index-ref.mdx` (spend)
- `index-validators/index-scripts.mdx` (spend/mint/withdraw)
- `index-validators/init-index-policy.mdx` (mint)
- `index-validators/observers/init-index-observer.mdx` (withdraw) ✓

❌ **Incorrectly placed:**
- `index-validators/index-staking.mdx` (withdraw) - should be in `observers/`

#### instance system
✅ **Correctly placed:**
- `instance/instance-provider-scripts.mdx` (spend/mint)
- `instance/instance-scripts.mdx` (spend/mint)

❌ **Incorrectly placed:**
- `instance/instance-governance-scripts.mdx` (withdraw) - should be in `observers/`

#### course system
✅ **Correctly placed:**
- `course/assignment-validator.mdx` (spend)
- `course/observers/assignment-cbor-obs.mdx` (withdraw) ✓
- `course/observers/course-state-cbor-obs.mdx` (withdraw) ✓
- `course/observers/module-cbor-obs.mdx` (withdraw) ✓

❌ **Missing documentation:**
- `course-state-validator` (spend) - **MISSING**
- `course-state-policy` (mint) - **MISSING**
- `module-ref-validator` (spend) - **MISSING**
- `module-policy` (mint) - **MISSING**

❌ **Extra documentation (not in registry):**
- `course/course-state-scripts.mdx` - **NOT IN REGISTRY**
- `course/module-scripts.mdx` - **NOT IN REGISTRY**

#### project system
✅ **Correctly placed:**
- `project/contributor-state-scripts.mdx` (spend/mint)
- `project/escrow1.mdx` (spend)
- `project/treasury-scripts.mdx` (spend)
- `project/treasury-token.mdx` (mint)
- `project/observers/contributor-state-cbor-obs.mdx` (withdraw) ✓
- `project/observers/escrow1-cbor-obs.mdx` (withdraw) ✓
- `project/observers/treasury-cbor-obs.mdx` (withdraw) ✓
- `project/observers/treasury-token-cbor-obs.mdx` (withdraw) ✓

## Detailed Findings

### ✅ Registry Validators WITH Correct Documentation (17/25)

1. **global-state/params-ref-validator** ✓
2. **global-state/global-state** ✓
3. **global-state/observers/init-global-state-observer** ✓
4. **index-validators/index-ref** ✓
5. **index-validators/index-scripts** ✓
6. **index-validators/init-index-policy** ✓
7. **index-validators/observers/init-index-observer** ✓
8. **instance/instance-provider-scripts** ✓
9. **instance/instance-scripts** ✓
10. **course/assignment-validator** ✓
11. **course/observers/assignment-cbor-obs** ✓
12. **course/observers/course-state-cbor-obs** ✓
13. **course/observers/module-cbor-obs** ✓
14. **project/contributor-state-scripts** ✓
15. **project/escrow1** ✓
16. **project/treasury-scripts** ✓
17. **project/treasury-token** ✓
18. **project/observers/contributor-state-cbor-obs** ✓
19. **project/observers/escrow1-cbor-obs** ✓
20. **project/observers/treasury-cbor-obs** ✓
21. **project/observers/treasury-token-cbor-obs** ✓

### ❌ Registry Validators MISSING Documentation (4/25)

1. **course/course-state-validator** (spend) - MISSING MDX file
2. **course/course-state-policy** (mint) - MISSING MDX file  
3. **course/module-ref-validator** (spend) - MISSING MDX file
4. **course/module-policy** (mint) - MISSING MDX file

### ❌ Validators with INCORRECT Placement (2/25)

1. **index-validators/index-staking.mdx** (withdraw) → should be `index-validators/observers/index-staking.mdx`
2. **instance/instance-governance-scripts.mdx** (withdraw) → should be `instance/observers/instance-governance-scripts.mdx`

### ❌ Documentation Files NOT in Registry (2)

1. **course/course-state-scripts.mdx** - No corresponding validator in registry
2. **course/module-scripts.mdx** - No corresponding validator in registry

## Action Items

### High Priority
1. **Create missing documentation files:**
   - `content/docs/protocol/v1/validators/course/course-state-validator.mdx`
   - `content/docs/protocol/v1/validators/course/course-state-policy.mdx`
   - `content/docs/protocol/v1/validators/course/module-ref-validator.mdx`
   - `content/docs/protocol/v1/validators/course/module-policy.mdx`

2. **Fix incorrect placement:**
   - Move `index-validators/index-staking.mdx` → `index-validators/observers/index-staking.mdx`
   - Move `instance/instance-governance-scripts.mdx` → `instance/observers/instance-governance-scripts.mdx`
   - Create `instance/observers/` directory if it doesn't exist

3. **Resolve registry mismatches:**
   - Either add `course-state-scripts` and `module-scripts` to registry, or remove their MDX files
   - Verify these aren't naming inconsistencies in the registry

### Medium Priority
- Review all observer directory structures to ensure consistency
- Update meta.json files in any newly created directories
- Verify content of existing documentation matches registry purposes

## Statistics
- **Total Registry Validators:** 25
- **Documentation Coverage:** 21/25 (84%)
- **Correctly Placed:** 21/23 (91% of existing docs)
- **Missing Documentation:** 4 validators
- **Incorrectly Placed:** 2 validators  
- **Extra Files:** 2 files not in registry

## Withdraw Purpose Validators (Observers)
All "withdraw" purpose validators should be in `observers/` subdirectories:

✅ **Correctly placed in observers/:**
- `global-state/observers/init-global-state-observer`
- `index-validators/observers/init-index-observer`
- `course/observers/assignment-cbor-obs`
- `course/observers/course-state-cbor-obs`
- `course/observers/module-cbor-obs`
- `project/observers/contributor-state-cbor-obs`
- `project/observers/escrow1-cbor-obs`
- `project/observers/treasury-cbor-obs`
- `project/observers/treasury-token-cbor-obs`

❌ **Should be moved to observers/:**
- `index-validators/index-staking` → `index-validators/observers/index-staking`
- `instance/instance-governance-scripts` → `instance/observers/instance-governance-scripts`