/**
 * course-author-operate — the Owner/Teacher path to standing up a course.
 *
 * Re-composed (no new facts) from:
 *   state-machine/course/owner-course-create.mdx
 *   state-machine/course/teacher-modules-manage.mdx
 *   state-machine/course/owner-teachers-manage.mdx
 *
 * Each step links once to the Surface 1 lifecycle; it is not re-described here.
 */

import { LIFECYCLE_LINK, type Sequence } from "@/components/protocol/sequences/types";

export const courseAuthorOperate: Sequence = {
  id: "course-author-operate",
  title: "Course · Author & operate",
  intro:
    "An owner stands up a course instance on-chain, then teachers populate it with learning modules and the owner adjusts who can teach. Each beat is a single transaction keyed on the course's policy ID.",
  steps: [
    {
      id: "create-course",
      n: 1,
      actor: "Course Owner",
      transaction: "Create Course",
      validatorAction: "instance_governance: governance action (mint course instance)",
      tokenDelta:
        "Mints a new course instance on-chain, registering the creator as owner and first teacher. Returns the course's policy ID (courseId).",
      resultingState:
        "Course instance exists on-chain; the creator is owner and first teacher; courseId is issued for all subsequent course operations.",
      buildEndpoint: "POST /api/v2/tx/instance/owner/course/create",
      link: LIFECYCLE_LINK,
    },
    {
      id: "manage-modules",
      n: 2,
      actor: "Teacher",
      transaction: "Manage Modules",
      validatorAction: "module_scripts: MintModule",
      tokenDelta:
        "Mints, updates, and/or burns module tokens in one batch — each module holds a Student Learning Target (SLT) and its criteria. Burned modules recover their UTxO deposit.",
      resultingState:
        "The course's modules are live on-chain; students can commit to them. Prerequisite chains between modules are recorded.",
      buildEndpoint: "POST /api/v2/tx/course/teacher/modules/manage",
      link: LIFECYCLE_LINK,
    },
    {
      id: "manage-teachers",
      n: 3,
      actor: "Course Owner",
      transaction: "Manage Teachers",
      validatorAction: "instance_governance: governance action (update teacher list)",
      tokenDelta:
        "No token mint or burn — updates the on-chain teacher-list datum, replacing the previous set entirely.",
      resultingState:
        "The course's teacher list is updated on-chain and mirrored to the database; only listed teachers can manage modules and assess assignments.",
      buildEndpoint: "POST /api/v2/tx/course/owner/teachers/manage",
      link: LIFECYCLE_LINK,
    },
  ],
};
