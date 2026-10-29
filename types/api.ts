// API Response Types for External YAML Access
// These types define the structure of responses from the Andamio YAML API endpoints

import { TransactionYaml } from "./index";

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

export interface ExpectedTxResponse {
  label: string;
  linkUrl: string;
  docsId: string;
  inputs: ExpectedTxInput[];
  outputs: ExpectedTxOutput[];
  andamio_protocol_treasury_fee: number;
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

export interface DeploymentParams {
  deployment: string;
  version: string;
  andamio_protocol_treasury?: string;
  andamio_services_treasury?: string;
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
