"use server";

import { loadYamlFile } from "@/utils/yaml";
import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { TransactionYaml, ResolvedTransactionResponse } from "@/types";
import { deploymentResolver } from "@/utils/deployment-resolver";
import { assertSafeSegment, isUnsafePathError } from "@/utils/safe-path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ role: string; transaction: string }> }
) {
  try {
    const rawParams = await params;
    const searchParams = request.nextUrl.searchParams;
    const rawDeployment = searchParams.get("deployment") || "preprod";
    const rawVersion = searchParams.get("version") || "v1";

    // Dynamic segments are caller-controlled too — validate alongside the
    // query params before any of them reach the filesystem.
    let role: string, transaction: string, deployment: string, version: string;
    try {
      role = assertSafeSegment(rawParams.role, "role");
      transaction = assertSafeSegment(rawParams.transaction, "transaction");
      deployment = assertSafeSegment(rawDeployment, "deployment parameter");
      version = assertSafeSegment(rawVersion, "version parameter");
    } catch (error) {
      if (isUnsafePathError(error)) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
      }
      throw error;
    }

    const filePath = `yaml/transactions/${version}/${role}/${transaction}.yaml`;
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