"use server";

import {
  ExpectedTxResponse,
  ExpectedTxAsset,
  ExpectedTxInput,
  ExpectedTxOutput,
  TransactionYaml,
  Registry,
  DeploymentParams,
  DeploymentExampleParams,
} from "@/types";
import { addCorsHeaders } from "@/utils/cors";
import { loadYamlFile } from "@/utils/yaml";
import { NextRequest, NextResponse } from "next/server";

// Helper function to convert token name to human-readable label
function tokenNameToLabel(tokenName: string): string {
  return tokenName
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to parse asset string into components
function parseAssetString(assetString: string): {
  quantity?: string;
  system?: string;
  tokenName?: string;
  fullToken?: string;
} {
  const parts = assetString.trim().split(" ");

  if (parts.length === 2) {
    // Format: "1 course.course-nft"
    const [quantity, token] = parts;
    const [system, tokenName] = token.split(".");
    return { quantity, system, tokenName, fullToken: token };
  } else if (parts.length === 1) {
    // Format: "course.course-nft" (no quantity)
    const token = parts[0];
    const [system, tokenName] = token.split(".");
    return { system, tokenName, fullToken: token };
  }

  return {};
}

// Helper function to get asset-id from registry
async function getAssetIdFromRegistry(
  system: string,
  tokenName: string
): Promise<string | null> {
  try {
    const registry = (await loadYamlFile(
      "yaml/validator-registry-v1.yaml"
    )) as Registry;

    const assetId =
      registry.systems?.[system]?.tokens?.[tokenName]?.["asset-id"];
    return assetId || null;
  } catch {
    return null;
  }
}

// Helper function to resolve policy ID from deployment params
async function resolvePolicyId(
  assetId: string,
  deployment: string,
  version: string,
  system: string
): Promise<string | undefined> {
  try {
    // Load deployment params
    const paramsData: DeploymentParams = await loadYamlFile(
      `yaml/deployments/${deployment}-${version}/params.yaml`
    );

    // Try to load examples file for course/project
    let examplesData: DeploymentExampleParams | null = null;
    try {
      examplesData = await loadYamlFile(
        `yaml/deployments/${deployment}-${version}/examples.yaml`
      );
    } catch {
      // Examples file might not exist or be empty
    }

    // Extract the policy ID placeholder from asset-id (e.g., "<access_token_policyid>")
    const policyMatch = assetId.match(/<([^>]+)>/);
    if (!policyMatch) return assetId.split(".")[0]; // Return the part before dot if no placeholder

    const policyPlaceholder = policyMatch[1];

    // Look in systems params first
    const systemData = paramsData.systems?.[system];
    if (systemData?.tokens?.[policyPlaceholder]) {
      return systemData.tokens[policyPlaceholder];
    }

    // Look in examples for course/project
    if ((system === "course" || system === "project") && examplesData) {
      const localInstance = examplesData.local_instances?.[system];
      if (localInstance?.tokens?.[policyPlaceholder]) {
        return localInstance.tokens[policyPlaceholder];
      }
    }

    // Return the placeholder if no actual value found
    return `<${policyPlaceholder}>`;
  } catch {
    return undefined;
  }
}

// Helper function to parse asset name from asset-id
function parseAssetName(assetId: string): string | undefined {
  const dotIndex = assetId.indexOf(".");
  if (dotIndex === -1) return undefined;

  return assetId.substring(dotIndex + 1);
}

// Helper function to resolve address
async function resolveAddress(
  address: string,
  deployment: string,
  version: string
): Promise<string> {
  if (!address.includes("<") || !address.includes(">")) {
    return address; // Not a placeholder
  }

  try {
    // Load deployment params
    const paramsData: DeploymentParams = await loadYamlFile(
      `yaml/deployments/${deployment}-${version}/params.yaml`
    );

    // Try to load examples file
    let examplesData: DeploymentExampleParams | null = null;
    try {
      examplesData = await loadYamlFile(
        `yaml/deployments/${deployment}-${version}/examples.yaml`
      );
    } catch {
      // Examples file might not exist
    }

    // Extract the address placeholder
    const addressMatch = address.match(/<([^>]+)>/);
    if (!addressMatch) return address;

    const addressPlaceholder = addressMatch[1];

    // Check each system in params
    for (const system of Object.keys(paramsData.systems || {})) {
      const systemData = paramsData.systems[system];
      if (systemData?.addresses?.[addressPlaceholder]) {
        return systemData.addresses[addressPlaceholder] || address;
      }
    }

    // Check course/project in examples
    if (
      examplesData?.local_instances?.course?.addresses?.[addressPlaceholder]
    ) {
      return (
        examplesData.local_instances.course.addresses[addressPlaceholder] ||
        address
      );
    }
    if (
      examplesData?.local_instances?.project?.addresses?.[addressPlaceholder]
    ) {
      return (
        examplesData.local_instances.project.addresses[addressPlaceholder] ||
        address
      );
    }

    return address; // Return original if not found
  } catch {
    return address;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const txFile = searchParams.get("file");
  const deployment = searchParams.get("deployment") || "preprod";
  const version = searchParams.get("version") || "v1";

  if (!txFile) {
    return NextResponse.json(
      { error: "No file parameter provided" },
      { status: 400 }
    );
  }

  try {
    const txData = (await loadYamlFile(
      `yaml/transactions/${txFile}`
    )) as TransactionYaml;

    // Helper function to process asset value into ExpectedTxAsset
    const processAsset = async (
      assetValue: string
    ): Promise<ExpectedTxAsset> => {
      const parsed = parseAssetString(assetValue);

      // Default values
      let linkUrl = "";
      let docsId = "";
      let policyId: string | undefined = undefined;
      let assetName: string | undefined = undefined;

      if (parsed.system && parsed.tokenName) {
        // Build the docs URL
        linkUrl = `https://docs.andamio.io/docs/protocol/${version}/tokens/${parsed.system}/${parsed.tokenName}`;
        docsId = parsed.fullToken || "";

        // Get asset-id from registry
        const assetId = await getAssetIdFromRegistry(
          parsed.system,
          parsed.tokenName
        );

        if (assetId) {
          // Resolve policy ID from deployment params
          policyId = await resolvePolicyId(
            assetId,
            deployment,
            version,
            parsed.system
          );

          // Parse asset name from asset-id
          assetName = parseAssetName(assetId);
        }
      } else {
        // Fallback for non-standard format
        docsId = assetValue;
      }

      // Create human-readable label from token name
      const label = parsed.tokenName ? tokenNameToLabel(parsed.tokenName) : assetValue;

      return {
        label,
        linkUrl,
        docsId,
        policyId,
        assetName,
        quantity: parsed.quantity,
      };
    };

    // For each input in txData, create an ExpectedTxInput
    const inputs: ExpectedTxInput[] = await Promise.all(
      txData.inputs.map(async (input) => {
        const resolvedAddress = await resolveAddress(
          input.output.address,
          deployment,
          version
        );
        const assets = await Promise.all(
          input.output.value.map((asset) => processAsset(asset))
        );

        return {
          address: resolvedAddress,
          docsId: `${txData.metadata.role}.${txData.name}`,
          assets,
        };
      })
    );

    // For each output in txData, create an ExpectedTxOutput
    const outputs: ExpectedTxOutput[] = await Promise.all(
      txData.outputs.map(async (output) => {
        const resolvedAddress = await resolveAddress(
          output.output.address,
          deployment,
          version
        );
        const assets = await Promise.all(
          output.output.value.map((asset) => processAsset(asset))
        );

        return {
          address: resolvedAddress,
          docsId: `${txData.metadata.role}.${txData.name}`,
          assets,
        };
      })
    );

    const repsonseData: ExpectedTxResponse = {
      label: txData.name,
      linkUrl: `https://docs.andamio.io/docs/protocol/${version}/transactions/${txData.metadata.role}/${txData.name}`,
      docsId: `${txData.metadata.role}.${txData.name}`,
      inputs: inputs,
      outputs: outputs,
    };

    const response = NextResponse.json(repsonseData);

    // Add CORS headers for external access
    addCorsHeaders(response, request);

    return response;
  } catch (error) {
    console.error("Error loading transaction file:", error);
    return NextResponse.json(
      { error: `Transaction file '${txFile}' not found` },
      { status: 404 }
    );
  }
}