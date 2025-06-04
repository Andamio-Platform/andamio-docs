# Andamio Protocol Diagrams

A comprehensive tool for generating visual diagrams for the Andamio protocol using GraphViz. This system converts YAML definitions into professional diagrams for both transaction flows and validator relationships with enhanced metadata support.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [YAML Configuration Format](#yaml-configuration-format)
- [Usage](#usage)
- [Andamio Protocol Features](#andamio-protocol-features)
- [Examples](#examples)
- [Batch Processing](#batch-processing)
- [Troubleshooting](#troubleshooting)

## Overview

This tool generates visual transaction diagrams showing the flow of UTxOs, operations, and redeemers for the Andamio protocol. It features:

- **28 Transaction diagrams** - Complete protocol coverage for all transaction types
- **24 Validator diagrams** - Comprehensive validator and script relationships
- **Enhanced metadata support** - Role-based transactions with fee estimates
- **Automatic styling** - Smart node type inference and layout
- **Batch processing** - Generate all diagrams with one command
- **5-column layout** - references → inputs → redeemers → transaction → outputs

### Core Components
- **YAML configuration files** - Define transaction and validator structures with metadata
- **Python scripts** (`build_transaction_diagram.py`, `build_validator_diagram.py`) - Convert YAML to GraphViz DOT format
- **Individual generation** (`generate-transaction-png.sh`, `generate-validator-png.sh`) - Single diagram workflow
- **Batch generation** (`generate-all-transaction-diagrams.sh`, `generate-all-validator-diagrams.sh`) - Process all diagrams
- **Deployment script** (`deploy-diagrams.sh`) - Deploy generated PNGs to public directories

## Prerequisites

### Required Software
- **Python 3.6+**
- **GraphViz** - For rendering diagrams
- **PyYAML** - Python library for YAML parsing

### Install GraphViz

**Ubuntu/Debian:**
```bash
sudo apt install graphviz
```

**macOS:**
```bash
brew install graphviz
```

**Windows:**
Download from [GraphViz website](https://graphviz.org/download/) or use Chocolatey:
```bash
choco install graphviz
```

## Setup

### 1. Create Python Virtual Environment
```bash
cd diagrams/graphviz/generate

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 2. Install Python Dependencies
```bash
# Upgrade pip (recommended)
pip install --upgrade pip

# Install PyYAML
pip install pyyaml
```

### 3. Make Scripts Executable
```bash
cd diagrams/graphviz/generate
chmod +x generate-transaction-png.sh generate-validator-png.sh
chmod +x generate-all-transaction-diagrams.sh generate-all-validator-diagrams.sh
chmod +x deploy-diagrams.sh
```

## YAML Configuration Format

### Enhanced Structure with Metadata
```yaml
name: TransactionName

# Enhanced metadata for Andamio protocol
metadata:
  role: "Student|CourseCreator|ProjectCreator|Contributor|InstanceAdmin|General"
  category: "assignment_management|treasury_management|state_management"
  requires_tokens: ["100at", "222at", "roleSpecificNFT"]
  estimated_fee: "2.5 ADA"
  description: "Human-readable transaction description"
  multi_signature: true|false
  required_signatures: ["role1", "role2"]  # if multi_signature: true

graph_attrs:
  rankdir: LR
  bgcolor: "#ffffff"
  splines: ortho
  nodesep: 0.4
  ranksep: 0.8

# Reference inputs (gray boxes on left)
references:
  - id: params_ref
    title: "params ref"
  - id: instance_ref  
    title: "instance ref"
  - id: global_state_ref
    title: "global state"

inputs:
  - id: input_id
    title: "Input Title"
    values:
      - "Token amounts and types"
    datum:
      field1: "value"
      field2: "value"
    redeemer:  # Optional
      id: redeemer_id
      title: "Redeemer Title"
      params:
        - "param1"
        - "param2"

# Reference inputs (read-only)
reference_inputs:
  - id: ref_input_id
    title: "Reference Input Title"
    values:
      - "Reference data"
    datum:
      config: "reference_config"

transaction:  # or 'operation' for backwards compatibility
  id: transaction_id
  title: "Transaction Description"

outputs:
  - id: output_id
    title: "Output Title"
    values:
      - "Token amounts and types"
    datum:
      field1: "value"
    mint:  # Optional
      id: mint_policy_id
      title: "Mint Policy"

connections: []  # Usually empty - connections are implied

ranks:
  - type: same
    nodes: [input1, input2, input3]
  - type: same
    nodes: [output1, output2, output3]
```

### Basic Structure (Legacy)
```yaml
name: TransactionName

graph_attrs:
  rankdir: LR
  bgcolor: "#ffffff"
  splines: ortho
  nodesep: 0.3
  ranksep: 0.3

styles:
  default_node: 'shape=box, style="filled", fillcolor="#ffffff", color="#4CAF50"'
  validator_node: 'shape=box, style="filled", fillcolor="#ffffff", color="#cc7000"'
  operation_node: 'height=6, width=2, fillcolor="#ffffff", color="#00796b"'

inputs:
  - id: input_id
    title: "Input Title"
    values:
      - "Token amounts and types"
    datum:
      field1: "value"
      field2: "value"
    redeemer:  # Optional
      id: redeemer_id
      title: "Redeemer Title"
      style: validator_node

operation:
  id: operation_id
  title: "Operation Description"
  style: operation_node

outputs:
  - id: output_id
    title: "Output Title"
    values:
      - "Token amounts and types"
    datum:
      field1: "value"

connections: []  # Usually empty - connections are implied

ranks:
  - type: same
    nodes: [input1, input2, input3]
  - type: same
    nodes: [output1, output2, output3]
```

### Connection Rules

**Automatic connections are created based on structure:**

1. **Inputs without redeemers** → directly to operation
2. **Inputs with redeemers** → redeemer → operation
3. **Operation** → all outputs

### Required Fields
- `name`: Transaction name
- `inputs`: Array of input UTxOs
- `operation`: Single operation definition
- `outputs`: Array of output UTxOs

### Optional Fields
- `graph_attrs`: GraphViz graph attributes
- `styles`: Custom node styles
- `connections`: Explicit connections (usually empty)
- `ranks`: Layout constraints
- `redeemer`: Per-input redeemer definition

## Usage

### Method 1: Batch Processing (Recommended)
Generate all Andamio protocol transaction diagrams at once:

```bash
cd diagrams/graphviz/generate

# Generate all transaction diagrams
./generate-all-transaction-diagrams.sh

# Generate all validator diagrams  
./generate-all-validator-diagrams.sh
```

This processes all YAML files and creates:
- Smart file updates (only regenerates when YAML is newer)
- Progress tracking with colored output
- Summary statistics
- Metadata-only file detection

### Method 2: Individual Diagrams

**For transactions:**
```bash
cd diagrams/graphviz/generate
./generate-transaction-png.sh student-commit-to-assignment.yaml
```

**For validators:**
```bash
cd diagrams/graphviz/generate
./generate-validator-png.sh assignment-validator.yaml
```

This creates:
- `output/transactions/student-commit-to-assignment.dot` - GraphViz DOT file
- `output/transactions/student-commit-to-assignment.png` - PNG image with enhanced metadata
- `output/validators/assignment-validator.dot` - GraphViz DOT file
- `output/validators/assignment-validator.png` - PNG image

### Method 3: Manual Steps
```bash
cd diagrams/graphviz/generate
source venv/bin/activate

# For transaction diagrams:
python3 build_transaction_diagram.py student-commit-to-assignment.yaml --yaml-dir=yaml/transactions --output-dir=output/transactions -o diagram.dot

# For validator diagrams:
python3 build_validator_diagram.py assignment-validator.yaml --yaml-dir=yaml/validators --output-dir=output/validators -o diagram.dot

# Step 2: Generate image
dot -Tpng output/transactions/diagram.dot -o output/transactions/diagram.png
dot -Tpng output/validators/diagram.dot -o output/validators/diagram.png

# Alternative formats:
dot -Tsvg output/transactions/diagram.dot -o output/transactions/diagram.svg
dot -Tpdf output/transactions/diagram.dot -o output/transactions/diagram.pdf
```

### Command Line Options

**build_transaction_diagram.py:**
```bash
python3 build_transaction_diagram.py <yaml_file> [--yaml-dir=DIR] [--output-dir=DIR] [-o output_file]

Options:
  yaml_file        Input YAML configuration file (filename only)
  --yaml-dir       Directory containing YAML files (default: yaml/transactions)
  --output-dir     Output directory for generated files (default: output/transactions)
  -o, --output     Output DOT filename (default: stdout)
```

**build_validator_diagram.py:**
```bash
python3 build_validator_diagram.py <yaml_file> [--yaml-dir=DIR] [--output-dir=DIR] [-o output_file]

Options:
  yaml_file        Input YAML configuration file (filename only)
  --yaml-dir       Directory containing YAML files (default: yaml/validators)
  --output-dir     Output directory for generated files (default: output/validators)
  -o, --output     Output DOT filename (default: stdout)
```

**generate-transaction-png.sh:**
```bash
./generate-transaction-png.sh <yaml_filename>

Arguments:
  yaml_filename    YAML file in the yaml/transactions/ directory (filename only)
```

**generate-validator-png.sh:**
```bash
./generate-validator-png.sh <yaml_filename>

Arguments:
  yaml_filename    YAML file in the yaml/validators/ directory (filename only)
```

**generate-all-transaction-diagrams.sh:**
```bash
./generate-all-transaction-diagrams.sh

Features:
  - Processes all YAML files in yaml/transactions/ directory
  - Automatically activates Python virtual environment
  - Shows progress with colored output
  - Reports metadata-only files
  - Provides generation statistics
```

**generate-all-validator-diagrams.sh:**
```bash
./generate-all-validator-diagrams.sh

Features:
  - Processes all YAML files in yaml/validators/ directory
  - Automatically activates Python virtual environment
  - Shows progress with colored output
  - Provides generation statistics
```

**deploy-diagrams.sh:**
```bash
./deploy-diagrams.sh

Features:
  - Copies PNG files from output/transactions/ to public/diagrams/transactions/
  - Copies PNG files from output/validators/ to public/diagrams/validators/
  - Archives DOT files with timestamp
  - Creates public directories automatically
```

## Andamio Protocol Features

### Transaction Types by Role

**Student Transactions (6):**
- `student-commit-to-assignment` - Student commits to working on assignment
- `student-leave-assignment` - Student leaves an assignment
- `student-update-assignment` - Student updates assignment submission
- `student-burn-local-state` - Student burns local state, moves to global
- `student-mint-local-state` - Student mints local state token

**Course Creator Transactions (3):**
- `course-creator-accept.assignment` - Approve student assignment
- `course-creator-deny-assignment` - Deny student assignment  
- `course-creator-mint-module-tokens` - Create course module tokens

**Project Creator Transactions (6):**
- `project-creator-accept-project` - Accept contributor proposal
- `project-creator-deny-project` - Deny contributor proposal
- `project-creator-refuse-project` - Refuse project with detailed reason
- `project-creator-mint-treasury-token` - Initialize project treasury
- `project-creator-manage-treasury-token` - Manage treasury funds
- `treasury-add-funds` - Add funds to project treasury

**Contributor Transactions (6):**
- `contributor-commit-project` - Commit to working on project
- `contributor-unlock-project` - Leave a project
- `contributor-get-rewards` - Claim project completion rewards
- `contributor-mint-project-state` - Create project participation state
- `contributor-add-info` - Add/update profile information
- `contributor-burn-contributor-info` - Remove contributor information

**Instance Admin Transactions (7):**
- `admin-add-course-creators` - Add course creators to platform
- `admin-add-project-creators` - Add project creators to platform  
- `admin-rm-course-creators` - Remove course creators
- `admin-rm-project-creators` - Remove project creators
- `admin-init-course` - Initialize new course
- `admin-init-project-step-1` - Initialize project (step 1)
- `admin-init-project-step-2` - Complete project initialization

**General Transactions (1):**
- `access-token-mint` - Mint access tokens (100at, 222at)

### Enhanced Metadata Features

- **Diagram Titles**: Role, category, description, and fee estimates
- **Token Requirements**: Clear display of required tokens (100at, 222at, NFTs)
- **Multi-signature Support**: Visual indication of required signatures
- **Fee Transparency**: Estimated transaction costs (1.5-4.5 ADA)
- **Backwards Compatibility**: Works with legacy YAML files

### File Types

- **22 Complete Diagrams**: Full transaction structure with visual flow
- **7 Metadata-Only**: Title and footer information without transaction diagrams
- **Automatic Detection**: Batch script identifies and reports file types

## Examples

### Andamio Student Transaction
```yaml
name: StudentCommitToAssignmentTransaction

# Enhanced metadata for Andamio protocol
metadata:
  role: "Student"
  category: "assignment_management"
  requires_tokens: ["100at", "222at"]
  estimated_fee: "2.5 ADA"
  description: "Student commits to working on a specific module assignment"
  multi_signature: false

# Reference inputs (gray boxes on left)
references:
  - id: params_ref
    title: "params ref"
  - id: instance_ref  
    title: "instance ref"
  - id: global_state_ref
    title: "global state"

inputs:
  - id: input_student_wallet
    title: "Student Wallet"
    values:
      - "222at token"
      - "5.0 ADA"

  - id: input_course_state
    title: "Course State UTxO"
    values:
      - "1 localStateToken"
    datum:
      assignments: "assignment_list[]"
      ls_cs: "course_state_cs"
      at_cs: "access_token_cs"
      alias: "student_alias"
    redeemer:
      id: course_state_redeemer
      title: "Commit Assignment"
      params:
        - "moduleIndex"
        - "assignmentIndex"
        - "alias"

# Reference inputs (read-only)
reference_inputs:
  - id: input_global_data
    title: "Global Data UTxO"
    values:
      - "1 prt"
    datum:
      courseInstance: "(irt, course_instance)[]"
      coursePolicy: "(prt, course_policy)[]"

transaction:
  id: commit_operation
  title: "commit to\\nassignment"

outputs:
  - id: output_course_state
    title: "Updated Course State"
    values:
      - "1 localStateToken"
    datum:
      assignments: "updated_assignment_list[]"
      ls_cs: "course_state_cs"
      at_cs: "access_token_cs"
      alias: "student_alias"

  - id: output_student_wallet
    title: "Student Wallet"
    values:
      - "222at token"
      - "2.5 ADA"
```

### Multi-Signature Treasury Management
```yaml
name: ProjectCreatorManageTreasuryTransaction

metadata:
  role: "ProjectCreator"
  category: "treasury_management"
  requires_tokens: ["100at", "projectCreatorNFT", "treasuryToken"]
  estimated_fee: "4.5 ADA"
  description: "Project creator manages treasury funds and distribution"
  multi_signature: true
  required_signatures: ["projectCreator", "instanceAdmin"]

# This generates diagrams with:
# - Title showing role, category, description, and fee
# - Footer showing required tokens and multi-signature requirements
# - Professional 5-column layout with automatic connections
```

## Batch Processing

### Generate All Diagrams
```bash
cd diagrams/graphviz/generate

# Generate all transaction diagrams
./generate-all-transaction-diagrams.sh

# Generate all validator diagrams
./generate-all-validator-diagrams.sh

# Deploy all generated diagrams to public directories
./deploy-diagrams.sh
```

**Sample Output (Transaction Generation):**
```
🔄 Andamio Protocol Diagram Generator
=====================================

📁 Found 28 YAML files in ./yaml/transactions
🐍 Activating virtual environment...

🔧 Processing: student-commit-to-assignment.yaml
   ✅ Successfully generated: student-commit-to-assignment.dot & student-commit-to-assignment.png

🔧 Processing: contributor-add-info.yaml
   📋 Metadata-only file (no transaction structure)
   ✅ Successfully generated: contributor-add-info.dot & contributor-add-info.png

📊 Generation Summary
===================
✅ Successful: 28
❌ Failed: 0
⏭️  Skipped: 0
📋 Metadata-only: 7
📁 Total: 28

🎉 All diagrams generated successfully!
📂 Output files are in: ../../output/transactions
📋 Note: 7 files contain only metadata (title/footer) without transaction diagrams
```

### Features
- **Smart Processing**: Only regenerates when YAML files are newer than outputs
- **Progress Tracking**: Real-time status with colored output
- **Environment Management**: Automatically activates Python virtual environment
- **Error Recovery**: Continues processing even if individual files fail
- **File Classification**: Identifies complete diagrams vs metadata-only files
- **Statistics**: Shows detailed generation summary

## Troubleshooting

### Common Issues

**"Command not found: python"**
- Try `python3` instead of `python`
- Ensure Python is installed and in PATH

**"Module 'yaml' not found"**
```bash
# Make sure you're in the virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Install PyYAML
pip install pyyaml
```

**"Command not found: dot"**
- Install GraphViz (see Prerequisites section)
- Ensure GraphViz is in your system PATH

**"Permission denied" on bash script**
```bash
chmod +x generate-transaction-png.sh generate-validator-png.sh
```

**YAML parsing errors**
- Check YAML syntax and indentation
- Ensure all required fields are present
- Validate YAML format online or with `python -c "import yaml; yaml.safe_load(open('file.yaml'))"`

### Virtual Environment Not Working
```bash
# Deactivate current environment
deactivate

# Remove old environment
rm -rf venv

# Create new environment
python -m venv venv

# Activate and install dependencies
source venv/bin/activate  # Linux/macOS
pip install pyyaml
```

### Debugging Output
```bash
# Check if .dot file is generated correctly
cat student-commit-to-assignment.dot

# Test GraphViz separately
dot -V  # Check GraphViz version
dot -Tpng test.dot -o test.png  # Test basic rendering
```

## Repository Structure
```
diagrams/
├── README.md                               # This file
├── graphviz/
│   └── generate/
│       ├── build_transaction_diagram.py   # Transaction diagram generator
│       ├── build_validator_diagram.py     # Validator diagram generator
│       ├── generate-transaction-png.sh    # Individual transaction generation
│       ├── generate-validator-png.sh      # Individual validator generation
│       ├── generate-all-transaction-diagrams.sh  # Batch transaction processing
│       ├── generate-all-validator-diagrams.sh    # Batch validator processing
│       ├── deploy-diagrams.sh             # Deploy PNGs to public directories
│       ├── generate_mdx_docs.py           # MDX documentation generator
│       ├── requirements.txt               # Python dependencies
│       ├── venv/                          # Python virtual environment
│       ├── examples/                      # Example files
│       └── yaml/                          # YAML diagram definitions
│           ├── transactions/              # Transaction definitions
│           │   ├── student-commit-to-assignment.yaml
│           │   ├── contributor-get-rewards.yaml
│           │   ├── project-creator-manage-treasury-token.yaml
│           │   ├── admin-init-course.yaml
│           │   └── ... (22+ more transaction types)
│           └── validators/                # Validator definitions
│               ├── assignment-validator.yaml
│               ├── course-state-scripts.yaml
│               ├── treasury-scripts.yaml
│               └── ... (17+ more validator types)
└── output/                                # Generated diagrams
    ├── transactions/                      # Transaction diagram outputs
    │   ├── *.dot                         # GraphViz DOT files
    │   └── *.png                         # PNG images
    ├── validators/                        # Validator diagram outputs
    │   ├── *.dot                         # GraphViz DOT files
    │   └── *.png                         # PNG images
    └── archive_YYYY-MM-DD_HH-MM-SS/      # Archived DOT files
        ├── transactions/
        └── validators/
```

## Advanced Features

### Automatic Node Styling
The system automatically infers node styles based on context:
- **UTxO nodes**: Green borders for inputs/outputs
- **Reference inputs**: Blue borders with "read only" labels
- **Validator nodes**: Orange borders for redeemers
- **Mint policies**: Purple borders for minting operations
- **User nodes**: Diamond shapes for wallets
- **Reference nodes**: Gray backgrounds for reference data

### Layout System
- **5-column automatic layout**: Optimal visual organization
- **YAML order preservation**: Input/output order maintained from configuration
- **Smart connections**: Automatic edge generation based on transaction structure
- **Metadata integration**: Title and footer information from enhanced metadata

### Enhanced Metadata
- **Title Generation**: "Role - Category\\nDescription\\nEstimated Fee: X ADA"
- **Footer Information**: "Required Tokens: token1, token2\\nMulti-Signature: role1 + role2"
- **Role-based categorization**: Student, CourseCreator, ProjectCreator, Contributor, InstanceAdmin
- **Fee transparency**: Realistic ADA cost estimates (1.5-4.5 ADA range)

### Integration with Andamio Atlas API
- **Complete mapping**: All YAML files correspond to actual API endpoints
- **Swagger documentation**: Links to OpenAPI specifications
- **Haskell implementations**: References to transaction builder code
- **Network configurations**: Mainnet, preprod, and test environment support