import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/* Issuer "Roles and actions" page: onboarding, the roles, the credential loop
   and the action cards. Each card after onboarding repeats the loop with its
   own signer and read route, so the page shows one loop shared by every role. */

type Role = "andamio" | "owner" | "teacher" | "learner";

const ROLES: Record<Role, { label: string; badge: string; fill: string }> = {
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

type Action = {
  n: number;
  title: string;
  note?: string;
  role: Role;
  routes: string[];
  poll: string;
};

/* Minting the access token is not one of the six actions; it has no number. */
const ONBOARD: Action = {
  n: 0,
  title: "Give someone an access token",
  role: "andamio",
  routes: ["POST /accounts/create"],
  poll: "GET /addresses/{address}/accounts",
};

const SETUP: Action[] = [
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

const EARN: Action[] = [
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

const LOOP = [
  { step: "Build", body: "POST the action. Andamio returns an unsigned transaction." },
  { step: "Sign", body: "The person taking the action signs it in their wallet." },
  { step: "Submit", body: "POST /submit. Andamio adds its sponsorship and submits it." },
  { step: "Poll", body: "Read the action's route until the result shows." },
];

function Chevron() {
  return <ArrowRight aria-hidden className="size-3.5 shrink-0 text-fd-muted-foreground" />;
}

/* The loop as four large steps. */
export function CredentialLoop() {
  return (
    <ol className="not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
      {LOOP.map((l, i) => (
        <li key={l.step} className="relative rounded-xl border border-fd-border bg-fd-card p-4">
          <div className="font-mono text-[11px] tracking-[0.14em] text-fd-muted-foreground">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="mt-1 font-display text-lg font-semibold tracking-tight">{l.step}</div>
          <p className="mt-1 text-sm text-fd-muted-foreground">{l.body}</p>
        </li>
      ))}
    </ol>
  );
}

function Segment({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

/* The loop as it runs for one action: the signer and the read change. */
function MiniLoop({ action }: { action: Action }) {
  const role = ROLES[action.role];
  if (action.role === "andamio") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <Segment className="bg-fd-muted text-fd-foreground">One call. Andamio builds, sponsors and submits</Segment>
        <Chevron />
        <Segment className="border border-fd-border text-fd-muted-foreground">
          Poll <code className="font-mono text-[11px]">{action.poll}</code>
        </Segment>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Segment className="border border-fd-border text-fd-muted-foreground">Build</Segment>
      <Chevron />
      <Segment className={role.fill}>Sign · {role.label}</Segment>
      <Chevron />
      <Segment className="border border-fd-border text-fd-muted-foreground">Submit</Segment>
      <Chevron />
      <Segment className="border border-fd-border text-fd-muted-foreground">
        Poll <code className="font-mono text-[11px]">{action.poll}</code>
      </Segment>
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  const role = ROLES[action.role];
  const indent = action.n > 0 ? "ps-6" : "";
  return (
    <li className="rounded-xl border border-fd-border bg-fd-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-baseline gap-3">
          {action.n > 0 ? (
            <span className="font-mono text-sm text-fd-muted-foreground">{action.n}</span>
          ) : null}
          <div>
            <div className="font-display text-base font-semibold tracking-tight">{action.title}</div>
            {action.note ? <div className="text-sm text-fd-muted-foreground">{action.note}</div> : null}
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${role.badge}`}>
          {role.label}
        </span>
      </div>
      <div className={`mt-3 space-y-1 ${indent}`}>
        {action.routes.map((r) => (
          <code key={r} className="block break-all font-mono text-xs text-fd-foreground">
            {r}
          </code>
        ))}
      </div>
      <div className={`mt-4 ${indent}`}>
        <MiniLoop action={action} />
      </div>
    </li>
  );
}

export function OnboardCard() {
  return (
    <ol className="not-prose my-4">
      <ActionCard action={ONBOARD} />
    </ol>
  );
}

/* The three roles. Course owner and teacher are granted; a learner is anyone
   holding an access token who submits evidence. */
const ROLE_CARDS: { role: Role; how: string; does: string }[] = [
  {
    role: "owner",
    how: "Whoever creates the course.",
    does: "Creates the course and names its teachers.",
  },
  {
    role: "teacher",
    how: "Named by the course owner.",
    does: "Defines credentials and accepts evidence.",
  },
  {
    role: "learner",
    how: "Not granted. Anyone with an access token who submits evidence.",
    does: "Submits evidence and claims the credential.",
  },
];

export function RoleCards() {
  return (
    <ul className="not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ROLE_CARDS.map((r) => {
        const role = ROLES[r.role];
        return (
          <li key={r.role} className="rounded-xl border border-fd-border bg-fd-card p-4">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${role.badge}`}>
              {role.label}
            </span>
            <p className="mt-3 text-sm font-medium text-fd-foreground">{r.does}</p>
            <p className="mt-1 text-sm text-fd-muted-foreground">{r.how}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function ActionCards({ stage }: { stage: "setup" | "earn" }) {
  const actions = stage === "setup" ? SETUP : EARN;
  return (
    <ol className="not-prose my-4 space-y-3">
      {actions.map((a) => (
        <ActionCard key={a.n} action={a} />
      ))}
    </ol>
  );
}
