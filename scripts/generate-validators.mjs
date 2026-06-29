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
  annotationsPath: path.join(
    __dirname,
    "..",
    "public",
    "yaml",
    "contracts",
    "validators-annotations.json"
  ),
  outputPath: path.join(
    __dirname,
    "..",
    "components",
    "protocol",
    "validators-data.ts"
  ),
};

// Canonical layer order (fixed per the protocol-docs-redesign handoff).
const LAYER_ORDER = ["Global registry", "Instances", "Course", "Project"];

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

/**
 * Load the hand-curated annotations (layer · purpose · governs), keyed by
 * blueprint validator name. Throws with a clear message on a missing/malformed
 * file so callers can exit non-zero.
 */
function loadAnnotations(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    throw new Error(
      `Could not read annotations at ${filePath}: ${error.message}\n` +
        `Expected the curated validators-annotations.json.`
    );
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Malformed annotations JSON at ${filePath}: ${error.message}`);
  }
  if (!json || !json.validators || typeof json.validators !== "object") {
    throw new Error(
      `Annotations at ${filePath} has no \`validators\` object — wrong file or corrupt.`
    );
  }
  return json.validators;
}

/**
 * JOIN (the contract).
 *
 * Bind each blueprint skeleton entry to its curated annotation. This is a
 * strict, bidirectional contract — generation FAILS LOUDLY (throws) if:
 *   - a blueprint validator has no curated annotation (silent omission), or
 *   - a curated key has no blueprint match (phantom validator).
 * The U4 prebuild drift guard enforces the same invariant at build time.
 *
 * @returns {Array<ValidatorEntry>} ordered by canonical layer then blueprint order.
 */
export function joinValidators(skeleton, annotations) {
  const skeletonNames = new Set(skeleton.map((s) => s.name));
  const annotationKeys = Object.keys(annotations);

  const missingAnnotation = skeleton
    .map((s) => s.name)
    .filter((name) => !annotations[name]);
  const phantomAnnotation = annotationKeys.filter(
    (key) => !skeletonNames.has(key)
  );

  const problems = [];
  if (missingAnnotation.length) {
    problems.push(
      `Blueprint validators with NO curated annotation (add them to ` +
        `validators-annotations.json):\n    - ${missingAnnotation.join("\n    - ")}`
    );
  }
  if (phantomAnnotation.length) {
    problems.push(
      `Curated annotations with NO blueprint match (phantom — remove or fix the ` +
        `key):\n    - ${phantomAnnotation.join("\n    - ")}`
    );
  }
  if (problems.length) {
    throw new Error(
      `Join contract violated — curated annotations and blueprint diverge:\n\n` +
        problems.join("\n\n") +
        `\n\nRe-vendor plutus.json and/or update validators-annotations.json, ` +
        `then re-run \`npm run docs-validators\`.`
    );
  }

  const entries = skeleton.map((s) => {
    const a = annotations[s.name];
    for (const field of ["displayName", "layer", "purpose", "governs"]) {
      if (typeof a[field] !== "string" || a[field].length === 0) {
        throw new Error(
          `Annotation for "${s.name}" is missing required field "${field}".`
        );
      }
    }
    if (!LAYER_ORDER.includes(a.layer)) {
      throw new Error(
        `Annotation for "${s.name}" has unknown layer "${a.layer}" ` +
          `(expected one of: ${LAYER_ORDER.join(", ")}).`
      );
    }
    return {
      id: s.name,
      name: a.displayName,
      layer: a.layer,
      purpose: a.purpose,
      actions: s.actions,
      governs: a.governs,
    };
  });

  // Stable sort: canonical layer order, preserving blueprint order within a layer.
  return entries
    .map((entry, i) => ({ entry, i }))
    .sort((x, y) => {
      const byLayer =
        LAYER_ORDER.indexOf(x.entry.layer) - LAYER_ORDER.indexOf(y.entry.layer);
      return byLayer !== 0 ? byLayer : x.i - y.i;
    })
    .map(({ entry }) => entry);
}

/**
 * Render the joined entries into a typed TS data module that the Validators MDX
 * page imports directly (mirrors components/credential-badges/anatomy-layers.ts).
 */
function renderDataModule(validators) {
  const header = `// AUTO-GENERATED by scripts/generate-validators.mjs — DO NOT EDIT BY HAND.
//
// Source of truth:
//   - machine skeleton (name + authorized actions): public/yaml/contracts/plutus.json (pinned blueprint)
//   - curated annotations (layer · purpose · governs): public/yaml/contracts/validators-annotations.json
//
// Regenerate with: npm run docs-validators
// A prebuild drift guard (scripts/check-validators-manifest.ts) fails the build
// if this file diverges from the blueprint, so it cannot silently go stale.

export type ValidatorLayer =
${LAYER_ORDER.map((l) => `  | ${JSON.stringify(l)}`).join("\n")};

export interface ValidatorEntry {
  /** Blueprint validator name, e.g. "global/global_state". */
  id: string;
  /** Human-friendly display name. */
  name: string;
  /** One of the four protocol layers. */
  layer: ValidatorLayer;
  /** One-line purpose (curated). */
  purpose: string;
  /** Authorized redeemer actions, sourced mechanically from the blueprint. */
  actions: string[];
  /** What token/state this validator mints/burns/governs (curated, tokens inline). */
  governs: string;
}

/** Canonical layer order, top (global) to bottom (project). */
export const VALIDATOR_LAYERS: ValidatorLayer[] = ${JSON.stringify(
    LAYER_ORDER
  )};

`;

  const body = `export const VALIDATORS: ValidatorEntry[] = ${JSON.stringify(
    validators,
    null,
    2
  )};\n`;

  return header + body;
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

  // Join curated annotations with the machine skeleton (fails loudly on drift).
  let annotations;
  let validators;
  try {
    annotations = loadAnnotations(CONFIG.annotationsPath);
    validators = joinValidators(skeleton, annotations);
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }

  log(`\nJoined ${validators.length} validators across ${LAYER_ORDER.length} layers:`);
  for (const layer of LAYER_ORDER) {
    const inLayer = validators.filter((v) => v.layer === layer);
    log(`\n  ${layer}`);
    for (const v of inLayer) {
      log(`    • ${v.name} (${v.id})`);
    }
  }

  if (DRY_RUN) {
    log("\n[DRY RUN] Skipping write of components/protocol/validators-data.ts");
  } else {
    const module = renderDataModule(validators);
    fs.mkdirSync(path.dirname(CONFIG.outputPath), { recursive: true });
    fs.writeFileSync(CONFIG.outputPath, module, "utf-8");
    log(`\nWrote ${path.relative(path.join(__dirname, ".."), CONFIG.outputPath)}`);
  }

  log("\n" + "=".repeat(60));
  log(`Done — ${validators.length} validators generated.`);
  log("=".repeat(60));
}

// Only run the CLI when invoked directly (so U3 can `import { extractSkeleton }`
// from this module without triggering extraction/printing).
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
