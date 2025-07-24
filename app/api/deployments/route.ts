"use server";

import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { NextRequest, NextResponse } from "next/server";
import { readdirSync } from "fs";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    const deploymentsDir = join(process.cwd(), "public", "yaml", "deployments");
    const deployments = readdirSync(deploymentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        deployment: dirent.name,
        url: `/api/deployments/${dirent.name}`
      }));
    
    const response = NextResponse.json({
      count: deployments.length,
      deployments
    });
    
    // Add CORS headers for external access
    addCorsHeaders(response, request);
    
    return response;
  } catch (error) {
    console.error("Error listing deployments:", error);
    return NextResponse.json(
      { error: "Failed to list deployments" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}