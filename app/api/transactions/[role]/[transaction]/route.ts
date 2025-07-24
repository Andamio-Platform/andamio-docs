"use server";

import { loadYamlFile } from "@/utils/yaml";
import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { TransactionYaml } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ role: string; transaction: string }> }
) {
  try {
    const { role, transaction } = await params;
    const filePath = `yaml/transactions/${role}/${transaction}.yaml`;
    const txData = await loadYamlFile(filePath) as TransactionYaml;
    
    const response = NextResponse.json({
      role: role,
      transaction: transaction,
      file: `${role}/${transaction}.yaml`,
      data: txData
    });
    
    // Add CORS headers for external access
    addCorsHeaders(response, request);
    
    return response;
  } catch (error) {
    console.error("Error loading transaction file:", error);
    const { role, transaction } = await params;
    return NextResponse.json(
      { error: `Transaction '${role}/${transaction}' not found` },
      { status: 404 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}