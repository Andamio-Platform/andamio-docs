import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import {
  EARN,
  LOOP,
  ONBOARD,
  ROLE_CARDS,
  ROLES,
  SETUP,
  type Action,
} from "@/lib/issuer-actions-data";

/* Issuer "Roles and actions" page: onboarding, the roles, the credential loop
   and the action cards. Each card after onboarding repeats the loop with its
   own signer and read route, so the page shows one loop shared by every role.
   The data lives in lib/issuer-actions-data.ts, which the page's markdown form
   also reads. */

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
