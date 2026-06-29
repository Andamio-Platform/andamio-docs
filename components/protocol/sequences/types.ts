/**
 * sequences/types — the per-step data contract for the protocol transaction
 * steppers (<TransactionStepper>).
 *
 * This is the render/data split mirror of `anatomy-layers.ts`: the component is
 * the render half, each per-sequence data module (onboarding.ts, …) is the
 * content half. A `Step` encodes one beat of the sequence grammar:
 *
 *   Actor → Transaction → on-chain effect (validatorAction + tokenDelta)
 *         → resulting state, plus the step's optional build endpoint.
 *
 * Data modules re-shape already-verified `state-machine/*` material into this
 * grammar — they add no new facts (same discipline as anatomy-layers).
 */

export interface Step {
  /** Stable key for React lists and tab/panel id namespacing. */
  id: string;
  /** Index shown in the rail and on the step-track node (1-based). */
  n: number;
  /** Who initiates the transaction (e.g. "Course Author", "Student"). */
  actor: string;
  /** The transaction the actor submits (e.g. "Mint Access Token"). */
  transaction: string;
  /** The validator action invoked on-chain (e.g. "global_state: MintLocalState"). */
  validatorAction: string;
  /** The token movement / mint / burn the transaction effects. */
  tokenDelta: string;
  /** The on-chain state once the transaction confirms. */
  resultingState: string;
  /** Optional build endpoint a developer calls to construct this transaction. */
  buildEndpoint?: string;
  /** Optional in-app link (e.g. to the shared lifecycle anchor or a tx page). */
  link?: { href: string; label: string };
}

export interface Sequence {
  id: string;
  title: string;
  /** Short framing paragraph rendered above the stepper. */
  intro: string;
  steps: Step[];
}
