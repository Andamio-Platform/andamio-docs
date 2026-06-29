/**
 * project-author-operate — the Owner/Manager path to standing up a project.
 *
 * Re-composed (no new facts) from:
 *   state-machine/project/owner-project-create.mdx
 *   state-machine/project/owner-managers-manage.mdx
 *   state-machine/project/manager-tasks-manage.mdx
 *   state-machine/project/user-treasury-add-funds.mdx
 *
 * Each step links once to the Surface 1 lifecycle; it is not re-described here.
 */

import { LIFECYCLE_LINK, type Sequence } from "@/components/protocol/sequences/types";

export const projectAuthorOperate: Sequence = {
  id: "project-author-operate",
  title: "Project · Author & operate",
  intro:
    "An owner stands up a project instance with a treasury, adds managers, and managers define funded tasks. Anyone can top up the treasury that pays task rewards. Each beat is a single transaction keyed on the project's policy ID.",
  steps: [
    {
      id: "create-project",
      n: 1,
      actor: "Project Owner",
      transaction: "Create Project",
      validatorAction: "instance_governance: governance action (mint project instance)",
      tokenDelta:
        "Mints a new project instance on-chain (6 mints, 2 observers), registering the creator as owner and first manager and establishing the treasury system. Returns the project's policy ID (project_id).",
      resultingState:
        "Project instance and treasury exist on-chain; the creator is owner and first manager; project_id is issued for all subsequent project operations.",
      buildEndpoint: "POST /api/v2/tx/instance/owner/project/create",
      link: LIFECYCLE_LINK,
    },
    {
      id: "manage-managers",
      n: 2,
      actor: "Project Owner",
      transaction: "Manage Managers",
      validatorAction: "instance_governance: governance action (update manager list)",
      tokenDelta:
        "No token mint or burn — updates the on-chain manager-list datum, replacing the previous set entirely.",
      resultingState:
        "The project's manager list is updated on-chain and mirrored to the database; only listed managers can create and assess tasks.",
      buildEndpoint: "POST /api/v2/tx/project/owner/managers/manage",
      link: LIFECYCLE_LINK,
    },
    {
      id: "manage-tasks",
      n: 3,
      actor: "Manager",
      transaction: "Manage Tasks",
      validatorAction: "treasury: Manage",
      tokenDelta:
        "No new tokens minted — uses existing treasury tokens. Adds or removes task definitions; each active task's reward amount is held in task escrow.",
      resultingState:
        "Tasks are live on-chain with rewards escrowed; contributors can commit to them. Removed tasks are cancelled.",
      buildEndpoint: "POST /api/v2/tx/project/manager/tasks/manage",
      link: LIFECYCLE_LINK,
    },
    {
      id: "add-funds",
      n: 4,
      actor: "Any user",
      transaction: "Fund Treasury",
      validatorAction: "treasury: CommitFunds",
      tokenDelta:
        "No mint or burn — deposits ADA or native assets into the project's on-chain treasury that funds task rewards.",
      resultingState:
        "The treasury balance increases on-chain (tracked on-chain only, no database sync); more reward funding is available for tasks.",
      buildEndpoint: "POST /api/v2/tx/project/user/treasury/add-funds",
      link: LIFECYCLE_LINK,
    },
  ],
};
