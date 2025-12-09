#!/usr/bin/env node

/**
 * V2 Transaction Documentation Generator
 *
 * Reads V2 transaction YAML files and generates MDX documentation pages.
 *
 * Source: public/yaml/transactions/v2/{system}/{role}/*.yaml
 * Output: content/docs/protocol/v2/transactions/{system}/{role}/*.mdx
 *
 * Usage:
 *   node scripts/generate-v2-tx-docs.mjs
 *   node scripts/generate-v2-tx-docs.mjs --dry-run
 *   node scripts/generate-v2-tx-docs.mjs --verbose
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, "..", "public", "yaml", "transactions", "v2"),
  outputDir: path.join(__dirname, "..", "content", "docs", "protocol", "v2", "transactions"),
  registryPath: path.join(__dirname, "..", "public", "yaml", "transactions", "v2", "address-registry.json"),
  costRegistryPath: path.join(__dirname, "..", "public", "yaml", "transactions", "v2", "cost-registry.json"),
  endpointRegistryPath: path.join(__dirname, "..", "public", "yaml", "transactions", "v2", "endpoint-registry.json"),
};

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const VERBOSE = args.includes("--verbose");

// Helper functions
function log(message) {
  console.log(message);
}

function verbose(message) {
  if (VERBOSE) console.log(`  [verbose] ${message}`);
}

function kebabToTitle(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getSystemTitle(system) {
  const titles = {
    course: "Course",
    project: "Project",
    general: "General",
    global: "Global",
  };
  return titles[system] || kebabToTitle(system);
}

function getRoleTitle(role) {
  const titles = {
    admin: "Admin",
    teacher: "Teacher",
    student: "Student",
    contributor: "Contributor",
    open: "Open",
  };
  return titles[role] || kebabToTitle(role);
}

// Load registries
function loadRegistry(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    verbose(`Could not load registry: ${filePath}`);
    return null;
  }
}

// Find all YAML files recursively
function findYamlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip special directories
      if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
        findYamlFiles(fullPath, files);
      }
    } else if (entry.isFile() && entry.name.endsWith(".yaml")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Parse YAML file
function parseYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return yaml.load(content);
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

// Extract path info from YAML file path
function getPathInfo(filePath) {
  const relativePath = path.relative(CONFIG.sourceDir, filePath);
  const parts = relativePath.split(path.sep);

  // Handle different structures:
  // - general/mint-access-token.yaml -> system: general, role: null, name: mint-access-token
  // - course/admin/create.yaml -> system: course, role: admin, name: create

  if (parts.length === 2) {
    // {system}/{name}.yaml
    return {
      system: parts[0],
      role: null,
      name: parts[1].replace(".yaml", ""),
      relativePath,
    };
  } else if (parts.length === 3) {
    // {system}/{role}/{name}.yaml
    return {
      system: parts[0],
      role: parts[1],
      name: parts[2].replace(".yaml", ""),
      relativePath,
    };
  }

  return null;
}

// Generate MDX content
function generateMdxContent(txData, pathInfo, costRegistry, endpointRegistry) {
  const { system, role, name } = pathInfo;
  const title = txData.name || kebabToTitle(name);
  const description = txData.metadata?.description || `${title} transaction`;

  // Build tx_file path for the diagram component
  const txFilePath = role
    ? `${system}/${role}/${name}.yaml`
    : `${system}/${name}.yaml`;

  // Get cost data if available
  const txId = txData.id || `${system}.${role}.${name}`;
  const costData = costRegistry?.transactionCosts?.[txId];
  const endpointData = endpointRegistry?.transactions?.[txId];

  let content = `---
title: "${title}"
description: "${description}"
tx_file: "${txFilePath}"
---

# ${title}

${description}

`;

  // Add API endpoint info if available
  if (txData.metadata?.api_endpoint || endpointData?.endpoint) {
    const endpoint = txData.metadata?.api_endpoint || endpointData?.endpoint;
    content += `## API Endpoint

\`\`\`
POST ${endpoint}
\`\`\`

`;
  }

  // Add transaction diagram
  content += `## Transaction Diagram

<TransactionDiagram txFile="${txFilePath}" version="v2" />

`;

  // Add cost breakdown if available
  if (costData || txData.costs) {
    const costs = costData || txData.costs;
    content += `## Cost Breakdown

| Component | Amount |
|-----------|--------|
`;

    if (costs.txFeeAda || costs.txFee) {
      content += `| Transaction Fee | ${costs.txFeeAda || `~${(costs.txFee / 1_000_000).toFixed(2)} ADA`} |\n`;
    }
    if (costs.serviceFeeAda || costs.serviceFee) {
      const serviceFee = costs.serviceFeeAda || (costs.serviceFee ? `${(costs.serviceFee / 1_000_000)} ADA` : "None");
      content += `| Service Fee | ${serviceFee} |\n`;
    }
    if (costs.walletDelta?.ada) {
      content += `| **Total Wallet Delta** | **${costs.walletDelta.ada}** |\n`;
    } else if (costs.totalCost?.ada) {
      content += `| **Total Cost** | **${costs.totalCost.ada}** |\n`;
    }

    content += `\n`;
  }

  // Add inputs section
  if (txData.inputs && txData.inputs.length > 0) {
    content += `## Inputs

`;
    for (const input of txData.inputs) {
      content += `### ${input.id}

- **Type:** ${input.type}
`;
      if (input.validator) content += `- **Validator:** \`${input.validator}\`\n`;
      if (input.address) content += `- **Address:** \`${input.address.substring(0, 30)}...\`\n`;
      if (input.description) content += `- **Description:** ${input.description}\n`;
      content += `\n`;
    }
  }

  // Add outputs section
  if (txData.outputs && txData.outputs.length > 0) {
    content += `## Outputs

`;
    for (const output of txData.outputs) {
      content += `### ${output.id}

- **Type:** ${output.type}
`;
      if (output.validator) content += `- **Validator:** \`${output.validator}\`\n`;
      if (output.address) content += `- **Address:** \`${output.address.substring(0, 30)}...\`\n`;
      if (output.value && output.value.length > 0) {
        content += `- **Value:**\n`;
        for (const v of output.value) {
          content += `  - ${v}\n`;
        }
      }
      if (output.description) content += `- **Description:** ${output.description}\n`;
      content += `\n`;
    }
  }

  // Add mints section
  if (txData.mints && txData.mints.length > 0) {
    content += `## Minting Operations

`;
    for (const mint of txData.mints) {
      content += `### ${mint.id}

- **Policy:** \`${mint.policy}\`
`;
      if (mint.policyId) content += `- **Policy ID:** \`${mint.policyId}\`\n`;
      if (mint.tokens && mint.tokens.length > 0) {
        content += `- **Tokens:**\n`;
        for (const token of mint.tokens) {
          if (typeof token === "string") {
            content += `  - ${token}\n`;
          } else {
            content += `  - ${token.quantity || 1} ${token.name}${token.description ? ` - ${token.description}` : ""}\n`;
          }
        }
      }
      content += `\n`;
    }
  }

  // Add observations if present
  if (txData.observations && txData.observations.length > 0) {
    content += `## Observations

`;
    for (const obs of txData.observations) {
      content += `- ${obs}\n`;
    }
    content += `\n`;
  }

  // Add questions if present
  if (txData.questions && txData.questions.length > 0) {
    content += `## Open Questions

`;
    for (const q of txData.questions) {
      content += `- ${q}\n`;
    }
    content += `\n`;
  }

  return content;
}

// Generate meta.json for a directory
function generateMetaJson(dirPath, pages, title) {
  return {
    title,
    pages: ["index", ...pages],
  };
}

// Generate index.mdx for a directory
function generateIndexMdx(title, description, children) {
  let content = `---
title: "${title}"
description: "${description}"
---

# ${title}

${description}

`;

  if (children && children.length > 0) {
    content += `## Transactions

`;
    for (const child of children) {
      content += `- [${child.title}](./${child.slug})\n`;
    }
  }

  return content;
}

// Main generation function
async function generateDocs() {
  log("=".repeat(60));
  log("V2 Transaction Documentation Generator");
  log("=".repeat(60));

  if (DRY_RUN) {
    log("\n[DRY RUN MODE - No files will be written]\n");
  }

  // Load registries
  const costRegistry = loadRegistry(CONFIG.costRegistryPath);
  const endpointRegistry = loadRegistry(CONFIG.endpointRegistryPath);

  verbose(`Cost registry loaded: ${!!costRegistry}`);
  verbose(`Endpoint registry loaded: ${!!endpointRegistry}`);

  // Find all YAML files
  const yamlFiles = findYamlFiles(CONFIG.sourceDir);
  log(`\nFound ${yamlFiles.length} YAML files in ${CONFIG.sourceDir}`);

  // Group files by system and role
  const structure = {};

  for (const filePath of yamlFiles) {
    // Skip registry files
    if (filePath.includes("-registry.")) continue;
    if (path.basename(filePath) === "SESSION-NOTES.md") continue;

    const pathInfo = getPathInfo(filePath);
    if (!pathInfo) {
      verbose(`Skipping unrecognized path: ${filePath}`);
      continue;
    }

    const txData = parseYamlFile(filePath);
    if (!txData) continue;

    const { system, role } = pathInfo;

    if (!structure[system]) {
      structure[system] = { roles: {}, files: [] };
    }

    if (role) {
      if (!structure[system].roles[role]) {
        structure[system].roles[role] = [];
      }
      structure[system].roles[role].push({ pathInfo, txData, filePath });
    } else {
      structure[system].files.push({ pathInfo, txData, filePath });
    }
  }

  // Generate MDX files
  let generatedCount = 0;
  const allPages = [];

  for (const [system, systemData] of Object.entries(structure)) {
    const systemDir = path.join(CONFIG.outputDir, system);
    const systemTitle = getSystemTitle(system);
    const systemPages = [];

    log(`\nProcessing system: ${system}`);

    // Process role-based files
    for (const [role, files] of Object.entries(systemData.roles)) {
      const roleDir = path.join(systemDir, role);
      const roleTitle = getRoleTitle(role);
      const rolePages = [];

      verbose(`  Processing role: ${role} (${files.length} files)`);

      for (const { pathInfo, txData } of files) {
        const mdxContent = generateMdxContent(txData, pathInfo, costRegistry, endpointRegistry);
        const mdxPath = path.join(roleDir, `${pathInfo.name}.mdx`);

        if (!DRY_RUN) {
          fs.mkdirSync(roleDir, { recursive: true });
          fs.writeFileSync(mdxPath, mdxContent);
        }

        log(`  ${DRY_RUN ? "[dry-run] " : ""}Generated: ${path.relative(CONFIG.outputDir, mdxPath)}`);
        generatedCount++;

        rolePages.push(pathInfo.name);
      }

      // Generate role index and meta.json
      if (rolePages.length > 0) {
        const roleIndexContent = generateIndexMdx(
          `${systemTitle} ${roleTitle} Transactions`,
          `${roleTitle} transactions for the ${systemTitle} system.`,
          rolePages.map((p) => ({ title: kebabToTitle(p), slug: p }))
        );

        const roleMetaJson = generateMetaJson(roleDir, rolePages, roleTitle);

        if (!DRY_RUN) {
          fs.writeFileSync(path.join(roleDir, "index.mdx"), roleIndexContent);
          fs.writeFileSync(path.join(roleDir, "meta.json"), JSON.stringify(roleMetaJson, null, 2));
        }

        systemPages.push(role);
      }
    }

    // Process system-level files (no role)
    for (const { pathInfo, txData } of systemData.files) {
      const mdxContent = generateMdxContent(txData, pathInfo, costRegistry, endpointRegistry);
      const mdxPath = path.join(systemDir, `${pathInfo.name}.mdx`);

      if (!DRY_RUN) {
        fs.mkdirSync(systemDir, { recursive: true });
        fs.writeFileSync(mdxPath, mdxContent);
      }

      log(`  ${DRY_RUN ? "[dry-run] " : ""}Generated: ${path.relative(CONFIG.outputDir, mdxPath)}`);
      generatedCount++;

      systemPages.push(pathInfo.name);
    }

    // Generate system index and meta.json
    if (systemPages.length > 0) {
      const systemIndexContent = generateIndexMdx(
        `${systemTitle} Transactions`,
        `Transactions for the ${systemTitle} system.`,
        systemPages.map((p) => ({ title: kebabToTitle(p), slug: p }))
      );

      const systemMetaJson = generateMetaJson(systemDir, systemPages, systemTitle);

      if (!DRY_RUN) {
        fs.mkdirSync(systemDir, { recursive: true });
        fs.writeFileSync(path.join(systemDir, "index.mdx"), systemIndexContent);
        fs.writeFileSync(path.join(systemDir, "meta.json"), JSON.stringify(systemMetaJson, null, 2));
      }

      allPages.push(system);
    }
  }

  // Generate top-level transactions index and meta.json
  if (allPages.length > 0) {
    const topIndexContent = generateIndexMdx(
      "V2 Transactions",
      "Protocol V2 transaction documentation, generated from CBOR analysis.",
      allPages.map((p) => ({ title: getSystemTitle(p), slug: p }))
    );

    const topMetaJson = generateMetaJson(CONFIG.outputDir, allPages, "Transactions");

    if (!DRY_RUN) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      fs.writeFileSync(path.join(CONFIG.outputDir, "index.mdx"), topIndexContent);
      fs.writeFileSync(path.join(CONFIG.outputDir, "meta.json"), JSON.stringify(topMetaJson, null, 2));
    }
  }

  log("\n" + "=".repeat(60));
  log(`${DRY_RUN ? "[DRY RUN] Would generate" : "Generated"} ${generatedCount} MDX files`);
  log("=".repeat(60));
}

// Run the generator
generateDocs().catch((error) => {
  console.error("Error generating documentation:", error);
  process.exit(1);
});
