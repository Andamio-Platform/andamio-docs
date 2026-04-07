import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Image
        src="/logo-with-typography.png"
        width={200}
        height={38}
        alt="Andamio"
        className="mb-8 dark:hidden"
        priority
      />
      <Image
        src="/logo-with-typography-dark.png"
        width={200}
        height={38}
        alt="Andamio"
        className="mb-8 hidden dark:block"
        priority
      />
      <p className="mb-10 max-w-lg text-lg text-muted-foreground">
        Protocol documentation, guides, and API reference for building on
        Andamio.
      </p>
      <div className="flex gap-4">
        <Link
          href="/docs"
          className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get Started
        </Link>
        <Link
          href="https://mainnet.api.andamio.io/reference"
          className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          API Reference
        </Link>
      </div>
    </main>
  );
}
