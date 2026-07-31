import { Registry } from "@/types";

export interface TokenInfo {
  hasToken: boolean;
  tokenLink?: string;
  tokenName?: string;
  displayToken?: string;
  amount?: string;
  fullToken: string;
}

/**
 * Creates token link information with asset ID resolution from registry
 * @param tokenStr - Token string in format "amount system.token-name"
 * @param registryData - Registry data for asset ID lookup
 * @param version - Protocol version (v1 or v2)
 * @returns TokenInfo object with linking and display information
 */
export const createTokenLink = (tokenStr: string, registryData?: Registry | null, version: string = "v2"): TokenInfo => {
  // Match pattern: "amount system.token-name"
  const tokenMatch = tokenStr.match(/^\d+\s+([^.]+)\.([^\s]+)$/);
  
  if (tokenMatch) {
    const [, system, tokenName] = tokenMatch;
    const amount = tokenStr.split(" ")[0];
    
    // Try to resolve asset ID from registry
    let displayToken = tokenName;
    if (registryData?.systems?.[system]?.tokens?.[tokenName]?.['asset-id']) {
      displayToken = registryData.systems[system].tokens[tokenName]['asset-id'] as string;
    }
    
    return {
      hasToken: true,
      tokenLink: `/docs/protocol/${version}/tokens/${system}/${tokenName}`,
      tokenName: tokenName,
      displayToken: displayToken,
      amount: amount,
      fullToken: tokenStr,
    };
  }
  
  return { 
    hasToken: false, 
    fullToken: tokenStr 
  };
};