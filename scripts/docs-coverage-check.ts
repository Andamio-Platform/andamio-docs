#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface MDXFrontmatter {
  title?: string;
  description?: string;
  tx_file?: string;
  validator_id?: string | string[];
  validator_system?: string;
}

interface RegistryValidator {
  name: string;
  purpose: string | string[];
  redeemer: unknown;
}

interface RegistrySystem {
  validators: Record<string, RegistryValidator>;
}

interface Registry {
  systems: Record<string, RegistrySystem>;
}

interface CoverageReport {
  mdxWithoutTxFile: string[];
  mdxWithoutValidatorId: string[];
  transactionsWithoutMdx: string[];
  validatorsWithoutMdx: string[];
  mdxReferencingMissingTxFiles: { mdxFile: string; txFile: string }[];
  mdxReferencingMissingValidators: { mdxFile: string; validatorId: string }[];
}

function parseMDXFrontmatter(filePath: string): MDXFrontmatter | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      return null;
    }

    return yaml.load(frontmatterMatch[1]) as MDXFrontmatter;
  } catch (error) {
    console.warn(
      `Warning: Could not parse frontmatter for ${filePath}:`,
      error
    );
    return null;
  }
}

function loadRegistry(registryPath: string): Registry {
  try {
    const content = fs.readFileSync(registryPath, "utf-8");
    return yaml.load(content) as Registry;
  } catch (error) {
    throw new Error(`Failed to load registry: ${error}`);
  }
}

