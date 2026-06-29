"use client";

/**
 * TransactionStepper — a full-width, non-scrolling interactive view of a
 * protocol transaction sequence. Reader clicks a step in the rail — or uses the
 * keyboard — and the step-track highlight + detail panel update in place, no
 * page scroll.
 *
 * This is the DATA-DRIVEN clone of <BadgeAnatomyExplorer>: it lifts that
 * component's accessible **rail** (ARIA tablist, roving tabindex, Arrow/Home/End)
 * and **detail panel** (role=tabpanel) verbatim, but takes its content via a
 * `steps` prop instead of a hardcoded module — so one component renders every
 * sequence (onboarding, course-*, project-*). Pair with `full: true` frontmatter
 * for true full-width.
 *
 * The middle "stage" column does NOT clone the badge image + hotspots (those are
 * image-specific). It is a net-new minimal **step-track**: a vertical/horizontal
 * line of numbered nodes showing sequence position, current step highlighted.
 * It is decorative (aria-hidden) — the rail + panel carry all real semantics.
 *
 * Per-step grammar: Actor → Transaction → on-chain effect (validatorAction +
 * tokenDelta) → resulting state, plus an optional build endpoint and link.
 *
 * Desktop (lg+): rail | step-track | detail panel, in a bounded-height canvas.
 * Mobile: degrades to a scrollable stack so all steps stay reachable.
 *
 * Accessibility: the rail is an ARIA tablist (roving tabindex, arrow/Home/End
 * keys); the detail panel is the tabpanel.
 */

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { Step } from "./sequences/types";

function StepDetail({ step }: { step: Step }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
        Step {step.n}
      </p>
      <h3 className="mt-1 text-xl font-semibold text-fd-foreground">{step.transaction}</h3>

      <dl className="mt-5 space-y-3">
        <div className="rounded-lg border border-fd-border bg-fd-card/50 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
            Actor
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-fd-foreground/90">{step.actor}</dd>
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-card/50 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
            On-chain effect
          </dt>
          <dd className="mt-1 space-y-1 text-sm leading-relaxed text-fd-foreground/90">
            <p>
              <span className="font-semibold text-fd-foreground">Validator action. </span>
              <code className="rounded bg-fd-muted px-1 py-0.5 text-xs">
                {step.validatorAction}
              </code>
            </p>
            <p>
              <span className="font-semibold text-fd-foreground">Token Δ. </span>
              {step.tokenDelta}
            </p>
          </dd>
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-card/50 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
            Resulting state
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-fd-foreground/90">
            {step.resultingState}
          </dd>
        </div>

        {step.buildEndpoint && (
          <div className="rounded-lg border border-fd-border bg-fd-card/50 p-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
              Build endpoint
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-fd-foreground/90">
              <code className="break-all rounded bg-fd-muted px-1 py-0.5 text-xs">
                {step.buildEndpoint}
              </code>
            </dd>
          </div>
        )}
      </dl>

      {step.link && (
        <a
          href={step.link.href}
          className="mt-4 inline-block text-sm font-medium text-fd-accent-foreground underline underline-offset-4 hover:opacity-80"
        >
          {step.link.label} →
        </a>
      )}
    </div>
  );
}

/**
 * StepTrack — net-new, minimal sequence-position visualization for the middle
 * column. Decorative only (aria-hidden): the rail carries the real semantics.
 * Renders a vertical line of numbered nodes; the active step is highlighted.
 */
function StepTrack({ steps, selected }: { steps: Step[]; selected: number }) {
  return (
    <div
      aria-hidden
      className="flex min-h-0 flex-col items-center justify-center"
    >
      <ol className="relative flex flex-col gap-6">
        {/* connecting line */}
        <span
          className="absolute left-[15px] top-3 bottom-3 w-px bg-fd-border"
          aria-hidden
        />
        {steps.map((step, i) => {
          const isActive = i === selected;
          const isDone = i < selected;
          return (
            <li key={step.id} className="relative flex items-center gap-3">
              <span
                className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors motion-reduce:transition-none ${
                  isActive
                    ? "bg-fd-accent-foreground text-fd-accent ring-2 ring-fd-accent-foreground"
                    : isDone
                      ? "bg-fd-muted text-fd-foreground"
                      : "bg-fd-card text-fd-muted-foreground ring-1 ring-fd-border"
                }`}
              >
                {step.n}
              </span>
              <span
                className={`text-xs ${
                  isActive
                    ? "font-semibold text-fd-foreground"
                    : "text-fd-muted-foreground"
                }`}
              >
                {step.transaction}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export interface TransactionStepperProps {
  steps: Step[];
  title?: string;
  intro?: string;
}

export default function TransactionStepper({ steps, title, intro }: TransactionStepperProps) {
  const [selected, setSelected] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!steps || steps.length === 0) return null;

  const active = steps[selected];
  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = `${baseId}-panel`;

  function onRailKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    let next = selected;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (selected + 1) % steps.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      next = (selected - 1 + steps.length) % steps.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = steps.length - 1;
    else return;
    e.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="not-prose my-6">
      {(title || intro) && (
        <div className="mb-5">
          {title && <h2 className="text-2xl font-semibold text-fd-foreground">{title}</h2>}
          {intro && (
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-fd-muted-foreground">
              {intro}
            </p>
          )}
        </div>
      )}

      {/* ---------- Desktop: bounded, non-scrolling canvas ---------- */}
      <div className="hidden lg:grid lg:h-[min(78vh,760px)] lg:grid-cols-[16rem_minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-5">
        {/* Rail */}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label={title ? `${title} steps` : "Transaction sequence steps"}
          onKeyDown={onRailKeyDown}
          className="flex flex-col gap-2 overflow-y-auto"
        >
          {steps.map((step, i) => {
            const isActive = i === selected;
            return (
              <button
                key={step.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={tabId(i)}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setSelected(i)}
                className={`rounded-xl border p-3 text-left transition-colors motion-reduce:transition-none ${
                  isActive
                    ? "border-fd-accent-foreground/40 bg-fd-accent text-fd-accent-foreground"
                    : "border-fd-border bg-fd-card hover:bg-fd-muted/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-fd-accent-foreground text-fd-accent"
                        : "bg-fd-muted text-fd-muted-foreground"
                    }`}
                    aria-hidden
                  >
                    {step.n}
                  </span>
                  <span className="text-sm font-semibold">{step.transaction}</span>
                </span>
                <span className="mt-1 block text-xs text-fd-muted-foreground">{step.actor}</span>
              </button>
            );
          })}
        </div>

        {/* Step-track stage (decorative) */}
        <StepTrack steps={steps} selected={selected} />

        {/* Detail panel */}
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(selected)}
          tabIndex={0}
          className="overflow-y-auto rounded-2xl border border-fd-border bg-fd-card p-5"
        >
          <StepDetail step={active} />
        </div>
      </div>

      {/* ---------- Mobile: scrollable stack, all steps reachable ---------- */}
      <div className="space-y-5 lg:hidden">
        {steps.map((step) => (
          <section
            key={step.id}
            className="rounded-2xl border border-fd-border bg-fd-card p-5"
          >
            <StepDetail step={step} />
          </section>
        ))}
      </div>
    </div>
  );
}
