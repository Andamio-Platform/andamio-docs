#!/usr/bin/env tsx
/**
 * Guard: the Surface 2 Validators page must not drift from the deployed contracts.
 *
 * components/protocol/validators-data.ts is GENERATED from the vendored, pinned
 * Aiken blueprint (public/yaml/contracts/plutus.json) joined with curated
 * annotations (public/yaml/contracts/validators-annotations.json), via
 * `npm run docs-validators`. The Validators MDX page imports that data module.
 *
 * Ways the page can silently go stale:
 *   1. Someone re-vendors plutus.json (a contract redeploy/rename) but forgets
 *      to re-run the generator — wrong validators/actions ship.
 *   2. Someone edits the curated annotations (layer/purpose/governs/displayName)
 *      without regenerating — stale descriptions ship.
 *   3. Someone hand-edits the generated validators-data.ts directly — and a bad
 *      `layer` value would make ValidatorsReference silently drop that validator
 *      (its `.filter(v => v.layer === layer)` matches no section).
 *
 * This guard re-runs the SAME generation pipeline the build trusts — extract the
 * skeleton from the blueprint, load the curated annotations, and join them
 * (the join contract itself rejects missing/phantom validators, unknown layers,
 * and empty fields) — then deep-compares the freshly-joined result against the
 * committed data module, field by field. Any divergence in id, name, layer,
 * purpose, actions, or governs fails the build. This is strictly stronger than
 * an id+actions check: it covers every curated field too.
 *
 * Usage:
 *   npx tsx scripts/check-validators-manifest.ts     # report + exit 1 on drift
 *
 * Runs automatically before every build via the `prebuild` npm script.
 */
import fs from "fs";
import path from "path";
import {
  extractSkeleton,
  loadAnnotations,
  joinValidators,
} from "./generate-validators.mjs";
import { VALIDATORS } from "../components/protocol/validators-data";

const BLUEPRINT_PATH = path.join("public", "yaml", "contracts", "plutus.json");
const ANNOTATIONS_PATH = path.join(
  "public",
  "yaml",
  "contracts",
  "validators-annotations.json",
);
const DATA_MODULE = "components/protocol/validators-data.ts";

const remediation =
  `\n\nThe Validators page is generated, not hand-written. Re-vendor ` +
  `plutus.json if a contract changed and/or update validators-annotations.json, ` +
  `then run \`npm run docs-validators\` to regenerate ${DATA_MODULE}, and commit the result.`;

function fail(msg: string): never {
  console.error(`✗ Validators manifest drift check failed.\n${msg}${remediation}`);
  process.exit(1);
}

for (const p of [BLUEPRINT_PATH, ANNOTATIONS_PATH]) {
  if (!fs.existsSync(p)) fail(`Missing required file: ${p}`);
}

// Re-run the generation pipeline (the same functions the generator uses).
// Each of these throws on its own invariants (no validators[], unrecognized
// redeemer shape → zero actions, missing/phantom annotation, unknown layer,
// empty curated field); surface those as a drift failure.
type Expected = {
  id: string;
  name: string;
  layer: string;
  purpose: string;
  actions: string[];
  governs: string;
};
let expected: Expected[];
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blueprint: any = JSON.parse(fs.readFileSync(BLUEPRINT_PATH, "utf8"));
  const skeleton = extractSkeleton(blueprint);
  const annotations = loadAnnotations(ANNOTATIONS_PATH);
  expected = joinValidators(skeleton, annotations) as Expected[];
} catch (error) {
  fail((error as Error).message);
}

// Deep-compare the freshly-joined result against the committed data module.
const expectedById = new Map(expected.map((e) => [e.id, e]));
const committedById = new Map(VALIDATORS.map((v) => [v.id, v]));

const problems: string[] = [];

const missing = [...expectedById.keys()].filter((id) => !committedById.has(id));
const extra = [...committedById.keys()].filter((id) => !expectedById.has(id));
if (missing.length) {
  problems.push(
    `Validators the generator would produce but absent from ${DATA_MODULE}:\n` +
      missing.map((id) => `  - ${id}`).join("\n"),
  );
}
if (extra.length) {
  problems.push(
    `Validators in ${DATA_MODULE} the generator would NOT produce (stale/phantom):\n` +
      extra.map((id) => `  - ${id}`).join("\n"),
  );
}

for (const [id, exp] of expectedById) {
  const got = committedById.get(id);
  if (!got) continue; // already reported as missing
  for (const field of ["name", "layer", "purpose", "governs"] as const) {
    if (exp[field] !== got[field]) {
      problems.push(
        `"${id}" field "${field}" drifted:\n` +
          `  generated: ${JSON.stringify(exp[field])}\n` +
          `  committed: ${JSON.stringify(got[field])}`,
      );
    }
  }
  const expActions = exp.actions.join(" · ");
  const gotActions = got.actions.join(" · ");
  if (expActions !== gotActions) {
    problems.push(
      `"${id}" actions drifted:\n` +
        `  blueprint: ${expActions || "(none)"}\n` +
        `  committed: ${gotActions || "(none)"}`,
    );
  }
}

if (problems.length) {
  fail(problems.join("\n\n"));
}

console.log(
  `✓ Validators manifest in sync: ${VALIDATORS.length} validators — ids, ` +
    `actions, and every curated field (layer, purpose, governs) match a fresh ` +
    `generation from the pinned blueprint + annotations.`,
);
