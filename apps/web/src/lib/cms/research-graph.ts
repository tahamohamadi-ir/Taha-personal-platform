/** Build-time Topic↔Project↔Publication graph from published CMS projections only. */

import { CmsOriginError, isCmsOriginBuild } from "./client";
import {
  getResearchProject,
  getResearchProjects,
  getResearchPublications,
  getResearchTopic,
  getResearchTopics,
  type ProjectDetailDto,
  type PublicationListDto,
  type ResearchTopicDetailDto,
} from "./research";

export type GraphNodeKind = "topic" | "project" | "publication";

export interface ResearchGraphNode {
  id: string;
  kind: GraphNodeKind;
  slug: string;
  title: string;
  href: string;
  x: number;
  y: number;
}

export interface ResearchGraphEdge {
  id: string;
  from: string;
  to: string;
}

export interface ResearchGraphLink {
  slug: string;
  title: string;
  href: string;
}

export interface ResearchGraphTreeTopic {
  slug: string;
  title: string;
  href: string;
  projects: ResearchGraphLink[];
  publications: ResearchGraphLink[];
}

export interface ResearchGraphModel {
  nodes: ResearchGraphNode[];
  edges: ResearchGraphEdge[];
  tree: ResearchGraphTreeTopic[];
  orphanProjects: ResearchGraphLink[];
  orphanPublications: ResearchGraphLink[];
  width: number;
  height: number;
}

type Locale = "fa" | "en";

function nodeId(kind: GraphNodeKind, slug: string): string {
  return `${kind}:${slug}`;
}

function layoutY(index: number, count: number, height: number, margin: number): number {
  if (count <= 1) return height / 2;
  const usable = height - margin * 2;
  return margin + (usable * index) / (count - 1);
}

/**
 * Returns null when there are no published topics/projects/publications,
 * or when no relationship edges exist (lists alone already cover that case).
 */
export async function getResearchGraph(
  locale: Locale,
): Promise<ResearchGraphModel | null> {
  const [topics, projects, publications] = await Promise.all([
    getResearchTopics(locale),
    getResearchProjects(locale),
    getResearchPublications(locale),
  ]);

  if (topics.length === 0 && projects.length === 0 && publications.length === 0) {
    return null;
  }

  const topicDetailsRaw = await Promise.all(
    topics.map((t) => getResearchTopic(locale, t.slug)),
  );
  if (isCmsOriginBuild()) {
    const missingTopics = topics.filter((_, i) => topicDetailsRaw[i] === null);
    if (missingTopics.length > 0) {
      throw new CmsOriginError(
        `research graph: missing topic detail for ${missingTopics.map((t) => t.slug).join(", ")}`,
        404,
      );
    }
  }
  const topicDetails = topicDetailsRaw.filter(
    (t): t is ResearchTopicDetailDto => t !== null,
  );

  const projectDetailsRaw = await Promise.all(
    projects.map((p) => getResearchProject(locale, p.slug)),
  );
  if (isCmsOriginBuild()) {
    const missingProjects = projects.filter((_, i) => projectDetailsRaw[i] === null);
    if (missingProjects.length > 0) {
      throw new CmsOriginError(
        `research graph: missing project detail for ${missingProjects.map((p) => p.slug).join(", ")}`,
        404,
      );
    }
  }
  const projectDetails = projectDetailsRaw.filter(
    (p): p is ProjectDetailDto => p !== null,
  );

  const pubBySlug = new Map<string, PublicationListDto>(
    publications.map((p) => [p.slug, p]),
  );

  const linkedProjectSlugs = new Set<string>();
  const linkedPublicationSlugs = new Set<string>();
  const edgeKeys = new Set<string>();
  const edges: ResearchGraphEdge[] = [];

  const addEdge = (from: string, to: string) => {
    const key = `${from}->${to}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ id: key, from, to });
  };

  const tree: ResearchGraphTreeTopic[] = [];

  for (const topic of topicDetails) {
    const topicHref = `/${locale}/research/topics/${topic.slug}/`;
    const topicProjects: ResearchGraphLink[] = [];
    const topicPubs: ResearchGraphLink[] = [];

    for (const p of topic.projects) {
      linkedProjectSlugs.add(p.slug);
      const href = `/${locale}/research/projects/${p.slug}/`;
      topicProjects.push({ slug: p.slug, title: p.title, href });
      addEdge(nodeId("topic", topic.slug), nodeId("project", p.slug));
    }

    for (const pub of topic.publications) {
      linkedPublicationSlugs.add(pub.slug);
      const href = `/${locale}/research/publications/${pub.slug}/`;
      topicPubs.push({ slug: pub.slug, title: pub.title, href });
      addEdge(nodeId("topic", topic.slug), nodeId("publication", pub.slug));
    }

    tree.push({
      slug: topic.slug,
      title: topic.title,
      href: topicHref,
      projects: topicProjects,
      publications: topicPubs,
    });
  }

  for (const project of projectDetails) {
    for (const topic of project.topics) {
      addEdge(nodeId("topic", topic.slug), nodeId("project", project.slug));
      linkedProjectSlugs.add(project.slug);
    }
    for (const pub of project.publications) {
      linkedPublicationSlugs.add(pub.slug);
      addEdge(nodeId("project", project.slug), nodeId("publication", pub.slug));
    }
  }

  if (edges.length === 0) {
    return null;
  }

  const topicNodes = topicDetails.map((t) => ({
    kind: "topic" as const,
    slug: t.slug,
    title: t.title,
    href: `/${locale}/research/topics/${t.slug}/`,
  }));

  const projectNodes = projectDetails.map((p) => ({
    kind: "project" as const,
    slug: p.slug,
    title: p.title,
    href: `/${locale}/research/projects/${p.slug}/`,
  }));

  const publicationNodes = publications.map((p) => ({
    kind: "publication" as const,
    slug: p.slug,
    title: p.title,
    href: `/${locale}/research/publications/${p.slug}/`,
  }));

  const width = 960;
  const height = Math.max(
    360,
    80 + Math.max(topicNodes.length, projectNodes.length, publicationNodes.length) * 72,
  );
  const margin = 48;
  const colX = { topic: 120, project: 480, publication: 840 };

  const nodes: ResearchGraphNode[] = [
    ...topicNodes.map((n, i) => ({
      id: nodeId(n.kind, n.slug),
      ...n,
      x: colX.topic,
      y: layoutY(i, topicNodes.length, height, margin),
    })),
    ...projectNodes.map((n, i) => ({
      id: nodeId(n.kind, n.slug),
      ...n,
      x: colX.project,
      y: layoutY(i, projectNodes.length, height, margin),
    })),
    ...publicationNodes.map((n, i) => ({
      id: nodeId(n.kind, n.slug),
      ...n,
      x: colX.publication,
      y: layoutY(i, publicationNodes.length, height, margin),
    })),
  ];

  const orphanProjects = projectDetails
    .filter((p) => !linkedProjectSlugs.has(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      href: `/${locale}/research/projects/${p.slug}/`,
    }));

  const orphanPublications = publications
    .filter((p) => !linkedPublicationSlugs.has(p.slug) && pubBySlug.has(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      href: `/${locale}/research/publications/${p.slug}/`,
    }));

  return {
    nodes,
    edges,
    tree,
    orphanProjects,
    orphanPublications,
    width,
    height,
  };
}
