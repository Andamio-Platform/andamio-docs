# PublishTx Integration and API Versioning Updates

## Date: 2025-09-17

## Overview
This document outlines the changes made to integrate the new `PublishTx` transaction and update the API routes to properly handle versioned transaction directories.

## Changes Made

### 1. New Transaction Added
- **File**: `public/yaml/transactions/v1/general/publish-tx.yaml`
- **Transaction ID**: `general.publish-tx`
- **Purpose**: Pays service fee to publish a course or project local state to the blockchain
- **Key Features**:
  - Role: general
  - Category: general
  - Requires: `global-state.access-token-user` token
  - Service fee: 150 ADA paid to course facilitator
  - No multi-signature requirement

### 2. API Route Updates for Version Support

#### Updated: `/api/transactions/[role]/[transaction]/route.ts`
**Change**: Modified the file path construction to include version parameter

```typescript
// Before:
const filePath = `yaml/transactions/${role}/${transaction}.yaml`;

// After:
const filePath = `yaml/transactions/${version}/${role}/${transaction}.yaml`;
```

- Now accepts `version` query parameter (defaults to "v1")
- Supports versioned transaction directory structure (`v1/`, `v2/`)

#### Updated: `/api/transactions/route.ts`
**Changes**:
1. Added version parameter support to the listing endpoint
2. Updated transaction discovery to handle versioned directories
3. Modified URL generation to include version parameter

```typescript
// Key changes:
const version = searchParams.get("version") || "v1";

// Version-aware transaction discovery
if (role) {
  transactions = getAllTransactions("", `${version}/${role}`);
} else {
  transactions = getAllTransactions("", version);
}

// Updated URL generation with version parameter
url: `/api/transactions/${roleDir}/${transactionName}?version=${version}`
```

## API Usage Examples

### List all transactions for a specific version:
```bash
GET /api/transactions?version=v1
```

### List transactions for a specific role and version:
```bash
GET /api/transactions?version=v1&role=general
```

### Get specific transaction with version:
```bash
GET /api/transactions/general/publish-tx?version=v1
```

### Response structure for publish-tx:
```json
{
  "role": "general",
  "transaction": "publish-tx",
  "file": "v1/general/publish-tx.yaml",
  "data": {
    "name": "PublishTx",
    "id": "general.publish-tx",
    "metadata": {
      "role": "general",
      "category": "general",
      "requires_tokens": ["global-state.access-token-user"],
      "estimated_cost": "0 ADA",
      "description": "Pays service fee to publish a course or project local state to the blockchain",
      "multi_signature": false
    },
    "outputs": [...]
  },
  "resolved": {
    "addresses": {...},
    "tokens": {...}
  }
}
```

## Directory Structure
The transaction files are organized with version directories:
```
public/yaml/transactions/
├── simple-spending-tx.yaml  # Legacy file (excluded from API)
├── v1/                      # Version 1 transactions
│   ├── admin/
│   ├── contributor/
│   ├── course-creator/
│   ├── general/
│   │   ├── access-token-mint.yaml
│   │   └── publish-tx.yaml  # New transaction
│   ├── project-creator/
│   └── student/
└── v2/                      # Version 2 transactions
    └── ...
```

## Backward Compatibility
- Default version is "v1" when not specified
- Existing API calls continue to work without modification
- Version parameter is optional but recommended for clarity

## Testing
The changes were validated with the following tests:

1. **Transaction listing**: Confirmed `publish-tx` appears in general role transactions
2. **Direct access**: Successfully retrieved transaction data via API endpoint
3. **Version handling**: Verified both v1 and v2 directories are properly handled
4. **Deployment resolution**: Confirmed addresses and tokens are resolved based on deployment parameter

## Impact
- All transaction API endpoints now support versioned transaction files
- Enables parallel development of v1 and v2 transaction specifications
- Maintains clean separation between protocol versions
- No breaking changes to existing API consumers (backward compatible)