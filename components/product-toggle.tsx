"use client";

import { RootToggle, type Option } from "fumadocs-ui/components/layout/root-toggle";
import { usePathname } from "next/navigation";

/* The product dropdown (Andamio Issuer, Andamio API, Protocol). It renders
   only on pages inside one of those products, so the /docs home and the
   shared pages (Glossary, Developer community) show no product picker. */
export function ProductToggle({ options, className }: { options: Option[]; className?: string }) {
  const pathname = usePathname();
  const inProduct = options.some((o) => o.url === pathname || o.urls?.has(pathname));
  if (!inProduct) return null;
  return <RootToggle options={options} className={className} />;
}
