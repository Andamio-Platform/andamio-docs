"use server";

import { loadYamlFile } from "@/utils/yaml";
import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { NextRequest, NextResponse } from "next/server";
import { readdirSync } from "fs";
import path, { join } from "path";
import {
  assertSafeSegment,
  isUnsafePathError,
  UnsafePathError,
} from "@/utils/safe-path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deployment: string }> }
) {
  try {
    const rawParams = await params;

    let deployment: string;
    try {
      deployment = assertSafeSegment(rawParams.deployment, "deployment");
    } catch (error) {
      if (isUnsafePathError(error)) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
      }
      throw error;
    }

    // Root derived locally and the check kept adjacent to the readdirSync
    // below — the only shape CodeQL accepts as a js/path-injection sanitizer.
    const publicRoot = path.resolve(process.cwd(), "public");
    const deploymentDir = path.resolve(publicRoot, join("yaml", "deployments", deployment));

    if (!deploymentDir.startsWith(publicRoot + path.sep)) {
      throw new UnsafePathError("Resolved path escapes the public directory");
    }

    // Check if deployment directory exists
    try {
      readdirSync(deploymentDir);
    } catch {
      return NextResponse.json(
        { error: `Deployment '${deployment}' not found` },
        { status: 404 }
      );
    }
    
    const deploymentData: { 
      deployment: string;
      files: { [key: string]: unknown };
    } = {
      deployment: deployment,
      files: {}
    };
    
    // Load all YAML files in the deployment directory
    const files = readdirSync(deploymentDir).filter(file => file.endsWith('.yaml'));
    
    for (const file of files) {
      const fileName = file.replace('.yaml', '');
      try {
        const fileData = await loadYamlFile(`yaml/deployments/${deployment}/${file}`);
        deploymentData.files[fileName] = fileData;
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
        deploymentData.files[fileName] = { error: `Failed to load ${file}` };
      }
    }
    
    const response = NextResponse.json(deploymentData);
    
    // Add CORS headers for external access
    addCorsHeaders(response, request);
    
    return response;
  } catch (error) {
    console.error("Error loading deployment files:", error);
    return NextResponse.json(
      { error: "Failed to load deployment files" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}