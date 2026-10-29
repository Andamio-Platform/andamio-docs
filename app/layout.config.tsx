import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

/**
 * Shared layout configurations
 *
 * Used by the docs layout (app/docs/layout.tsx). `/` redirects to /docs, so
 * there is no separate home layout.
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Image
          src="/logo-with-typography.png"
          width={128}
          height={24}
          alt="Andamio Logo"
          className="dark:hidden"
        />
        <Image
          src="/logo-with-typography-dark.png"
          width={128}
          height={24}
          alt="Andamio Logo"
          className="hidden dark:block"
        />
      </>
    ),
    url: "https://andamio.io",
  },
  // Guides lives in the docs sidebar tree (below Home), not as a nav link,
  // so Home can sit at the very top of the sidebar.
  links: [],
};
