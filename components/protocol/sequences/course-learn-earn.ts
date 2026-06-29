/**
 * course-learn-earn — the Student path from enrolling to claiming a credential.
 *
 * Re-composed (no new facts) from:
 *   state-machine/course/student-assignment-commit.mdx
 *   state-machine/course/student-assignment-update.mdx
 *   state-machine/course/teacher-assignments-assess.mdx
 *   state-machine/course/student-credential-claim.mdx
 *
 * Each step links once to the Surface 1 lifecycle; it is not re-described here.
 */

import { LIFECYCLE_LINK, type Sequence } from "@/components/protocol/sequences/types";

export const courseLearnEarn: Sequence = {
  id: "course-learn-earn",
  title: "Course · Learn & earn",
  intro:
    "A student enrolls by committing to an assignment, revises their evidence, has a teacher assess it, and — once all commitments are accepted — claims a credential NFT and recovers their deposit.",
  steps: [
    {
      id: "commit-assignment",
      n: 1,
      actor: "Student",
      transaction: "Commit to Assignment",
      validatorAction: "course_state: CommitAssignment",
      tokenDelta:
        "On first commit, mints the student's course-state token (enrollment) and records the assignment commitment in one step; later commits add an assignment without re-minting. A recoverable course-state deposit is locked.",
      resultingState:
        "Student is enrolled in the course; the assignment commitment with its evidence hash is on-chain.",
      buildEndpoint: "POST /api/v2/tx/course/student/assignment/commit",
      link: LIFECYCLE_LINK,
    },
    {
      id: "update-assignment",
      n: 2,
      actor: "Student",
      transaction: "Update Assignment",
      validatorAction: "assignment_validator: StudentAction",
      tokenDelta:
        "No mint or burn — updates the on-chain assignment datum with revised evidence (optionally committing to a new module in the same transaction).",
      resultingState:
        "The assignment commitment carries the student's revised evidence, ready for teacher assessment.",
      buildEndpoint: "POST /api/v2/tx/course/student/assignment/update",
      link: LIFECYCLE_LINK,
    },
    {
      id: "assess-assignments",
      n: 3,
      actor: "Teacher",
      transaction: "Assess Assignments",
      validatorAction: "assignment_validator: Accept",
      tokenDelta:
        "No mint or burn — records an accept or refuse decision per student in the on-chain assignment state (decisions can be batched).",
      resultingState:
        "Each assessed commitment is marked accepted or refused on-chain. Refused work can be revised and resubmitted; accepted work counts toward the credential.",
      buildEndpoint: "POST /api/v2/tx/course/teacher/assignments/assess",
      link: LIFECYCLE_LINK,
    },
    {
      id: "claim-credential",
      n: 4,
      actor: "Student",
      transaction: "Claim Course Credential",
      validatorAction: "course_state: BurnCourseState",
      tokenDelta:
        "Mints a course credential NFT directly to the student's wallet, burns the course-state (enrollment) token, and refunds the enrollment deposit — a net ADA gain for the student.",
      resultingState:
        "The student holds a verifiable course-credential NFT on-chain; the enrollment deposit is returned.",
      buildEndpoint: "POST /api/v2/tx/course/student/credential/claim",
      link: LIFECYCLE_LINK,
    },
  ],
};
