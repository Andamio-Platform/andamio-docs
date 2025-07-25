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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ role: string; transaction: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const deployment = searchParams.get("deployment") || "preprod";
  const version = searchParams.get("version") || "v1";
  
  const { role, transaction } = await params;
  const txFile = `${role}/${transaction}.yaml`;

  try {
    const txData = (await loadYamlFile(
      `yaml/transactions/${txFile}`
    )) as TransactionYaml;

    // Refine the details of inputs and outputs. Todo:
    // 1. The linkUrl for each ExpectedAsset must be of the form https://docs.andamio.io/docs/protocol/${version}/tokens/${system}/${asset}, where system and asset are extracted from the asset string using dot notation. So:
    // YAML:
    // value:
    //    - "1 course.course-nft"
    // ExpectedAsset:
    //    linkUrl: https://docs.andamio.io/docs/protocol/${version}/tokens/course/course-nft
    // 2. Define policyId where possible. In public/yaml/validator-registry-v1.yaml, each token has an asset-id field of the form <policyid>.<assetname>. Check the appropriate path of public/yaml/deployments, based on deployment and version parameters on lines 11 and 12 above. If a policyId is defined in a params file, then return this policyId as policyId. Otherwse, return the semantic name from the asset-id.
    // 3. Define assetName where possible. The assetName is the semantic name from the asset-id, after the dot. So for "course.course-nft", the assetName is "course-nft", and for "<access_token_policyid>.222<alias>", the assetName is "222<alias>". If such an asset name can be parsed from the asset-id, then return it as assetName. Otherwise, return undefined.
    // 4. usually, we will ignore quantity, as it is not relevant to the expected transaction. It is here to cover a few edge cases that we will not prioritize now.
    // 5. When possible, replace semantic address return value with the actual address from the deployment params file. If the address is empty or not found in the params file, return the semantic name for the address.
    // 6. For each asset in each input and output, the docsId should be the semantic value for the token that is referenced in the value of the input or output in the txData. For example, if the input or output value is "1 course.course-nft", then the docsId should be "course.course-nft".

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
      { error: `Transaction '${role}/${transaction}' not found` },
      { status: 404 }
    );
  }
}
