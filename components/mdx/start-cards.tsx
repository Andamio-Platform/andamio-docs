import Link from "next/link";
import { ArrowRight, BadgeCheck, Braces, Layers, type LucideIcon } from "lucide-react";

/* The three "What do you want to do?" cards on the /docs home. Each card names
   a goal, the product that serves it, and two facts that tell the paths apart.
   Copy is kept to matching lengths so the three cards stay balanced. */

type Path = {
  icon: LucideIcon;
  goal: string;
  product: string;
  body: string;
  facts: [string, string];
  href: string;
};

const PATHS: Path[] = [
  {
    icon: BadgeCheck,
    goal: "Issue credentials",
    product: "Andamio Issuer",
    body: "Add credentials to a program you already run.",
    facts: ["For enterprises and organizations", "No crypto to buy or hold"],
    href: "/docs/issuer",
  },
  {
    icon: Braces,
    goal: "Build an app",
    product: "Andamio API",
    body: "Let people earn and use credentials in your app.",
    facts: ["For app developers", "Courses, projects and credentials"],
    href: "/docs/api",
  },
  {
    icon: Layers,
    goal: "Use the contracts",
    product: "Protocol",
    body: "Work directly with the smart contracts on Cardano.",
    facts: ["For Cardano developers", "Audited by TxPipe"],
    href: "/docs/protocol",
  },
];

/* The quieter strip under the cards, for readers not ready to pick a path.
   Ordered read, learn, see, try. */
const EXPLORE = [
  { label: "Light paper", hint: "Why Andamio exists", href: "https://www.andamio.io/whitepaper" },
  { label: "Glossary", hint: "The key terms", href: "/docs/glossary" },
  {
    label: "See a badge",
    hint: "A live example",
    href: "https://credentials.andamio.io/badges/ae192632aabe00ed2042eaef596bc15f3887fa32e75e8f9b8fa516df.e9b5343186f83ed804a9fd87293a7378e3b237743b76d56da73b111d855631db.svg",
  },
  { label: "Earn one", hint: "Try the app", href: "https://app.andamio.io" },
];

export function ExploreLinks() {
  return (
    <div className="not-prose my-6 grid grid-cols-2 divide-fd-border lg:my-8 overflow-hidden rounded-xl border border-fd-border sm:grid-cols-4 sm:divide-x">
      {EXPLORE.map((e) => (
        <Link
          key={e.label}
          href={e.href}
          className="group flex flex-col gap-0.5 px-5 py-4 transition-colors hover:bg-fd-accent lg:py-5"
        >
          <span className="text-sm font-medium text-fd-foreground lg:text-base">{e.label}</span>
          <span className="inline-flex items-center gap-1 text-xs text-fd-muted-foreground group-hover:text-fd-primary lg:text-sm">
            {e.hint}
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function StartCards() {
  return (
    <div className="docs-home not-prose my-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:my-8 lg:gap-5">
      {PATHS.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className="group flex flex-col rounded-xl border border-fd-border bg-fd-card p-6 transition-all lg:p-7 hover:-translate-y-0.5 hover:border-fd-primary hover:shadow-lg"
        >
          <span className="flex size-11 items-center justify-center rounded-lg bg-fd-primary/12 text-fd-primary">
            <p.icon className="size-5" />
          </span>
          <span className="mt-5 text-xs font-medium text-fd-muted-foreground lg:mt-6 lg:text-sm">{p.goal}</span>
          <span className="mt-1 font-display text-xl font-semibold tracking-tight text-fd-foreground lg:text-2xl">
            {p.product}
          </span>
          <span className="mt-2 text-sm text-fd-muted-foreground lg:text-[0.9375rem]">{p.body}</span>
          <ul className="mt-5 flex-1 divide-y divide-fd-border border-t border-fd-border text-sm text-fd-foreground">
            {p.facts.map((f) => (
              <li key={f} className="py-2.5">
                {f}
              </li>
            ))}
          </ul>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fd-primary">
            Start here
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
