// Debug why instance.instance-admin-token isn't resolving
import { deploymentResolver } from "../utils/deployment-resolver";

async function debugInstanceToken() {
  console.log("Debugging instance.instance-admin-token resolution...\n");
  
  // Test the resolveToken method directly
  const deploymentParams = await deploymentResolver.loadDeployment("mainnet", "v2");
  
  if (deploymentParams) {
    console.log("=== Instance System Tokens ===");
    const instanceSystem = deploymentParams.systems.instance;
    if (instanceSystem?.tokens) {
      for (const [key, value] of Object.entries(instanceSystem.tokens)) {
        console.log(`${key}: ${value}`);
      }
    }
    
    console.log("\n=== Manual Token Resolution Test ===");
    const testToken = "1 instance.instance-admin-token";
    console.log(`Testing: ${testToken}`);
    
    // Check if the resolver can find the right policy key
    const tokenRef = "instance.instance-admin-token";
    const [system, tokenName] = tokenRef.split(".");
    console.log(`System: ${system}, Token: ${tokenName}`);
    
    // Expected policy key format based on new logic
    let expectedPolicyKey: string;
    if (tokenName.includes("access-token")) {
      expectedPolicyKey = `${tokenName.replace(/-/g, "_").replace(/_user$|_global_state$|_index$/, "")}_policyid`;
    } else {
      const baseTokenName = tokenName.replace(/-token$/, "").replace(/-/g, "_");
      expectedPolicyKey = `${baseTokenName}_policyid`;
    }
    console.log(`Expected policy key: ${expectedPolicyKey}`);
    
    // Check if it exists
    const policyId = instanceSystem?.tokens?.[expectedPolicyKey];
    console.log(`Found policy ID: ${policyId || 'NOT FOUND'}`);
    
    // The issue is likely that the resolver expects "instance_admin_policyid"
    // but the token is called "instance-admin-token", so it should look for "instance_admin_policyid"
    // Let's check the logic
  }
}

debugInstanceToken().catch(console.error);