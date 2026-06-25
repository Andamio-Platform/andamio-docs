#!/usr/bin/env tsx
/**
 * Guard: the vendored treasury reference script must stay self-consistent.
 *
 * public/yaml/deployments/<network>-v2/treasury-reference.json pins one
 * DEPLOYED project treasury so the in-browser <TreasuryVerifier> can recompute
 * any project's treasury hash by a single 28-byte substitution. If that file is
 * ever edited carelessly — a stray character in the cbor, a wrong pinned hash,
 * a project NFT id that no longer appears exactly once — the verifier silently
 * emits WRONG hashes to enterprise integrators. There is no louder failure than
 * a verifier that confidently lies.
 *
 * This guard recomputes the pin from its own bytes and asserts:
 *   1. blake2b-224(0x03 || cbor) === reference_script_hash   (the pin is real)
 *   2. pNFT_ref occurs exactly once in cbor                  (one substitution slot)
 *   3. the three credentials are well-formed 28-byte hex
 *
 * It does NOT reach the network — the contract is internal consistency, which
 * is all the verifier depends on. Re-pinning to a new deployed treasury is the
 * only legitimate way these bytes change, and that change must still satisfy 1–3.
 *
 * Usage:
 *   npx tsx scripts/check-treasury-reference.ts     # report + exit 1 on drift
 *
 * Runs automatically before every build via the `prebuild` npm script.
 */
import fs from "fs";
import path from "path";
import { blake2b } from "@noble/hashes/blake2.js";

const REFS = [
  path.join("public", "yaml", "deployments", "preprod-v2", "treasury-reference.json"),
];

const HEX28 = /^[0-9a-f]{56}$/;

function fail(msg: string): never {
  console.error(`✗ Treasury reference check failed.\n${msg}`);
  process.exit(1);
}

const hexToBytes = (hex: string): Uint8Array =>
  Uint8Array.from(hex.match(/../g)!.map((b) => parseInt(b, 16)));

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

let checked = 0;

for (const p of REFS) {
  if (!fs.existsSync(p)) fail(`Missing required file: ${p}`);

  let ref: {
    reference_script_hash?: string;
    pNFT_ref?: string;
    instance_stake_cred?: string;
    cbor?: string;
  };
  try {
    ref = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    fail(`${p} is not valid JSON: ${e instanceof Error ? e.message : e}`);
  }

  const { reference_script_hash, pNFT_ref, instance_stake_cred, cbor } = ref;

  for (const [name, val] of [
    ["reference_script_hash", reference_script_hash],
    ["pNFT_ref", pNFT_ref],
    ["instance_stake_cred", instance_stake_cred],
  ] as const) {
    if (!val || !HEX28.test(val)) {
      fail(`${p}: '${name}' must be 56-hex (28 bytes), got: ${val ?? "(missing)"}`);
    }
  }
  if (!cbor || !/^[0-9a-f]+$/.test(cbor)) {
    fail(`${p}: 'cbor' must be a non-empty hex string.`);
  }

  const occurrences = cbor.split(pNFT_ref!).length - 1;
  if (occurrences !== 1) {
    fail(
      `${p}: pNFT_ref must occur exactly once in cbor (the single per-project ` +
        `substitution slot), but it occurs ${occurrences} time(s). The verifier ` +
        `cannot safely substitute.`,
    );
  }

  const recomputed = bytesToHex(blake2b(hexToBytes("03" + cbor), { dkLen: 28 }));
  if (recomputed !== reference_script_hash) {
    fail(
      `${p}: blake2b-224(0x03 || cbor) = ${recomputed}\n` +
        `  but reference_script_hash = ${reference_script_hash}\n` +
        `The cbor and the pinned hash disagree — the reference is corrupt or ` +
        `was re-pinned without updating the hash.`,
    );
  }

  checked++;
}

console.log(
  `✓ Treasury reference${checked === 1 ? "" : "s"} self-consistent: ` +
    `${checked} pin(s) recompute to their published hash.`,
);
