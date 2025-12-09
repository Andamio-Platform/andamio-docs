/**
 * V2 Transaction Types
 *
 * These types support the V2 transaction YAML schema, which is built from
 * CBOR analysis for maximum accuracy. The schema supports both:
 * - Diagram rendering (inputs → transaction → outputs flow)
 * - Cost documentation (detailed fee breakdowns)
 *
 * V2 YAMLs live at: public/yaml/transactions/v2/{system}/{role}/{name}.yaml
 * Registry at: public/yaml/transactions/v2/address-registry.json
 */

// =============================================================================
// METADATA
// =============================================================================

export interface V2TransactionMetadata {
  role: string;           // e.g., "admin", "teacher", "student", "open"
  system: string;         // e.g., "course", "project", "general"
  description: string;
  api_endpoint?: string;  // e.g., "/tx/v2/course/admin/create"
}

// =============================================================================
// COSTS
// =============================================================================

export interface V2ExecutionUnits {
  mem: number;
  steps: number;
}

export interface V2TransactionCosts {
  txFee: number;                           // Transaction fee in lovelace
  serviceFee?: number;                     // Protocol/instance fee in lovelace
  serviceFeeRecipient?: string;            // "protocol-treasury" or "instance-treasury"

  utxoDeposits?: Record<string, number>;   // UTxO deposits by name

  walletDelta?: {                          // Verified against actual wallet
    lovelace: number;
    ada: string;
    breakdown?: string;
    verified?: boolean;
  };

  executionUnits?: Record<string, V2ExecutionUnits>;
  collateral?: number;

  notes?: string;
}

// =============================================================================
// DATUM & REDEEMER
// =============================================================================

export type V2DatumValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | V2DatumValue[]
  | null;

export interface V2Datum {
  constructor?: number;
  fields?: Record<string, V2DatumValue>;
  [key: string]: V2DatumValue | undefined;
}

export interface V2Redeemer {
  action?: string;
  data?: string;
  format?: string;
  fields?: Record<string, V2DatumValue>;
}

// =============================================================================
// INPUTS
// =============================================================================

export interface V2TransactionInput {
  id: string;
  type: "script" | "wallet";

  // For script inputs
  validator?: string;                      // Validator name from registry
  address?: string;                        // Actual address
  redeemer?: V2Redeemer;

  // Value and datum
  value?: string[];
  datum?: V2Datum | Record<string, unknown>;

  // Documentation
  description?: string;
  notes?: string;
  label?: string;
}

// =============================================================================
// REFERENCE INPUTS
// =============================================================================

export interface V2ReferenceInput {
  id: string;
  utxo?: string;                           // "txhash#index" format
  tx_id?: string;                          // Alternative: just the tx hash
  index?: number;                          // Alternative: just the index
  description?: string;
  notes?: string;
  source?: string;                         // Description of where this comes from
}

// =============================================================================
// OUTPUTS
// =============================================================================

export interface V2TransactionOutput {
  id: string;
  type: "script" | "wallet";

  // For script outputs
  validator?: string;                      // Validator name from registry
  address?: string;                        // Actual address

  // Value and datum
  value: string[];
  datum?: V2Datum | Record<string, unknown>;

  // Script reference (for outputs carrying embedded scripts)
  script_ref?: string;

  // Documentation
  description?: string;
  notes?: string;
  label?: string;                          // e.g., "protocol-treasury", "user"
}

// =============================================================================
// MINTS
// =============================================================================

export interface V2MintToken {
  quantity?: number;
  name: string;
  hex?: string;
  description?: string;
}

export interface V2Mint {
  id: string;
  policy: string;                          // Policy name from registry
  policyId?: string;                       // Actual policy ID
  redeemer?: V2Redeemer;
  tokens: (string | V2MintToken)[];        // Can be simple strings or detailed objects
  notes?: string;
}

// =============================================================================
// WITHDRAWALS (Observers)
// =============================================================================

export interface V2Withdraw {
  id: string;
  validator?: string;                      // Observer name from registry
  stakeAddress?: string;                   // Actual stake address
  redeemer?: V2Redeemer;
  amount: number;                          // Usually 0 for observers
  description?: string;
}

// =============================================================================
// EXAMPLE CONTEXT (for documentation)
// =============================================================================

