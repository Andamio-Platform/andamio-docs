"use server";

import { loadYamlFile } from "@/utils/yaml";
import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { TransactionYaml, ResolvedTransactionResponse } from "@/types";
import { deploymentResolver } from "@/utils/deployment-resolver";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ role: string; transaction: string }> }
) {
  try {
    const { role, transaction } = await params;
    const searchParams = request.nextUrl.searchParams;
    const deployment = searchParams.get("deployment") || "preprod";
    const version = searchParams.get("version") || "v1";
    
    const filePath = `yaml/transactions/${role}/${transaction}.yaml`;
    const txData = await loadYamlFile(filePath) as TransactionYaml;
    
    // Resolve addresses and tokens from deployment files
    const resolved = await deploymentResolver.resolveTransaction(
      txData,
      deployment,
      version
    );
    
    const responseData: ResolvedTransactionResponse = {
      role: role,
      transaction: transaction,
      file: `${role}/${transaction}.yaml`,
      data: txData,
      resolved: {
        addresses: resolved.resolvedAddresses,
        tokens: resolved.resolvedTokens,
      },
    };
    
    const response = NextResponse.json(responseData);
    
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