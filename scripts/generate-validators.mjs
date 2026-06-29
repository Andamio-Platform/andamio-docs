#!/usr/bin/env node

/**
 * Validators Documentation Generator (Surface 2)
 *
 * Mechanically extracts the validator/action skeleton from the vendored,
 * pinned Aiken blueprint. The "join curated annotations + render the page"
 * half lands in U3 and extends this file (see `extractSkeleton` below — keep
 * it as the standalone, reusable extraction entry point).
 *
 * Source:  public/yaml/contracts/plutus.json  (vendored @ rev 351b267)
 * Pin doc: public/yaml/contracts/PINNED-REV.md
 *
 * Extraction rules:
 *   - Walk `validators[]`. Each entry's `title` is `<name>.<module>.<purpose>`;
 *     dedupe on `title.split('.')[0]` (29 purpose-suffixed entries → 12 unique
 *     validator names).
 *   - For each unique validator, resolve `redeemer.schema.$ref`
 *     (e.g. `#/definitions/course~1assignment_validator~1AssignmentDecisionAction`)
 *     by un-escaping `~1`→`/`, stripping `#/definitions/`, and looking up
 *     `definitions[key]`.
 *   - Read the ordered action list from `def.anyOf[].title`. Single-constructor
 *     defs (e.g. `global/global_state_ref` → `NewGlobalRefPair`) may be an
 *     `anyOf` with one entry or a bare object — both are handled.
 *
 * Usage:
 *   node scripts/generate-validators.mjs --dry-run
 *   node scripts/generate-validators.mjs --verbose
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  blueprintPath: path.join(
    __dirname,
    "..",
    "public",
    "yaml",
    "contracts",
    "plutus.json"
  ),
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

/**
 * Load and parse the vendored blueprint. Throws with a clear message on a
 * missing or malformed file so callers can exit non-zero.
 */
function loadBlueprint(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    throw new Error(
      `Could not read blueprint at ${filePath}: ${error.message}\n` +
        `Expected the vendored plutus.json (see public/yaml/contracts/PINNED-REV.md).`
    );
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Malformed blueprint JSON at ${filePath}: ${error.message}`
    );
  }

  if (!json || !Array.isArray(json.validators)) {
    throw new Error(
      `Blueprint at ${filePath} has no \`validators[]\` array — wrong file or corrupt blueprint.`
    );
  }
  if (!json.definitions || typeof json.definitions !== "object") {
    throw new Error(
      `Blueprint at ${filePath} has no \`definitions\` object — cannot resolve redeemer schemas.`
    );
  }

  return json;
}

/**
 * Resolve a JSON-schema `$ref` (e.g.
 * `#/definitions/course~1assignment_validator~1AssignmentDecisionAction`) to its
 * definition object in `definitions`. Returns `undefined` if the key is absent.
 */
function resolveRef(ref, definitions) {
  if (typeof ref !== "string") return undefined;
  const key = ref.replace(/^#\/definitions\//, "").replace(/~1/g, "/");
  return definitions[key];
}

/**
 * Read the ordered action list from a resolved redeemer definition.
 * - `anyOf` present → each entry's `title` (the normal multi-constructor case,
 *   and the single-entry `anyOf` case e.g. `NewGlobalRefPair`).
 * - bare object with a `title` → `[title]` (single-constructor, no `anyOf`).
 * - otherwise → `[]` (sentinel: opaque/unknown schema, not a crash).
 */
function actionsFromDef(def) {
  if (!def || typeof def !== "object") return [];
  if (Array.isArray(def.anyOf)) {
    return def.anyOf
      .map((variant) => variant && variant.title)
      .filter((title) => typeof title === "string" && title.length > 0);
  }
  if (typeof def.title === "string" && def.title.length > 0) {
    return [def.title];
  }
  return [];
}

/**
 * EXTRACTION (the mechanical half).
 *
 * Walk `validators[]`, dedupe on `title.split('.')[0]`, resolve each validator's
 * redeemer `$ref` to its action list.
 *
 * @param {object} blueprint Parsed plutus.json
 * @returns {Array<{ name: string, actions: string[] }>} one entry per unique
 *          validator, in first-seen order.
 */
export function extractSkeleton(blueprint) {
  if (!blueprint || !Array.isArray(blueprint.validators)) {
    throw new Error("extractSkeleton: blueprint has no `validators[]` array.");
  }
  const definitions = blueprint.definitions || {};

  const byName = new Map(); // name → { name, actions }

  for (const validator of blueprint.validators) {
    const title = validator && validator.title;
    if (typeof title !== "string") {
      verbose(`Skipping validator with no string title`);
      continue;
    }
    const name = title.split(".")[0];
    if (byName.has(name)) {
      verbose(`Dedupe: ${name} already seen (from ${title})`);
      continue;
    }

    const ref = validator.redeemer && validator.redeemer.schema
      ? validator.redeemer.schema.$ref
      : undefined;
    const def = resolveRef(ref, definitions);
    const actions = actionsFromDef(def);

    if (actions.length === 0) {
      verbose(`No actions resolved for ${name} (ref: ${ref})`);
    }

    byName.set(name, { name, actions });
  }

  return [...byName.values()];
}

// Main
function main() {
  log("=".repeat(60));
  log("Validators Skeleton Extractor (Surface 2)");
  log("=".repeat(60));

  if (DRY_RUN) {
    log("\n[DRY RUN MODE - No files will be written]\n");
  }

  let blueprint;
  try {
    blueprint = loadBlueprint(CONFIG.blueprintPath);
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }

  verbose(`Loaded ${blueprint.validators.length} validator entries`);

  let skeleton;
  try {
    skeleton = extractSkeleton(blueprint);
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }

  log(`\nExtracted ${skeleton.length} unique validators:\n`);
  for (const { name, actions } of skeleton) {
    log(`  ${name}`);
    log(`    → ${actions.length ? actions.join(" · ") : "(no actions)"}`);
  }

  // The render half (join curated annotations → data module / MDX) is U3.
  // When DRY_RUN is set, never write — extraction-only run prints the table.
  if (!DRY_RUN) {
    log(
      "\n[note] Rendering half (curated join → data module) lands in U3; " +
        "this script currently performs extraction only."
    );
  }

  log("\n" + "=".repeat(60));
  log(`Done — ${skeleton.length} validators extracted.`);
  log("=".repeat(60));
}

// Only run the CLI when invoked directly (so U3 can `import { extractSkeleton }`
// from this module without triggering extraction/printing).
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
