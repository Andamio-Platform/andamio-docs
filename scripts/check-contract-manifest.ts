#!/usr/bin/env tsx
/**
 * Guard: the Contract Verification manifest must not drift from the deployment.
 *
 * content/docs/contract-verification.mdx hardcodes the mainnet V2
 * script hashes (minting policy IDs) and spend-script addresses so integrators
 * can verify deployed contracts against published values. Those same values
 * live in public/yaml/deployments/mainnet-v2/params.yaml, which is the
 * source of truth and changes on every redeploy.
 *
 * Hardcoded prose silently goes stale: a redeploy updates params.yaml but not
 * the page, and the page then publishes wrong hashes to enterprise verifiers.
 * This guard asserts that EVERY script hash and address listed in the page
 * still appears somewhere in params.yaml. If one doesn't, the page has drifted
 * (or the manifest moved) and the build fails with a pointer to the offender.
 *
 * It intentionally checks one direction only — every doc value must exist in
 * params.yaml. params.yaml legitimately holds extra entries (blank policy IDs,
 * the non-script params-ref address, treasuries) that the page omits on
 * purpose, so the reverse direction would produce false failures.
 *
 * Usage:
 *   npx tsx scripts/check-contract-manifest.ts     # report + exit 1 on drift
 *
 * Runs automatically before every build via the `prebuild` npm script, so
 * drift fails `next build` locally and in CI/Vercel.
 */
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const PARAMS_PATH = path.join("public", "yaml", "deployments", "mainnet-v2", "params.yaml");
const DOC_PATH = path.join("content", "docs", "contract-verification.mdx");

const HASH_RE = /`([0-9a-f]{56})`/g; // blake2b-224 script hash / policy ID
const ADDR_RE = /`(addr1[0-9a-z]+)`/g; // bech32 script address

/** Recursively collect every leaf string value from a parsed YAML tree. */
function collectStrings(node: unknown, out: Set<string>): void {
  if (typeof node === "string") {
    const v = node.trim();
    if (v) out.add(v);
  } else if (Array.isArray(node)) {
    for (const item of node) collectStrings(item, out);
  } else if (node && typeof node === "object") {
    for (const value of Object.values(node)) collectStrings(value, out);
  }
}

/** Extract all unique capture-group-1 matches for a global regex. */
function extractAll(re: RegExp, text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(re)) found.add(m[1]);
  return [...found];
}

function fail(msg: string): never {
  console.error(`✗ Contract manifest drift check failed.\n${msg}`);
  process.exit(1);
}

for (const p of [PARAMS_PATH, DOC_PATH]) {
  if (!fs.existsSync(p)) fail(`Missing required file: ${p}`);
}

const paramsValues = new Set<string>();
collectStrings(yaml.load(fs.readFileSync(PARAMS_PATH, "utf8")), paramsValues);

const doc = fs.readFileSync(DOC_PATH, "utf8");
const docHashes = extractAll(HASH_RE, doc);
const docAddrs = extractAll(ADDR_RE, doc);
const docValues = [...docHashes, ...docAddrs];

if (docValues.length === 0) {
  fail(
    `No script hashes or addresses found in ${DOC_PATH}. ` +
      `Expected backtick-wrapped 56-hex hashes and addr1 addresses — did the table format change?`,
  );
}

const drifted = docValues.filter((v) => !paramsValues.has(v));

if (drifted.length > 0) {
  fail(
    `${drifted.length} value(s) in ${DOC_PATH} are not present in ${PARAMS_PATH}:\n` +
      drifted.map((v) => `  - ${v}`).join("\n") +
      `\n\nEither the deployment manifest changed (update the page to match) ` +
      `or the page has a typo. params.yaml is the source of truth.`,
  );
}

console.log(
  `✓ Contract manifest in sync: ${docHashes.length} hash(es) + ${docAddrs.length} address(es) ` +
    `in ${path.basename(DOC_PATH)} all present in ${path.basename(PARAMS_PATH)}.`,
);
