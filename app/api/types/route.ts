"use server";

import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";

export async function GET(request: NextRequest) {
  try {
    const typesFilePath = join(process.cwd(), "public", "types", "andamio-api.d.ts");
    const typesContent = readFileSync(typesFilePath, "utf-8");
    
    const response = new NextResponse(typesContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": "attachment; filename=andamio-api.d.ts",
      },
    });
    
    // Add CORS headers for external access
    addCorsHeaders(response, request);
    
    return response;
  } catch (error) {
    console.error("Error serving types file:", error);
    return NextResponse.json(
      { error: "Failed to load types file" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}