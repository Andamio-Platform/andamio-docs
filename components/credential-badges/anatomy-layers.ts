/**
 * anatomy-layers — the four-layer content model for the Credential Badge Anatomy
 * Explorer (<BadgeAnatomyExplorer>).
 *
 * Seeded VERBATIM from the verified claims in
 * content/docs/credential-badges/index.mdx. This is a presentation re-shaping of
 * already-verified content — do NOT add facts here. Every claim keeps the true
 * live / coming / in-dev label it carries on the prose page; an interactive view
 * must never drop, blur, or upgrade a label.
 */

export type ClaimLabel = "live" | "coming" | "in-dev";

export interface Claim {
  text: string;
  label: ClaimLabel;
}

export interface Hotspot {
  /** Percent coordinates over the square badge stage (0–100). */
  x: number;
  y: number;
}

export interface Layer {
  id: string;
  /** Index shown in the rail and on the badge hotspot (1-based). */
  n: number;
  title: string;
  /** One-line summary for the rail. */
  tagline: string;
  what: string;
  why: string;
  claims: Claim[];
  hotspot: Hotspot;
  /** Optional in-app link (e.g. to the contract-verification page). */
  link?: { href: string; label: string };
}

export const LAYERS: Layer[] = [
  {
    id: "image",
    n: 1,
    title: "The Image",
    tagline: "A self-contained, shareable SVG",
    what:
      "A self-contained SVG served at credentials.andamio.io/badges/<policy_id>.<slt_hash>.svg. " +
      "The filename keys off the course's on-chain policy_id and the slt_hash (the Student " +
      "Learning Target it attests). The design is a Proof Rings shield: the outer ring encodes " +
      "the policy_id, the inner ring encodes the slt_hash, on a per-course colour palette.",
    why:
      "It's a normal image file — postable on social media, droppable into a portfolio, " +
      "embeddable anywhere — and it renders standalone, with no call back to Andamio.",
    claims: [
      {
        text:
          "Any credential serves on demand at credentials.andamio.io/badges/<policy_id>.<slt_hash>.svg " +
          "(HTTP 200, image/svg+xml). Serving is static-first, with an on-demand render fallback, so " +
          "a badge resolves even if it was never pre-generated.",
        label: "live",
      },
      {
        text:
          "The (policy_id, slt_hash) pair is decodable straight from the pixels, and a badge " +
          "provably round-trips to its on-chain hashes (the generator ships a ring-geometry " +
          "verifier, make verify).",
        label: "live",
      },
      {
        text:
          "The badge image is presentation-layer only — never identity-bearing. The rings " +
          "encode the identifying hashes, but a credential's identity is its on-chain anchor, " +
          "not its picture. This is an explicit design invariant.",
        label: "live",
      },
    ],
    hotspot: { x: 50, y: 7 },
  },
  {
    id: "metadata",
    n: 2,
    title: "SVG Metadata",
    tagline: "What travels with the file",
    what:
      "Because the badge is a self-contained SVG, the identifying data travels with the image. " +
      "Today that is the Proof-Ring encoding of the (policy_id, slt_hash) pair — readable back " +
      "out of the file itself, wherever it ends up.",
    why:
      "The file can be stored anywhere and the identifiers it carries can be recomputed by " +
      "anyone — no Andamio lookup required to know which course and target it refers to.",
    claims: [
      {
        text:
          "The Proof-Ring encoding of the (policy_id, slt_hash) pair travels in the file and is " +
          "readable back out of it.",
        label: "live",
      },
      {
        text:
          "Open Badges “baking” — embedding the signed verifiable credential inside the " +
          "SVG/PNG (e.g. <openbadges:credential verify=\"<JWS>\">) so the image self-verifies " +
          "offline. The spec is finalized; today's badges carry the Proof-Ring encoding, not an " +
          "embedded signed credential.",
        label: "coming",
      },
    ],
    hotspot: { x: 77, y: 25 },
  },
  {
    id: "openbadges",
    n: 3,
    title: "Open Badges, W3C VC & DID",
    tagline: "The portable, standards-based view",
    what:
      "Andamio expresses each credential in the Open Badges 3.0 / W3C Verifiable Credentials 2.0 " +
      "JSON-LD form — a standards-based shape any compliant verifier can read. The Andamio-specific " +
      "terms (onChainAnchor, onChainAttestation, accessToken, requires, prereqAttestation) are " +
      "defined in a hosted, versioned JSON-LD context, and a hosted issuer Profile identifies " +
      "Andamio as the issuer.",
    why:
      "The OB3 / W3C VC form is a portable view of the on-chain anchor, so a verifier that has " +
      "never heard of Cardano can still read and trust the credential — that's what makes an " +
      "Andamio credential integrate with any app that speaks Open Badges. The DID layer gives the " +
      "credential a cryptographic issuer identity so a verifier can check who signed it.",
    claims: [
      {
        text: "/context/v0.jsonld serves Andamio's OB 3.0 extension terms (versioned, immutable).",
        label: "live",
      },
      {
        text: "/issuer serves the hosted OB 3.0 issuer Profile (application/ld+json).",
        label: "live",
      },
      {
        text:
          "did:web:credentials.andamio.io is the production issuer identity — its " +
          "/.well-known/did.json is not yet published; today credentials use a throwaway did:key " +
          "and reference the hosted Profile URL informationally.",
        label: "coming",
      },
      {
        text:
          "The signing service that emits and lets you verify a credential — KMS-backed signing " +
          "plus a human-facing verification page.",
        label: "coming",
      },
    ],
    hotspot: { x: 50, y: 50 },
  },
  {
    id: "cardano",
    n: 4,
    title: "The Andamio Layer on Cardano",
    tagline: "The on-chain anchor that makes it a credential",
    what:
      "Underneath the image and the standards form sits the part that makes this a credential and " +
      "not a certificate: an anchor on Cardano. Each credential's onChainAnchor carries the " +
      "policyId, asset identifiers, and the transaction hashes that bind the attestation into the " +
      "recipient's on-chain Access Token global state, governed by Andamio's deployed protocol " +
      "validators.",
    why:
      "The ledger — not Andamio's server, and not the picture — is the source of truth. Anyone " +
      "can independently confirm the anchor without trusting us.",
    claims: [
      {
        text:
          "The on-chain course and target identity (the policy_id / slt_hash the badges are built " +
          "from) is real on Cardano mainnet, and badges provably round-trip to those hashes; " +
          "anchored via deployed protocol validators.",
        label: "live",
      },
      {
        text:
          "A recipient's evidence_hash is anchored on-chain and retrievable through the " +
          "authenticated Andamio CLI; exercising a full end-to-end recipient credential_claim flow " +
          "is still in progress.",
        label: "in-dev",
      },
      {
        text:
          "The public andamioscan explorer does not yet surface evidence_hash — the data is " +
          "on-chain, but the public reader hasn't exposed it (an API-surface gap, not a data gap).",
        label: "in-dev",
      },
    ],
    hotspot: { x: 50, y: 92 },
    link: { href: "/docs/protocol/v2/contract-verification", label: "Deployed protocol validators" },
  },
];
