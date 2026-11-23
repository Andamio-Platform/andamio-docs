import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  {
    ignores: [
      ".content-collections/**",
      ".contentlayer/**",
      ".source/**",
      ".next/**",
      ".worktrees/**",
      ".vercel/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-danger": "error",
    },
  },
];

export default eslintConfig;
