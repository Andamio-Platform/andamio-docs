import {
  EARN,
  LOOP,
  ONBOARD,
  ROLE_CARDS,
  ROLES,
  SETUP,
  type Action,
} from "./issuer-actions-data";
import type { JsxTag } from "./jsx-scan";

/* Markdown for the Issuer card components, so a page's text form carries what
   its cards show. Each known tag, with exactly the props listed here, becomes
   markdown written from lib/issuer-actions-data.ts. Anything else using one of
   these names fails: scripts/check-issuer-cards.ts reports it before the build,
   and lib/mdx-markdown.ts throws if it reaches the build anyway. */

function code(s: string): string {
  return `\`${s}\``;
}

function actionLines(a: Action): string[] {
  const signer =
    a.role === "andamio"
      ? "no one (one call: Andamio builds, sponsors and submits the transaction)"
      : ROLES[a.role].label;
  const lines = [`**${a.title}**`];
  if (a.note) lines.push(`- Note: ${a.note}`);
  lines.push(`- Signed by: ${signer}`);
  lines.push(`- ${a.routes.length > 1 ? "Routes" : "Route"}: ${a.routes.map(code).join(", ")}`);
  lines.push(`- Poll: ${code(a.poll)}`);
  return lines;
}

/* Numbered actions keep their number as the list marker; sub-bullets indent
   under it. */
function actionList(actions: Action[]): string {
  return actions
    .map((a) => {
      const [head, ...rest] = actionLines(a);
      const marker = `${a.n}. `;
      const pad = " ".repeat(marker.length);
      return [marker + head, ...rest.map((l) => pad + l)].join("\n");
    })
    .join("\n");
}

const RENDER: Record<string, Record<string, () => string>> = {
  OnboardCard: { "": () => actionLines(ONBOARD).join("\n") },
  ActionCards: {
    'stage="setup"': () => actionList(SETUP),
    'stage="earn"': () => actionList(EARN),
  },
  RoleCards: {
    "": () =>
      [
        "| Role | What they do | How they get it |",
        "|---|---|---|",
        ...ROLE_CARDS.map((r) => `| ${ROLES[r.role].label} | ${r.does} | ${r.how} |`),
      ].join("\n"),
  },
  CredentialLoop: {
    "": () => LOOP.map((l, i) => `${i + 1}. **${l.step}**: ${l.body}`).join("\n"),
  },
};

/** Card components that have a markdown form. */
export const ISSUER_CARD_COMPONENTS = Object.keys(RENDER);

/* The props as written, normalised to `a="x" b="y"` in source order, or null
   when they are not all plain string props. */
function normaliseProps(raw: string): string | null {
  const body = raw.trim();
  if (body === "") return "";
  const props = [...body.matchAll(/([A-Za-z][\w-]*)="([^"]*)"/g)];
  const rebuilt = props.map((m) => m[0]).join(" ");
  if (rebuilt.replace(/\s+/g, "") !== body.replace(/\s+/g, "")) return null;
  return rebuilt;
}

/** The markdown for one Issuer card tag (see `scanJsxTags`), or why it has none. */
export function renderIssuerCard(tag: JsxTag): { markdown: string } | { problem: string } {
  const written = `<${tag.name}${tag.attrs}${tag.selfClosing ? "/>" : ">"}`;
  if (!tag.selfClosing) return { problem: `${written}: card tags must be self-closing` };
  const props = normaliseProps(tag.attrs);
  const fn = props === null ? undefined : RENDER[tag.name]?.[props];
  if (!fn) {
    const known = Object.keys(RENDER[tag.name] ?? {})
      .map((p) => `<${tag.name}${p ? ` ${p}` : ""} />`)
      .join(", ");
    return { problem: `${written}: no markdown form for these props (known: ${known})` };
  }
  return { markdown: fn() };
}
