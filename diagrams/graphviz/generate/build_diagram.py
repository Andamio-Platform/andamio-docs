#!/usr/bin/env python3
import yaml
import sys
import os
import argparse

class TransactionDiagramBuilder:
    def __init__(self):
        self.default_styles = {
            'default_node': 'shape=box, style="filled", fillcolor="#ffffff", color="#4CAF50", fontname="Arial", fontsize=10, penwidth=2, margin="0.1,0.1"',
            'validator_node': 'shape=box, style="rounded,filled", fillcolor="#ffffff", color="#cc7000", fontname="Arial", fontsize=10, penwidth=2, margin="0.1,0.1"',
            'operation_node': 'shape=box, style="rounded,filled", fillcolor="#ffffff", color="#00796b", fontsize=12, penwidth=3, width=4, height=2',
            'transaction_node': 'shape=box, style="rounded,filled", fillcolor="#ffffff", color="#00796b", fontsize=12, penwidth=3, width=2, height=2',
            'reference_node': 'shape=box, style="filled", fillcolor="#9e9e9e", color="#9e9e9e", fontcolor="#ffffff", fontname="Arial", fontsize=10, penwidth=1',
            'user_node': 'shape=diamond, style="filled", fillcolor="#4dd0e1", color="#4dd0e1", fontcolor="#ffffff", fontname="Arial", fontsize=9',
            'mint_policy_node': 'shape=box, style="rounded,filled", fillcolor="#ffffff", color="#6A5ACD", fontname="Arial", fontsize=10, penwidth=2, margin="0.1,0.1"',
            'reference_input_node': 'shape=box, style="filled", fillcolor="#ffffff", color="#2196F3", fontname="Arial", fontsize=10, penwidth=2, margin="0.1,0.1"'
        }
    
    def infer_node_style(self, node_config, node_context):
        """Automatically infer node style based on context and content"""
        # Context-based inference (highest priority)
        if node_context == 'reference':
            return 'reference_node'
        elif node_context == 'mint':
            return 'mint_policy_node'
        elif node_context == 'redeemer':
            return 'validator_node'
        elif node_context == 'transaction':
            return 'transaction_node'
        elif node_context == 'reference_input':
            return 'reference_input_node'
        elif node_context in ['input', 'output']:
            # ALL inputs and outputs are UTxO nodes - no exceptions
            # Position determined purely by YAML order
            return 'default_node'
        
        # For nodes outside input/output sections, apply title-based inference
        title = node_config.get('title', '').lower()
        if any(keyword in title for keyword in ['user', 'andamio', 'wallet']) and 'utxo' not in title:
            return 'user_node'
        elif any(keyword in title for keyword in ['state', 'ref']) and not any(utxo_keyword in title for utxo_keyword in ['utxo', 'value', 'datum']):
            return 'reference_node'
        
        # Default to standard UTxO node
        return 'default_node'
    
    def generate_reference_input_node(self, utxo_config):
        """Generate a reference input UTxO node with READ ONLY label and blue border"""
        node_id = utxo_config['id']
        title = utxo_config['title']
        values = utxo_config.get('values', [])
        datum = utxo_config.get('datum', {})
        
        # Generate value section
        value_section = ""
        for value in values:
            value_section += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{value}</FONT></TD></TR>\n'
        
        # Generate datum section
        datum_section = ""
        if datum:
            datum_section = '            <TR><TD HEIGHT="5"></TD></TR>\n'
            datum_section += '            <TR><TD ALIGN="left"><B>Datum:</B></TD></TR>\n'
            datum_section += self._format_datum_recursive(datum, 0)
        
        return f'''    {node_id} [label=<
        <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="2">
            <TR><TD ALIGN="left"><B>{title}</B></TD></TR>
            <TR><TD ALIGN="left"><FONT COLOR="#2196F3"><B>read only</B></FONT></TD></TR>
            <TR><TD HEIGHT="5"></TD></TR>
            <TR><TD ALIGN="left"><B>Value:</B></TD></TR>
{value_section}{datum_section}        </TABLE>
    >, style="filled", fillcolor="#ffffff", color="#2196F3", fontname="Arial", fontsize=10, penwidth=2, margin="0.1,0.1"];'''
    
    def generate_utxo_node(self, utxo_config, node_context='utxo'):
        """Generate a UTxO node from configuration with automatic style inference"""
        node_id = utxo_config['id']
        title = utxo_config['title']
        values = utxo_config.get('values', [])
        datum = utxo_config.get('datum', {})
        
        # Check if this should be treated as a simple node instead of UTxO
        inferred_style = self.infer_node_style(utxo_config, node_context)
        if inferred_style in ['user_node', 'reference_node']:
            # Generate as simple node instead
            return self.generate_simple_node(utxo_config, self.default_styles, node_context)
        elif node_context == 'reference_input':
            # Generate as reference input with special styling
            return self.generate_reference_input_node(utxo_config)
        
        # Generate standard UTxO node with table layout
        value_section = ""
        for value in values:
            value_section += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{value}</FONT></TD></TR>\n'
        
        # Generate datum section
        datum_section = ""
        if datum:
            datum_section = '            <TR><TD ALIGN="left"><B>Datum:</B></TD></TR>\n'
            datum_section += self._format_datum_recursive(datum, 0)
        
        # Build the table with conditional datum section
        table_content = f'''    {node_id} [label=<
        <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="2">
            <TR><TD ALIGN="left"><B>{title}</B></TD></TR>
            <TR><TD HEIGHT="3"></TD></TR>
            <TR><TD ALIGN="left"><B>Value:</B></TD></TR>
{value_section}'''
        
        if datum_section:
            table_content += f'''            <TR><TD HEIGHT="3"></TD></TR>
{datum_section}'''
        
        table_content += '''        </TABLE>
    >];'''
        
        return table_content
    
    def generate_simple_node(self, node_config, styles, node_context='default'):
        """Generate a simple node (for references, minting, etc.) with inferred styling"""
        node_id = node_config['id']
        title = node_config['title']
        
        # Infer style automatically
        inferred_style = self.infer_node_style(node_config, node_context)
        style_attrs = styles.get(inferred_style, self.default_styles.get(inferred_style, self.default_styles['default_node']))
        
        # Add any additional attributes from config (for backwards compatibility)
        extra_attrs = node_config.get('attrs', {})
        if extra_attrs:
            attr_str = ", ".join([f'{k}={v}' for k, v in extra_attrs.items()])
            style_attrs = f'{style_attrs}, {attr_str}'
        
        return f'    {node_id} [label="{title}", {style_attrs}];'
    
    def generate_transaction_node(self, tx_config, styles, input_count, output_count):
        """Generate a transaction/operation node with dynamic height based on max of input/output counts"""
        node_id = tx_config['id']
        title = tx_config['title']
        
        # Always use transaction_node style, fallback to operation_node for backwards compatibility
        style_attrs = styles.get('transaction_node', styles.get('operation_node', self.default_styles['transaction_node']))
        
        # Calculate dynamic height: max(inputs, outputs) + 1
        max_utxo_count = max(input_count, output_count)
        dynamic_height = max_utxo_count + 1
        
        # Parse existing style attributes and override height
        if ',' in style_attrs:
            # Split attributes and rebuild with new height
            attrs = [attr.strip() for attr in style_attrs.split(',')]
            # Remove any existing height attribute
            attrs = [attr for attr in attrs if not attr.startswith('height=')]
            # Add dynamic height
            attrs.append(f'height={dynamic_height}')
            style_attrs = ', '.join(attrs)
        else:
            # Single attribute or empty, just append height
            style_attrs = f'{style_attrs}, height={dynamic_height}'
        
        return f'    {node_id} [label="{title}", {style_attrs}];'
    
    def generate_redeemer_node(self, redeemer_config, styles):
        """Generate a redeemer/validator node with automatic style inference"""
        node_id = redeemer_config['id']
        title = redeemer_config['title']
        params = redeemer_config.get('params', [])
        
        # Always use validator_node style for redeemers
        style_attrs = styles.get('validator_node', self.default_styles['validator_node'])
        
        # Add any additional attributes
        extra_attrs = redeemer_config.get('attrs', {})
        if extra_attrs:
            attr_str = ", ".join([f'{k}={v}' for k, v in extra_attrs.items()])
            style_attrs = f'{style_attrs}, {attr_str}'
        
        # Generate redeemer with params if present
        if params:
            # Create table format for redeemer with parameters
            params_section = ""
            for param in params:
                params_section += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{param}</FONT></TD></TR>\n'
            
            return f'''    {node_id} [label=<
        <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="2">
            <TR><TD ALIGN="left"><B>{title}</B></TD></TR>
            <TR><TD HEIGHT="3"></TD></TR>
            <TR><TD ALIGN="left"><B>Params:</B></TD></TR>
{params_section}        </TABLE>
    >, {style_attrs}];'''
        else:
            # Simple redeemer without parameters
            return f'    {node_id} [label="{title}", {style_attrs}];'
    
    def _format_datum_recursive(self, data, indent_level):
        """Recursively format datum structure"""
        result = ""
        indent = "&nbsp;&nbsp;" * indent_level
        
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, dict):
                    result += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{indent}{key}: {{</FONT></TD></TR>\n'
                    result += self._format_datum_recursive(value, indent_level + 1)
                    result += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{indent}}}</FONT></TD></TR>\n'
                elif isinstance(value, list):
                    if len(value) == 0:
                        result += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{indent}{key}: []</FONT></TD></TR>\n'
                    else:
                        result += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{indent}{key}: [</FONT></TD></TR>\n'
                        for item in value:
                            result += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{indent}&nbsp;&nbsp;"{item}",</FONT></TD></TR>\n'
                        result += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{indent}]</FONT></TD></TR>\n'
                else:
                    result += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{indent}{key}: {value}</FONT></TD></TR>\n'
        
        return result
    
    def generate_connections(self, connections):
        """Generate connection/edge definitions"""
        result = []
        for conn in connections:
            from_node = conn['from']
            to_node = conn['to']
            attrs = conn.get('attrs', {})
            
            if attrs:
                # Always quote string values, use unquoted for numeric values
                attr_str = ", ".join([f'{k}="{v}"' if isinstance(v, str) else f'{k}={v}' for k, v in attrs.items()])
                result.append(f'    {from_node} -> {to_node} [{attr_str}];')
            else:
                result.append(f'    {from_node} -> {to_node};')
        
        return result
    
    def generate_implied_connections(self, config):
        """Generate implied connections based on structure"""
        connections = []
        
        # Support both 'transaction' and 'operation' keys for backwards compatibility
        transaction_config = config.get('transaction', config.get('operation', {}))
        transaction_id = transaction_config.get('id', 'transaction')
        
        # Connections from inputs to transaction (directly or via redeemer)
        all_inputs = config.get('inputs', []) + config.get('reference_inputs', [])
        for input_utxo in all_inputs:
            input_id = input_utxo['id']
            redeemer = input_utxo.get('redeemer')
            
            if redeemer:
                # Input -> Redeemer (no arrow) -> Transaction
                redeemer_id = redeemer['id']
                connections.append({
                    'from': input_id,
                    'to': redeemer_id,
                    'attrs': {'dir': 'none'}
                })
                connections.append({
                    'from': redeemer_id,
                    'to': transaction_id,
                    'attrs': {'arrowsize': '0.6'}
                })
            else:
                # Input -> Transaction
                connections.append({
                    'from': input_id,
                    'to': transaction_id,
                    'attrs': {'arrowsize': '0.6'}
                })
        
        # Connections from transaction to outputs (with minting if present)
        for output_utxo in config.get('outputs', []):
            output_id = output_utxo['id']
            mint_config = output_utxo.get('mint')
            
            if mint_config:
                # Transaction -> Mint Policy -> Output (with minted tokens)
                mint_id = mint_config['id']
                connections.append({
                    'from': transaction_id,
                    'to': mint_id,
                    'attrs': {'arrowsize': '0.6', 'color': '#6A5ACD', 'penwidth': '2'}
                })
                connections.append({
                    'from': mint_id,
                    'to': output_id,
                    'attrs': {'arrowsize': '0.6', 'color': '#6A5ACD', 'penwidth': '2'}
                })
            else:
                # Transaction -> Output (normal flow)
                connections.append({
                    'from': transaction_id,
                    'to': output_id,
                    'attrs': {'arrowsize': '0.6'}
                })
        
        return connections
    
    def generate_ranks(self, ranks):
        """Generate rank constraints for layout"""
        result = []
        for rank in ranks:
            rank_type = rank['type']
            nodes = rank['nodes']
            node_list = "; ".join(nodes)
            result.append(f'    {{{rank_type}={rank_type}; {node_list};}}')
        
        return result
    
    def build_diagram(self, config):
        """Build complete GraphViz diagram from configuration"""
        name = config.get('name', 'TransactionDiagram')
        graph_attrs = config.get('graph_attrs', {})
        metadata = config.get('metadata', {})
        
        # Use built-in styles, ignore any styles from config
        styles = self.default_styles
        
        # Start building diagram
        lines = [f"digraph {name} {{"]
        
        # Graph attributes
        for key, value in graph_attrs.items():
            if isinstance(value, str) and not value.startswith('"'):
                lines.append(f'    {key}="{value}";')
            else:
                lines.append(f'    {key}={value};')
        
        lines.append("")
        
        # Default styles
        lines.append("    // Default node style")
        lines.append(f'    node [{styles["default_node"]}];')
        lines.append('    edge [color="#000000", fontname="Arial", fontsize=9];')
        lines.append("")
        
        # Generate reference nodes
        if 'references' in config and config['references']:
            lines.append("    // Reference nodes")
            for ref_node in config['references']:
                lines.append(self.generate_simple_node(ref_node, styles, 'reference'))
            lines.append("")
        
        # Generate input UTxO nodes
        lines.append("    // Input UTxO nodes")
        for input_utxo in config.get('inputs', []):
            lines.append(self.generate_utxo_node(input_utxo, 'input'))
        
        lines.append("")
        
        # Generate reference input UTxO nodes (at bottom of input column)
        if 'reference_inputs' in config and config['reference_inputs']:
            lines.append("    // Reference Input UTxO nodes (read only)")
            for ref_input_utxo in config['reference_inputs']:
                lines.append(self.generate_utxo_node(ref_input_utxo, 'reference_input'))
            lines.append("")
        
        # Generate transaction/operation node (support both keys for backwards compatibility)
        transaction_config = config.get('transaction', config.get('operation'))
        if transaction_config:
            lines.append("    // Transaction/Operation node")
            input_count = len(config.get('inputs', [])) + len(config.get('reference_inputs', []))
            output_count = len(config.get('outputs', []))
            lines.append(self.generate_transaction_node(transaction_config, styles, input_count, output_count))
            lines.append("")
        
        # Generate mint policy nodes (from outputs that have mint fields)
        mint_nodes = []
        for output_utxo in config.get('outputs', []):
            if 'mint' in output_utxo:
                mint_nodes.append(output_utxo['mint'])
        
        if mint_nodes:
            lines.append("    // Mint policy nodes")
            for mint_node in mint_nodes:
                lines.append(self.generate_simple_node(mint_node, styles, 'mint'))
            lines.append("")
        
        # Generate output UTxO nodes
        lines.append("    // Output UTxO nodes")
        for output_utxo in config.get('outputs', []):
            lines.append(self.generate_utxo_node(output_utxo, 'output'))
        
        lines.append("")
        
        # Generate redeemer nodes (from inputs and reference_inputs that have redeemers)
        redeemer_nodes = []
        for input_utxo in config.get('inputs', []):
            if 'redeemer' in input_utxo:
                redeemer_nodes.append(input_utxo['redeemer'])
        for ref_input_utxo in config.get('reference_inputs', []):
            if 'redeemer' in ref_input_utxo:
                redeemer_nodes.append(ref_input_utxo['redeemer'])
        
        if redeemer_nodes:
            lines.append("    // Redeemer/Validator nodes")
            lines.append(f'    node [{styles["validator_node"]}];')
            lines.append("")
            for redeemer in redeemer_nodes:
                lines.append(self.generate_redeemer_node(redeemer, styles))
            lines.append("")
        
        # Generate automatic layout constraints (create proper 5-column layout)
        lines.append("    // Automatic layout constraints for 5-column layout")
        
        # Column 1: References (leftmost)
        reference_nodes = [ref['id'] for ref in config.get('references', [])]
        if reference_nodes:
            ref_node_list = "; ".join(reference_nodes)
            lines.append(f'    {{rank=min; {ref_node_list};}}')
        
        # Column 2: Input UTxOs + Reference Input UTxOs - maintain column AND YAML order
        input_nodes = [input_utxo['id'] for input_utxo in config.get('inputs', [])]
        reference_input_nodes = [ref_input['id'] for ref_input in config.get('reference_inputs', [])]
        all_input_nodes = input_nodes + reference_input_nodes
        
        if all_input_nodes:
            input_node_list = "; ".join(all_input_nodes)
            lines.append(f'    {{rank=same; {input_node_list};}}')
            
            # Add invisible vertical edges to maintain YAML order within column
            if len(all_input_nodes) > 1:
                lines.append("    // Maintain input order from YAML (inputs first, then reference inputs)")
                for i in range(len(all_input_nodes) - 1):
                    lines.append(f'    {all_input_nodes[i]} -> {all_input_nodes[i+1]} [style=invis, weight=10];')
        
        # Column 3: Redeemers (collect from inputs and reference_inputs that have redeemers)
        redeemer_nodes = []
        for input_utxo in config.get('inputs', []):
            if 'redeemer' in input_utxo:
                redeemer_nodes.append(input_utxo['redeemer']['id'])
        for ref_input_utxo in config.get('reference_inputs', []):
            if 'redeemer' in ref_input_utxo:
                redeemer_nodes.append(ref_input_utxo['redeemer']['id'])
        if redeemer_nodes:
            redeemer_node_list = "; ".join(redeemer_nodes)
            lines.append(f'    {{rank=same; {redeemer_node_list};}}')
        
        # Column 4: Transaction (center)
        transaction_config = config.get('transaction', config.get('operation'))
        if transaction_config:
            transaction_id = transaction_config['id']
            lines.append(f'    {{rank=same; {transaction_id};}}')
        
        # Column 4.5: Mint policies (between transaction and outputs)
        mint_node_ids = []
        for output_utxo in config.get('outputs', []):
            if 'mint' in output_utxo:
                mint_node_ids.append(output_utxo['mint']['id'])
        if mint_node_ids:
            mint_node_list = "; ".join(mint_node_ids)
            lines.append(f'    {{rank=same; {mint_node_list};}}')
        
        # Column 5: Output UTxOs - maintain column AND YAML order
        output_nodes = [output_utxo['id'] for output_utxo in config.get('outputs', [])]
        if output_nodes:
            output_node_list = "; ".join(output_nodes)
            lines.append(f'    {{rank=max; {output_node_list};}}')
            
            # Add invisible vertical edges to maintain YAML order within column
            if len(output_nodes) > 1:
                lines.append("    // Maintain output order from YAML")
                for i in range(len(output_nodes) - 1):
                    lines.append(f'    {output_nodes[i]} -> {output_nodes[i+1]} [style=invis, weight=10];')
        
        # Add any custom rank constraints from config (will supplement the above)
        if 'ranks' in config:
            lines.append("    // Custom layout constraints from config")
            lines.extend(self.generate_ranks(config['ranks']))
        
        lines.append("")
        
        # Generate connections (both implied and explicit)
        lines.append("    // Connections")
        
        # First add implied connections
        implied_connections = self.generate_implied_connections(config)
        lines.extend(self.generate_connections(implied_connections))
        
        # Then add any explicit connections
        if 'connections' in config and config['connections']:
            lines.extend(self.generate_connections(config['connections']))
        
        # Add footer with required tokens
        if metadata:
            requires_tokens = metadata.get('requires_tokens', [])
            if requires_tokens:
                lines.append("")
                lines.append("    // Required tokens footer")
                tokens_str = ", ".join(requires_tokens)
                footer_text = f"Required Tokens: {tokens_str}"
                # Add the footer text as a label to the graph itself instead of as a node
                # This will ensure it appears at the bottom of the rendered image
                lines.append(f'    label="{footer_text}";')
                lines.append('    labelloc="b";')  # b = bottom
                lines.append('    fontsize=10;')
                lines.append('    fontcolor="#666666";')
        
        lines.append("}")
        
        return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description='Build transaction diagrams from YAML configuration')
    parser.add_argument('config_file', help='YAML configuration file')
    parser.add_argument('-o', '--output', help='Output DOT file (default: stdout)')
    parser.add_argument('--yaml-dir', default='./yaml', help='Directory containing YAML files (default: ./yaml)')
    parser.add_argument('--output-dir', default='../../output', help='Output directory for DOT files (default: ../../output)')
    
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
        
        builder = TransactionDiagramBuilder()
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