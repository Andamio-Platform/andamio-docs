// Quick test of deployment resolver functionality
import { deploymentResolver } from "../utils/deployment-resolver";
import { loadYamlFile } from "../utils/yaml";

async function testResolver() {
  console.log("Testing deployment resolver with mainnet-v1 data...\n");

  // Load a sample transaction
  const txData = await loadYamlFile(
    "yaml/transactions/general/access-token-mint.yaml"
  );

  // Test with mainnet deployment
  const resolved = await deploymentResolver.resolveTransaction(
    txData,
    "mainnet",
    "v1"
  );

  console.log("=== Resolved Addresses ===");
  if (Object.keys(resolved.resolvedAddresses).length > 0) {
    for (const [addressName, addressInfo] of Object.entries(
      resolved.resolvedAddresses
    )) {
      console.log(`\nAddress: ${addressName}`);
      console.log(`  Path: ${addressInfo.path}`);
      console.log(`  Original: ${addressInfo.originalValue}`);
      console.log(`  Resolved: ${addressInfo.resolvedValue}`);
    }
  } else {
    console.log("No addresses resolved");
  }

  console.log("\n=== Resolved Tokens ===");
  if (Object.keys(resolved.resolvedTokens).length > 0) {
    for (const [tokenName, tokenInfo] of Object.entries(
      resolved.resolvedTokens
    )) {
      console.log(`\nToken: ${tokenName}`);
      console.log(`  Path: ${tokenInfo.path}`);
      console.log(`  Original: ${tokenInfo.originalValue}`);
      console.log(`  Resolved: ${tokenInfo.resolvedValue}`);
    }
  } else {
    console.log("No tokens resolved");
  }
}

function getValueAtPath(obj: any, path: string): any {
  const keys = path.match(/[^[\]]+/g) || [];
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === "object") {
      result = result[key];
    } else {
      return undefined;
    }
  }

  return result;
}

testResolver().catch(console.error);
