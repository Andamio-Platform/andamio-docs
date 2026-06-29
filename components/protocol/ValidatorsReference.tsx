import React from "react";
import {
  VALIDATORS,
  VALIDATOR_LAYERS,
  type ValidatorEntry,
  type ValidatorLayer,
} from "./validators-data";

/**
 * ValidatorsReference — the rendered half of Surface 2.
 *
 * Static (no client interactivity): imports the generated, drift-guarded data
 * module and presents the 12 validators grouped under their four protocol
 * layers. Each token is explained inline in its validator's `governs` note, so
 * retiring the separate tokens/ tree loses nothing.
 *
 * Mirrors the data/render split of <BadgeAnatomyExplorer> + anatomy-layers.ts.
 * Imported directly by content/docs/protocol/v2/validators.mdx (real MDX ESM
 * import — no mdx-components registration required).
 */

const LAYER_BLURB: Record<ValidatorLayer, string> = {
  "Global registry":
    "Protocol-wide identity and the index that keeps it ordered.",
  Instances:
    "The shared container, governance, and minting authority a course or project is built on.",
  Course: "Everything that runs a single course — enrollment, modules, assignments.",
  Project:
    "Everything that runs a single project — contributors, treasury, task escrow.",
};

/** Render a minimal inline subset of Markdown: **bold** and `code`. */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-fd-foreground">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-fd-muted px-1 py-0.5 text-[0.85em] font-mono"
        >
          {match[2]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function ValidatorCard({ validator }: { validator: ValidatorEntry }) {
  return (
    <div className="rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="m-0 text-base font-semibold text-fd-foreground">
          {validator.name}
        </h4>
        <code className="text-xs text-fd-muted-foreground">{validator.id}</code>
      </div>

      <p className="mt-2 mb-0 text-sm text-fd-muted-foreground">
        {validator.purpose}
      </p>

      <div className="mt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
          Authorized actions
        </span>
        <ul className="mt-1.5 flex flex-wrap gap-1.5 p-0">
          {validator.actions.length > 0 ? (
            validator.actions.map((action) => (
              <li
                key={action}
                className="list-none rounded border border-fd-border bg-fd-secondary px-2 py-0.5 font-mono text-xs text-fd-secondary-foreground"
              >
                {action}
              </li>
            ))
          ) : (
            <li className="list-none text-xs text-fd-muted-foreground">
              (no redeemer actions)
            </li>
          )}
        </ul>
      </div>

      <div className="mt-3 border-t border-fd-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
          Governs
        </span>
        <p className="mt-1.5 mb-0 text-sm text-fd-foreground/90">
          {renderInline(validator.governs)}
        </p>
      </div>
    </div>
  );
}

export function ValidatorsReference() {
  return (
    <div className="not-prose flex flex-col gap-8">
      {VALIDATOR_LAYERS.map((layer) => {
        const inLayer = VALIDATORS.filter((v) => v.layer === layer);
        if (inLayer.length === 0) return null;
        return (
          <section key={layer}>
            <div className="mb-3">
              <h3 className="m-0 text-lg font-semibold text-fd-foreground">
                {layer}
              </h3>
              <p className="mt-1 mb-0 text-sm text-fd-muted-foreground">
                {LAYER_BLURB[layer]}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {inLayer.map((validator) => (
                <ValidatorCard key={validator.id} validator={validator} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default ValidatorsReference;
