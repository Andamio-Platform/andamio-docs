import Link from "next/link";

/* Documentation entry point: one CTA to the /docs routing page over an index of the
   three docs roots (Andamio Issuer, Andamio API, Protocol) and the shared
   pages. Editorial brand tokens (mono kickers, Inter display, thin rules) are
   kept; the marketing chrome (oversized hero, ghost numerals, eyebrow, trust
   footer) is dialed down so the page reads as an index, not a landing page.
   Top-nav search covers find, so there is no in-page box. */

type Section = { title: string; body: string; href: string };

/* The three sidebar roots. Each card opens that root's landing page. */
const ROOTS: Section[] = [
  {
    title: "Andamio Issuer",
    body: "Issue credentials from a program you already run. Enterprise key, and Andamio sponsors the transactions.",
    href: "/docs/issuer",
  },
  {
    title: "Andamio API",
    body: "Build an app where people earn and use credentials. Developer key, plus Apps & Tooling and Credential Badges.",
    href: "/docs/api",
  },
  {
    title: "Protocol",
    body: "Build directly on the contracts. Validators, transactions, tokens, contract verification and the security audit.",
    href: "/docs/protocol",
  },
];

/* Pages shared by every root. */
const SHARED: Section[] = [
  {
    title: "Glossary",
    body: "Key terms and concepts.",
    href: "/docs/glossary",
  },
];

function SectionGrid({ label, sections }: { label: string; sections: Section[] }) {
  return (
    <section className="mb-10">
      <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="grid grid-cols-1 gap-x-12 border-t border-border sm:grid-cols-2">
        {sections.map((s) => (
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
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 sm:px-10">
      {/* ── Hero: orient, then search ──────────────────────────── */}
      <section className="py-14 sm:py-20">
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-foreground sm:text-5xl">
          Build on Andamio
        </h1>
        <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-muted-foreground">
          Everything to issue, verify, and gate on-chain credentials. Pick the
          product you use below.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/docs"
            className="flex w-fit items-center gap-2 bg-brand px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-foreground transition-opacity hover:opacity-90"
          >
            Where to start
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </section>

      {/* ── Browse: the three roots, then the shared pages ────── */}
      <SectionGrid label="Choose your product" sections={ROOTS} />
      <SectionGrid label="Shared" sections={SHARED} />

      {/* ── Quiet meta line ────────────────────────────────────── */}
      <div className="py-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Andamio Documentation &#124; 2026
      </div>
    </main>
  );
}
