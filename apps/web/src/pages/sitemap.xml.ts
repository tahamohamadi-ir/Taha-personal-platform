import type { APIRoute } from "astro";
import { site } from "../data/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const urls = ["/", "/en/", "/fa/", "/en/about/", "/fa/about/", "/en/cv/", "/fa/cv/"];
  const entries = urls
    .map(
      (path) =>
        `  <url><loc>${new URL(path, site.url).href}</loc></url>`,
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