function extractTransactionNamesFromRegistry(registry: Registry): Set<string> {
  const transactionNames = new Set<string>();

  for (const system of Object.values(registry.systems)) {
    for (const validator of Object.values(system.validators)) {
      if (validator.redeemer && Array.isArray(validator.redeemer)) {
        for (const redeemer of validator.redeemer) {
          if (redeemer.transaction) {
            if (typeof redeemer.transaction === "string") {
              if (redeemer.transaction.trim()) {
                transactionNames.add(redeemer.transaction);
              }
            } else if (Array.isArray(redeemer.transaction)) {
              for (const tx of redeemer.transaction) {
                if (tx.trim()) {
                  transactionNames.add(tx);
                }
              }
            }
          }

          // Handle nested action structures
          for (const [actionType, actions] of Object.entries(redeemer)) {
            if (
              actionType !== "type" &&
              actionType !== "transaction" &&
              Array.isArray(actions)
            ) {
              for (const action of actions) {
                if (action.transaction) {
                  if (typeof action.transaction === "string") {
                    if (action.transaction.trim()) {
                      transactionNames.add(action.transaction);
                    }
                  } else if (Array.isArray(action.transaction)) {
                    for (const tx of action.transaction) {
                      if (tx.trim()) {
                        transactionNames.add(tx);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return transactionNames;
}

function extractValidatorNamesFromRegistry(registry: Registry): Set<string> {
  const validatorNames = new Set<string>();

  for (const system of Object.values(registry.systems)) {
    for (const validatorId of Object.keys(system.validators)) {
      validatorNames.add(validatorId);
    }
  }

  return validatorNames;
}

function getAllFiles(dir: string, extension: string): string[] {
  const files: string[] = [];

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(dir)) {
    walk(dir);
  }

  return files;
}

async function checkDocumentationCoverage(): Promise<void> {
  const registryPath = path.join(
    process.cwd(),
    "public",
    "yaml",
    "validator-registry-v2.yaml"
  );
  const transactionMdxDir = path.join(
    process.cwd(),
    "content",
    "docs",
    "protocol",
    "v2",
    "transactions"
  );
  const validatorMdxDir = path.join(
    process.cwd(),
    "content",
    "docs",
    "protocol",
    "v2",
    "validators"
  );
  const transactionYamlDir = path.join(
    process.cwd(),
    "public",
    "yaml",
    "transactions"
  );

  // Load registry
  const registry = loadRegistry(registryPath);

  // Extract expected transaction and validator names from registry
  const expectedTransactions = extractTransactionNamesFromRegistry(registry);
  const expectedValidators = extractValidatorNamesFromRegistry(registry);

  // Get all MDX files
  const transactionMdxFiles = getAllFiles(transactionMdxDir, ".mdx");
  const validatorMdxFiles = getAllFiles(validatorMdxDir, ".mdx");

  // Get all YAML files
  const transactionYamlFiles = getAllFiles(transactionYamlDir, ".yaml");

  // Extract base names from YAML files (without .yaml extension)
  const existingTransactionYamls = new Set(
    transactionYamlFiles.map((f) => path.basename(f, ".yaml"))
  );

  const report: CoverageReport = {
    mdxWithoutTxFile: [],
    mdxWithoutValidatorId: [],
    transactionsWithoutMdx: [],
    validatorsWithoutMdx: [],
    mdxReferencingMissingTxFiles: [],
    mdxReferencingMissingValidators: [],
  };

  // Check transaction MDX files
  for (const mdxFile of transactionMdxFiles) {
    // Skip index files
    if (path.basename(mdxFile) === "index.mdx") continue;

    const frontmatter = parseMDXFrontmatter(mdxFile);
    if (!frontmatter) continue;

    if (!frontmatter.tx_file) {
      report.mdxWithoutTxFile.push(mdxFile);
    } else {
      // Check if referenced tx_file exists
      const txFileName = frontmatter.tx_file.replace(".yaml", "");
      if (!existingTransactionYamls.has(txFileName)) {
        report.mdxReferencingMissingTxFiles.push({
          mdxFile,
          txFile: frontmatter.tx_file,
        });
      }
    }
  }

  // Check validator MDX files
  for (const mdxFile of validatorMdxFiles) {
    // Skip index files
    if (path.basename(mdxFile) === "index.mdx") continue;

    const frontmatter = parseMDXFrontmatter(mdxFile);
    if (!frontmatter) continue;

    if (!frontmatter.validator_id) {
      report.mdxWithoutValidatorId.push(mdxFile);
    } else {
      // Check if referenced validator_id exists in registry
      const validatorIds = Array.isArray(frontmatter.validator_id)
        ? frontmatter.validator_id
        : [frontmatter.validator_id];

      for (const validatorId of validatorIds) {
        let validatorFound = false;
        for (const system of Object.values(registry.systems)) {
          if (system.validators[validatorId]) {
            validatorFound = true;
            break;
          }
        }

        if (!validatorFound) {
          report.mdxReferencingMissingValidators.push({
            mdxFile,
            validatorId,
          });
        }
      }
    }
  }

  // Check for transactions in registry without MDX pages
  const transactionMdxTxFiles = new Set<string>();
  for (const mdxFile of transactionMdxFiles) {
    if (path.basename(mdxFile) === "index.mdx") continue;
    const frontmatter = parseMDXFrontmatter(mdxFile);
    if (frontmatter?.tx_file) {
      transactionMdxTxFiles.add(frontmatter.tx_file.replace(".yaml", ""));
    }
  }

  for (const transaction of expectedTransactions) {
    if (!transactionMdxTxFiles.has(transaction)) {
      report.transactionsWithoutMdx.push(transaction);
    }
  }

  // Check for validators in registry without MDX pages
  const validatorMdxIds = new Set<string>();
  for (const mdxFile of validatorMdxFiles) {
    if (path.basename(mdxFile) === "index.mdx") continue;
    const frontmatter = parseMDXFrontmatter(mdxFile);
    if (frontmatter?.validator_id) {
      if (Array.isArray(frontmatter.validator_id)) {
        for (const id of frontmatter.validator_id) {
          validatorMdxIds.add(id);
        }
      } else {
        validatorMdxIds.add(frontmatter.validator_id);
      }
    }
  }

  for (const validator of expectedValidators) {
    if (!validatorMdxIds.has(validator)) {
      report.validatorsWithoutMdx.push(validator);
    }
  }

  // Print report
  console.log("=".repeat(80));
  console.log("DOCUMENTATION COVERAGE REPORT");
  console.log("=".repeat(80));

  console.log("\n📄 TRANSACTION MDX FILES WITHOUT tx_file:");
  if (report.mdxWithoutTxFile.length === 0) {
    console.log("✅ All transaction MDX files have tx_file specified");
  } else {
    report.mdxWithoutTxFile.forEach((file) =>
      console.log(`  ❌ ${path.relative(process.cwd(), file)}`)
    );
  }

  console.log("\n🛡️  VALIDATOR MDX FILES WITHOUT validator_id:");
  if (report.mdxWithoutValidatorId.length === 0) {
    console.log("✅ All validator MDX files have validator_id specified");
  } else {
    report.mdxWithoutValidatorId.forEach((file) =>
      console.log(`  ❌ ${path.relative(process.cwd(), file)}`)
    );
  }

  console.log("\n= MDX FILES REFERENCING MISSING TX FILES:");
  if (report.mdxReferencingMissingTxFiles.length === 0) {
    console.log("✅ All tx_file references point to existing YAML files");
  } else {
    report.mdxReferencingMissingTxFiles.forEach(({ mdxFile, txFile }) =>
      console.log(`  ❌ ${path.relative(process.cwd(), mdxFile)} → ${txFile}`)
    );
  }

  console.log("\n= MDX FILES REFERENCING MISSING VALIDATORS:");
  if (report.mdxReferencingMissingValidators.length === 0) {
    console.log("✅ All validator_id references exist in registry");
  } else {
    report.mdxReferencingMissingValidators.forEach(({ mdxFile, validatorId }) =>
      console.log(
        `  ❌ ${path.relative(process.cwd(), mdxFile)} → ${validatorId}`
      )
    );
  }

  console.log("\n📄 TRANSACTIONS IN REGISTRY WITHOUT MDX PAGES:");
  if (report.transactionsWithoutMdx.length === 0) {
    console.log("✅ All registry transactions have corresponding MDX pages");
  } else {
    report.transactionsWithoutMdx.forEach((transaction) =>
      console.log(`  ❌ ${transaction}`)
    );
  }

  console.log("\n🛡️  VALIDATORS IN REGISTRY WITHOUT MDX PAGES:");
  if (report.validatorsWithoutMdx.length === 0) {
    console.log("✅ All registry validators have corresponding MDX pages");
  } else {
    report.validatorsWithoutMdx.forEach((validator) =>
      console.log(`  ❌ ${validator}`)
    );
  }

  console.log("\n" + "=".repeat(80));

  const totalIssues =
    report.mdxWithoutTxFile.length +
    report.mdxWithoutValidatorId.length +
    report.transactionsWithoutMdx.length +
    report.validatorsWithoutMdx.length +
    report.mdxReferencingMissingTxFiles.length +
    report.mdxReferencingMissingValidators.length;

  if (totalIssues === 0) {
    console.log("🎉 PERFECT! All documentation is properly cross-referenced.");
  } else {
    console.log(`⚠️ SUMMARY: ${totalIssues} issues found that need attention.`);
  }

  console.log("=".repeat(80));
}

// Run the check
checkDocumentationCoverage().catch(console.error);
