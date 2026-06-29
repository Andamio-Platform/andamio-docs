/**
 * project-contribute-earn — the Contributor path from committing to a task to
 * claiming a reward credential.
 *
 * Re-composed (no new facts) from:
 *   state-machine/project/contributor-task-commit.mdx
 *   state-machine/project/contributor-task-action.mdx
 *   state-machine/project/manager-tasks-assess.mdx
 *   state-machine/project/contributor-credential-claim.mdx
 *
 * Symmetric to course-learn-earn. Each step links once to the Surface 1
 * lifecycle; it is not re-described here.
 */

import { LIFECYCLE_LINK, type Sequence } from "@/components/protocol/sequences/types";

export const projectContributeEarn: Sequence = {
  id: "project-contribute-earn",
  title: "Project · Contribute & earn",
  intro:
    "A contributor commits to a task (joining the project on first commit), does the work and submits evidence on-chain, has a manager assess it, and — once accepted — claims a credential and reward, recovering their deposit.",
  steps: [
    {
      id: "commit-task",
      n: 1,
      actor: "Contributor",
      transaction: "Commit to Task",
      validatorAction: "contributor_state: CommitProject",
      tokenDelta:
        "On first commit, mints the contributor-state token (joins the project) and records the task commitment in one step; later commits skip minting. A recoverable contributor-state deposit is locked.",
      resultingState:
        "Contributor has joined the project; the task commitment with its evidence is on-chain and linked to the task.",
      buildEndpoint: "POST /api/v2/tx/project/contributor/task/commit",
      link: LIFECYCLE_LINK,
    },
    {
      id: "submit-task-work",
      n: 2,
      actor: "Contributor",
      transaction: "Submit Task Work",
      validatorAction: "escrow1: UserAction",
      tokenDelta:
        "No mint or burn. The actual work happens off-chain; this transaction records the contributor's evidence of completion in the on-chain task state.",
      resultingState:
        "The contributor's submission is recorded on-chain and available for the manager to assess.",
      buildEndpoint: "POST /api/v2/tx/project/contributor/task/action",
      link: LIFECYCLE_LINK,
    },
    {
      id: "assess-tasks",
      n: 3,
      actor: "Manager",
      transaction: "Assess Tasks",
      validatorAction: "escrow1: Accept + contributor_state: AddCompleted",
      tokenDelta:
        "No mint or burn — records an accept or reject decision per contributor against the task escrow (decisions can be batched).",
      resultingState:
        "Each submission is marked accepted or rejected on-chain; accepted contributors can claim their credential and reward.",
      buildEndpoint: "POST /api/v2/tx/project/manager/tasks/assess",
      link: LIFECYCLE_LINK,
    },
    {
      id: "claim-credential",
      n: 4,
      actor: "Contributor",
      transaction: "Claim Project Credential",
      validatorAction: "contributor_state: BurnContributor",
      tokenDelta:
        "Burns the contributor-state token, stores the credential hash in global state, pays the task reward, refunds the contributor-state deposit, and pays a small protocol fee — a net ADA gain for the contributor.",
      resultingState:
        "The contributor holds a verifiable project credential and reward on-chain; the deposit is returned and the commitment is marked rewarded.",
      buildEndpoint: "POST /api/v2/tx/project/contributor/credential/claim",
      link: LIFECYCLE_LINK,
    },
  ],
};
