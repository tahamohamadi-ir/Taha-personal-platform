import type { APIRoute } from "astro";
import { site } from "../../../data/site";
import { content } from "../../../data/content";
import { getPublishedArticles } from "../../../lib/cms/articles";

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async () => {
  const locale = "en" as const;
  const page = content[locale];
  const articles = await getPublishedArticles(locale);
  const channelUrl = new URL(`/${locale}/writing/`, site.url).href;
  const feedUrl = new URL(`/${locale}/writing/rss.xml`, site.url).href;
  const itemsXml = articles
    .map((article) => {
      const link = new URL(`/${locale}/writing/${article.slug}/`, site.url).href;
      const pubDate = article.published_at
        ? new Date(article.published_at).toUTCString()
        : "";
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
      <description>${escapeXml(article.excerpt ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${page.blog.heading} - ${page.name}`)}</title>
    <link>${channelUrl}</link>
    <description>${escapeXml(page.blog.intro)}</description>
    <language>${locale}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
