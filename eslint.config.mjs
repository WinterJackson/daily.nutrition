import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "prefer-const": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "prefer-rest-params": "warn",
      "@next/next/no-html-link-for-pages": "warn"
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "prisma/**"
  ]),
]);

export default eslintConfig;
