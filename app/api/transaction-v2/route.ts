"use server";

import { loadYamlFile } from "@/utils/yaml";
import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { NextRequest, NextResponse } from "next/server";
import { assertSafeRelativePath, isUnsafePathError } from "@/utils/safe-path";
import { TransactionYamlV2, transformV2ToDiagramData, V2DiagramData } from "@/types/v2";

/**
 * V2 Transaction API Route
 *
 * Loads V2 transaction YAML files from public/yaml/transactions/v2/
 * and provides them in a format suitable for diagram rendering.
 *
 * Query Parameters:
 *   - file: Path to YAML file relative to v2 directory (e.g., "course/admin/create.yaml")
 *   - format: "v2" (default) for native V2 format, "v1" for V1-compatible diagram format
 *
 * Example:
 *   GET /api/transaction-v2?file=course/admin/create.yaml
 *   GET /api/transaction-v2?file=course/admin/create.yaml&format=v1
 */

interface V2TransactionResponse {
  id: string;
  system: string;
  role: string | null;
  transaction: string;
  file: string;
  data: TransactionYamlV2;
  diagramData?: V2DiagramData;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawTxFile = searchParams.get("file");
  const format = searchParams.get("format") || "v2";

  if (!rawTxFile) {
    return NextResponse.json(
      { error: "No file parameter provided" },
      { status: 400 }
    );
  }

  // Interpolated into a filesystem path below.
  let txFile: string;
  try {
    txFile = assertSafeRelativePath(rawTxFile, "file parameter");
  } catch (error) {
    if (isUnsafePathError(error)) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    throw error;
  }

  try {
    // Load the V2 YAML file
    const txData = (await loadYamlFile(
      `yaml/transactions/v2/${txFile}`
    )) as TransactionYamlV2;

    if (!txData) {
      return NextResponse.json(
        { error: "Transaction file not found" },
        { status: 404 }
      );
    }

    // Parse path info from file path
    const parts = txFile.replace(".yaml", "").split("/");
    let system: string;
    let role: string | null = null;
    let transaction: string;

    if (parts.length === 2) {
      // {system}/{name}.yaml
      [system, transaction] = parts;
    } else if (parts.length === 3) {
      // {system}/{role}/{name}.yaml
      [system, role, transaction] = parts;
    } else {
      system = "unknown";
      transaction = parts[parts.length - 1];
    }

    // Build response
    const responseData: V2TransactionResponse = {
      id: txData.id || `${system}.${role || ""}.${transaction}`.replace("..", "."),
      system,
      role,
      transaction,
      file: txFile,
      data: txData,
    };

    // If V1 format requested, transform for diagram compatibility
    if (format === "v1") {
      responseData.diagramData = transformV2ToDiagramData(txData);
    }

    const response = NextResponse.json(responseData);

    // Add CORS headers for external access
    addCorsHeaders(response, request);

    return response;
  } catch (error) {
    console.error("Error loading V2 transaction file:", error);
    return NextResponse.json(
      { error: "Failed to load transaction file", details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}
