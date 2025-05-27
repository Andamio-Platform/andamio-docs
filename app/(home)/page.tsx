import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center space-y-12">
      <Image src="/andamio.png" width={150} height={150} alt="Andamio Logo" />
      <h1 className="text-4xl font-bold">Andamio Documentation</h1>
      <p className="text-fd-muted-foreground">
        Open{" "}
        <Link
          href="/docs"
          className="text-fd-foreground font-semibold underline"
        >
          /docs
        </Link>{" "}
        to see the documentation.
      </p>
    </main>
  );
}
