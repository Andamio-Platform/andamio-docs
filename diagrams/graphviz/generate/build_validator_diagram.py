#!/usr/bin/env python3
import yaml
import sys
import os
import argparse

class ValidatorDiagramBuilder:
    def __init__(self):
        self.default_styles = {
            'blueprint_source_node': 'shape=box, style="rounded,filled", fillcolor="#f5f5f5", color="#666666", fontname="Arial", fontsize=14, penwidth=2, width=2.5, height=1.2, margin="0.2,0.2"',
            'validator_node': 'shape=box, style="rounded,filled", fillcolor="#ffffff", color="#cc7000", fontname="Arial", fontsize=12, penwidth=3, width=3, height=1.5, margin="0.2,0.2"',
            'redeemer_node': 'shape=box, style="filled", fillcolor="#ffffff", color="#4CAF50", fontname="Arial", fontsize=10, penwidth=2, margin="0.1,0.1"',
            'action_node': 'shape=box, style="filled", fillcolor="#ffffff", color="#2196F3", fontname="Arial", fontsize=9, penwidth=1, margin="0.1,0.1"'
        }
    
    def generate_blueprint_source_node(self, blueprint_source):
        """Generate the blueprint source title node"""
        if not blueprint_source:
            return None
        
        # Remove .plutus extension and format the title
        title = blueprint_source.replace('.plutus', '').replace('_', ' ').title()
        node_id = "blueprint_source"
        style_attrs = self.default_styles['blueprint_source_node']
        
        return f'    {node_id} [label="{title}", {style_attrs}];'
    
    def generate_validator_node(self, validator_name):
        """Generate the main validator node"""
        node_id = "validator"
        style_attrs = self.default_styles['validator_node']
        
        return f'    {node_id} [label="{validator_name}", {style_attrs}];'
    
    def generate_redeemer_nodes(self, redeemers):
        """Generate redeemer and action nodes from the redeemers configuration"""
        nodes = []
        connections = []
        node_counter = 0
        
        for redeemer_type, actions in redeemers.items():
            # Create redeemer type node
            redeemer_id = f"redeemer_{node_counter}"
            style_attrs = self.default_styles['redeemer_node']
            nodes.append(f'    {redeemer_id} [label="{redeemer_type}", {style_attrs}];')
            
            # Create connection from validator to redeemer
            connections.append(f'    validator -> {redeemer_id} [arrowsize=0.8, penwidth=2];')
            
            # Create action nodes if they exist
            if actions and isinstance(actions, list):
                for i, action in enumerate(actions):
                    action_id = f"action_{node_counter}_{i}"
                    style_attrs = self.default_styles['action_node']
                    nodes.append(f'    {action_id} [label="{action}", {style_attrs}];')
                    
                    # Create connection from redeemer to action
                    connections.append(f'    {redeemer_id} -> {action_id} [arrowsize=0.6, penwidth=1];')
            
            node_counter += 1
        
        return nodes, connections
    
    def generate_simple_redeemer_nodes(self, redeemers):
        """Generate simple redeemer nodes for validators that don't have enumerated actions"""
        nodes = []
        connections = []
        
        for i, redeemer in enumerate(redeemers):
            redeemer_id = f"redeemer_{i}"
            style_attrs = self.default_styles['redeemer_node']
            nodes.append(f'    {redeemer_id} [label="{redeemer}", {style_attrs}];')
            
            # Create connection from validator to redeemer
            connections.append(f'    validator -> {redeemer_id} [arrowsize=0.8, penwidth=2];')
        
        return nodes, connections
    
    def generate_layout_constraints(self, redeemers, has_blueprint_source=False):
        """Generate layout constraints to organize nodes properly"""
        constraints = []
        
        # Blueprint source on the far left (if present), validator next
        if has_blueprint_source:
            constraints.append('    {rank=min; blueprint_source;}')
            constraints.append('    {rank=same; validator;}')
        else:
            constraints.append('    {rank=min; validator;}')
        
        # Collect all redeemer and action node IDs for proper ranking
        redeemer_nodes = []
        action_nodes = []
        node_counter = 0
        
        if isinstance(redeemers, dict):
            # Complex redeemers with actions
            for redeemer_type, actions in redeemers.items():
                redeemer_id = f"redeemer_{node_counter}"
                redeemer_nodes.append(redeemer_id)
                
                if actions and isinstance(actions, list):
                    for i, action in enumerate(actions):
                        action_id = f"action_{node_counter}_{i}"
                        action_nodes.append(action_id)
                
                node_counter += 1
            
            # Place redeemers in middle column
            if redeemer_nodes:
                redeemer_list = "; ".join(redeemer_nodes)
                constraints.append(f'    {{rank=same; {redeemer_list};}}')
            
            # Place actions in right column
            if action_nodes:
                action_list = "; ".join(action_nodes)
                constraints.append(f'    {{rank=max; {action_list};}}')
                
                # Add invisible edges to maintain vertical order of actions
                if len(action_nodes) > 1:
                    constraints.append("    // Maintain action order")
                    for i in range(len(action_nodes) - 1):
                        constraints.append(f'    {action_nodes[i]} -> {action_nodes[i+1]} [style=invis, weight=10];')
        
        else:
            # Simple redeemers list
            simple_redeemer_nodes = [f"redeemer_{i}" for i in range(len(redeemers))]
            if simple_redeemer_nodes:
                redeemer_list = "; ".join(simple_redeemer_nodes)
                constraints.append(f'    {{rank=max; {redeemer_list};}}')
                
                # Add invisible edges to maintain vertical order
                if len(simple_redeemer_nodes) > 1:
                    constraints.append("    // Maintain redeemer order")
                    for i in range(len(simple_redeemer_nodes) - 1):
                        constraints.append(f'    {simple_redeemer_nodes[i]} -> {simple_redeemer_nodes[i+1]} [style=invis, weight=10];')
        
        return constraints
    
    def build_diagram(self, config):
        """Build complete GraphViz diagram from validator configuration"""
        validator_name = config.get('validator_name', 'Unknown_Validator')
        blueprint_source = config.get('blueprint_source', None)
        redeemers = config.get('redeemers', [])
        
        # Start building diagram
        diagram_name = validator_name.replace(' ', '_').replace('-', '_')
        lines = [f"digraph {diagram_name} {{"]
        
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
        
        # Generate blueprint source node (if present)
        has_blueprint_source = False
        if blueprint_source:
            lines.append("    // Blueprint source node")
            blueprint_node = self.generate_blueprint_source_node(blueprint_source)
            if blueprint_node:
                lines.append(blueprint_node)
                has_blueprint_source = True
                lines.append('')
        
        # Generate validator node
        lines.append("    // Validator node")
        lines.append(self.generate_validator_node(validator_name))
        lines.append('')
        
        # Generate redeemer and action nodes
        if isinstance(redeemers, dict):
            # Complex redeemers with enumerated actions
            lines.append("    // Redeemer type nodes")
            redeemer_nodes, redeemer_connections = self.generate_redeemer_nodes(redeemers)
            lines.extend(redeemer_nodes)
            lines.append('')
        elif isinstance(redeemers, list):
            # Simple list of redeemers
            lines.append("    // Simple redeemer nodes")
            redeemer_nodes, redeemer_connections = self.generate_simple_redeemer_nodes(redeemers)
            lines.extend(redeemer_nodes)
            lines.append('')
        
        # Generate layout constraints
        lines.append("    // Layout constraints")
        layout_constraints = self.generate_layout_constraints(redeemers, has_blueprint_source)
        lines.extend(layout_constraints)
        lines.append('')
        
        # Generate connections
        lines.append("    // Connections")
        
        # Add blueprint source to validator connection (if blueprint source exists)
        if has_blueprint_source:
            lines.append('    blueprint_source -> validator [arrowsize=1.0, penwidth=2.5, color="#666666"];')
            
        if isinstance(redeemers, (dict, list)):
            lines.extend(redeemer_connections)
        
        lines.append("}")
        
        return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description='Build validator diagrams from YAML configuration')
    parser.add_argument('config_file', help='YAML configuration file')
    parser.add_argument('-o', '--output', help='Output DOT file (default: stdout)')
    parser.add_argument('--yaml-dir', default='./yaml/validators', help='Directory containing validator YAML files (default: ./yaml/validators)')
    parser.add_argument('--output-dir', default='../../output', help='Output directory for DOT files (default: ../../output)')
    
    args = parser.parse_args()
    
    try:
        # Determine input file path
        if os.path.isabs(args.config_file):
            input_file = args.config_file
        else:
            # If not absolute, check if it's in the yaml/validators directory
            if os.path.exists(os.path.join(args.yaml_dir, args.config_file)):
                input_file = os.path.join(args.yaml_dir, args.config_file)
            else:
                input_file = args.config_file  # Use as-is and let the open function handle errors
        
        with open(input_file, 'r') as f:
            config = yaml.safe_load(f)
        
        builder = ValidatorDiagramBuilder()
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