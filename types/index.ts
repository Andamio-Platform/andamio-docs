// No need to import React Flow types here as they're used directly in the component

// Define types for complex structures
type DatumValue = string | Record<string, unknown> | null;
type RedeemerValue = string | Record<string, unknown> | null;

// Graph attributes for visualization
interface GraphAttributes {
  rankdir: string;
  bgcolor: string;
  splines: string;
  nodesep: number;
  ranksep: number;
}

// Common output structure shared by inputs, reference inputs, and outputs
interface OutputStructure {
  address: string;
  value: string[];
  datum?: DatumValue;
  script?: string;
}

// Input structure
interface TransactionInput {
  id: string;
  type: string;
  redeemer?: RedeemerValue;
  output: OutputStructure;
}

// Reference input structure (similar to input but used differently)
interface ReferenceInput {
  id: string;
  type: string;
  output: OutputStructure;
}

// Output structure
interface TransactionOutput {
  id: string;
  type: string;
  output: OutputStructure;
}

// Mint structure
interface Mint {
  id: string;
  policy: string;
  redeemer?: RedeemerValue;
  tokens: string[];
}

// Withdraw structure
interface Withdraw {
  id: string;
  redeemer?: RedeemerValue;
  amount?: number;
  observer?: string;
}

// Main transaction YAML structure
export interface TransactionYaml {
  name: string;
  metadata: {
    role: string;
    category: string;
    requires_tokens: string[];
    estimated_fee: string;
    description: string;
    multi_signature: boolean;
  };
  graph_attrs?: GraphAttributes;
  inputs: TransactionInput[];
  reference_inputs?: ReferenceInput[];
  outputs: TransactionOutput[];
  mints?: Mint[];
  withdraws?: Withdraw[];
}

// Props for the DiagramTransactionWrapper component
export interface DiagramTransactionWrapperProps {
  yamlPath?: string; // Optional path to the YAML file
}

// Validator Types
// Props interface for the component
export interface DiagramValidatorOverviewProps {
  system: string;
  validatorId: string;
}

// Node type identifiers for validator diagram
export type ValidatorNodeTypes = {
  validatorNode: "validatorNode";
  redeemerNode: "redeemerNode";
};

// Registry types based on registry.yaml structure
export interface RedeemerAction {
  action: string;
  transaction: string | string[];
}

// Redeemer can have different structures based on the registry.yaml
export interface RedeemerType {
  type?: string;
  transaction?: string | string[];
  [key: string]: string | string[] | RedeemerAction[] | unknown; // For action types like AssignmentDecisionAction, CourseStateAction, etc.
}

export interface Validator {
  name: string;
  purpose: string | string[];
  blueprint?: string;
  title?: string;
  redeemer?: RedeemerType | RedeemerType[];
  [key: string]:
    | string
    | string[]
    | RedeemerType
    | RedeemerType[]
    | Record<string, unknown>
    | undefined;
}

export interface SystemValidators {
  validators: {
    [key: string]: Validator;
  };
}

export interface Registry {
  systems: {
    [key: string]: SystemValidators;
  };
}
