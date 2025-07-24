"use server";

import { loadYamlFile } from "@/utils/yaml";
import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { TransactionYaml } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const txFile = searchParams.get("file");

  if (!txFile) {
    return NextResponse.json(
      { error: "No file parameter provided" },
      { status: 400 }
    );
  }

  try {
    const txData = await loadYamlFile(`yaml/transactions/${txFile}`) as TransactionYaml;
    
    const response = NextResponse.json(txData);
    
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
