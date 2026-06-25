"use client";

/**
 * BadgeAnatomyExplorer — a full-width, non-scrolling interactive view of the
 * four layers of an Andamio Credential Badge.
 *
 * Used ONLY on content/docs/credential-badges/index.mdx (paired with `full: true`
 * frontmatter for full-width). Reader clicks a layer in the rail — or its hotspot
 * on the badge — and the badge highlight + detail panel update in place, no page
 * scroll. Content (and every live / coming / in-dev label) comes verbatim from
 * ./anatomy-layers; this component adds no facts.
 *
 * Desktop (lg+): rail | badge stage | detail panel, in a bounded-height canvas.
 * Mobile: degrades to a scrollable stack so all content stays reachable.
 *
 * Accessibility: the rail is an ARIA tablist (roving tabindex, arrow/Home/End
 * keys); the detail panel is the tabpanel. Badge hotspots are a pointer
 * enhancement layered on top of the accessible rail.
 */

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { LAYERS, type ClaimLabel, type Layer } from "./anatomy-layers";

const BADGE_SRC = "/images/credential-badges/credential-badge-sample.svg";

const LABEL_META: Record<
  ClaimLabel,
  { text: string; className: string; dot: string }
> = {
  live: {
    text: "Live",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  coming: {
    text: "Coming",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30",
    dot: "bg-amber-500",
  },
  "in-dev": {
    text: "In dev",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30",
    dot: "bg-sky-500",
  },
};

function LabelChip({ label }: { label: ClaimLabel }) {
  const meta = LABEL_META[label];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${meta.className}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.text}
    </span>
  );
}

function LayerDetail({ layer }: { layer: Layer }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
        Layer {layer.n}
      </p>
      <h3 className="mt-1 text-xl font-semibold text-fd-foreground">{layer.title}</h3>

      <p className="mt-4 text-sm leading-relaxed text-fd-foreground/90">
        <span className="font-semibold text-fd-foreground">What it is. </span>
        {layer.what}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-fd-foreground/90">
        <span className="font-semibold text-fd-foreground">Why it matters. </span>
        {layer.why}
      </p>

      <ul className="mt-5 space-y-2.5">
        {layer.claims.map((claim, i) => (
          <li
            key={i}
            className="flex gap-2.5 rounded-lg border border-fd-border bg-fd-card/50 p-3 text-sm text-fd-foreground/90"
          >
            <LabelChip label={claim.label} />
            <span className="leading-relaxed">{claim.text}</span>
          </li>
        ))}
      </ul>

      {layer.link && (
        <a
          href={layer.link.href}
          className="mt-4 inline-block text-sm font-medium text-fd-accent-foreground underline underline-offset-4 hover:opacity-80"
        >
          {layer.link.label} →
        </a>
      )}
    </div>
  );
}

export default function BadgeAnatomyExplorer() {
  const [selected, setSelected] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = LAYERS[selected];

  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = `${baseId}-panel`;

  function onRailKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    let next = selected;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (selected + 1) % LAYERS.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      next = (selected - 1 + LAYERS.length) % LAYERS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = LAYERS.length - 1;
    else return;
    e.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="not-prose my-6">
      {/* ---------- Desktop: bounded, non-scrolling canvas ---------- */}
      <div className="hidden lg:grid lg:h-[min(78vh,760px)] lg:grid-cols-[15rem_minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-5">
        {/* Rail */}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Badge anatomy layers"
          onKeyDown={onRailKeyDown}
          className="flex flex-col gap-2 overflow-y-auto"
        >
          {LAYERS.map((layer, i) => {
            const isActive = i === selected;
            return (
              <button
                key={layer.id}
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
                    {layer.n}
                  </span>
                  <span className="text-sm font-semibold">{layer.title}</span>
                </span>
                <span className="mt-1 block text-xs text-fd-muted-foreground">
                  {layer.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Badge stage */}
        <div className="flex min-h-0 flex-col items-center justify-center">
          <div className="relative aspect-square w-full max-w-[min(100%,52vh)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BADGE_SRC}
              alt="Andamio Proof Rings credential badge: Andamio for Developers, Module 3 — App Template"
              className="size-full object-contain"
            />
            {LAYERS.map((layer, i) => {
              const isActive = i === selected;
              return (
                <button
                  key={layer.id}
                  type="button"
                  aria-label={`Layer ${layer.n}: ${layer.title}`}
                  onClick={() => setSelected(i)}
                  style={{ left: `${layer.hotspot.x}%`, top: `${layer.hotspot.y}%` }}
                  className={`absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold shadow-md ring-2 transition-transform motion-reduce:transition-none ${
                    isActive
                      ? "z-10 scale-125 bg-fd-accent-foreground text-fd-accent ring-fd-accent-foreground"
                      : "bg-fd-card/90 text-fd-foreground ring-fd-border hover:scale-110"
                  }`}
                >
                  {layer.n}
                </button>
              );
            })}
          </div>
          <p className="mt-2 max-w-prose text-center text-xs text-fd-muted-foreground">
            Real Proof Rings badge — <em>Andamio for Developers, Module 3</em>. Rendered from the
            current generator; badge art is presentation-layer and mutable.
          </p>
        </div>

        {/* Detail panel */}
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(selected)}
          tabIndex={0}
          className="overflow-y-auto rounded-2xl border border-fd-border bg-fd-card p-5"
        >
          <LayerDetail layer={active} />
        </div>
      </div>

      {/* ---------- Mobile: scrollable stack, all content reachable ---------- */}
      <div className="space-y-5 lg:hidden">
        <div className="mx-auto max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BADGE_SRC}
            alt="Andamio Proof Rings credential badge: Andamio for Developers, Module 3 — App Template"
            className="w-full object-contain"
          />
          <p className="mt-2 text-center text-xs text-fd-muted-foreground">
            Real Proof Rings badge — <em>Andamio for Developers, Module 3</em>.
          </p>
        </div>
        {LAYERS.map((layer) => (
          <section
            key={layer.id}
            className="rounded-2xl border border-fd-border bg-fd-card p-5"
          >
            <LayerDetail layer={layer} />
          </section>
        ))}
      </div>
    </div>
  );
}
