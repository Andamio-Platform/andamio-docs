import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
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
  },
  links: [
    {
      text: "Mainnet API",
      url: "https://mainnet.api.andamio.io",
      external: true,
    },
    {
      text: "Preprod API",
      url: "https://preprod.api.andamio.io",
      external: true,
    },
  ],
};
