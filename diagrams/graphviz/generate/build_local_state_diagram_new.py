#!/usr/bin/env python3
import yaml
import sys
import os
import argparse

class LocalStateDiagramBuilder:
    def __init__(self):
        self.default_styles = {
            'local_state_node': 'shape=box, style="rounded,filled", fillcolor="#f0f8ff", color="#0066cc", fontname="Arial", fontsize=16, penwidth=2, width=3, height=1.5, margin="0.3,0.3"',
            'role_node': 'shape=box, style="rounded,filled", fillcolor="#e6f2ff", color="#3399ff", fontname="Arial", fontsize=12, penwidth=1.5, width=2, height=1, margin="0.2,0.2"',
            'validator_node': 'shape=box, style="rounded,filled", fillcolor="#ffffff", color="#cc7000", fontname="Arial", fontsize=12, penwidth=2, width=2.5, height=1.2, margin="0.2,0.2"',
            'transaction_node': 'shape=box, style="filled", fillcolor="#f5f5f5", color="#2196F3", fontname="Arial", fontsize=10, penwidth=1.5, margin="0.1,0.1"',
            'action_node': 'shape=box, style="filled", fillcolor="#f9f9f9", color="#4CAF50", fontname="Arial", fontsize=10, penwidth=1, margin="0.1,0.1"'
        }
    
    def generate_local_state_node(self, name):
        """Generate the main local state node"""
        node_id = "local_state"
        style_attrs = self.default_styles['local_state_node']
        
        return f'    {node_id} [label="{name}", {style_attrs}];'
    
    def generate_role_nodes(self, config):
        """Generate nodes for admin, contributor, and user roles"""
        nodes = []
        connections = []
        
        # Admin role
        admin = config.get('admin', 'Admin')
        nodes.append(f'    admin_role [label="{admin}", {self.default_styles["role_node"]}];')
        connections.append(f'    local_state -> admin_role [arrowsize=0.8, penwidth=1.5, color="#3399ff"];')
        
        # Contributor role
        contributor = config.get('contributor', 'Contributor')
        nodes.append(f'    contributor_role [label="{contributor}", {self.default_styles["role_node"]}];')
        connections.append(f'    local_state -> contributor_role [arrowsize=0.8, penwidth=1.5, color="#3399ff"];')
        
        # User role
        user = config.get('user', 'User')
        nodes.append(f'    user_role [label="{user}", {self.default_styles["role_node"]}];')
        connections.append(f'    local_state -> user_role [arrowsize=0.8, penwidth=1.5, color="#3399ff"];')
        
        return nodes, connections
    
    def generate_validator_nodes(self, validators):
        """Generate validator nodes from the validators list"""
        nodes = []
        connections = []
        validator_ids = []
        validator_names = []
        
        if not validators:
            return nodes, connections, validator_ids, validator_names
        
        for i, validator in enumerate(validators):
            if isinstance(validator, dict):
                # Handle complex validator definition (dict with name as key)
                for validator_name, validator_info in validator.items():
                    validator_id = f"validator_{i}"
                    validator_ids.append(validator_id)
                    validator_names.append(validator_name)
                    style_attrs = self.default_styles['validator_node']
                    nodes.append(f'    {validator_id} [label="{validator_name}", {style_attrs}];')
            else:
                # Handle simple validator name (string)
                validator_id = f"validator_{i}"
                validator_ids.append(validator_id)
                validator_names.append(validator)
                style_attrs = self.default_styles['validator_node']
                nodes.append(f'    {validator_id} [label="{validator}", {style_attrs}];')
        
        return nodes, connections, validator_ids, validator_names
    
    def generate_transaction_nodes(self, transactions):
        """Generate transaction nodes from the transactions list"""
        nodes = []
        connections = []
        transaction_ids = []
        transaction_names = []
        
        if not transactions:
            return nodes, connections, transaction_ids, transaction_names
        
        for i, transaction in enumerate(transactions):
            transaction_id = f"transaction_{i}"
            transaction_ids.append(transaction_id)
            transaction_names.append(transaction)
            style_attrs = self.default_styles['transaction_node']
            nodes.append(f'    {transaction_id} [label="{transaction}", {style_attrs}];')
        
        return nodes, connections, transaction_ids, transaction_names
    
    def generate_action_nodes(self, config):
        """Generate nodes for user and admin actions"""
        user_action_nodes = []
        admin_action_nodes = []
        connections = []
        user_action_ids = []
        admin_action_ids = []
        user_action_names = []
        admin_action_names = []
        
        # User actions
        user_actions = config.get('user_actions', [])
        if user_actions:
            for i, action in enumerate(user_actions):
                action_id = f"user_action_{i}"
                user_action_ids.append(action_id)
                user_action_names.append(action)
                style_attrs = self.default_styles['action_node']
                user_action_nodes.append(f'    {action_id} [label="{action}", {style_attrs}];')
        
        # Admin actions
        admin_actions = config.get('admin_actions', [])
        if admin_actions:
            for i, action in enumerate(admin_actions):
                action_id = f"admin_action_{i}"
                admin_action_ids.append(action_id)
                admin_action_names.append(action)
                style_attrs = self.default_styles['action_node']
                admin_action_nodes.append(f'    {action_id} [label="{action}", {style_attrs}];')
        
        return user_action_nodes, admin_action_nodes, connections, user_action_ids, admin_action_ids, user_action_names, admin_action_names
    
    def build_diagram(self, config):
        """Build complete GraphViz diagram from local state configuration"""
        local_state_def = config.get('local_state_def', {})
        name = local_state_def.get('name', 'Local_State')
        validators = local_state_def.get('validators', [])
        transactions = local_state_def.get('transactions', [])
        
        # Start building diagram
        diagram_name = name.replace(' ', '_').replace('-', '_')
        lines = [f"digraph {diagram_name}_Local_State {{"]
        
        # Graph attributes for better layout
        lines.append('    rankdir=LR;')  # Left to right layout
        lines.append('    bgcolor="white";')
        lines.append('    splines=true;')
        lines.append('    overlap=false;')
        lines.append('    nodesep=1.0;')
        lines.append('    ranksep=2.0;')
        lines.append('')
        
        # Default styles
        lines.append("    // Default styles")
        lines.append('    node [fontname="Arial"];')
        lines.append('    edge [color="#333333", fontname="Arial", fontsize=9];')
        lines.append('')
        
        # Generate local state node
        lines.append("    // Local state node")
        lines.append(self.generate_local_state_node(name))
        lines.append('')
        
        # Generate role nodes
        lines.append("    // Role nodes")
        role_nodes, role_connections = self.generate_role_nodes(local_state_def)
        lines.extend(role_nodes)
        lines.append('')
        
        # Generate validator nodes
        lines.append("    // Validator nodes")
        validator_nodes, validator_connections, validator_ids, validator_names = self.generate_validator_nodes(validators)
        lines.extend(validator_nodes)
        lines.append('')
        
        # Generate transaction nodes
        lines.append("    // Transaction nodes")
        transaction_nodes, transaction_connections, transaction_ids, transaction_names = self.generate_transaction_nodes(transactions)
        lines.extend(transaction_nodes)
        lines.append('')
        
        # Generate action nodes
        lines.append("    // Action nodes")
        user_action_nodes, admin_action_nodes, action_connections, user_action_ids, admin_action_ids, user_action_names, admin_action_names = self.generate_action_nodes(local_state_def)
        lines.extend(user_action_nodes)
        lines.extend(admin_action_nodes)
        lines.append('')
        
        # Generate layout constraints for column-based approach
        lines.append("    // Layout constraints")
        lines.append('    {rank=same; local_state;}')  # Column 1: Local State
        
        # Column 2: Roles
        if role_nodes:
            role_list = "admin_role; contributor_role; user_role"
            lines.append(f'    {{rank=same; {role_list};}}')
        
        # Column 3: Actions
        if user_action_ids or admin_action_ids:
            action_list = "; ".join(user_action_ids + admin_action_ids)
            if action_list:
                lines.append(f'    {{rank=same; {action_list};}}')
        
        # Column 4: Validators
        if validator_ids:
            validator_list = "; ".join(validator_ids)
            lines.append(f'    {{rank=same; {validator_list};}}')
        
        # Column 5: Transactions
        if transaction_ids:
            transaction_list = "; ".join(transaction_ids)
            lines.append(f'    {{rank=same; {transaction_list};}}')
        
        lines.append('')
        
        # Generate connections
        lines.append("    // Connections")
        lines.extend(role_connections)
        
        # Connect roles to their actions
        lines.append("    // Role to action connections")
        
        # Connect admin role to all admin actions
        for action_id in admin_action_ids:
            lines.append(f'    admin_role -> {action_id} [arrowsize=0.6, penwidth=1, color="#4CAF50"];')
        
        # Connect user role to all user actions
        for action_id in user_action_ids:
            lines.append(f'    user_role -> {action_id} [arrowsize=0.6, penwidth=1, color="#4CAF50"];')
        
        # Connect contributor role to relevant actions (if any)
        # For now, assuming contributor can perform user actions
        for action_id in user_action_ids:
            lines.append(f'    contributor_role -> {action_id} [arrowsize=0.6, penwidth=1, color="#4CAF50"];')
        
        # Connect actions to validators
        lines.append("    // Action to validator connections")
        
        # Connect each action to each validator
        for action_id in user_action_ids + admin_action_ids:
            for validator_id in validator_ids:
                lines.append(f'    {action_id} -> {validator_id} [arrowsize=0.8, penwidth=1.5, color="#cc7000"];')
        
        # Connect validators to transactions
        lines.append("    // Validator to transaction connections")
        
        # Connect each validator to each transaction
        for validator_id in validator_ids:
            for transaction_id in transaction_ids:
                lines.append(f'    {validator_id} -> {transaction_id} [arrowsize=0.6, penwidth=1, color="#2196F3"];')
        
        # Add invisible edges to enforce column ordering
        lines.append("    // Invisible edges for layout")
        
        # Local state to roles
        if role_nodes:
            lines.append(f'    local_state -> admin_role [style=invis, weight=10];')
        
        # Roles to actions
        if role_nodes and (user_action_ids or admin_action_ids):
            first_action = user_action_ids[0] if user_action_ids else admin_action_ids[0]
            lines.append(f'    admin_role -> {first_action} [style=invis, weight=10];')
        
        # Actions to validators
        if (user_action_ids or admin_action_ids) and validator_ids:
            first_action = user_action_ids[0] if user_action_ids else admin_action_ids[0]
            lines.append(f'    {first_action} -> {validator_ids[0]} [style=invis, weight=10];')
        
        # Validators to transactions
        if validator_ids and transaction_ids:
            lines.append(f'    {validator_ids[0]} -> {transaction_ids[0]} [style=invis, weight=10];')
        
        lines.append("}")
        
        return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description='Build local state diagrams from YAML configuration')
    parser.add_argument('config_file', help='YAML configuration file')
    parser.add_argument('-o', '--output', help='Output DOT file (default: stdout)')
    parser.add_argument('--yaml-dir', default='./yaml/global-and-local-state', help='Directory containing local state YAML files (default: ./yaml/global-and-local-state)')
    parser.add_argument('--output-dir', default='../../output/local-state', help='Output directory for DOT files (default: ../../output/local-state)')
    
    args = parser.parse_args()
    
    try:
        # Determine input file path
        if os.path.isabs(args.config_file):
            input_file = args.config_file
        else:
            # If not absolute, check if it's in the yaml directory
            if os.path.exists(os.path.join(args.yaml_dir, args.config_file)):
                input_file = os.path.join(args.yaml_dir, args.config_file)
            else:
                input_file = args.config_file  # Use as-is and let the open function handle errors
        
        with open(input_file, 'r') as f:
            config = yaml.safe_load(f)
        
        builder = LocalStateDiagramBuilder()
        diagram = builder.build_diagram(config)
        
        if args.output:
            # Determine output file path
            if os.path.isabs(args.output):
                output_file = args.output
            else:
                # If not absolute, put it in the output directory
                output_file = os.path.join(args.output_dir, args.output)
                
                # Ensure output directory exists
                os.makedirs(os.path.dirname(output_file), exist_ok=True)
            
            with open(output_file, 'w') as f:
                f.write(diagram)
            print(f"Generated {output_file}")
        else:
            print(diagram)
            
    except FileNotFoundError:
        print(f"Error: Configuration file '{args.config_file}' not found", file=sys.stderr)
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"Error parsing YAML: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
