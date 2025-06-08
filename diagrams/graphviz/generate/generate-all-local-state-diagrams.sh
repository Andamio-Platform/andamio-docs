#!/bin/bash

# Script to generate .dot and .png files for all YAML local state diagrams
# Usage: ./generate-all-local-state-diagrams.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
YAML_DIR="./yaml/global-and-local-state"
OUTPUT_DIR="../../output/local-state"
SCRIPT_NAME="./generate-local-state-png.sh"

# Counters
total_files=0
successful_files=0
failed_files=0
skipped_files=0

echo -e "${BLUE}🔄 Andamio Local State Diagram Generator${NC}"
echo -e "${BLUE}=======================================${NC}"
echo

# Check if directories exist
if [ ! -d "$YAML_DIR" ]; then
    echo -e "${RED}❌ Error: YAML directory '$YAML_DIR' not found${NC}"
    exit 1
fi

if [ ! -f "$SCRIPT_NAME" ]; then
    echo -e "${RED}❌ Error: Script '$SCRIPT_NAME' not found${NC}"
    exit 1
fi

# Make sure the script is executable
chmod +x "$SCRIPT_NAME"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Count total YAML files (only those with "local-state" in the name)
total_files=$(find "$YAML_DIR" -name "*local-state*.yaml" | wc -l | tr -d ' ')
echo -e "${BLUE}📁 Found $total_files local state YAML files in $YAML_DIR${NC}"
echo

# Check and activate virtual environment
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Error: Virtual environment 'venv' not found${NC}"
    echo -e "${YELLOW}   Please create it with: python3 -m venv venv && source venv/bin/activate && pip install PyYAML${NC}"
    exit 1
fi

# Activate virtual environment
echo -e "${BLUE}🐍 Activating virtual environment...${NC}"
source venv/bin/activate
echo

# Process each YAML file
for yaml_file in "$YAML_DIR"/*local-state*.yaml; do
    # Check if files exist (handles case where no .yaml files found)
    if [ ! -f "$yaml_file" ]; then
        echo -e "${YELLOW}⚠️  No local state YAML files found in $YAML_DIR${NC}"
        exit 0
    fi
    
    # Extract filename without path and extension
    filename=$(basename "$yaml_file" .yaml)
    
    echo -e "${BLUE}🔧 Processing local state: ${NC}$filename.yaml"
    
    # Check if output files already exist
    dot_file="$OUTPUT_DIR/${filename}.dot"
    png_file="$OUTPUT_DIR/${filename}.png"
    
    if [ -f "$dot_file" ] && [ -f "$png_file" ]; then
        # Check if YAML is newer than outputs
        if [ "$yaml_file" -nt "$dot_file" ] || [ "$yaml_file" -nt "$png_file" ]; then
            echo -e "   ${YELLOW}📄 Updating existing files (YAML is newer)${NC}"
        else
            echo -e "   ${YELLOW}⏭️  Skipping (up-to-date files exist)${NC}"
            ((skipped_files++))
            echo
            continue
        fi
    fi
    
    # Run the generate script
    if "$SCRIPT_NAME" "$(basename "$yaml_file")" 2>/dev/null; then
        echo -e "   ${GREEN}✅ Successfully generated: $filename.dot & $filename.png${NC}"
        ((successful_files++))
    else
        echo -e "   ${RED}❌ Failed to generate: $filename${NC}"
        ((failed_files++))
    fi
    
    echo
done

# Summary
echo -e "${BLUE}📊 Local State Generation Summary${NC}"
echo -e "${BLUE}===============================${NC}"
echo -e "${GREEN}✅ Successful: $successful_files${NC}"
echo -e "${RED}❌ Failed: $failed_files${NC}"
echo -e "${YELLOW}⏭️  Skipped: $skipped_files${NC}"
echo -e "${BLUE}📁 Total: $total_files${NC}"
echo

if [ $failed_files -eq 0 ]; then
    echo -e "${GREEN}🎉 All local state diagrams generated successfully!${NC}"
    echo -e "${BLUE}📂 Output files are in: $OUTPUT_DIR${NC}"
else
    echo -e "${YELLOW}⚠️  Some files failed to generate. Check the errors above.${NC}"
    exit 1
fi

# Optional: Show output directory contents
echo
echo -e "${BLUE}📋 Generated Local State Files:${NC}"
echo -e "${BLUE}=============================${NC}"
ls -la "$OUTPUT_DIR"/*local-state*.{dot,png} 2>/dev/null | while read -r line; do
    echo "   $line"
done

echo
echo -e "${GREEN}✨ Done!${NC}"
