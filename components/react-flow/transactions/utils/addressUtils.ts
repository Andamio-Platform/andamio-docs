import { Registry } from "@/types";

export interface AddressInfo {
  displayName: string;
  linkUrl: string | null;
  isValidator: boolean;
}

export function resolveAddressDisplay(
  address: string,
  registryData?: Registry | null
): AddressInfo {
  // Handle dot notation addresses (e.g., "global-state.global-state")
  if (address.includes(".") && registryData) {
    const parts = address.split(".");
    const system = parts[0];
    const validatorName = parts[1];
    
    // Search through registry to find the matching validator and get its placeholder address
    if (registryData.systems[system]?.validators?.[validatorName]) {
      const validator = registryData.systems[system].validators[validatorName];
      const isObserver = validatorName.includes("obs");
      const linkUrl = isObserver
        ? `/docs/protocol/v1/validators/${system}/observers/${validatorName}`
        : `/docs/protocol/v1/validators/${system}/${validatorName}`;
      
      return {
        displayName: typeof validator.address === 'string' ? validator.address : address, // Display the placeholder address from registry
        linkUrl,
        isValidator: true
      };
    }
  }
  
  // For any other format (including if dot notation validator not found), return as-is
  return {
    displayName: address,
    linkUrl: null,
    isValidator: false
  };
}