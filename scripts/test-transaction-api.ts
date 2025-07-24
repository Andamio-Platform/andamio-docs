// Test script for the enhanced transaction API
import { TransactionYaml, ResolvedTransactionResponse } from "@/types";

async function testTransactionAPI() {
  const baseUrl = "http://localhost:3000";
  
  // Test cases
  const testCases = [
    {
      name: "General transaction (mint-access-token)",
      url: "/api/transaction?file=general/mint-access-token.yaml&deployment=preprod&version=v1",
    },
    {
      name: "Admin transaction (add-course-creators)",
      url: "/api/transaction?file=admin/add-course-creators.yaml&deployment=preprod&version=v1",
    },
    {
      name: "Role-based endpoint test",
      url: "/api/transactions/general/mint-access-token?deployment=preprod&version=v1",
    },
  ];

  console.log("Testing Transaction API with deployment resolution...\n");

  for (const testCase of testCases) {
    console.log(`\n=== Testing: ${testCase.name} ===`);
    console.log(`URL: ${testCase.url}`);
    
    try {
      const response = await fetch(baseUrl + testCase.url);
      const data = await response.json() as ResolvedTransactionResponse;
      
      if (!response.ok) {
        console.error("❌ Error:", data);
        continue;
      }
      
      console.log("✅ Success!");
      console.log("Transaction:", data.transaction);
      console.log("Role:", data.role);
      
      // Check resolved addresses
      if (data.resolved?.addresses && Object.keys(data.resolved.addresses).length > 0) {
        console.log("\nResolved Addresses:");
        for (const [path, address] of Object.entries(data.resolved.addresses)) {
          console.log(`  ${path}: ${address}`);
        }
      } else {
        console.log("\nNo addresses resolved (deployment params may be empty)");
      }
      
      // Check resolved tokens
      if (data.resolved?.tokens && Object.keys(data.resolved.tokens).length > 0) {
        console.log("\nResolved Tokens:");
        for (const [path, token] of Object.entries(data.resolved.tokens)) {
          console.log(`  ${path}: ${token}`);
        }
      } else {
        console.log("No tokens resolved (deployment params may be empty)");
      }
      
    } catch (error) {
      console.error("❌ Failed to fetch:", error);
    }
  }
  
  console.log("\n\n=== API Test Complete ===");
}

// Run the test
testTransactionAPI().catch(console.error);