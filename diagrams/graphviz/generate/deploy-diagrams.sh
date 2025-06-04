#!/bin/bash

# Script to deploy PNG files and archive DOT files
# - Copies PNG files from diagrams/output/transactions to public/diagrams/transactions
# - Copies PNG files from diagrams/output/validators to public/diagrams/validators
# - Archives all DOT files to a dated directory in output

set -e  # Exit on any error

# Define directories
OUTPUT_DIR="../../output"
TRANSACTION_OUTPUT_DIR="$OUTPUT_DIR/transactions"
VALIDATOR_OUTPUT_DIR="$OUTPUT_DIR/validators"
PUBLIC_TRANSACTIONS_DIR="../../../public/diagrams/transactions"
PUBLIC_VALIDATORS_DIR="../../../public/diagrams/validators"
CURRENT_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVE_DIR="$OUTPUT_DIR/archive_$CURRENT_DATE"

echo "Starting diagram deployment process..."

# Check if output directory exists
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "Error: Output directory '$OUTPUT_DIR' not found"
    exit 1
fi

# Create public diagrams directories if they don't exist
echo "Creating public diagrams directories if needed..."
mkdir -p "$PUBLIC_TRANSACTIONS_DIR"
mkdir -p "$PUBLIC_VALIDATORS_DIR"

# Count and copy transaction PNG files
TRANSACTION_PNG_COUNT=0
if [ -d "$TRANSACTION_OUTPUT_DIR" ]; then
    TRANSACTION_PNG_COUNT=$(find "$TRANSACTION_OUTPUT_DIR" -maxdepth 1 -name "*.png" 2>/dev/null | wc -l)
    echo "Found $TRANSACTION_PNG_COUNT transaction PNG files to copy"
    
    if [ $TRANSACTION_PNG_COUNT -gt 0 ]; then
        echo "Copying transaction PNG files to public directory..."
        cp "$TRANSACTION_OUTPUT_DIR"/*.png "$PUBLIC_TRANSACTIONS_DIR/"
        echo "Successfully copied $TRANSACTION_PNG_COUNT transaction PNG files to $PUBLIC_TRANSACTIONS_DIR"
    fi
else
    echo "No transaction output directory found"
fi

# Count and copy validator PNG files
VALIDATOR_PNG_COUNT=0
if [ -d "$VALIDATOR_OUTPUT_DIR" ]; then
    VALIDATOR_PNG_COUNT=$(find "$VALIDATOR_OUTPUT_DIR" -maxdepth 1 -name "*.png" 2>/dev/null | wc -l)
    echo "Found $VALIDATOR_PNG_COUNT validator PNG files to copy"
    
    if [ $VALIDATOR_PNG_COUNT -gt 0 ]; then
        echo "Copying validator PNG files to public directory..."
        cp "$VALIDATOR_OUTPUT_DIR"/*.png "$PUBLIC_VALIDATORS_DIR/"
        echo "Successfully copied $VALIDATOR_PNG_COUNT validator PNG files to $PUBLIC_VALIDATORS_DIR"
    fi
else
    echo "No validator output directory found"
fi

TOTAL_PNG_COUNT=$((TRANSACTION_PNG_COUNT + VALIDATOR_PNG_COUNT))
if [ $TOTAL_PNG_COUNT -eq 0 ]; then
    echo "No PNG files found to copy"
fi

# Count DOT files to archive from subdirectories
TRANSACTION_DOT_COUNT=0
VALIDATOR_DOT_COUNT=0

if [ -d "$TRANSACTION_OUTPUT_DIR" ]; then
    TRANSACTION_DOT_COUNT=$(find "$TRANSACTION_OUTPUT_DIR" -maxdepth 1 -name "*.dot" 2>/dev/null | wc -l)
fi

if [ -d "$VALIDATOR_OUTPUT_DIR" ]; then
    VALIDATOR_DOT_COUNT=$(find "$VALIDATOR_OUTPUT_DIR" -maxdepth 1 -name "*.dot" 2>/dev/null | wc -l)
fi

TOTAL_DOT_COUNT=$((TRANSACTION_DOT_COUNT + VALIDATOR_DOT_COUNT))
echo "Found $TOTAL_DOT_COUNT DOT files to archive ($TRANSACTION_DOT_COUNT transaction, $VALIDATOR_DOT_COUNT validator)"

# Archive DOT files if any exist
if [ $TOTAL_DOT_COUNT -gt 0 ]; then
    echo "Creating archive directory: $ARCHIVE_DIR"
    mkdir -p "$ARCHIVE_DIR"
    mkdir -p "$ARCHIVE_DIR/transactions"
    mkdir -p "$ARCHIVE_DIR/validators"
    
    if [ $TRANSACTION_DOT_COUNT -gt 0 ]; then
        echo "Moving transaction DOT files to archive..."
        mv "$TRANSACTION_OUTPUT_DIR"/*.dot "$ARCHIVE_DIR/transactions/"
    fi
    
    if [ $VALIDATOR_DOT_COUNT -gt 0 ]; then
        echo "Moving validator DOT files to archive..."
        mv "$VALIDATOR_OUTPUT_DIR"/*.dot "$ARCHIVE_DIR/validators/"
    fi
    
    echo "Successfully archived $TOTAL_DOT_COUNT DOT files to $ARCHIVE_DIR"
else
    echo "No DOT files found to archive"
fi

echo "Deployment complete!"
echo "Transaction PNG files copied to: $PUBLIC_TRANSACTIONS_DIR"
echo "Validator PNG files copied to: $PUBLIC_VALIDATORS_DIR"
if [ $TOTAL_DOT_COUNT -gt 0 ]; then
    echo "DOT files archived to: $ARCHIVE_DIR"
fi