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
  redeemer?: RedeemerValue;
  tokens: string[];
}

// Withdraw structure
interface Withdraw {
  id: string;
  redeemer?: RedeemerValue;
  amount?: number;
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
