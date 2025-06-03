#!/bin/bash

# Script to generate .dot and .png files from YAML transaction diagram configuration

# Check if argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <yaml_file>"
    echo "Example: $0 enroll-course.yaml"
    exit 1
fi

# Define directories
YAML_DIR="./yaml"
OUTPUT_DIR="../../output"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Construct the full path to the YAML file
YAML_FILE="$YAML_DIR/$1"

# Check if the YAML file exists
if [ ! -f "$YAML_FILE" ]; then
    echo "Error: File '$YAML_FILE' not found"
    exit 1
fi

# Extract the base name (remove extension)
BASENAME=$(basename "$YAML_FILE" .yaml)

# Define output file names with output directory
DOT_FILE="${BASENAME}.dot"
PNG_FILE="${BASENAME}.png"

echo "Generating diagram for: $YAML_FILE"

# Step 1: Generate .dot file using the Python script
echo "Creating $OUTPUT_DIR/$DOT_FILE..."
if ! python3 build_diagram.py "$1" --yaml-dir="$YAML_DIR" --output-dir="$OUTPUT_DIR" -o "$DOT_FILE"; then
    echo "Error: Failed to generate .dot file"
    exit 1
fi

# Step 2: Generate .png file from .dot file using GraphViz
echo "Creating $OUTPUT_DIR/$PNG_FILE..."
if ! dot -Tpng "$OUTPUT_DIR/$DOT_FILE" -o "$OUTPUT_DIR/$PNG_FILE"; then
    echo "Error: Failed to generate .png file. Make sure GraphViz is installed."
    echo "Install GraphViz with: sudo apt install graphviz (Ubuntu/Debian) or brew install graphviz (macOS)"
    exit 1
fi

echo "Successfully generated:"
echo "  - $OUTPUT_DIR/$DOT_FILE"
echo "  - $OUTPUT_DIR/$PNG_FILE"