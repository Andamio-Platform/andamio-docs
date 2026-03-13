# V2 Documentation Generation System Audit

**Date:** 2025-12-09
**Status:** Audit Complete, Action Plan Defined

> **Note (2026-03):** V1 content has been fully removed from the codebase. The `content/docs/protocol/v1/` directory and `public/yaml/transactions/v1/` no longer exist. All protocol documentation is now V2-only. The historical V1 references below are preserved for context.

## Executive Summary

The V1 documentation system is well-architected and functional. The V2 YAML files we've been creating have a **different schema** optimized for CBOR analysis rather than diagram rendering. We need to either:
1. Create V2-compatible YAMLs that work with existing components, OR
2. Build new V2-specific rendering components

**Recommendation:** Create a **hybrid approach** - keep our analysis YAMLs as the source of truth, then generate diagram-ready YAMLs from them.

---

## Current V1 System Architecture

### File Structure
```
public/yaml/
├── validator-registry-v1.yaml          # Central registry
├── transactions/v1/
│   ├── admin/                          # Role-based organization
│   │   ├── add-course-creators.yaml
│   │   └── ...
│   ├── contributor/
│   ├── course-creator/
│   ├── project-creator/
│   ├── student/
│   └── general/

content/docs/protocol/v1/transactions/
├── admin/
│   ├── add-course-creators.mdx         # References yaml via tx_file
│   └── ...
```

### Component Pipeline

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  YAML File      │────▶│  /api/transaction │────▶│ TransactionDiagram  │
│  (v1 schema)    │     │  route.ts         │     │ Wrapper.tsx         │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────────┐     ┌─────────────────────┐
                        │ deployment-      │     │ DiagramTransaction  │
                        │ resolver.ts      │     │ Flow.tsx            │
                        └──────────────────┘     └─────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `types/index.ts` | `TransactionYaml` interface |
| `app/api/transaction/route.ts` | Loads YAML, resolves addresses |
| `components/react-flow/transactions/TransactionDiagramWrapper.tsx` | Client component |
| `components/react-flow/transactions/DiagramTransactionFlow.tsx` | ReactFlow renderer |
| `scripts/docs-coverage-check.ts` | Validates MDX ↔ YAML coverage |

### V1 TransactionYaml Schema

```typescript
interface TransactionYaml {
  name: string;
  metadata: {
    role: string;
    category: string;                    // V1 specific
    requires_tokens: string[];
    estimated_fee: string;               // V1 specific
    description: string;
    multi_signature: boolean;
  };
  graph_attrs?: GraphAttributes;
  inputs: TransactionInput[];            // Has output.address, output.value
  reference_inputs?: ReferenceInput[];
  outputs: TransactionOutput[];
  mints?: Mint[];
  withdraws?: Withdraw[];
}
```

---

## V2 YAML Schema Comparison

Our V2 YAMLs have evolved for **CBOR analysis** rather than **diagram rendering**:

### V2 Schema (Current)
```yaml
name: InitCourseV2
id: admin.course-create              # Uses dot notation ID

metadata:
  role: "admin"
  system: "course"                   # NEW: system classification
  description: "..."
  api_endpoint: "/tx/v2/..."         # NEW: API reference

costs:                               # NEW: Detailed cost breakdown
  txFee: 544916
  protocolFee: 25000000
  minUtxo: {...}

inputs:
  - id: admin_global_state
    type: script
    description: "..."               # Description, not output structure

outputs:
  - id: local_state_nft
    type: script
    validator: local-state-nft-validator
    address: "addr_test1xz..."       # Actual address, not dot notation
    value: ["1236970 lovelace", ...] # Different format
    datum: {...}
    description: "..."

mints:
  - id: mint_local_state_token
    policy: local-state-token-policy
    policyId: "1b4d9c2a..."          # Actual policy ID
    tokens: [...]

observations: [...]                   # NEW: Notes
questions: [...]                      # NEW: Questions
```

### Key Differences

| Aspect | V1 | V2 (Current) |
|--------|----|----|
| **ID format** | `admin.add-course-creators` | `course.admin.create` |
| **File path** | `v1/{role}/{name}.yaml` | `v2/{system}/{role}/{name}.yaml` |
| **metadata.category** | Required | Not used |
| **metadata.system** | Not used | Required |
| **metadata.estimated_fee** | Required | Replaced by `costs` section |
| **Input structure** | `input.output.address` | `input.address` (direct) |
| **Address format** | Dot notation | Actual addresses |
| **Costs** | Single estimated_fee | Detailed breakdown |
| **Registry** | `validator-registry-v1.yaml` | `address-registry.json` |

---

## Identified Gaps

### 1. Schema Incompatibility
The existing `DiagramTransactionFlow.tsx` expects V1 schema:
```typescript
// Line 110: Checks for metadata
if (isRegistryLoading || !txData || !txData.metadata) { ... }

// Line 241: Uses metadata.estimated_fee
fee: txData.metadata.estimated_fee,

// Line 257-280: Expects input.output.address structure
address: input.output.address,
```

### 2. Registry Mismatch
- V1 uses `validator-registry-v1.yaml` (YAML format, systems structure)
- V2 uses `address-registry.json` (JSON format, flat policies/validators)

