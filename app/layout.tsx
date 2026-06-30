import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

// Brand canon (andamio-brand-guide.md §4, locked 2026-06-28):
//   Sans (display + UI) = Inter; Mono = JetBrains Mono. Never a serif.
// Loaded as CSS variables and consumed by --font-sans / --font-heading /
// --font-display / --font-mono in global.css. Inter and JetBrains Mono are
// variable fonts, so the full weight axis (incl. the 300 body and 600
// display weights the brand calls for) is available without listing weights.
const inter = Inter({
  variable: '--font-inter',
  display: 'swap',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  display: 'swap',
  subsets: ['latin'],
});

// Curated section toggles for the ⌘K search dialog. Each `value` is a root slug
// emitted as the index `tag` in app/api/search/route.ts. Kept to the five
// sections people actually scope to — the other roots (developer-community,
// contract-verification, security-audit, glossary) stay fully searchable with
// no tag selected, just off the toggle bar to keep it uncluttered. No default
// tag (search-everything by default); allowClear lets a chosen scope be reset.
const searchTags = [
  { name: 'API', value: 'api' },
  { name: 'Issuer', value: 'issuer' },
  { name: 'Apps & Tooling', value: 'apps-tooling' },
  { name: 'Protocol', value: 'protocol' },
  { name: 'Credential Badges', value: 'credential-badges' },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${inter.className}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{ options: { tags: searchTags, allowClear: true } }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