export interface V2ExampleContext {
  [key: string]: string | string[] | number | Record<string, unknown>;
}

// =============================================================================
// MAIN TRANSACTION YAML STRUCTURE
// =============================================================================

export interface TransactionYamlV2 {
  // Identity
  name: string;
  id: string;                              // e.g., "course.admin.create"

  // Metadata
  metadata: V2TransactionMetadata;

  // Costs (from CBOR analysis)
  costs?: V2TransactionCosts;

  // Example context for documentation
  example_context?: V2ExampleContext;

  // Transaction structure
  inputs: V2TransactionInput[];
  reference_inputs?: V2ReferenceInput[];
  outputs: V2TransactionOutput[];
  mints?: V2Mint[];
  withdraws?: V2Withdraw[];

  // Analysis notes
  observations?: string[];
  questions?: string[];

  // Inline registry (optional, for standalone documentation)
  registry?: Record<string, {
    policyId?: string;
    address?: string;
    stakeAddress?: string;
  }>;

  // Fees section (alternative to costs, for simpler docs)
  fees?: {
    transaction_fee?: string;
    collateral?: string;
    service_fee?: string | null;
    notes?: string;
  };
}

// =============================================================================
// REGISTRY TYPES (address-registry.json)
// =============================================================================

export interface V2Policy {
  policyId: string;
  description?: string;
  tokenPrefixes?: Record<string, string>;
  tokenNaming?: string;
  tokens?: Record<string, string>;
  inferredFrom?: string[];
}

export interface V2Validator {
  address: string;
  purpose: string;
  description?: string;
  hasScriptRef?: boolean;
  designNote?: string;
  inferredFrom?: string[];
}

export interface V2Observer {
  stakeAddress: string;
  purpose: string;
  description?: string;
  inferredFrom?: string[];
}

export interface V2Wallet {
  address: string;
  description?: string;
  fee?: string;
  fees?: Record<string, string>;
  designNote?: string;
  inferredFrom?: string[];
}

export interface V2AddressRegistry {
  version: string;
  lastUpdated: string;
  network: string;
  notes?: string[];

  policies: Record<string, V2Policy>;
  validators: Record<string, V2Validator>;
  observers: Record<string, V2Observer>;
  wallets: Record<string, V2Wallet>;
  referenceUtxos?: Record<string, {
    description: string;
    inferredFrom?: string[];
  }>;
}

// =============================================================================
// ENDPOINT REGISTRY (endpoint-registry.json)
// =============================================================================

export interface V2EndpointRequest {
  [key: string]: {
    type: string;
    required: boolean;
    description?: string;
    items?: string | { type: string; properties?: Record<string, unknown> };
    properties?: Record<string, unknown>;
  };
}

export interface V2Endpoint {
  role: string;
  system: string;
  action: string;
  endpoint: string;
  method: string;
  description: string;
  requestBody?: string;
  request: V2EndpointRequest;
  response: {
    unsignedTxCBOR: { type: string; required: boolean };
    [key: string]: { type: string; required: boolean; description?: string };
  };
}

export interface V2EndpointRegistry {
  version: string;
  lastUpdated: string;
  baseUrl: string;
  notes?: string[];
  urlPattern?: {
    current: string;
    upcoming: string;
  };
  commonTypes?: Record<string, {
    type: string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    description?: string;
    properties?: Record<string, unknown>;
  }>;
  transactions: Record<string, V2Endpoint>;
}

// =============================================================================
// COST REGISTRY (cost-registry.json)
// =============================================================================

export interface V2CostEntry {
  txFee: number;
  txFeeAda: string;
  serviceFee: number;
  serviceFeeAda: string;
  serviceFeeRecipient: string | null;
  utxoFlow?: {
    spent?: Record<string, number | string>;
    created?: Record<string, number | string>;
    netChange?: number;
    netChangeAda?: string;
    notes?: string;
  };
  utxoDeposits?: Record<string, number | string>;
  walletDelta?: {
    lovelace: number;
    ada: string;
    breakdown: string;
    verified?: string;
  };
  totalCost?: {
    lovelace: number;
    ada: string;
    breakdown: string;
  };
  executionUnits?: Record<string, V2ExecutionUnits>;
  collateral?: number;
  scalingEstimates?: Record<string, {
    txFee: string;
    deposits: string;
    total: string;
  }>;
}