### 3. Missing V2 Components
- No `TransactionYamlV2` type definition
- No V2-specific diagram renderer
- No V2 docs-coverage-check script

### 4. File Path Conventions
- V1: `v1/{role}/{tx-name}.yaml` → MDX at `v1/transactions/{role}/{tx-name}.mdx`
- V2: `v2/{system}/{role}/{tx-name}.yaml` → MDX at `v2/transactions/{system}/{role}/{tx-name}.mdx` (TBD)

---

## Recommended Action Plan

### Phase 1: Define V2 Schema (Do Not Modify V1)

Create new type definitions that support both diagram rendering AND cost analysis:

```typescript
// types/v2.ts (NEW FILE)
export interface TransactionYamlV2 {
  name: string;
  id: string;  // e.g., "course.admin.create"

  metadata: {
    role: string;
    system: string;
    description: string;
    api_endpoint?: string;
  };

  costs: {
    txFee: number;
    serviceFee: number;
    serviceFeeRecipient?: string;
    utxoDeposits?: Record<string, number>;
    walletDelta?: { lovelace: number; ada: string };
  };

  inputs: V2TransactionInput[];
  reference_inputs?: V2ReferenceInput[];
  outputs: V2TransactionOutput[];
  mints?: V2Mint[];
  withdraws?: V2Withdraw[];

  observations?: string[];
  questions?: string[];
}
```

### Phase 2: Create V2 API Route

```typescript
// app/api/transaction-v2/route.ts (NEW FILE)
// Loads from yaml/transactions/v2/{system}/{role}/{name}.yaml
// Uses address-registry.json for resolution
```

### Phase 3: Create V2 Diagram Components

Either:
- **Option A:** Adapter that converts V2 schema to V1 format for existing components
- **Option B:** New `DiagramTransactionFlowV2.tsx` that handles V2 schema natively

### Phase 4: Create V2 MDX Generation Script

```javascript
// scripts/generate-v2-tx-docs.mjs (NEW FILE)
// Reads from: public/yaml/transactions/v2/{system}/{role}/*.yaml
// Generates: content/docs/protocol/v2/transactions/{system}/{role}/*.mdx
// Creates: meta.json files for navigation
```

### Phase 5: Create V2 Coverage Check

```typescript
// scripts/docs-coverage-check-v2.ts (NEW FILE)
// Validates V2 MDX files against V2 YAML files
// Uses address-registry.json instead of validator-registry-v1.yaml
```

---

## Files to Create (Do NOT Modify)

| New File | Purpose |
|----------|---------|
| `types/v2.ts` | V2 type definitions |
| `app/api/transaction-v2/route.ts` | V2 YAML loader API |
| `scripts/generate-v2-tx-docs.mjs` | MDX generator for V2 |
| `scripts/docs-coverage-check-v2.ts` | V2 coverage validation |
| `components/react-flow/transactions/DiagramTransactionFlowV2.tsx` | V2 diagram (optional) |

## Files to NOT Modify

| Existing File | Reason |
|---------------|--------|
| `types/index.ts` | V1 types still in use |
| `app/api/transaction/route.ts` | V1 API still needed |
| `scripts/docs-coverage-check.ts` | V1 coverage still needed |
| `scripts/generate-api-docs.mjs` | Works for OpenAPI, not tx YAML |
| `components/react-flow/transactions/*.tsx` | V1 diagram components |

---

## Current V2 Transaction YAML Status

| File | Schema Status | Diagram Ready |
|------|---------------|---------------|
| `general/mint-access-token.yaml` | V2 analysis format | No |
| `course/admin/create.yaml` | V2 analysis format | No |
| `course/admin/teachers-update.yaml` | V2 analysis format | No |
| `course/teacher/modules-manage.yaml` | V2 analysis format | No |

**Note:** Our current V2 YAMLs are excellent for documentation and analysis but need transformation to work with the diagram components.

---

## Next Steps

1. **Immediate:** Standardize V2 YAML schema across all 4 existing files
2. **Short-term:** Create `types/v2.ts` with proper interfaces
3. **Short-term:** Create `generate-v2-tx-docs.mjs` script
4. **Medium-term:** Decide on diagram approach (adapter vs new component)
5. **Medium-term:** Create V2 coverage check script

---

## Related Files Reference

```
scripts/
├── docs-coverage-check.ts       # V1 only - DO NOT MODIFY
├── generate-api-docs.mjs        # OpenAPI - unrelated to tx YAML
├── generate-all-api-docs.mjs    # OpenAPI - unrelated to tx YAML
└── [NEW] generate-v2-tx-docs.mjs

types/
├── index.ts                     # V1 types - DO NOT MODIFY
├── api.ts                       # API types
└── [NEW] v2.ts

public/yaml/
├── validator-registry-v1.yaml   # V1 registry
├── validator-registry-v2.yaml   # V2 registry (existing, review needed)
└── transactions/
    ├── v1/                      # V1 transactions
    └── v2/                      # V2 transactions (our new work)
        ├── address-registry.json
        ├── cost-registry.json
        ├── endpoint-registry.json
        └── {system}/{role}/*.yaml
```
