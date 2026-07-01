import Link from "next/link";

/* Documentation entry point — a single Quickstart CTA over a browse-by-section
   index that mirrors the six-root IA spine. Editorial brand tokens (mono
   kickers, Inter display, thin rules) are kept; the marketing chrome (oversized
   hero, ghost numerals, eyebrow, trust footer) is dialed down so the page reads
   as an index, not a landing page. Top-nav search covers find — no in-page box. */

/* The six roots — each card targets that root's index. */
const SECTIONS = [
  {
    kicker: "Product",
    title: "Andamio API",
    body: "REST endpoints and guides to build on the protocol from your own stack.",
    href: "/docs/api",
  },
  {
    kicker: "Product",
    title: "Andamio Issuer",
    body: "Issue and manage credentials with a low-code, API-backed product.",
    href: "/docs/issuer",
  },
  {
    kicker: "Product",
    title: "Credential Badges",
    body: "Verifiable, on-chain badges that learners carry anywhere.",
    href: "/docs/credential-badges",
  },
  {
    kicker: "Zone",
    title: "Apps & Tooling",
    body: "Explore the app, plus the CLI, SDK, templates, bot, and Andamioscan.",
    href: "/docs/apps-tooling",
  },
  {
    kicker: "Zone",
    title: "Developer Community",
    body: "Pioneers, the repositories index, and community tools.",
    href: "/docs/developer-community",
  },
  {
    kicker: "Reference",
    title: "Protocol",
    body: "Validators, transactions, and tokens — the on-chain machinery, specified.",
    href: "/docs/protocol",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 sm:px-10">
      {/* ── Hero: orient, then search ──────────────────────────── */}
      <section className="py-14 sm:py-20">
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-foreground sm:text-5xl">
          Build on Andamio
        </h1>
        <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-muted-foreground">
          Everything to issue, verify, and gate on-chain credentials. Pick a
          section below to dive in.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/docs/api/getting-started"
            className="flex w-fit items-center gap-2 bg-brand px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-foreground transition-opacity hover:opacity-90"
          >
            Quickstart
            <span aria-hidden>&rarr;</span>
          </Link>
          <Link
            href="/docs"
            className="flex w-fit items-center gap-2 border border-border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-brand hover:text-brand"
          >
            Open Docs
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </section>

      {/* ── Browse by section (the six-root spine) ─────────────── */}
      <section>
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Browse by section
        </div>
        <div className="grid grid-cols-1 gap-x-12 border-t border-border sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group border-b border-border py-3.5 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-base font-medium tracking-tight text-foreground transition-colors group-hover:text-brand">
                  {s.title}
                </span>
                <span
                  aria-hidden
                  className="font-mono text-sm text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                >
                  &rarr;
                </span>
              </div>
              <p className="mt-0.5 text-sm font-light leading-snug text-muted-foreground">
                {s.body}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Quiet meta line ────────────────────────────────────── */}
      <div className="py-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Andamio Documentation &#124; 2026
      </div>
    </main>
  );
}
