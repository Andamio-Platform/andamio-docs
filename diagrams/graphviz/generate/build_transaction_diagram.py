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
        address = utxo_config.get('address', '')
        values = utxo_config.get('values', [])
        datum = utxo_config.get('datum', {})
        
        # Generate address section
        address_section = ""
        if address:
            address_section = '            <TR><TD HEIGHT="5"></TD></TR>\n'
            address_section += '            <TR><TD ALIGN="left"><B>Address:</B></TD></TR>\n'
            address_section += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{address}</FONT></TD></TR>\n'
        
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
{address_section}            <TR><TD HEIGHT="5"></TD></TR>
            <TR><TD ALIGN="left"><B>Value:</B></TD></TR>
{value_section}{datum_section}        </TABLE>
    >, style="filled", fillcolor="#ffffff", color="#2196F3", fontname="Arial", fontsize=10, penwidth=2, margin="0.1,0.1"];'''
    
    def generate_utxo_node(self, utxo_config, node_context='utxo'):
        """Generate a UTxO node from configuration with automatic style inference"""
        node_id = utxo_config['id']
        title = utxo_config['title']
        address = utxo_config.get('address', '')
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
        
        # Generate address section
        address_section = ""
        if address:
            address_section = '            <TR><TD ALIGN="left"><B>Address:</B></TD></TR>\n'
            address_section += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{address}</FONT></TD></TR>\n'
        
        # Generate value section
        value_section = ""
        for value in values:
            value_section += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{value}</FONT></TD></TR>\n'
        
        # Generate datum section
        datum_section = ""
        if datum:
            datum_section = '            <TR><TD ALIGN="left"><B>Datum:</B></TD></TR>\n'
            datum_section += self._format_datum_recursive(datum, 0)
        
        # Build the table with conditional sections
        table_content = f'''    {node_id} [label=<
        <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="2">
            <TR><TD ALIGN="left"><B>{title}</B></TD></TR>
            <TR><TD HEIGHT="3"></TD></TR>'''
        
        if address_section:
            table_content += address_section
            table_content += '            <TR><TD HEIGHT="3"></TD></TR>\n'
        
        table_content += '            <TR><TD ALIGN="left"><B>Value:</B></TD></TR>\n'
        table_content += value_section
        
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
    
    def generate_mint_node(self, mint_config, styles):
        """Generate a mint policy node with UTxO-style table format"""
        node_id = mint_config['id']
        title = mint_config['title']
        values = mint_config.get('values', [])
        redeemer = mint_config.get('redeemer')
        
        # Use mint_policy_node style
        style_attrs = styles.get('mint_policy_node', self.default_styles['mint_policy_node'])
        
        # Generate value section
        value_section = ""
        for value in values:
            value_section += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{value}</FONT></TD></TR>\n'
        
        # Generate redeemer section
        redeemer_section = ""
        if redeemer:
            redeemer_title = redeemer.get('title', '')
            redeemer_params = redeemer.get('params', [])
            
            redeemer_section = '            <TR><TD HEIGHT="3"></TD></TR>\n'
            redeemer_section += '            <TR><TD ALIGN="left"><B>Redeemer:</B></TD></TR>\n'
            redeemer_section += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{redeemer_title}</FONT></TD></TR>\n'
            
            if redeemer_params:
                redeemer_section += '            <TR><TD ALIGN="left"><B>Params:</B></TD></TR>\n'
                for param in redeemer_params:
                    redeemer_section += f'            <TR><TD ALIGN="left"><FONT FACE="Courier New">{param}</FONT></TD></TR>\n'
        
        # Build the table
        table_content = f'''    {node_id} [label=<
        <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="2">
            <TR><TD ALIGN="left"><B>{title}</B></TD></TR>
            <TR><TD HEIGHT="3"></TD></TR>
            <TR><TD ALIGN="left"><B>Value:</B></TD></TR>
{value_section}'''
        
        if redeemer_section:
            table_content += redeemer_section
        
        table_content += f'''        </TABLE>
    >, {style_attrs}];'''
        
        return table_content

    def generate_transaction_with_mint_node(self, tx_config, mint_nodes, observers, styles):
        """Generate a transaction node with embedded mint policy and observer tables"""
        node_id = tx_config['id']
        title = tx_config['title']
        
        # Use transaction_node style
        style_attrs = styles.get('transaction_node', self.default_styles['transaction_node'])
        
        # Generate mint sections as nested tables
        embedded_sections = ""
        
        # Add mint policies
        for mint_node in mint_nodes:
            mint_title = mint_node['title']
            mint_values = mint_node.get('values', [])
            mint_redeemer = mint_node.get('redeemer')
            
            # Add mint section with inner border
            embedded_sections += '            <TR><TD HEIGHT="10"></TD></TR>\n'
            embedded_sections += '            <TR><TD>\n'
            embedded_sections += '                <TABLE BORDER="2" CELLBORDER="0" CELLSPACING="0" CELLPADDING="4" BGCOLOR="#ffffff" COLOR="#6A5ACD">\n'
            embedded_sections += f'                    <TR><TD ALIGN="left" BGCOLOR="#f0f0ff"><B>{mint_title}</B></TD></TR>\n'
            
            # Add mint values
            if mint_values:
                embedded_sections += '                    <TR><TD ALIGN="left"><B>Value:</B></TD></TR>\n'
                for value in mint_values:
                    embedded_sections += f'                    <TR><TD ALIGN="left"><FONT FACE="Courier New">{value}</FONT></TD></TR>\n'
            
            # Add mint redeemer
            if mint_redeemer:
                embedded_sections += '                    <TR><TD ALIGN="left"><B>Redeemer:</B></TD></TR>\n'
                embedded_sections += f'                    <TR><TD ALIGN="left"><FONT FACE="Courier New">{mint_redeemer.get("title", "")}</FONT></TD></TR>\n'
                
                redeemer_params = mint_redeemer.get('params', [])
                if redeemer_params:
                    embedded_sections += '                    <TR><TD ALIGN="left"><B>Params:</B></TD></TR>\n'
                    for param in redeemer_params:
                        embedded_sections += f'                    <TR><TD ALIGN="left"><FONT FACE="Courier New">{param}</FONT></TD></TR>\n'
            
            embedded_sections += '                </TABLE>\n'
            embedded_sections += '            </TD></TR>\n'
        
        # Add observers
        for observer in observers:
            observer_title = observer['title']
            observer_address = observer.get('address', '')
            observer_redeemer = observer.get('redeemer')
            
            # Add observer section with inner border (different color from mint)
            embedded_sections += '            <TR><TD HEIGHT="10"></TD></TR>\n'
            embedded_sections += '            <TR><TD>\n'
            embedded_sections += '                <TABLE BORDER="2" CELLBORDER="0" CELLSPACING="0" CELLPADDING="4" BGCOLOR="#ffffff" COLOR="#FF8C00">\n'
            embedded_sections += f'                    <TR><TD ALIGN="left" BGCOLOR="#fff0e0"><B>{observer_title}</B></TD></TR>\n'
            
            # Add observer address
            if observer_address:
                embedded_sections += '                    <TR><TD ALIGN="left"><B>Address:</B></TD></TR>\n'
                embedded_sections += f'                    <TR><TD ALIGN="left"><FONT FACE="Courier New">{observer_address}</FONT></TD></TR>\n'
            
            # Add observer redeemer
            if observer_redeemer:
                embedded_sections += '                    <TR><TD ALIGN="left"><B>Redeemer:</B></TD></TR>\n'
                embedded_sections += f'                    <TR><TD ALIGN="left"><FONT FACE="Courier New">{observer_redeemer.get("title", "")}</FONT></TD></TR>\n'
                
                redeemer_params = observer_redeemer.get('params', [])
                if redeemer_params:
                    embedded_sections += '                    <TR><TD ALIGN="left"><B>Params:</B></TD></TR>\n'
                    for param in redeemer_params:
                        embedded_sections += f'                    <TR><TD ALIGN="left"><FONT FACE="Courier New">{param}</FONT></TD></TR>\n'
            
            embedded_sections += '                </TABLE>\n'
            embedded_sections += '            </TD></TR>\n'
        
        # Add final spacing
        if embedded_sections:
            embedded_sections += '            <TR><TD HEIGHT="10"></TD></TR>\n'
        
        # Generate the outer transaction table
        return f'''    {node_id} [label=<
        <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" BGCOLOR="#e8f5e8">
            <TR><TD ALIGN="center"><B><FONT POINT-SIZE="16">{title}</FONT></B></TD></TR>
{embedded_sections}        </TABLE>
    >, shape=box, style="filled", fillcolor="#e8f5e8", color="#00796b", fontname="Arial", fontsize=10, penwidth=3, margin="0.2,0.2"];'''

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
            <TR><TD ALIGN="left"><B>Redeemer:</B></TD></TR>
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
        
        # Get mint nodes first
        mint_nodes = config.get('mint', [])
        
        # Connections from inputs to transaction/mint cluster
        all_inputs = config.get('inputs', []) + config.get('reference_inputs', [])
        
        # Always connect to transaction node (mint is embedded inside it)
        target_id = transaction_id
        
        for input_utxo in all_inputs:
            input_id = input_utxo['id']
            redeemer = input_utxo.get('redeemer')
            
            if redeemer:
                # Input -> Redeemer (no arrow) -> Transaction/Mint
                redeemer_id = redeemer['id']
                connections.append({
                    'from': input_id,
                    'to': redeemer_id,
                    'attrs': {'dir': 'none'}
                })
                connections.append({
                    'from': redeemer_id,
                    'to': target_id,
                    'attrs': {'arrowsize': '0.6'}
                })
            else:
                # Input -> Transaction/Mint
                connections.append({
                    'from': input_id,
                    'to': target_id,
                    'attrs': {'arrowsize': '0.6'}
                })
        
        # Connections to outputs (always from transaction node)
        for output_utxo in config.get('outputs', []):
            output_id = output_utxo['id']
            
            # Check if this output receives minted tokens
            output_values = output_utxo.get('values', [])
            has_minted_tokens = any('access_token' in str(value) for value in output_values)
            
            if mint_nodes and has_minted_tokens:
                # Transaction -> Output (with minted tokens, using purple color to indicate minting)
                connections.append({
                    'from': transaction_id,
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
        
        # Skip reference nodes - they are no longer needed
        
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
        
        # Generate transaction cluster with embedded mint nodes
        transaction_config = config.get('transaction', config.get('operation'))
        mint_nodes = config.get('mint', [])
        
        if transaction_config:
            if mint_nodes:
                lines.append("    // Transaction node with embedded mint policy")
                transaction_id = transaction_config['id']
                transaction_title = transaction_config['title']
                
                # Generate a single node that contains transaction title, mint details, and observers
                observers = config.get('observers', [])
                lines.append(self.generate_transaction_with_mint_node(transaction_config, mint_nodes, observers, styles))
                lines.append("")
            else:
                lines.append("    // Transaction/Operation node")
                input_count = len(config.get('inputs', [])) + len(config.get('reference_inputs', []))
                output_count = len(config.get('outputs', []))
                lines.append(self.generate_transaction_node(transaction_config, styles, input_count, output_count))
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
        
        # Generate automatic layout constraints (create proper 4-column layout)
        lines.append("    // Automatic layout constraints for 4-column layout")
        
        # Column 1: Input UTxOs + Reference Input UTxOs - maintain column AND YAML order
        input_nodes = [input_utxo['id'] for input_utxo in config.get('inputs', [])]
        reference_input_nodes = [ref_input['id'] for ref_input in config.get('reference_inputs', [])]
        all_input_nodes = input_nodes + reference_input_nodes
        
        if all_input_nodes:
            input_node_list = "; ".join(all_input_nodes)
            lines.append(f'    {{rank=min; {input_node_list};}}')
            
            # Add invisible vertical edges to maintain YAML order within column
            if len(all_input_nodes) > 1:
                lines.append("    // Maintain input order from YAML (inputs first, then reference inputs)")
                for i in range(len(all_input_nodes) - 1):
                    lines.append(f'    {all_input_nodes[i]} -> {all_input_nodes[i+1]} [style=invis, weight=10];')
        
        # Column 2: Redeemers (collect from inputs and reference_inputs that have redeemers)
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
        
        # Column 3: Transaction (center)
        transaction_config = config.get('transaction', config.get('operation'))
        
        if transaction_config:
            transaction_id = transaction_config['id']
            lines.append(f'    {{rank=same; {transaction_id};}}')
        
        # Column 4: Output UTxOs - maintain column AND YAML order
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
        
        # Then add any explicit connections (but skip reference connections)
        if 'connections' in config and config['connections']:
            # Filter out connections to/from reference nodes (any node ending in _ref)
            filtered_connections = []
            for conn in config['connections']:
                # Skip connections involving ANY reference nodes (nodes ending in _ref)
                if not (conn['from'].endswith('_ref') or conn['to'].endswith('_ref')):
                    filtered_connections.append(conn)
            lines.extend(self.generate_connections(filtered_connections))
        
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
    parser.add_argument('--yaml-dir', default='./yaml/transactions', help='Directory containing transaction YAML files (default: ./yaml/transactions)')
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