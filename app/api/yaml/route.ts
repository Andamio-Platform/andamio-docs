"use server";

import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { NextRequest, NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { join } from "path";

function getYamlFiles(dir: string, baseDir: string = "", results: string[] = []): string[] {
  const fullPath = join(process.cwd(), "public", "yaml", dir);
  
  try {
    const items = readdirSync(fullPath);
    
    for (const item of items) {
      const itemPath = join(fullPath, item);
      const relativePath = baseDir ? `${baseDir}/${item}` : `${dir}/${item}`;
      
      if (statSync(itemPath).isDirectory()) {
        // Recursively get files from subdirectories
        getYamlFiles(`${dir}/${item}`, baseDir, results);
      } else if (item.endsWith('.yaml')) {
        results.push(`/yaml/${relativePath.replace(/^\/+/, '')}`);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${fullPath}:`, error);
  }
  
  return results;
}

export async function GET(request: NextRequest) {
  try {
    const yamlFiles: string[] = [];
    
    // Get all YAML files from different directories
    getYamlFiles("", "", yamlFiles);
    
    // Organize files by category
    const organizedFiles = {
      registry: yamlFiles.filter(f => f.includes('validator-registry')),
      transactions: yamlFiles.filter(f => f.includes('/transactions/')),
      deployments: yamlFiles.filter(f => f.includes('/deployments/')),
      other: yamlFiles.filter(f => 
        !f.includes('validator-registry') && 
        !f.includes('/transactions/') && 
        !f.includes('/deployments/')
      )
    };
    
    const response = NextResponse.json({
      totalFiles: yamlFiles.length,
      categories: {
        registry: {
          count: organizedFiles.registry.length,
          files: organizedFiles.registry
        },
        transactions: {
          count: organizedFiles.transactions.length,
          files: organizedFiles.transactions
        },
        deployments: {
          count: organizedFiles.deployments.length,
          files: organizedFiles.deployments
        },
        other: {
          count: organizedFiles.other.length,
          files: organizedFiles.other
        }
      },
      allFiles: yamlFiles.sort()
    });
    
    // Add CORS headers for external access
    addCorsHeaders(response, request);
    
    return response;
  } catch (error) {
    console.error("Error listing YAML files:", error);
    return NextResponse.json(
      { error: "Failed to list YAML files" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}