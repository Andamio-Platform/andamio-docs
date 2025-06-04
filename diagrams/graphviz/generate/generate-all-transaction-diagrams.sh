#!/bin/bash

# Script to generate .dot and .png files for all YAML transaction diagrams
# Usage: ./generate-all-diagrams.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
YAML_DIR="./yaml/transactions"
OUTPUT_DIR="../../output/transactions"
SCRIPT_NAME="./generate-transaction-png.sh"

# Counters
total_files=0
successful_files=0
failed_files=0
skipped_files=0
metadata_only_files=0

echo -e "${BLUE}🔄 Andamio Protocol Diagram Generator${NC}"
echo -e "${BLUE}=====================================${NC}"
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

# Count total YAML files
total_files=$(find "$YAML_DIR" -name "*.yaml" | wc -l | tr -d ' ')
echo -e "${BLUE}📁 Found $total_files YAML files in $YAML_DIR${NC}"
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
for yaml_file in "$YAML_DIR"/*.yaml; do
    # Check if files exist (handles case where no .yaml files found)
    if [ ! -f "$yaml_file" ]; then
        echo -e "${YELLOW}⚠️  No YAML files found in $YAML_DIR${NC}"
        exit 0
    fi
    
    # Extract filename without path and extension
    filename=$(basename "$yaml_file" .yaml)
    
    echo -e "${BLUE}🔧 Processing: ${NC}$filename.yaml"
    
    # Check if YAML file has transaction structure or just metadata
    if ! grep -q "^inputs:" "$yaml_file" && ! grep -q "^transaction:" "$yaml_file"; then
        echo -e "   ${YELLOW}📋 Metadata-only file (no transaction structure)${NC}"
    fi
    
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
    if "$SCRIPT_NAME" "$filename.yaml" 2>/dev/null; then
        echo -e "   ${GREEN}✅ Successfully generated: $filename.dot & $filename.png${NC}"
        ((successful_files++))
    else
        echo -e "   ${RED}❌ Failed to generate: $filename${NC}"
        ((failed_files++))
    fi
    
    echo
done

# Count metadata-only files
metadata_only_files=$(find "$YAML_DIR" -name "*.yaml" -exec sh -c 'if ! grep -q "^inputs:" "$1" && ! grep -q "^transaction:" "$1"; then echo "$1"; fi' _ {} \; | wc -l | tr -d ' ')

# Summary
echo -e "${BLUE}📊 Generation Summary${NC}"
echo -e "${BLUE}===================${NC}"
echo -e "${GREEN}✅ Successful: $successful_files${NC}"
echo -e "${RED}❌ Failed: $failed_files${NC}"
echo -e "${YELLOW}⏭️  Skipped: $skipped_files${NC}"
echo -e "${YELLOW}📋 Metadata-only: $metadata_only_files${NC}"
echo -e "${BLUE}📁 Total: $total_files${NC}"
echo

if [ $failed_files -eq 0 ]; then
    echo -e "${GREEN}🎉 All diagrams generated successfully!${NC}"
    echo -e "${BLUE}📂 Output files are in: $OUTPUT_DIR${NC}"
    if [ $metadata_only_files -gt 0 ]; then
        echo -e "${YELLOW}📋 Note: $metadata_only_files files contain only metadata (title/footer) without transaction diagrams${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Some files failed to generate. Check the errors above.${NC}"
    exit 1
fi

# Optional: Show output directory contents
echo
echo -e "${BLUE}📋 Generated Files:${NC}"
echo -e "${BLUE}=================${NC}"
ls -la "$OUTPUT_DIR"/*.{dot,png} 2>/dev/null | while read -r line; do
    echo "   $line"
done

echo
echo -e "${GREEN}✨ Done!${NC}"