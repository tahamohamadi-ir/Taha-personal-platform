// @ts-check
import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://tahamohamadi.ir",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [react()],
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
