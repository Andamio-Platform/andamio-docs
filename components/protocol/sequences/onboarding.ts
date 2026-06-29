/**
 * onboarding — the single transaction every Andamio participant runs first.
 *
 * Re-composed from `state-machine/general/mint-access-token.mdx` (no new facts):
 * actor, build endpoint, on-chain effect, and resulting state are all sourced
 * from that page. The generic build → sign → submit → register → confirm
 * lifecycle is NOT repeated here — each step links once to Surface 1.
 */

import type { Sequence } from "./types";

const LIFECYCLE_LINK = {
  href: "/docs/protocol/v2#the-transaction-lifecycle",
  label: "Transaction lifecycle",
};

export const onboarding: Sequence = {
  id: "onboarding",
  title: "Onboarding — mint an access token",
  intro:
    "Minting an access token is the entry point for all participation in Andamio. Any user who wants to interact with courses, projects, or any other on-chain feature must first mint an access token tied to a unique alias.",
  steps: [
    {
      id: "mint-access-token",
      n: 1,
      actor: "Any user",
      transaction: "Mint Access Token",
      validatorAction: "global_state: MintLocalState",
      tokenDelta:
        "Mints the Access Token (a local-state NFT) tied to a unique alias. The alias is enforced unique across the protocol by the on-chain linked list.",
      resultingState:
        "The user holds an access token under a unique alias, recorded on-chain. They can now create courses or projects and join either as a participant.",
      buildEndpoint: "POST /api/v2/tx/general/mint-access-token",
      link: LIFECYCLE_LINK,
    },
  ],
};
