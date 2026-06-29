import Link from "next/link";
import { LargeSearchToggle } from "fumadocs-ui/components/layout/search-toggle";

/* Documentation entry point — search-forward, then a browse-by-section index
   that mirrors the six-root IA spine. Editorial brand tokens (mono kickers,
   Sora display, thin rules) are kept; the marketing chrome (oversized hero,
   ghost numerals, CTA buttons, trust footer) is dialed down so the page reads
   as an index, not a landing page. */

/* The six roots. api/, apps-tooling/, and developer-community/ do not exist as
   routes yet — they are created in the Phase 2 IA restructure (Phase C). Until
   then each card targets the root's best current page, which stays correct once
   the restructure's permanent redirects land. */
const SECTIONS = [
  {
    kicker: "Product",
    title: "Andamio API",
    body: "REST endpoints and guides to build on the protocol from your own stack.",
    href: "/docs/getting-started",
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
    href: "/docs/guides",
  },
  {
    kicker: "Zone",
    title: "Developer Community",
    body: "Pioneers, the repositories index, and community tools.",
    href: "/docs/pioneers",
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
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-5xl">
          Build on <span className="text-brand">Andamio</span>
        </h1>
        <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-muted-foreground">
          Everything to issue, verify, and gate on-chain credentials. Search the
          docs, or pick a section below.
        </p>

        <LargeSearchToggle className="mt-8 w-full max-w-xl" />

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          New here?{" "}
          <Link href="/docs/getting-started" className="text-brand hover:underline">
            Start with the Quickstart &rarr;
          </Link>
          <span aria-hidden className="px-2 text-border">
            /
          </span>
          <Link
            href="https://api.andamio.io"
            className="text-foreground hover:underline"
          >
            API Reference &#8599;
          </Link>
        </p>
      </section>

      {/* ── Browse by section (the six-root spine) ─────────────── */}
      <section>
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Browse by section
        </div>
        <div className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group relative flex flex-col border-b border-r border-border p-6 transition-colors hover:bg-accent sm:p-7"
            >
              <span
                aria-hidden
                className="absolute right-5 top-6 font-mono text-sm text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
              >
                &rarr;
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.kicker}
              </span>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground">
                {s.title}
              </h2>
              <p className="mt-2 max-w-[26ch] text-sm font-light leading-relaxed text-muted-foreground">
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
