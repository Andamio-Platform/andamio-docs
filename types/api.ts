// API Response Types for External YAML Access
// These types define the structure of responses from the Andamio YAML API endpoints

import { Registry, TransactionYaml } from "./index";

// Base error response structure
export interface ApiError {
  error: string;
  status: number;
}

// Registry API Types
export interface RegistryResponse extends Registry {}

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
  | DeploymentsListResponse
  | DeploymentResponse
  | YamlFilesResponse
  | ApiError;