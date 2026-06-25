"use client";

/**
 * TreasuryVerifier — recompute any Andamio project's treasury script hash from
 * its project_id, fully client-side, and verify it against the deployed chain.
 *
 * Project treasuries have no static published hash: each is a parameterized
 * instance of one audited validator. But only ONE of its six parameters varies
 * per project — the project NFT policy id, which IS the project_id. The other
 * five are global constants already baked into a hash-pinned, deployed reference
 * script (vendored at /yaml/deployments/preprod-v2/treasury-reference.json).
 *
 * So recomputation is a single 28-byte substitution into that reference script,
 * then blake2b-224(0x03 || script). No apply-params engine, no backend, no
 * secrets — exactly as trustless as the static-contract page, just per project.
 *
 * Both inputs (project_id + the global instance stake credential) are public,
 * so the result is fully verifiable. The page links out to a block explorer so
 * the user confirms the derived treasury is the one actually holding funds.
 */

import { useEffect, useMemo, useState } from "react";
import { blake2b } from "@noble/hashes/blake2.js";
import { bech32 } from "@scure/base";

interface TreasuryReference {
  network: string;
  reference_script_hash: string;
  pNFT_ref: string;
  instance_stake_cred: string;
  cbor: string;
}

interface VerifierProps {
  /** Which deployment's reference script to load. Only preprod is pinned today. */
  network?: "preprod";
}

const HEX28 = /^[0-9a-f]{56}$/;

const hexToBytes = (hex: string): Uint8Array =>
  Uint8Array.from(hex.match(/../g)!.map((b) => parseInt(b, 16)));

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** Normalise pasted input: drop whitespace, lowercase. */
const clean = (s: string): string => s.replace(/\s+/g, "").toLowerCase();

interface Recompute {
  hash: string;
  address: string;
}

/**
 * Recompute a project's treasury hash + address from the deployed reference
 * script. Pure function of public inputs — no network, no secrets.
 */
function recompute(ref: TreasuryReference, projectId: string): Recompute {
  // The reference script embeds its own project NFT policy id exactly once.
  // Swapping that 28-byte run for the target is the whole parameterization.
  if (ref.cbor.split(ref.pNFT_ref).length - 1 !== 1) {
    throw new Error("reference script integrity check failed (pNFT slot)");
  }
  const script = ref.cbor.replace(ref.pNFT_ref, projectId);
  // 0x03 = PlutusV3 language tag. Hash the single-CBOR script form.
  const hash = bytesToHex(blake2b(hexToBytes("03" + script), { dkLen: 28 }));

  // Address = header || payment script hash (28) || stake script hash (28).
  // 0x30 = testnet, script-payment + script-stake (CIP-19). Mainnet uses 0x31.
  const header = ref.network === "preprod" ? 0x30 : 0x31;
  const addrBytes = Uint8Array.from([
    header,
    ...hexToBytes(hash),
    ...hexToBytes(ref.instance_stake_cred),
  ]);
  const prefix = ref.network === "preprod" ? "addr_test" : "addr";
  const address = bech32.encode(prefix, bech32.toWords(addrBytes), 256);

  return { hash, address };
}

