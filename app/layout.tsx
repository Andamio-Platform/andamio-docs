import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import localFont from 'next/font/local';
import { GeistMono } from 'geist/font/mono';
import type { ReactNode } from 'react';

// Body: Mona Sans (GitHub's industrial grotesque) — self-hosted, OFL.
const monaSans = localFont({
  variable: '--font-mona',
  display: 'swap',
  src: [
    { path: './fonts/MonaSans-Light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/MonaSans-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/MonaSans-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/MonaSans-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/MonaSans-Bold.woff2', weight: '700', style: 'normal' },
  ],
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${monaSans.variable} ${GeistMono.variable} ${monaSans.className}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
