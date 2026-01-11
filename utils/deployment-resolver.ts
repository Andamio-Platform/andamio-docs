import { loadYamlFile } from "./yaml";
import { Registry } from "@/types";

export interface DeploymentParams {
  deployment: string;
  version: string;
  systems: {
    [systemName: string]: {
      addresses?: {
        [addressKey: string]: string;
      };
      tokens?: {
        [tokenKey: string]: string;
      };
    };
  };
}

export interface ResolvedTransaction {
  originalData: any;
  resolvedAddresses: {
    [addressName: string]: {
      path: string;
      originalValue: string;
      resolvedValue: string;
    };
  };
  resolvedTokens: {
    [tokenName: string]: {
      path: string;
      originalValue: string;
      resolvedValue: string;
    };
  };
}

class DeploymentResolver {
  private deploymentCache: Map<string, DeploymentParams> = new Map();
  private registry: Registry | null = null;
  private tokenNameMap: Map<string, string> = new Map();
  private addressNameMap: Map<string, string> = new Map();

  /**
   * Load the validator registry
   */
  private async loadRegistry(): Promise<void> {
    if (this.registry) return;
    
    try {
      this.registry = await loadYamlFile("yaml/validator-registry-v1.yaml") as Registry;
      
      // Build token name map (system.token-name -> friendly name)
      for (const [systemName, system] of Object.entries(this.registry.systems)) {
        if (system.tokens) {
          for (const [tokenKey, tokenInfo] of Object.entries(system.tokens)) {
            const tokenRef = `${systemName}.${tokenKey}`;
            this.tokenNameMap.set(tokenRef, tokenKey);
          }
        }
        
        // Build address name map (system.validator -> friendly name)
        if (system.validators) {
          for (const [validatorKey, validatorInfo] of Object.entries(system.validators)) {
            const addressRef = `${systemName}.${validatorKey}`;
            // Use the validator's name field if available, otherwise use the key
            const friendlyName = validatorInfo.name || validatorKey;
            this.addressNameMap.set(addressRef, friendlyName);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load registry:", error);
    }
  }

  /**
   * Load deployment parameters for a specific deployment and version
   */
  async loadDeployment(deployment: string, version: string): Promise<DeploymentParams | null> {
    const cacheKey = `${deployment}-${version}`;
    
    if (this.deploymentCache.has(cacheKey)) {
      return this.deploymentCache.get(cacheKey)!;
    }

    try {
      const params = await loadYamlFile(
        `yaml/deployments/${deployment}-${version}/params.yaml`
      ) as DeploymentParams;
      
      this.deploymentCache.set(cacheKey, params);
      return params;
    } catch (error) {
      console.error(`Failed to load deployment ${deployment}-${version}:`, error);
      return null;
    }
  }

  /**
   * Resolve an address reference like "global-state.global-state" to actual address
   */
  resolveAddress(addressRef: string, deployment: DeploymentParams): string | null {
    // Handle special cases
    if (addressRef === "user" || addressRef.startsWith("<") && addressRef.endsWith(">")) {
      return addressRef; // Return as-is for user addresses or placeholders
    }

    // Parse dot notation: system.validator
    const parts = addressRef.split(".");
    if (parts.length !== 2) {
      return null;
    }

    const [system, validator] = parts;
    const systemData = deployment.systems[system];
    
    if (!systemData?.addresses) {
      return null;
    }

    // Convert validator name to address key format
    // e.g., "global-state" -> "global_state_address"
    const addressKey = `${validator.replace(/-/g, "_")}_address`;
    
    return systemData.addresses[addressKey] || null;
  }

  /**
   * Resolve a token reference like "global-state.access-token-user" to policy ID
   */
  resolveToken(tokenRef: string, deployment: DeploymentParams): string | null {
    // Parse the token reference (e.g., "1 global-state.access-token-user")
    const match = tokenRef.match(/^(\d+)\s+(.+)$/);
    if (!match) {
      return null;
    }

    const [, amount, tokenPath] = match;
    
    // Handle lovelace separately
    if (tokenPath === "lovelace") {
      return tokenRef; // Return as-is
    }

    // Parse dot notation: system.token-name
    const parts = tokenPath.split(".");
    if (parts.length !== 2) {
      return null;
    }

    const [system, tokenName] = parts;
    const systemData = deployment.systems[system];
    
    if (!systemData?.tokens) {
      return null;
    }

    // Convert token name to policy key format
    // Handle special patterns for different token types
    let policyKey: string;
    
    if (tokenName.includes("access-token")) {
      // Access tokens: "access-token-user" -> "access_token_policyid"
      policyKey = `${tokenName.replace(/-/g, "_").replace(/_user$|_global_state$|_index$/, "")}_policyid`;
    } else {
      // Other tokens: remove "-token" suffix and convert to policy key
      // e.g., "instance-admin-token" -> "instance_admin_policyid"
      const baseTokenName = tokenName.replace(/-token$/, "").replace(/-/g, "_");
      policyKey = `${baseTokenName}_policyid`;
    }
    
    const policyId = systemData.tokens[policyKey];
    if (!policyId) {
      return null;
    }

    // Return the resolved token with policy ID
    return `${amount} ${policyId}.${this.getTokenSuffix(tokenName)}`;
  }

  /**
   * Get the token suffix based on token name patterns from registry
   */
  private getTokenSuffix(tokenName: string): string {
    // Access token patterns (u = user token, g = global state token)
    if (tokenName === "access-token-user") return "u<alias>";
    if (tokenName === "access-token-global-state") return "g<alias>";
    if (tokenName === "access-token-index") return '" "';
    
    // For other tokens, check if they have specific patterns
    // Otherwise, use the token name itself as the suffix
    return tokenName;
  }

  /**
   * Resolve all addresses and tokens in a transaction
   */
  async resolveTransaction(
    transactionData: any,
    deployment: string,
    version: string
  ): Promise<ResolvedTransaction> {
    // Ensure registry is loaded
    await this.loadRegistry();
    
    const deploymentParams = await this.loadDeployment(deployment, version);
    
    if (!deploymentParams) {
      return {
        originalData: transactionData,
        resolvedAddresses: {},
        resolvedTokens: {},
      };
    }

    const resolvedAddresses: { [addressName: string]: { path: string; originalValue: string; resolvedValue: string } } = {};
    const resolvedTokens: { [tokenName: string]: { path: string; originalValue: string; resolvedValue: string } } = {};

    // Process inputs
    if (transactionData.inputs) {
      transactionData.inputs.forEach((input: any, index: number) => {
        if (input.output?.address) {
          const originalAddress = input.output.address;
          const resolved = this.resolveAddress(originalAddress, deploymentParams);
          if (resolved && resolved !== originalAddress) {
            // Get friendly name for the address
            const friendlyName = this.addressNameMap.get(originalAddress) || originalAddress;
            
            resolvedAddresses[friendlyName] = {
              path: `inputs[${index}].output.address`,
              originalValue: originalAddress,
              resolvedValue: resolved
            };
          }
        }
        
        if (input.output?.value) {
          input.output.value.forEach((value: string, valueIndex: number) => {
            const resolved = this.resolveToken(value, deploymentParams);
            if (resolved && resolved !== value) {
              // Extract token reference from original value
              const tokenMatch = value.match(/^\d+\s+(.+)$/);
              if (tokenMatch) {
                const tokenRef = tokenMatch[1];
                const friendlyName = this.tokenNameMap.get(tokenRef) || tokenRef;
                
                resolvedTokens[friendlyName] = {
                  path: `inputs[${index}].output.value[${valueIndex}]`,
                  originalValue: value,
                  resolvedValue: resolved
                };
              }
            }
          });
        }
      });
    }

    // Process reference inputs
    if (transactionData.reference_inputs) {
      transactionData.reference_inputs.forEach((refInput: any, index: number) => {
        if (refInput.output?.address) {
          const originalAddress = refInput.output.address;
          const resolved = this.resolveAddress(originalAddress, deploymentParams);
          if (resolved && resolved !== originalAddress) {
            // Get friendly name for the address
            const friendlyName = this.addressNameMap.get(originalAddress) || originalAddress;
            
            resolvedAddresses[friendlyName] = {
              path: `reference_inputs[${index}].output.address`,
              originalValue: originalAddress,
              resolvedValue: resolved
            };
          }
        }
        
        if (refInput.output?.value) {
          refInput.output.value.forEach((value: string, valueIndex: number) => {
            const resolved = this.resolveToken(value, deploymentParams);
            if (resolved && resolved !== value) {
              // Extract token reference from original value
              const tokenMatch = value.match(/^\d+\s+(.+)$/);
              if (tokenMatch) {
                const tokenRef = tokenMatch[1];
                const friendlyName = this.tokenNameMap.get(tokenRef) || tokenRef;
                
                resolvedTokens[friendlyName] = {
                  path: `reference_inputs[${index}].output.value[${valueIndex}]`,
                  originalValue: value,
                  resolvedValue: resolved
                };
              }
            }
          });
        }
      });
    }

    // Process outputs
    if (transactionData.outputs) {
      transactionData.outputs.forEach((output: any, index: number) => {
        if (output.output?.address) {
          const originalAddress = output.output.address;
          const resolved = this.resolveAddress(originalAddress, deploymentParams);
          if (resolved && resolved !== originalAddress) {
            // Get friendly name for the address
            const friendlyName = this.addressNameMap.get(originalAddress) || originalAddress;
            
            resolvedAddresses[friendlyName] = {
              path: `outputs[${index}].output.address`,
              originalValue: originalAddress,
              resolvedValue: resolved
            };
          }
        }
        
        if (output.output?.value) {
          output.output.value.forEach((value: string, valueIndex: number) => {
            const resolved = this.resolveToken(value, deploymentParams);
            if (resolved && resolved !== value) {
              // Extract token reference from original value
              const tokenMatch = value.match(/^\d+\s+(.+)$/);
              if (tokenMatch) {
                const tokenRef = tokenMatch[1];
                const friendlyName = this.tokenNameMap.get(tokenRef) || tokenRef;
                
                resolvedTokens[friendlyName] = {
                  path: `outputs[${index}].output.value[${valueIndex}]`,
                  originalValue: value,
                  resolvedValue: resolved
                };
              }
            }
          });
        }
      });
    }

    // Process mints
    if (transactionData.mints) {
      transactionData.mints.forEach((mint: any, index: number) => {
        if (mint.tokens) {
          mint.tokens.forEach((token: string, tokenIndex: number) => {
            const resolved = this.resolveToken(token, deploymentParams);
            if (resolved && resolved !== token) {
              // Extract token reference from original value
              const tokenMatch = token.match(/^(-?\d+)\s+(.+)$/);
              if (tokenMatch) {
                const tokenRef = tokenMatch[2];
                const friendlyName = this.tokenNameMap.get(tokenRef) || tokenRef;
                
                resolvedTokens[friendlyName] = {
                  path: `mints[${index}].tokens[${tokenIndex}]`,
                  originalValue: token,
                  resolvedValue: resolved
                };
              }
            }
          });
        }
      });
    }

    return {
      originalData: transactionData,
      resolvedAddresses,
      resolvedTokens,
    };
  }
}

// Export singleton instance
export const deploymentResolver = new DeploymentResolver();