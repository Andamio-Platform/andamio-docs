#!/usr/bin/env python3
"""
Generate MDX documentation files from YAML transaction definitions.

This script creates organized MDX files compatible with the andamio-docs structure,
with proper frontmatter, sections, and navigation metadata.
"""

import yaml
import os
import json
from pathlib import Path
import argparse
from typing import Dict, List, Any

class MDXGenerator:
    def __init__(self, yaml_dir: str, output_dir: str):
        self.yaml_dir = Path(yaml_dir)
        self.output_dir = Path(output_dir)
        self.transactions = {}
        self.role_groups = {
            'Student': [],
            'CourseCreator': [],
            'ProjectCreator': [],
            'Contributor': [],
            'InstanceAdmin': [],
            'General': []
        }
        
    def load_yaml_files(self):
        """Load all YAML transaction files and organize by role"""
        print("📂 Loading YAML files...")
        
        for yaml_file in self.yaml_dir.glob("*.yaml"):
            try:
                with open(yaml_file, 'r') as f:
                    config = yaml.safe_load(f)
                
                # Extract metadata and basic info
                name = config.get('name', yaml_file.stem)
                metadata = config.get('metadata', {})
                
                # Determine if it's a complete transaction or metadata-only
                has_structure = bool(config.get('inputs') or config.get('transaction') or config.get('operation'))
                
                transaction_info = {
                    'filename': yaml_file.stem,
                    'name': name,
                    'metadata': metadata,
                    'has_structure': has_structure,
                    'raw_config': config
                }
                
                self.transactions[yaml_file.stem] = transaction_info
                
                # Group by role
                role = metadata.get('role', 'General')
                if role in self.role_groups:
                    self.role_groups[role].append(transaction_info)
                else:
                    self.role_groups['General'].append(transaction_info)
                    
                print(f"  ✅ Loaded: {yaml_file.stem}")
                
            except Exception as e:
                print(f"  ❌ Error loading {yaml_file}: {e}")
    
    def generate_frontmatter(self, transaction: Dict[str, Any]) -> str:
        """Generate MDX frontmatter for a transaction"""
        metadata = transaction['metadata']
        title = transaction['name'].replace('Transaction', '')
        description = metadata.get('description', f"Documentation for {title}")
        
        frontmatter = f"""---
title: "{title}"
description: "{description}"
---
"""
        return frontmatter
    
    def generate_transaction_mdx(self, transaction: Dict[str, Any]) -> str:
        """Generate complete MDX content for a transaction"""
        metadata = transaction['metadata']
        
        # Start with frontmatter
        content = self.generate_frontmatter(transaction)
        
        # Main title and overview
        title = transaction['name'].replace('Transaction', '')
        content += f"""
# {title}

{metadata.get('description', 'Transaction description not available.')}

## Overview

This transaction is performed by **{metadata.get('role', 'Unknown')}** users and falls under the **{metadata.get('category', 'general').replace('_', ' ').title()}** category.

"""
        
        # Prerequisites section
        content += """## Prerequisites

"""
        
        required_tokens = metadata.get('requires_tokens', [])
        if required_tokens:
            content += f"""### Required Tokens
The following tokens are required to execute this transaction:

"""
            for token in required_tokens:
                content += f"- **{token}**\n"
            content += "\n"
        
        # Multi-signature requirements
        if metadata.get('multi_signature', False):
            required_sigs = metadata.get('required_signatures', [])
            content += f"""### Multi-Signature Requirements
This transaction requires multiple signatures:

"""
            if required_sigs:
                sig_list = " + ".join(required_sigs)
                content += f"**Required Signatures:** {sig_list}\n\n"
            else:
                content += "This transaction requires multi-signature approval.\n\n"
        
        # Fee information
        fee = metadata.get('estimated_fee', 'Not specified')
        content += f"""## Transaction Details

### Estimated Fee
**{fee}**

### Transaction Type
- **Role:** {metadata.get('role', 'Unknown')}
- **Category:** {metadata.get('category', 'general').replace('_', ' ').title()}
- **Multi-Signature:** {'Yes' if metadata.get('multi_signature', False) else 'No'}

"""
        
        # Transaction structure section
        if transaction['has_structure']:
            content += """## Transaction Structure

This transaction includes:

### Inputs
The transaction consumes the following UTxOs:
- User wallet UTxO
- Protocol state UTxOs
- Authorization tokens

### Reference Inputs
The transaction references:
- Parameter reference scripts
- Instance reference data
- Global state information

### Outputs
The transaction produces:
- Updated state UTxOs
- Modified user wallet
- Any newly minted tokens

### Transaction Flow

![Transaction Diagram](/diagrams/transactions/{}.png)

""".format(transaction['filename'])
        else:
            content += """## Transaction Structure

⚠️ **Note:** This transaction is currently defined with metadata only. The complete transaction structure is not yet implemented.

"""
        
        # API Reference
        content += f"""## API Reference

### Endpoint
```
POST /tx/v0/{metadata.get('role', 'general').lower()}/{self.filename_to_endpoint(transaction['filename'])}
```

### Request Example
```json
{{
  "userAlias": "string",
  "additionalParams": {{
    // Transaction-specific parameters
  }}
}}
```

### Response Example
```json
{{
  "success": true,
  "transactionId": "tx_hash",
  "fee": "{fee}"
}}
```

## Code Examples

### JavaScript/TypeScript
```typescript
import {{ AndamioAPI }} from '@andamio/api';

const api = new AndamioAPI();

const result = await api.transactions.{self.to_camel_case(transaction['filename'])}({{
  userAlias: "your-alias",
  // Additional parameters
}});
```

### Python
```python
from andamio_api import AndamioAPI

api = AndamioAPI()

result = api.transactions.{self.to_snake_case(transaction['filename'])}(
    user_alias="your-alias",
    # Additional parameters
)
```

## Error Handling

Common errors that may occur:

| Error Code | Description | Solution |
|------------|-------------|----------|
| `INSUFFICIENT_TOKENS` | Required tokens not available | Ensure wallet contains required tokens |
| `INVALID_SIGNATURE` | Signature validation failed | Check signing process and permissions |
| `TRANSACTION_FAILED` | Transaction execution failed | Review transaction parameters and retry |

## Related Transactions

"""
        
        # Add related transactions based on role and category
        role = metadata.get('role', 'General')
        category = metadata.get('category', '')
        
        related = []
        for tx in self.role_groups.get(role, []):
            if tx['filename'] != transaction['filename'] and tx['metadata'].get('category') == category:
                related.append(tx)
        
        if related:
            for rel_tx in related[:3]:  # Limit to 3 related transactions
                rel_title = rel_tx['name'].replace('Transaction', '')
                content += f"- [{rel_title}](./{rel_tx['filename']}.mdx)\n"
        else:
            content += "No directly related transactions found.\n"
        
        content += f"""
## See Also

- [All {role} Transactions](../index.mdx#{role.lower()}-transactions)
- [Transaction Overview](../../index.mdx)
- [API Documentation](../../apis/reference/)
- [Getting Started Guide](../../getting-started.mdx)
"""
        
        return content
    
    def filename_to_endpoint(self, filename: str) -> str:
        """Convert filename to API endpoint format"""
        # Remove common prefixes and convert to kebab-case
        endpoint = filename.replace('admin-', '').replace('student-', '').replace('contributor-', '').replace('project-creator-', '').replace('course-creator-', '')
        return endpoint.replace('_', '-')
    
    def to_camel_case(self, snake_str: str) -> str:
        """Convert snake_case to camelCase"""
        components = snake_str.replace('-', '_').split('_')
        return components[0] + ''.join(x.title() for x in components[1:])
    
    def to_snake_case(self, kebab_str: str) -> str:
        """Convert kebab-case to snake_case"""
        return kebab_str.replace('-', '_')
    
    def generate_role_index(self, role: str, transactions: List[Dict]) -> str:
        """Generate index page for a role category"""
        content = f"""---
title: "{role} Transactions"
description: "Transaction documentation for {role} users"
---

# {role} Transactions

This section contains all transactions available to **{role}** users in the Andamio protocol.

## Available Transactions

"""
        
        for tx in transactions:
            metadata = tx['metadata']
            title = tx['name'].replace('Transaction', '')
            description = metadata.get('description', 'No description available')
            fee = metadata.get('estimated_fee', 'Not specified')
            
            content += f"""### [{title}](./{tx['filename']}.mdx)

{description}

- **Category:** {metadata.get('category', 'general').replace('_', ' ').title()}
- **Fee:** {fee}
- **Multi-Sig:** {'Yes' if metadata.get('multi_signature', False) else 'No'}

"""
        
        content += f"""
## Transaction Categories

"""
        
        # Group by category
        categories = {}
        for tx in transactions:
            category = tx['metadata'].get('category', 'general')
            if category not in categories:
                categories[category] = []
            categories[category].append(tx)
        
        for category, cat_transactions in categories.items():
            category_title = category.replace('_', ' ').title()
            content += f"""### {category_title}

"""
            for tx in cat_transactions:
                title = tx['name'].replace('Transaction', '')
                content += f"- [{title}](./{tx['filename']}.mdx)\n"
            content += "\n"
        
        return content
    
    def generate_main_index(self) -> str:
        """Generate main transactions index page"""
        content = """---
title: "Transactions"
description: "Complete reference for all Andamio protocol transactions"
---

# Transaction Reference

The Andamio protocol supports transactions for different user roles. Each transaction type has specific requirements, fees, and outputs.

## Transaction Overview

The protocol currently supports **{total_count}** transaction types across **{role_count}** user roles:

""".format(
            total_count=len(self.transactions),
            role_count=len([role for role, txs in self.role_groups.items() if txs])
        )
        
        # Add role-based navigation
        for role, transactions in self.role_groups.items():
            if not transactions:
                continue
                
            content += f"""### [{role} Transactions](./reference/{role.lower()}/)

{len(transactions)} transactions available for {role} users.

"""
            # Show first few transactions as examples
            for tx in transactions[:3]:
                metadata = tx['metadata']
                title = tx['name'].replace('Transaction', '')
                content += f"- **{title}** - {metadata.get('description', 'No description')}\n"
            
            if len(transactions) > 3:
                content += f"- ... and {len(transactions) - 3} more\n"
            content += "\n"
        
        content += """## Quick Reference

### By Fee Range

#### Low Cost (1.5-2.0 ADA)
Profile updates, state transitions, basic operations.

#### Medium Cost (2.5-3.5 ADA)
Token minting, role-based operations, project interactions.

#### High Cost (4.0+ ADA)
Admin operations, multi-signature transactions, treasury management.

### By Authorization Level

#### Single Signature
Most user transactions require only the user's signature.

#### Multi-Signature
Admin and treasury operations require multiple authorized signatures.

## Getting Started

1. [Set up your development environment](./getting-started.mdx)
2. [Choose your transaction type](#transaction-overview)
3. [Review the specific transaction documentation](./reference/)
4. [Implement using our SDKs](../apis/)

## Visual Documentation

All transactions include visual diagrams showing the complete UTxO flow:

![Sample Transaction Diagram](/diagrams/transactions/sample.png)

## API Integration

All transactions are available through our REST API and SDKs:

- [REST API Documentation](../apis/reference/)
- [JavaScript/TypeScript SDK](../apis/sdks/javascript/)
- [Python SDK](../apis/sdks/python/)

"""
        
        return content
    
    def generate_meta_json(self, role: str, transactions: List[Dict]) -> Dict:
        """Generate meta.json for navigation"""
        pages = []
        
        # Add index page
        pages.append("index")
        
        # Add individual transaction pages
        for tx in sorted(transactions, key=lambda x: x['filename']):
            pages.append(tx['filename'])
        
        return {
            "title": f"{role} Transactions",
            "pages": pages,
            "defaultOpen": False
        }
    
    def generate_root_meta_json(self) -> Dict:
        """Generate root meta.json for transactions section"""
        pages = ["index", "getting-started"]
        
        # Add role-based sections
        for role in self.role_groups.keys():
            if self.role_groups[role]:  # Only add if there are transactions
                pages.append(f"reference/{role.lower()}")
        
        return {
            "title": "Transactions",
            "icon": "GitBranch",
            "pages": pages,
            "defaultOpen": True
        }
    
    def generate_getting_started(self) -> str:
        """Generate getting started guide"""
        return """---
title: "Getting Started"
description: "Learn how to work with Andamio protocol transactions"
---

# Getting Started with Transactions

This guide will help you understand and implement Andamio protocol transactions.

## Understanding Transaction Types

The Andamio protocol organizes transactions by user roles:

- **Student**: Learning and assignment-related transactions
- **CourseCreator**: Course management and grading transactions  
- **ProjectCreator**: Project initialization and treasury management
- **Contributor**: Project participation and reward claiming
- **InstanceAdmin**: Platform administration and governance
- **General**: Basic protocol operations like token minting

## Prerequisites

### Required Setup

1. **Wallet Connection**: Connect a Cardano wallet with sufficient ADA
2. **Access Tokens**: Obtain required protocol tokens (100at, 222at)
3. **Role Authorization**: Ensure your wallet has the required role-specific NFTs

### Development Environment

```bash
# Install the Andamio SDK
npm install @andamio/api

# Or for Python
pip install andamio-api
```

## Basic Transaction Flow

Every Andamio transaction follows this pattern:

1. **Prepare Inputs**: Gather required UTxOs and tokens
2. **Set Reference Data**: Include protocol reference scripts
3. **Build Transaction**: Construct the transaction with proper redeemers
4. **Sign & Submit**: Sign with required keys and submit to network
5. **Confirm**: Wait for blockchain confirmation

## Your First Transaction

Let's start with minting access tokens:

### JavaScript Example

```typescript
import { AndamioAPI } from '@andamio/api';

const api = new AndamioAPI({
  network: 'preprod', // or 'mainnet'
  walletConnector: yourWalletConnector
});

// Mint access tokens
const result = await api.transactions.mintAccessToken({
  userAlias: "your-unique-alias",
  userInfo: "Additional user information"
});

console.log('Transaction submitted:', result.transactionId);
```

### Python Example

```python
from andamio_api import AndamioAPI

api = AndamioAPI(
    network='preprod',
    wallet_connector=your_wallet_connector
)

# Mint access tokens
result = api.transactions.mint_access_token(
    user_alias="your-unique-alias",
    user_info="Additional user information"
)

print(f"Transaction submitted: {result.transaction_id}")
```

## Error Handling

Common errors and solutions:

### Insufficient Funds
```typescript
try {
  const result = await api.transactions.mintAccessToken(params);
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.log('Add more ADA to your wallet');
  }
}
```

### Missing Tokens
```typescript
try {
  const result = await api.transactions.commitToAssignment(params);
} catch (error) {
  if (error.code === 'MISSING_ACCESS_TOKEN') {
    // First mint access tokens
    await api.transactions.mintAccessToken(accessParams);
    // Then retry the original transaction
  }
}
```

## Next Steps

1. **Explore Transaction Types**: Browse the [transaction reference](./reference/)
2. **Review Specific Documentation**: Each transaction has detailed documentation
3. **Check API Reference**: See [API documentation](../apis/reference/)
4. **Join the Community**: Get help in our [Discord](https://discord.gg/andamio)

## Visual Learning

Each transaction includes visual diagrams showing the complete flow:

![Transaction Flow Example](/diagrams/transactions/access-token-mint.png)

These diagrams show:
- Input UTxOs (what you spend)
- Reference inputs (read-only data)
- Transaction logic (what happens)
- Output UTxOs (what you receive)
- Redeemers (authorization logic)

## Fee Planning

Transaction fees vary by complexity:

| Fee Range | Transaction Types | Examples |
|-----------|------------------|----------|
| 1.5-2.0 ADA | Basic operations | Profile updates, state changes |
| 2.5-3.5 ADA | Token operations | Minting, role assignments |
| 4.0+ ADA | Complex operations | Treasury management, admin functions |

Plan your ADA budget accordingly when performing multiple transactions.
"""
    
    def generate_all_docs(self):
        """Generate complete MDX documentation structure"""
        print("🚀 Generating MDX documentation...")
        
        # Create output directory structure
        docs_dir = self.output_dir / "transactions"
        docs_dir.mkdir(parents=True, exist_ok=True)
        
        reference_dir = docs_dir / "reference"
        reference_dir.mkdir(exist_ok=True)
        
        # Generate main index
        print("📝 Generating main index...")
        with open(docs_dir / "index.mdx", 'w') as f:
            f.write(self.generate_main_index())
        
        # Generate getting started guide
        print("📝 Generating getting started guide...")
        with open(docs_dir / "getting-started.mdx", 'w') as f:
            f.write(self.generate_getting_started())
        
        # Generate root meta.json
        with open(docs_dir / "meta.json", 'w') as f:
            json.dump(self.generate_root_meta_json(), f, indent=2)
        
        # Generate role-based documentation
        for role, transactions in self.role_groups.items():
            if not transactions:
                continue
                
            print(f"📝 Generating {role} documentation...")
            
            role_dir = reference_dir / role.lower()
            role_dir.mkdir(exist_ok=True)
            
            # Generate role index
            with open(role_dir / "index.mdx", 'w') as f:
                f.write(self.generate_role_index(role, transactions))
            
            # Generate individual transaction files
            for tx in transactions:
                print(f"  📄 Generating {tx['filename']}.mdx...")
                with open(role_dir / f"{tx['filename']}.mdx", 'w') as f:
                    f.write(self.generate_transaction_mdx(tx))
            
            # Generate meta.json for role
            with open(role_dir / "meta.json", 'w') as f:
                json.dump(self.generate_meta_json(role, transactions), f, indent=2)
        
        print("✅ MDX documentation generation complete!")
        print(f"📂 Output directory: {docs_dir}")
        
        # Print summary
        total_files = len(self.transactions)
        role_count = len([role for role, txs in self.role_groups.items() if txs])
        
        print(f"\n📊 Generation Summary:")
        print(f"📄 Total transactions: {total_files}")
        print(f"👥 User roles: {role_count}")
        print(f"📁 Generated directories: {role_count + 1} (+ main)")
        print(f"📝 Generated MDX files: {total_files + role_count + 2} (+ indexes)")

def main():
    parser = argparse.ArgumentParser(description='Generate MDX documentation from YAML transaction files')
    parser.add_argument('--yaml-dir', default='./yaml', help='Directory containing YAML files')
    parser.add_argument('--output-dir', default='./docs', help='Output directory for MDX files')
    
    args = parser.parse_args()
    
    # Check if yaml directory exists
    if not os.path.exists(args.yaml_dir):
        print(f"❌ Error: YAML directory '{args.yaml_dir}' not found")
        return 1
    
    # Create generator and run
    generator = MDXGenerator(args.yaml_dir, args.output_dir)
    generator.load_yaml_files()
    generator.generate_all_docs()
    
    return 0

if __name__ == "__main__":
    exit(main())