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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${inter.className}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