/** Pull the 28-byte payment credential out of a hash or a bech32 address. */
function paymentCredential(input: string): string | null {
  const v = clean(input);
  if (HEX28.test(v)) return v; // already a bare script hash
  if (v.startsWith("addr")) {
    try {
      const { bytes } = bech32.decodeToBytes(v);
      // header(1) || payment credential(28) || ...
      return bytesToHex(bytes.slice(1, 29));
    } catch {
      return null;
    }
  }
  return null;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
      aria-label="Copy to clipboard"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

export default function TreasuryVerifier({ network = "preprod" }: VerifierProps) {
  const [ref, setRef] = useState<TreasuryReference | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [compareInput, setCompareInput] = useState("");

  useEffect(() => {
    fetch(`/yaml/deployments/${network}-v2/treasury-reference.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: TreasuryReference) => setRef(d))
      .catch((e) =>
        setLoadError(e instanceof Error ? e.message : "failed to load reference")
      );
  }, [network]);

  const normalizedId = clean(projectId);
  const idValid = HEX28.test(normalizedId);

  const result = useMemo(() => {
    if (!ref || !idValid) return null;
    try {
      return recompute(ref, normalizedId);
    } catch {
      return null;
    }
  }, [ref, idValid, normalizedId]);

  const comparison = useMemo(() => {
    if (!result || !compareInput.trim()) return null;
    const cred = paymentCredential(compareInput);
    if (!cred) return { ok: false, reason: "unrecognized" as const };
    return { ok: cred === result.hash, reason: "checked" as const, cred };
  }, [result, compareInput]);

  const explorerBase =
    network === "preprod"
      ? "https://preprod.cardanoscan.io"
      : "https://cardanoscan.io";

  return (
    <div className="w-full rounded-lg border border-border/60 not-prose">
      <div className="px-4 py-3 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-2">
        <div className="text-sm font-medium">Project treasury verifier</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {network}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loadError && (
          <div className="text-sm text-red-500">
            Could not load the reference script ({loadError}).
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="tv-project-id"
            className="text-sm text-muted-foreground"
          >
            Project ID
            <span className="text-muted-foreground/70">
              {" "}
              (the project NFT policy ID, 56 hex characters)
            </span>
          </label>
          <input
            id="tv-project-id"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="9bcd4ae8db56b6312f09bbe68f789c7454ea7cf3bfd732dddc88621c"
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-md border border-border/60 bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary/60"
          />
          {projectId.trim() !== "" && !idValid && (
            <div className="text-xs text-amber-500">
              Expecting 56 hexadecimal characters (28 bytes).
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <span aria-hidden>✓</span>
              <span>
                Canonical Andamio treasury, parameterized for this project
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Treasury script hash
                </div>
                <div className="flex items-start gap-2">
                  <code className="text-sm font-mono break-all text-foreground/90">
                    {result.hash}
                  </code>
                  <CopyButton value={result.hash} />
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Treasury address
                </div>
                <div className="flex items-start gap-2">
                  <code className="text-sm font-mono break-all text-foreground/90">
                    <a
                      href={`${explorerBase}/address/${result.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {result.address}
                    </a>
                  </code>
                  <CopyButton value={result.address} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Open it in the explorer to confirm this is the address holding
                  the project&apos;s funds.
                </div>
              </div>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                Check a treasury address you were given
              </summary>
              <div className="mt-2 space-y-1.5">
                <input
                  value={compareInput}
                  onChange={(e) => setCompareInput(e.target.value)}
                  placeholder="addr_test1x… or a 56-hex script hash"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary/60"
                />
                {comparison?.reason === "unrecognized" && (
                  <div className="text-xs text-amber-500">
                    Paste a bech32 address (addr…) or a bare 56-hex script hash.
                  </div>
                )}
                {comparison?.reason === "checked" &&
                  (comparison.ok ? (
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      ✓ Matches — this address runs the canonical treasury for
                      the project above.
                    </div>
                  ) : (
                    <div className="text-sm text-red-500">
                      ✗ Does not match. Its payment credential is{" "}
                      <code className="font-mono break-all">
                        {comparison.cred}
                      </code>
                      .
                    </div>
                  ))}
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                Reproduce it yourself
              </summary>
              <p className="text-xs text-muted-foreground mt-2 mb-1">
                Every input below is public. The recompute is a single 28-byte
                substitution into the deployed reference script, then a hash.
              </p>
              <pre className="text-xs overflow-x-auto rounded-md bg-muted/40 p-3 leading-relaxed">
                <code>{`import hashlib, urllib.request, json

REF_HASH = "${ref?.reference_script_hash}"   # pinned deployed treasury, preprod
PROJECT  = "${idValid ? normalizedId : "<your project_id>"}"

# 1. fetch the deployed reference script bytes (any public indexer works)
url = f"https://cardano-preprod.blockfrost.io/api/v0/scripts/{REF_HASH}/cbor"
# req = urllib.request.Request(url, headers={"project_id": "<blockfrost>"})
# cbor = json.load(urllib.request.urlopen(req))["cbor"]
cbor = "<reference cbor hex>"   # or copy from the docs reference file

# 2. swap the reference project NFT id for yours (it occurs exactly once)
PNFT_REF = "${ref?.pNFT_ref}"
script = cbor.replace(PNFT_REF, PROJECT)

# 3. hash 0x03 (PlutusV3 tag) || script  ->  the treasury script hash
h = hashlib.blake2b(bytes.fromhex("03" + script), digest_size=28).hexdigest()
print(h)`}</code>
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
