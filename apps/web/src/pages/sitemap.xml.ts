import type { APIRoute } from "astro";
import { site } from "../data/site";
import { getPublishedArticles } from "../lib/cms/articles";
import {
  getResearchProjects,
  getResearchPublications,
  getResearchTopics,
} from "../lib/cms/research";
import { getBooks, getDownloads, getTalks } from "../lib/cms/publications";
import { getProjects } from "../lib/cms/projects";

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
    "/en/research/",
    "/fa/research/",
    "/en/research/statement/",
    "/fa/research/statement/",
    "/en/projects/",
    "/fa/projects/",
    "/en/publications/",
    "/fa/publications/",
    "/en/books/",
    "/fa/books/",
    "/en/talks/",
    "/fa/talks/",
    "/en/downloads/",
    "/fa/downloads/",
  ];

  const staticEntries = staticPaths
    .map((path) => `  <url><loc>${new URL(path, site.url).href}</loc></url>`)
    .join("\n");

  const dynamicEntries: string[] = [];
  for (const locale of site.locales) {
    const articles = await getPublishedArticles(locale);
    for (const article of articles) {
      const path = `/${locale}/blog/${article.slug}/`;
      const lastmod = article.updated_at ?? article.published_at;
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>`
        : "";
      dynamicEntries.push(
        `  <url><loc>${new URL(path, site.url).href}</loc>${lastmodTag}<changefreq>monthly</changefreq><priority>0.7</priority></url>`,
      );
    }

    const topics = await getResearchTopics(locale);
    for (const topic of topics) {
      const path = `/${locale}/research/topics/${topic.slug}/`;
      const lastmod = topic.updated_at ?? topic.published_at;
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>`
        : "";
      dynamicEntries.push(
        `  <url><loc>${new URL(path, site.url).href}</loc>${lastmodTag}<changefreq>monthly</changefreq><priority>0.7</priority></url>`,
      );
    }

    const projects = await getResearchProjects(locale);
    for (const project of projects) {
      const path = `/${locale}/research/projects/${project.slug}/`;
      const lastmod = project.updated_at ?? project.published_at;
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>`
        : "";
      dynamicEntries.push(
        `  <url><loc>${new URL(path, site.url).href}</loc>${lastmodTag}<changefreq>monthly</changefreq><priority>0.7</priority></url>`,
      );
    }

    const publications = await getResearchPublications(locale);
    for (const publication of publications) {
      const path = `/${locale}/publications/${publication.slug}/`;
      const lastmod = publication.updated_at ?? publication.published_at;
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>`
        : "";
      dynamicEntries.push(
        `  <url><loc>${new URL(path, site.url).href}</loc>${lastmodTag}<changefreq>monthly</changefreq><priority>0.7</priority></url>`,
      );
    }

    const books = await getBooks(locale);
    for (const book of books) {
      const path = `/${locale}/books/${book.slug}/`;
      const lastmod = book.updated_at ?? book.published_at;
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>`
        : "";
      dynamicEntries.push(
        `  <url><loc>${new URL(path, site.url).href}</loc>${lastmodTag}<changefreq>monthly</changefreq><priority>0.6</priority></url>`,
      );
    }

    const talks = await getTalks(locale);
    for (const talk of talks) {
      const path = `/${locale}/talks/${talk.slug}/`;
      const lastmod = talk.updated_at ?? talk.published_at;
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>`
        : "";
      dynamicEntries.push(
        `  <url><loc>${new URL(path, site.url).href}</loc>${lastmodTag}<changefreq>monthly</changefreq><priority>0.6</priority></url>`,
      );
    }

    const downloads = await getDownloads(locale);
    for (const download of downloads) {
      const path = `/${locale}/downloads/${download.slug}/`;
      const lastmod = download.updated_at ?? download.published_at;
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>`
        : "";
      dynamicEntries.push(
        `  <url><loc>${new URL(path, site.url).href}</loc>${lastmodTag}<changefreq>monthly</changefreq><priority>0.6</priority></url>`,
      );
    }

    const caseStudies = await getProjects(locale);
    for (const project of caseStudies) {
      const path = `/${locale}/projects/${project.slug}/`;
      const lastmod = project.updated_at ?? project.published_at;
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>`
        : "";
      dynamicEntries.push(
        `  <url><loc>${new URL(path, site.url).href}</loc>${lastmodTag}<changefreq>monthly</changefreq><priority>0.7</priority></url>`,
      );
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${dynamicEntries.join("\n")}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
