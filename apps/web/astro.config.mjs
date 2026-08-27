// @ts-check
import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

/*
  WF-06 Visual Atlas (local-only): /_design/ is injected ONLY when
  DESIGN_ATLAS=1. In this Astro version injectRoute is an
  astro:config:setup integration-hook API, so the conditional block ships
  as a small inline integration. Default `npm run build` must stay
  atlas-free (gate G4, enforced by qa/design-atlas.spec.mjs).
*/
/** @type {import("astro").AstroIntegration} */
const designAtlas = {
  name: "design-atlas",
  hooks: {
    "astro:config:setup": ({ injectRoute }) => {
      // process is a Node runtime global; @types/node is deliberately not a
      // dependency of this package, so the literal read is untyped.
      // @ts-ignore
      if (process.env.DESIGN_ATLAS === "1") {
        injectRoute({
          pattern: "/_design",
          entrypoint: "./src/design-atlas/pages/index.astro",
          prerender: true,
        });
      }
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://tahamohamadi.ir",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [react(), designAtlas],
  env: {
    schema: {
      CMS_API_BASE: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
