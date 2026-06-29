#!/usr/bin/env tsx
/**
 * Guard: the Surface 2 Validators page must not drift from the deployed contracts.
 *
 * components/protocol/validators-data.ts is GENERATED from the vendored, pinned
 * Aiken blueprint (public/yaml/contracts/plutus.json) joined with curated
 * annotations (public/yaml/contracts/validators-annotations.json), via
 * `npm run docs-validators`. The Validators MDX page imports that data module.
 *
 * Two ways the page can silently go stale:
 *   1. Someone re-vendors plutus.json (a contract redeploy/rename) but forgets
 *      to re-run the generator — the page then publishes wrong validators/actions.
 *   2. Someone hand-edits validators-data.ts (which is supposed to be generated).
 *
 * This guard re-extracts the skeleton from the blueprint and asserts the
 * committed data module still matches it, BIDIRECTIONALLY:
 *   - every blueprint validator is present in the data module, and vice versa
 *     (no missing validator, no phantom);
 *   - each validator's authorized action list matches the blueprint exactly.
 * Unlike the contract-manifest guard (intentionally one-directional), a missing
 * validator here is a real regression, so the check runs both ways.
 *
 * Curated-annotation integrity (every blueprint validator has an annotation, no
 * phantom keys, valid layers) is enforced by the generator's join contract; this
 * guard covers the blueprint↔page axis that the generator can't re-check at build.
 *
 * Usage:
 *   npx tsx scripts/check-validators-manifest.ts     # report + exit 1 on drift
 *
 * Runs automatically before every build via the `prebuild` npm script, so drift
 * fails `next build` locally and in CI/Vercel.
 */
import fs from "fs";
import path from "path";
import { extractSkeleton } from "./generate-validators.mjs";
import { VALIDATORS } from "../components/protocol/validators-data";

const BLUEPRINT_PATH = path.join("public", "yaml", "contracts", "plutus.json");
const DATA_MODULE = "components/protocol/validators-data.ts";

function fail(msg: string): never {
  console.error(`✗ Validators manifest drift check failed.\n${msg}`);
  process.exit(1);
}

if (!fs.existsSync(BLUEPRINT_PATH)) {
  fail(
    `Missing vendored blueprint: ${BLUEPRINT_PATH} (see public/yaml/contracts/PINNED-REV.md).`,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let blueprint: any;
try {
  blueprint = JSON.parse(fs.readFileSync(BLUEPRINT_PATH, "utf8"));
} catch (error) {
  fail(`Could not parse ${BLUEPRINT_PATH}: ${(error as Error).message}`);
}

// Re-extract the mechanical skeleton straight from the blueprint.
const skeleton = extractSkeleton(blueprint) as Array<{
  name: string;
  actions: string[];
}>;

const blueprintByName = new Map(skeleton.map((s) => [s.name, s.actions]));
const dataById = new Map(VALIDATORS.map((v) => [v.id, v.actions]));

const remediation =
  `\n\nThe Validators page is generated, not hand-written. Re-vendor ` +
  `plutus.json if a contract changed, then run \`npm run docs-validators\` ` +
  `to regenerate ${DATA_MODULE}, and commit the result.`;

// 1. Bidirectional set equality on validator names.
const missingInData = [...blueprintByName.keys()].filter(
  (name) => !dataById.has(name),
);
const phantomInData = [...dataById.keys()].filter(
  (id) => !blueprintByName.has(id),
);

const problems: string[] = [];
if (missingInData.length) {
  problems.push(
    `Blueprint validators absent from ${DATA_MODULE} (page is missing them):\n` +
      missingInData.map((n) => `  - ${n}`).join("\n"),
  );
}
if (phantomInData.length) {
  problems.push(
    `Validators in ${DATA_MODULE} with no blueprint match (phantom/stale):\n` +
      phantomInData.map((n) => `  - ${n}`).join("\n"),
  );
}

// 2. Action-list equality for validators present in both (exact, order-sensitive —
//    the generator preserves blueprint order, so any difference is real drift).
for (const [name, blueprintActions] of blueprintByName) {
  const dataActions = dataById.get(name);
  if (!dataActions) continue; // already reported as missing above
  const a = blueprintActions.join(" · ");
  const b = dataActions.join(" · ");
  if (a !== b) {
    problems.push(
      `Action list for "${name}" differs:\n` +
        `  blueprint: ${a || "(none)"}\n` +
        `  page:      ${b || "(none)"}`,
    );
  }
}

if (problems.length) {
  fail(problems.join("\n\n") + remediation);
}

console.log(
  `✓ Validators manifest in sync: ${VALIDATORS.length} validators, ` +
    `actions match the pinned blueprint.`,
);
