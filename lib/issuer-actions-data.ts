/* Data behind the Issuer "Roles and actions" cards. The card components in
   components/mdx/issuer-actions.tsx render it, and lib/issuer-actions-markdown.ts
   writes it out as markdown for the page's text form, so both always agree. */

export type Role = "andamio" | "owner" | "teacher" | "learner";

export const ROLES: Record<Role, { label: string; badge: string; fill: string }> = {
  andamio: {
    label: "Andamio",
    badge: "border-fd-border bg-fd-muted text-fd-muted-foreground",
    fill: "bg-fd-muted text-fd-foreground",
  },
  owner: {
    label: "Course owner",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    fill: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  },
  teacher: {
    label: "Teacher",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    fill: "bg-sky-500/15 text-sky-800 dark:text-sky-200",
  },
  learner: {
    label: "Learner",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    fill: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  },
};

export type Action = {
  n: number;
  title: string;
  note?: string;
  role: Role;
  routes: string[];
  poll: string;
};

/* Minting the access token is not one of the six actions; it has no number. */
export const ONBOARD: Action = {
  n: 0,
  title: "Give someone an access token",
  role: "andamio",
  routes: ["POST /accounts/create"],
  poll: "GET /addresses/{address}/accounts",
};

export const SETUP: Action[] = [
  {
    n: 1,
    title: "Create a course",
    role: "owner",
    routes: ["POST /courses/create"],
    poll: "GET /courses/{course_id}",
  },
  {
    n: 2,
    title: "Name the teachers",
    role: "owner",
    routes: ["POST /courses/{course_id}/teachers"],
    poll: "GET /courses/{course_id}/teachers",
  },
  {
    n: 3,
    title: "Define a credential",
    role: "teacher",
    routes: ["POST /courses/{course_id}/credentials/create"],
    poll: "GET /courses/{course_id}",
  },
];

export const EARN: Action[] = [
  {
    n: 4,
    title: "Submit evidence",
    note: "Update it until it is accepted.",
    role: "learner",
    routes: [
      "POST /courses/{course_id}/credentials/{credential_hash}/evidence/submit",
      "…/evidence/update",
    ],
    poll: "GET /accounts/{alias}/submissions",
  },
  {
    n: 5,
    title: "Accept evidence",
    note: "In batches, all or nothing.",
    role: "teacher",
    routes: ["POST /courses/{course_id}/credentials/evidence/approve"],
    poll: "GET /courses/{course_id}/credentials/issuances",
  },
  {
    n: 6,
    title: "Claim the credential",
    role: "learner",
    routes: ["POST /courses/{course_id}/credentials/claim"],
    poll: "GET /accounts/{alias}/credentials",
  },
];

export const LOOP = [
  { step: "Build", body: "POST the action. Andamio returns an unsigned transaction." },
  { step: "Sign", body: "The person taking the action signs it in their wallet." },
  { step: "Submit", body: "POST /submit. Andamio adds its sponsorship and submits it." },
  { step: "Poll", body: "Read the action's route until the result shows." },
];

/* The three roles. Course owner and teacher are granted; a learner is anyone
   holding an access token who submits evidence. */
export const ROLE_CARDS: { role: Role; how: string; does: string }[] = [
  {
    role: "owner",
    how: "Whoever creates the course.",
    does: "Creates the course and names its teachers.",
  },
  {
    role: "teacher",
    how: "Named by the course owner.",
    does: "Defines and removes credentials, and accepts evidence.",
  },
  {
    role: "learner",
    how: "Not granted. Anyone with an access token who submits evidence.",
    does: "Submits evidence and claims the credential.",
  },
];
