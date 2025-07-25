// API Response Types for External YAML Access
// These types define the structure of responses from the Andamio YAML API endpoints

import { Registry, TransactionYaml } from "./index";

// Base error response structure
export interface ApiError {
  error: string;
  status: number;
}

// Registry API Types
export interface RegistryResponse extends Registry {
  // API response metadata
  timestamp?: string;
  version?: string;
  source?: string;
}

export interface SystemResponse {
  system: string;
  data: {
    validators?: { [key: string]: unknown };
    tokens?: { [key: string]: unknown };
  };
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

// Enhanced transaction response with resolved addresses and tokens
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

export interface ExpectedTxResponse {
  label: string;
  linkUrl: string;
  docsId: string;
  inputs: ExpectedTxInput[];
  outputs: ExpectedTxOutput[];
}

export interface ExpectedTxInput {
  address: string;
  docsId: string;
  assets: ExpectedTxAsset[];
}

export interface ExpectedTxOutput {
  address: string;
  docsId: string;
  assets: ExpectedTxAsset[];
}

export interface ExpectedTxAsset {
  label: string;
  linkUrl: string;
  docsId: string;
  policyId: string | undefined | null;
  assetName: string | undefined | null;
  quantity: string | undefined | null;
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

export interface DeploymentParams {
  deployment: string;
  version: string;
  systems: {
    [key: string]: {
      addresses?: {
        [key: string]: string;
      };
      tokens?: {
        [key: string]: string;
      };
    };
  };
}

export interface DeploymentExampleParams {
  deployment: string;
  version: string;
  local_instances?: {
    course?: {
      addresses?: {
        [key: string]: string;
      };
      tokens?: {
        [key: string]: string;
      };
    };
    project?: {
      addresses?: {
        [key: string]: string;
      };
      tokens?: {
        [key: string]: string;
      };
    };
  };
  transactions?: {
    [role: string]: {
      [transactionName: string]: string;
    };
  };
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
  | ExpectedTxResponse
  | DeploymentParams
  | ApiError;
