"use server";

import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { NextRequest, NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { join } from "path";

function getAllTransactions(baseDir: string, prefix: string = ""): string[] {
  const transactions: string[] = [];
  const fullPath = join(process.cwd(), "public", "yaml", "transactions", prefix);
  
  try {
    const items = readdirSync(fullPath);
    
    for (const item of items) {
      const itemPath = join(fullPath, item);
      const relativePath = prefix ? `${prefix}/${item}` : item;
      
      if (statSync(itemPath).isDirectory()) {
        // Recursively get transactions from subdirectories
        transactions.push(...getAllTransactions(baseDir, relativePath));
      } else if (item.endsWith('.yaml') && item !== 'simple-spending-tx.yaml') {
        // Add individual transaction files (exclude simple-spending-tx.yaml as it's not a real transaction)
        transactions.push(relativePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${fullPath}:`, error);
  }
  
  return transactions;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const version = searchParams.get("version") || "v1";

    let transactions: string[];

    if (role) {
      // Get transactions for specific role and version
      transactions = getAllTransactions("", `${version}/${role}`);
    } else {
      // Get all transactions for the specified version
      transactions = getAllTransactions("", version);
    }
    
    // Transform file paths to transaction info
    const transactionList = transactions.map(filePath => {
      const parts = filePath.split('/');
      const fileName = parts[parts.length - 1];
      const transactionName = fileName.replace('.yaml', '');
      // Extract role from path (skip version part if present)
      const roleIndex = parts[0] === 'v1' || parts[0] === 'v2' ? 1 : 0;
      const roleDir = parts.length > roleIndex + 1 ? parts[roleIndex] : 'general';

      return {
        file: filePath,
        role: roleDir,
        transaction: transactionName,
        id: `${roleDir}.${transactionName}`,
        url: `/api/transactions/${roleDir}/${transactionName}?version=${version}`
      };
    });
    
    const response = NextResponse.json({
      count: transactionList.length,
      transactions: transactionList
    });
    
    // Add CORS headers for external access
    addCorsHeaders(response, request);
    
    return response;
  } catch (error) {
    console.error("Error listing transactions:", error);
    return NextResponse.json(
      { error: "Failed to list transactions" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}