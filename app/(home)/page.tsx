import Link from "next/link";

/* Editorial home page — the bold front door. Mono kicker + Sora headline in
   docs' own tokens, then a few quick, low-friction calls to action. Static /
   CSS-only; the calm reading experience lives behind /docs and is untouched. */

const ENTRIES = [
  {
    n: "01",
    title: "Protocol",
    body: "Validators, transactions, and tokens — the on-chain machinery, specified.",
    href: "/docs/protocol",
    cta: "Read the protocol",
  },
  {
    n: "02",
    title: "Guides",
    body: "Build, publish, and verify on Andamio with step-by-step walkthroughs.",
    href: "/docs",
    cta: "Start building",
  },
  {
    n: "03",
    title: "API Reference",
    body: "REST endpoints to issue, verify, and gate on credentials from your own stack.",
    href: "https://api.andamio.io",
    cta: "Open the API docs",
  },
  {
    n: "04",
    title: "Issuer",
    body: "Issue and manage on-chain credentials with a low-code, API-backed product.",
    href: "/docs/issuer",
    cta: "Explore Issuer",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 sm:px-10">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
          <span>Andamio / Documentation</span>
          <span aria-hidden className="h-px flex-1 bg-border" />
        </div>

        <h1 className="mt-10 max-w-3xl font-display text-5xl font-bold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-7xl">
          Build on <span className="text-brand">Andamio</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
          Issue verifiable, on-chain credentials. Pick where to start — you can
          go deeper from anywhere.
        </p>

        <div className="mt-8 flex flex-wrap gap-px">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 bg-foreground px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90"
          >
            Get Started
            <span aria-hidden>&rarr;</span>
          </Link>
          <Link
            href="https://api.andamio.io"
            className="inline-flex items-center px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground ring-1 ring-inset ring-border transition-colors hover:bg-accent"
          >
            API Reference
          </Link>
        </div>
      </section>

      {/* ── Quick paths ────────────────────────────────────────── */}
      <section className="grid gap-px sm:grid-cols-4">
        {ENTRIES.map((e) => (
          <Link
            key={e.n}
            href={e.href}
            className="group relative flex flex-col overflow-hidden border-b border-border py-10 sm:border-b-0 sm:py-14 sm:pr-8 sm:[&:not(:first-child)]:pl-8 sm:[&:not(:last-child)]:border-r"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-2 right-2 font-display text-7xl font-bold tabular-nums tracking-[-0.05em] text-foreground/[0.04] sm:text-8xl"
            >
              {e.n}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {e.n}
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
              {e.title}
            </h2>
            <p className="mt-2 max-w-xs text-sm font-light leading-relaxed text-muted-foreground">
              {e.body}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-brand">
              {e.cta}
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </span>
          </Link>
        ))}
      </section>

      {/* ── Footer caption ─────────────────────────────────────── */}
      <div className="border-t border-border py-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Live on Cardano mainnet &middot; Audited by TxPipe
      </div>
    </main>
  );
}
