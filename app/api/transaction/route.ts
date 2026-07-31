"use server";

import { loadYamlFile } from "@/utils/yaml";
import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { TransactionYaml, ResolvedTransactionResponse } from "@/types";
import { deploymentResolver } from "@/utils/deployment-resolver";
import {
  assertSafeRelativePath,
  assertSafeSegment,
  isUnsafePathError,
} from "@/utils/safe-path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawTxFile = searchParams.get("file");
  const rawDeployment = searchParams.get("deployment") || "preprod";
  const rawVersion = searchParams.get("version") || "v2";

  if (!rawTxFile) {
    return NextResponse.json(
      { error: "No file parameter provided" },
      { status: 400 }
    );
  }

  // All three reach the filesystem below — reject traversal before they do.
  let txFile: string, deployment: string, version: string;
  try {
    txFile = assertSafeRelativePath(rawTxFile, "file parameter");
    deployment = assertSafeSegment(rawDeployment, "deployment parameter");
    version = assertSafeSegment(rawVersion, "version parameter");
  } catch (error) {
    if (isUnsafePathError(error)) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    throw error;
  }

  try {
    const txData = await loadYamlFile(`yaml/transactions/${version}/${txFile}`) as TransactionYaml;
    
    // Resolve addresses and tokens from deployment files
    const resolved = await deploymentResolver.resolveTransaction(
      txData,
      deployment,
      version
    );
    
    // Extract role from file path (e.g., "admin/add-course-creators.yaml" -> "admin")
    const role = txFile.includes("/") ? txFile.split("/")[0] : "general";
    const transaction = txFile.includes("/") 
      ? txFile.split("/")[1].replace(".yaml", "") 
      : txFile.replace(".yaml", "");
    
    const responseData: ResolvedTransactionResponse = {
      role,
      transaction,
      file: txFile,
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
    return NextResponse.json(
      { error: "Failed to load transaction file" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}
