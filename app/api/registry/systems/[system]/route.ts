"use server";

import { loadYamlFile } from "@/utils/yaml";
import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { Registry } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ system: string }> }
) {
  try {
    const { system } = await params;
    const registryData = await loadYamlFile("yaml/validator-registry-v1.yaml") as Registry;
    const systemData = registryData.systems?.[system];
    
    if (!systemData) {
      return NextResponse.json(
        { error: `System '${system}' not found` },
        { status: 404 }
      );
    }
    
    const response = NextResponse.json({
      system: system,
      data: systemData
    });
    
    // Add CORS headers for external access
    addCorsHeaders(response, request);
    
    return response;
  } catch (error) {
    console.error("Error loading registry file:", error);
    return NextResponse.json(
      { error: "Failed to load registry file" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}