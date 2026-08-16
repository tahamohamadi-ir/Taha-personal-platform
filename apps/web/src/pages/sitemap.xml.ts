import type { APIRoute } from "astro";
import { site } from "../data/site";
import { getPublishedArticles } from "../lib/cms/articles";

export const prerender = true;

export const GET: APIRoute = async () => {
  const staticPaths = [
    "/",
    "/en/",
    "/fa/",
    "/en/about/",
    "/fa/about/",
    "/en/cv/",
    "/fa/cv/",
    "/en/blog/",
    "/fa/blog/",
  ];

  const staticEntries = staticPaths
    .map((path) => `  <url><loc>${new URL(path, site.url).href}</loc></url>`)
    .join("\n");

  const articleEntries: string[] = [];
  for (const locale of site.locales) {
    const articles = await getPublishedArticles(locale);
    for (const article of articles) {
      const path = `/${locale}/blog/${article.slug}/`;
      const lastmod = article.updated_at ?? article.published_at;
      const lastmodTag = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : "";
      articleEntries.push(
        `  <url><loc>${new URL(path, site.url).href}</loc>${lastmodTag}<changefreq>monthly</changefreq><priority>0.7</priority></url>`,
      );
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${articleEntries.join("\n")}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