export interface V2CostRegistry {
  version: string;
  lastUpdated: string;
  network: string;
  notes?: string[];
  treasuries?: Record<string, {
    address: string;
    description: string;
  }>;
  serviceFees?: Record<string, {
    amount: number;
    ada: string;
    recipient: string | null;
    note?: string;
  }>;
  transactionCosts: Record<string, V2CostEntry>;
  minUtxoByType?: Record<string, {
    observed?: number[];
    average?: number;
    description?: string;
    samples?: { tx: string; values: number[] }[];
    estimatedRange?: { min: number; max: number };
  }>;
}

// =============================================================================
// HELPER TYPES FOR DIAGRAM RENDERING
// =============================================================================

/**
 * Normalized structure for diagram rendering.
 * V2 YAMLs can be transformed to this format for the existing diagram components.
 */
export interface V2DiagramData {
  name: string;
  metadata: {
    role: string;
    category: string;               // Derived from system
    requires_tokens: string[];      // Derived from inputs
    estimated_fee: string;          // Derived from costs
    description: string;
    multi_signature: boolean;       // Derived from inputs
  };
  inputs: {
    id: string;
    type: string;
    redeemer?: string;
    output: {
      address: string;
      value: string[];
      datum?: string;
      script?: string;
    };
  }[];
  reference_inputs?: {
    id: string;
    type: string;
    output: {
      address: string;
      value: string[];
      datum?: string;
      script?: string;
    };
  }[];
  outputs: {
    id: string;
    type: string;
    output: {
      address: string;
      value: string[];
      datum?: string;
      script?: string;
    };
  }[];
  mints?: {
    id: string;
    policy: string;
    redeemer?: string;
    tokens: string[];
  }[];
  withdraws?: {
    id: string;
    redeemer?: string;
    amount?: number;
    observer?: string;
  }[];
}

/**
 * Transform a V2 transaction YAML to the V1-compatible diagram format
 */
export function transformV2ToDiagramData(v2: TransactionYamlV2): V2DiagramData {
  return {
    name: v2.name,
    metadata: {
      role: v2.metadata.role,
      category: v2.metadata.system,
      requires_tokens: [], // Could derive from inputs
      estimated_fee: v2.costs?.walletDelta?.ada ||
                     (v2.costs?.txFee ? `~${(v2.costs.txFee / 1_000_000).toFixed(2)} ADA` : "unknown"),
      description: v2.metadata.description,
      multi_signature: v2.inputs.filter(i => i.type === "wallet").length > 1,
    },
    inputs: v2.inputs.map(input => ({
      id: input.id,
      type: input.type,
      redeemer: input.redeemer ? JSON.stringify(input.redeemer) : undefined,
      output: {
        // Prefer validator name over raw address for diagram display
        address: input.validator || input.label || input.address || "unknown",
        value: input.value || [],
        datum: input.datum ? JSON.stringify(input.datum) : undefined,
      },
    })),
    reference_inputs: v2.reference_inputs?.map(ref => ({
      id: ref.id,
      type: "reference",
      output: {
        address: ref.description || ref.utxo || `${ref.tx_id}#${ref.index}`,
        value: [],
        datum: undefined,
      },
    })),
    outputs: v2.outputs.map(output => ({
      id: output.id,
      type: output.type,
      output: {
        // Prefer validator name or label over raw address for diagram display
        address: output.validator || output.label || output.address || "unknown",
        value: output.value,
        datum: output.datum ? JSON.stringify(output.datum) : undefined,
        script: output.script_ref,
      },
    })),
    mints: v2.mints?.map(mint => ({
      id: mint.id,
      policy: mint.policy,
      redeemer: mint.redeemer ? JSON.stringify(mint.redeemer) : undefined,
      tokens: mint.tokens.map(t => typeof t === "string" ? t : `${t.quantity || 1} ${t.name}`),
    })),
    withdraws: v2.withdraws?.map(w => ({
      id: w.id,
      redeemer: w.redeemer ? JSON.stringify(w.redeemer) : undefined,
      amount: w.amount,
      observer: w.validator,
    })),
  };
}
