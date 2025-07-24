/**
 * TypeScript definitions for Andamio YAML API
 * 
 * These types define the structure of responses from the Andamio YAML API endpoints.
 * Import these types in your external applications for type safety.
 * 
 * @example
 * ```typescript
 * import type { RegistryResponse, TransactionResponse } from './andamio-api';
 * 
 * const registry: RegistryResponse = await fetch('https://docs.andamio.io/api/registry')
 *   .then(res => res.json());
 * ```
 */

// Base error response structure
export interface ApiError {
  error: string;
  status: number;
}

// Registry API Types
export interface RedeemerAction {
  action: string;
  transaction: string | string[];
}

export interface RedeemerType {
  type?: string;
  transaction?: string | string[];
  [key: string]: string | string[] | RedeemerAction[] | unknown;
}

export interface ValidatorInfo {
  name: string;
  doc: string;
  purpose: string;
  address?: string;
  blueprint?: string;
  title?: string;
  redeemer?: RedeemerType | RedeemerType[];
}

export interface TokenInfo {
  "asset-id": string;
  "minted-in"?: string | string[] | null;
  "used-in"?: string | string[] | null;
  "referenced-in"?: string | string[] | null;
  "burned-in"?: string | string[] | null;
}

export interface SystemValidators {
  validators?: { [key: string]: ValidatorInfo };
  tokens?: { [key: string]: TokenInfo };
}

export interface Registry {
  systems: {
    [key: string]: SystemValidators;
  };
}

export interface RegistryResponse extends Registry {}

export interface SystemResponse {
  system: string;
  data: SystemValidators;
}

// Transaction Types
export interface TransactionMetadata {
  role: string;
  category: string;
  requires_tokens?: string[];
  estimated_fee?: string;
  estimated_cost?: string;
  description: string;
  multi_signature: boolean;
  required_signatures?: string[];
}

export interface OutputStructure {
  address: string;
  value: string[];
  datum?: string | Record<string, unknown> | null;
  script?: string;
}

export interface TransactionInput {
  id: string;
  type: string;
  redeemer?: string | Record<string, unknown> | null;
  output: OutputStructure;
}

export interface ReferenceInput {
  id: string;
  type: string;
  output: OutputStructure;
}

export interface TransactionOutput {
  id: string;
  type: string;
  output: OutputStructure;
}

export interface Mint {
  id: string;
  policy: string;
  redeemer?: string | Record<string, unknown> | null;
  tokens: string[];
}

export interface Withdrawal {
  id: string;
  amount: string;
  observer: string;
  redeemer?: string | Record<string, unknown> | null;
}

export interface TransactionYaml {
  name: string;
  id: string;
  metadata: TransactionMetadata;
  graph_attrs?: {
    rankdir: string;
    bgcolor: string;
    splines: string;
    nodesep: number;
    ranksep: number;
  };
  inputs: TransactionInput[];
  reference_inputs?: ReferenceInput[];
  outputs: TransactionOutput[];
  mints?: Mint[];
  withdraws?: Withdrawal[];
}

// Transactions API Types
export interface TransactionListItem {
  file: string;
  role: string;
  transaction: string;
  id: string;
  url: string;
}

export interface TransactionsListResponse {
  count: number;
  transactions: TransactionListItem[];
}

export interface TransactionResponse {
  role: string;
  transaction: string;
  file: string;
  data: TransactionYaml;
}

// Enhanced transaction response with deployment resolution
export interface ResolvedTransactionResponse extends TransactionResponse {
  resolved?: {
    addresses: {
      [addressName: string]: {
        path: string;
        originalValue: string;
        resolvedValue: string;
      };
    };
    tokens: {
      [tokenName: string]: {
        path: string;
        originalValue: string;
        resolvedValue: string;
      };
    };
  };
}

// Deployments API Types
export interface DeploymentListItem {
  deployment: string;
  url: string;
}

export interface DeploymentsListResponse {
  count: number;
  deployments: DeploymentListItem[];
}

export interface DeploymentResponse {
  deployment: string;
  files: {
    [fileName: string]: unknown | { error: string };
  };
}

// YAML Files Discovery API Types
export interface YamlFilesCategory {
  count: number;
  files: string[];
}

export interface YamlFilesResponse {
  totalFiles: number;
  categories: {
    registry: YamlFilesCategory;
    transactions: YamlFilesCategory;
    deployments: YamlFilesCategory;
    other: YamlFilesCategory;
  };
  allFiles: string[];
}

// Union type for all possible API responses
export type ApiResponse = 
  | RegistryResponse
  | SystemResponse
  | TransactionsListResponse
  | TransactionResponse
  | ResolvedTransactionResponse
  | DeploymentsListResponse
  | DeploymentResponse
  | YamlFilesResponse
  | ApiError;