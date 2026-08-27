// WF-08 graph Phase 1 consumer QA gate (BK-05 GET /api/graph/{locale}).
// Plain Node spec, same style as the sibling specs (source-scan + one
// CMS-mocked build, p8-catalog pattern). Covers the consumer-side contract:
//
//   adapter : src/lib/cms/research-graph.ts exists, consumes the BK-05
//             camelCase envelope {nodes, edges} exactly (GraphNodePublic /
//             GraphEdgePublic field names, no invented fields, no snake_case
//             leakage), reuses the shared cmsFetchJson + throwIfCmsError
//             conventions (transport/5xx fails the build per ADR-0027
//             Slice 3), resolves null on unset base (snapshot mode) and on
//             404 (BK-05 fail-closed: no active version published), and
//             exports a pure parser that is fail-closed at render time:
//             malformed payload -> null, missing-label nodes dropped,
//             orphan edge endpoints dropped, duplicate edge ids collapsed
//             (first wins), blank relatedRecords entries dropped.
//   section : src/components/research/ResearchGraph.astro renders ONE
//             published payload as a semantic linked list BEFORE any
//             interactive island exists: ordered list, per-node type Badge +
//             label + summary, per-node edge relations with peer label and
//             stable edge id, accessible-label data surface, and a
//             data-graph-related parity surface (the payload's
//             relatedRecords family/id) shared with the future island. The
//             list renders ZERO hrefs (relatedRecords carry no slug, so no
//             URL may be invented) and renders nothing for an empty node set.
//   pages   : src/pages/{fa,en}/index.astro wire the HomeTemplate "graph"
//             slot with the section, guarded by the parsed payload (the
//             block stays omitted honestly when no graph is published);
//             src/pages/{fa,en}/research/index.astro include the same
//             section beside the CollectionIndexTemplate results.
//   build   : CMS-mocked build (BK-05 mock pattern from
//             apps/cms/tests/test_api_graph.py full_graph, extended with
//             fail-closed traps) proves the graph reaches dist home +
//             research pages per locale, that orphan/duplicate/blank-label
//             rows never render, and that the snapshot (unset base) build
//             omits the section honestly.

import { existsSync, mkdtempSync, openSync, readFileSync, closeSync, rmSync } from "node:fs";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const distDir = join(webRoot, "dist");

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

function readSource(relativePath) {
  const target = join(webRoot, relativePath);
  if (!existsSync(target)) {
    failures.push(`missing file: ${relativePath}`);
    return null;
  }
  return readFileSync(target, "utf8");
}

// Same doctrine as the sibling adopt specs: ASCII sources, token-only styles.
function doctrineScan(label, src) {
  const hex = src.match(/#[0-9a-fA-F]{3,8}\b/g);
  check(!hex, `${label}: no raw hex colors${hex ? ` (found ${hex.join(", ")})` : ""}`);
  const pxProblems = [];
  for (const line of src.split(/\r?\n/)) {
    for (const m of line.matchAll(/\b\d+px\b/g)) {
      if (!/border|outline|box-shadow/.test(line)) pxProblems.push(line.trim());
    }
  }
  check(
    pxProblems.length === 0,
    `${label}: px only inside border/outline/box-shadow declarations${pxProblems.length ? ` (found ${pxProblems.length})` : ""}`,
  );
  check(
    !/[^\x00-\x7F]/.test(src),
    `${label}: ASCII-only source (Persian arrives via dictionary strings passed as props)`,
  );
}

// --- adapter: src/lib/cms/research-graph.ts -----------------------------------
{
  const adapter = readSource("src/lib/cms/research-graph.ts");
  if (adapter !== null) {
    check(
      adapter.includes("export async function getResearchGraph"),
      "adapter: exports getResearchGraph",
    );
    check(
      adapter.includes("/api/graph/"),
      "adapter: targets the BK-05 public read GET /api/graph/{locale}",
    );
    check(
      adapter.includes("cmsFetchJson") && adapter.includes("throwIfCmsError"),
      "adapter: reuses the shared CMS_API_BASE fetch + fail-build conventions (transport/5xx fails the build)",
    );
    const unsetIdx = adapter.indexOf('kind === "unset"');
    check(
      unsetIdx >= 0 && /return null/.test(adapter.slice(unsetIdx, unsetIdx + 120)),
      "adapter: CMS_API_BASE unset resolves null immediately (snapshot mode omits the graph)",
    );
    const notFoundIdx = adapter.indexOf("status === 404");
    check(
      notFoundIdx >= 0 && /return null/.test(adapter.slice(notFoundIdx, notFoundIdx + 120)),
      "adapter: the 404 branch resolves null (BK-05 fail-closed: no active version is an expected absent state, never a build failure)",
    );
    check(
      adapter.includes("CmsOriginError"),
      "adapter: unexpected non-404 HTTP status raises CmsOriginError",
    );
    check(
      /export function parseGraphPayload/.test(adapter),
      "adapter: pure parser is exported (testable mapping, no network)",
    );
    check(
      adapter.includes("Array.isArray(payload.nodes)") &&
        adapter.includes("Array.isArray(payload.edges)"),
      "adapter (parser): malformed payload shape resolves null (omit-honestly, never render untrusted shape)",
    );
    check(
      adapter.includes("accessibleLabel") &&
        adapter.includes("relatedRecords") &&
        adapter.includes("relationType") &&
        adapter.includes("colorRole") &&
        adapter.includes("iconRole"),
      "adapter: camelCase BK-05 contract fields mapped verbatim (GraphNodePublic/GraphEdgePublic)",
    );
    check(
      !/accessible_label|related_records|relation_type|color_role|icon_role/.test(adapter),
      "adapter: no snake_case field leakage into the consumer contract",
    );
    check(
      adapter.includes("seenEdgeIds") || /seen\w*Edge/.test(adapter),
      "adapter (parser): duplicate edge ids are collapsed (first wins)",
    );
    check(
      adapter.includes("knownIds"),
      "adapter (parser): orphan edge endpoints are dropped against the surviving node id set",
    );
    check(
      /!nonEmptyText\(value\.label\)/.test(adapter),
      "adapter (parser): missing-label nodes are dropped (fail-closed render set)",
    );
    check(
      /weight:\s*(typeof|Number)/.test(adapter) || /weight\s*=\s*0/.test(adapter),
      "adapter (parser): weight defaults to a neutral rendering weight when absent",
    );
    doctrineScan("graph adapter", adapter);
  }
}

// --- section: src/components/research/ResearchGraph.astro ---------------------
{
  const section = readSource("src/components/research/ResearchGraph.astro");
  if (section !== null) {
    check(
      section.includes('from "../../lib/cms/research-graph"'),
      "section: consumes the shared BK-05 adapter types",
    );
    check(
      section.includes("data-research-graph"),
      "section: carries the data-research-graph marker (dist + QA anchor)",
    );
    check(
      /<ol[\s>]/.test(section),
      "section: renders the semantic linked-list equivalent as an ordered list",
    );
    check(
      section.includes('aria-labelledby="research-graph-heading"'),
      "section: names itself for screen readers via aria-labelledby",
    );
    check(
      section.includes("data-graph-node") &&
        section.includes("data-graph-edge") &&
        section.includes("data-graph-related") &&
        section.includes("data-graph-accessible-label") &&
        section.includes("data-graph-weight"),
      "section: carries the selection-parity data surface (node id, edge id, relatedRecords family/id, accessible label, weight) for the future island",
    );
    check(
      section.includes("node.accessibleLabel || node.label"),
      "section: accessible label falls back to the visible label when BK-05 serves a blank one",
    );
    check(
      section.includes("Badge"),
      "section: node type renders through the ui/Badge primitive (meaning from text, never colour alone)",
    );
    check(
      !/\bhref=/.test(section),
      "section: renders zero hrefs (relatedRecords are family/id only - no URL may be invented; island packet owns link resolution)",
    );
    check(
      section.includes("nodes.length > 0"),
      "section: renders nothing for an empty node set (honest omission)",
    );
    check(
      section.includes("edge.source === node.id ? edge.target : edge.source"),
      "section: edge relations resolve the peer endpoint (orphan endpoints already dropped by the parser)",
    );
    doctrineScan("graph section", section);
  }
}

// --- pages ---------------------------------------------------------------------
for (const locale of ["fa", "en"]) {
  const home = readSource(`src/pages/${locale}/index.astro`);
  if (home !== null) {
    check(
      home.includes('import ResearchGraph from "../../components/research/ResearchGraph.astro"'),
      `${locale} home: composes the WF-08 graph section`,
    );
    check(
      home.includes('from "../../lib/cms/research-graph"') &&
        home.includes("await getResearchGraph(locale)"),
      `${locale} home: consumes the BK-05 graph adapter`,
    );
    check(
      home.includes('slot="graph"'),
      `${locale} home: wires the HomeTemplate "graph" slot (WF-07A omission resolved)`,
    );
    check(
      home.includes("graph && graph.nodes.length > 0"),
      `${locale} home: the graph block stays omitted honestly when no payload is published`,
    );
    check(
      home.includes("relatedHeading"),
      `${locale} home: section copy arrives via the locale dictionary (no hardcoded copy)`,
    );
  }

  const research = readSource(`src/pages/${locale}/research/index.astro`);
  if (research !== null) {
    check(
      research.includes('import ResearchGraph from "../../../components/research/ResearchGraph.astro"'),
      `${locale} research index: includes the WF-08 graph section`,
    );
    check(
      research.includes('from "../../../lib/cms/research-graph"') &&
        research.includes("await getResearchGraph(locale)"),
      `${locale} research index: consumes the BK-05 graph adapter`,
    );
    check(
      research.includes('slot="results"') && research.includes("data-research-list"),
      `${locale} research index: the section sits beside the results slot (filter JS keeps owning data-research-list only)`,
    );
    check(
      research.includes("<ResearchGraph"),
      `${locale} research index: renders the graph section from the parsed payload`,
    );
  }
}

// --- CMS-mocked build integration (BK-05 mock pattern + fail-closed traps) -----
// Serves the test_api_graph.py full_graph fixture shape (camelCase, stable
// edge id composition "research-fit->identity:relates-to"), extended with:
// a blank-label node (dropped), an orphan edge (dropped), and a duplicate
// edge id (collapsed, first wins). Per-locale payloads prove isolation.
const GRAPH_MOCKS = {
  en: {
    nodes: [
      {
        id: "research-fit",
        type: "concept",
        label: "Research fit",
        accessibleLabel: "Research fit",
        weight: 4,
        summary: "Research directions that fit the profile.",
        colorRole: "brand",
        iconRole: "star",
        position: { x: 1.5, y: -2.0, z: 3.25 },
        relatedRecords: [{ family: "article", id: "17" }],
      },
      {
        id: "identity",
        type: "identity",
        label: "Identity",
        accessibleLabel: "",
        weight: 1,
        relatedRecords: [],
      },
      {
        id: "blank-label",
        type: "concept",
        label: "   ",
        accessibleLabel: "",
        weight: 9,
        relatedRecords: [],
      },
    ],
    edges: [
      {
        id: "research-fit->identity:relates-to",
        source: "research-fit",
        target: "identity",
        relationType: "relates-to",
        directed: true,
        weight: 3,
        explanation: "Both drive the research agenda.",
      },
      {
        id: "identity->research-fit:supports",
        source: "identity",
        target: "research-fit",
        relationType: "supports",
        directed: false,
        weight: 0,
      },
      {
        id: "research-fit->ghost-node:mentions",
        source: "research-fit",
        target: "ghost-node",
        relationType: "mentions",
        directed: true,
        weight: 1,
        explanation: "orphan endpoint trap",
      },
      {
        id: "research-fit->identity:relates-to",
        source: "research-fit",
        target: "identity",
        relationType: "relates-to",
        directed: true,
        weight: 3,
        explanation: "duplicate id trap - first wins",
      },
    ],
  },
  fa: {
    nodes: [
      {
        id: "graph-fa-node",
        type: "concept",
        label: "Research fit FA",
        accessibleLabel: "",
        weight: 2,
        relatedRecords: [],
      },
    ],
    edges: [],
  },
};

let profileSnapshot = null;
try {
  profileSnapshot = JSON.parse(
    readFileSync(join(webRoot, "src", "data", "profile.snapshot.json"), "utf8"),
  );
} catch {
  profileSnapshot = null;
}

function jsonOk(res, body) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function startMockServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      const pathname = url.pathname;
      const page = url.searchParams.get("page");

      if (pathname === "/api/site") {
        return jsonOk(res, { primaryColor: "#087c73", downloads: [] });
      }
      if (pathname.startsWith("/api/graph/")) {
        const locale = pathname.split("/").filter(Boolean).pop();
        return jsonOk(res, GRAPH_MOCKS[locale] ?? { nodes: [], edges: [] });
      }
      if (pathname.startsWith("/api/profiles/")) {
        const parts = pathname.split("/").filter(Boolean);
        if (parts.length >= 4 && profileSnapshot?.profiles?.[parts[2]]) {
          return jsonOk(res, profileSnapshot.profiles[parts[2]]);
        }
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ detail: "not found" }));
        return;
      }
      if (pathname.startsWith("/api/")) {
        if (/^\/api\/.+\/(en|fa)\/[^/]+\/?$/.test(pathname)) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ detail: "not found" }));
          return;
        }
        if (page && page !== "1") return jsonOk(res, []);
        return jsonOk(res, []);
      }
      res.writeHead(404);
      res.end();
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      check(
        address && typeof address === "object",
        "mock server address missing",
      );
      if (address && typeof address === "object") {
        resolve({ server, base: `http://127.0.0.1:${address.port}` });
      } else {
        reject(new Error("mock server address missing"));
      }
    });
  });
}

function runBuild(envOverrides = {}) {
  return new Promise((resolve, reject) => {
    // Cache bust between builds (same reason as the sibling specs): a stale
    // dist/.prerender chunk tree can crash static generation on Windows
    // ("Cannot find module dist/.prerender/chunks/compiler_*.mjs").
    for (const stale of [
      join(webRoot, "node_modules", ".vite"),
      join(webRoot, "node_modules", ".astro"),
      join(webRoot, "dist", ".prerender"),
    ]) {
      try {
        rmSync(stale, { recursive: true, force: true });
      } catch {
        /* best-effort cache bust */
      }
    }
    const logDir = mkdtempSync(join(tmpdir(), "graph-consumer-"));
    const logPath = join(logDir, "build.log");
    const logFd = openSync(logPath, "w");
    const env = { ...process.env, ...envOverrides };
    if (!("CMS_API_BASE" in envOverrides)) delete env.CMS_API_BASE;
    const child = spawn(
      process.platform === "win32" ? "cmd.exe" : "npm",
      process.platform === "win32" ? ["/c", "npm", "run", "build"] : ["run", "build"],
      { cwd: webRoot, env, stdio: ["ignore", logFd, logFd] },
    );
    child.on("error", reject);
    child.on("close", (status) => {
      closeSync(logFd);
      const output = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
      try {
        rmSync(logDir, { recursive: true, force: true });
      } catch {
        /* best-effort cleanup */
      }
      resolve({ status, output });
    });
  });
}

function decodeEntities(html) {
  return html.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function graphSectionOf(html) {
  const start = html.indexOf("data-research-graph");
  if (start < 0) return null;
  const end = html.indexOf("</section>", start);
  return end > start ? decodeEntities(html.slice(start, end)) : null;
}

function relatedAttr(section, nodeId) {
  const anchor = `data-graph-node="${nodeId}"`;
  const nodeStart = section.indexOf(anchor);
  if (nodeStart < 0) return null;
  const match = section.slice(nodeStart).match(/data-graph-related="(\[[^\]]*\])"/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

const mock = await startMockServer();
try {
  const built = await runBuild({ CMS_API_BASE: mock.base });
  check(
    built.status === 0,
    `CMS-mocked build succeeds with the graph payload published; exit=${built.status}\n${built.output.slice(-2500)}`,
  );

  if (built.status === 0) {
    const pages = ["en/index.html", "fa/index.html", "en/research/index.html", "fa/research/index.html"];
    for (const page of pages) {
      const target = join(distDir, ...page.split("/"));
      check(
        existsSync(target),
        `CMS-mocked build: ${page} exists`,
      );
      if (!existsSync(target)) continue;
      const html = readFileSync(target, "utf8");
      const section = graphSectionOf(html);
      check(
        section !== null,
        `CMS-mocked build: ${page} renders the graph section`,
      );
      if (section === null) continue;

      if (page.startsWith("en/")) {
        check(
          section.includes('data-graph-node="research-fit"') &&
            section.includes('data-graph-node="identity"'),
          `CMS-mocked build: ${page} renders both published node ids`,
        );
        check(
          section.includes("Research fit") && section.includes("Identity"),
          `CMS-mocked build: ${page} renders the node labels`,
        );
        check(
          section.includes("data-graph-accessible-label=\"Research fit\"") &&
            section.includes('data-graph-accessible-label="Identity"'),
          `CMS-mocked build: ${page} carries the accessible-label surface (blank BK-05 accessibleLabel falls back to the label)`,
        );
        check(
          section.includes('data-graph-edge="research-fit->identity:relates-to"'),
          `CMS-mocked build: ${page} renders the stable edge id composition`,
        );
        check(
          section.includes('data-graph-relation="relates-to"') &&
            section.includes('data-graph-relation="supports"'),
          `CMS-mocked build: ${page} renders both relation types`,
        );
        check(
          section.includes("Both drive the research agenda.") &&
            !section.includes("duplicate id trap"),
          `CMS-mocked build: ${page} collapses the duplicate edge id (first wins, trap explanation never renders)`,
        );
        check(
          (section.match(/data-graph-edge="research-fit->identity:relates-to"/g) || []).length === 2,
          `CMS-mocked build: ${page} renders the edge once per endpoint node and the duplicate payload row adds nothing (first-wins dedupe)`,
        );
        const related = relatedAttr(section, "research-fit");
        check(
          JSON.stringify(related) === JSON.stringify([{ family: "article", id: "17" }]),
          `CMS-mocked build: ${page} selection parity - data-graph-related carries the payload relatedRecords verbatim (got ${JSON.stringify(related)})`,
        );
        check(
          !section.includes("ghost-node"),
          `CMS-mocked build: ${page} drops the orphan edge endpoint`,
        );
        check(
          !section.includes('data-graph-node="blank-label"'),
          `CMS-mocked build: ${page} drops the blank-label node`,
        );
        check(
          !section.includes("<a "),
          `CMS-mocked build: ${page} graph list stays link-free (no invented related-record URLs)`,
        );
        const fitIdx = section.indexOf('data-graph-node="research-fit"');
        const identityIdx = section.indexOf('data-graph-node="identity"');
        check(
          fitIdx >= 0 && identityIdx > fitIdx,
          `CMS-mocked build: ${page} orders the semantic list by weight (heavier node first, deterministic)`,
        );
        check(
          !section.includes('data-graph-node="graph-fa-node"'),
          `CMS-mocked build: ${page} carries no other-locale graph rows (BK-05 per-locale isolation)`,
        );
      } else {
        check(
          section.includes('data-graph-node="graph-fa-node"') &&
            section.includes("Research fit FA"),
          `CMS-mocked build: ${page} renders the fa graph payload`,
        );
        check(
          !section.includes('data-graph-node="research-fit"'),
          `CMS-mocked build: ${page} carries no other-locale graph rows (BK-05 per-locale isolation)`,
        );
      }
    }
  }
} finally {
  await new Promise((resolve) => mock.server.close(resolve));
}

// Snapshot restore build: default (unset base) output must omit the graph.
const restore = await runBuild();
check(
  restore.status === 0,
  `snapshot restore build succeeds; exit=${restore.status}\n${restore.output.slice(-2000)}`,
);
if (restore.status === 0) {
  for (const page of ["en/index.html", "fa/index.html", "en/research/index.html", "fa/research/index.html"]) {
    const target = join(distDir, ...page.split("/"));
    if (!existsSync(target)) continue;
    const html = readFileSync(target, "utf8");
    check(
      !html.includes("data-research-graph"),
      `snapshot build: ${page} omits the graph section honestly (no published payload)`,
    );
  }
}

// --- report ---------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`graph-consumer.spec: FAIL - ${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `PASS graph-consumer (${passed.length} checks): BK-05 adapter (unset/404 -> null, transport fails build, fail-closed parser) + ResearchGraph semantic list (ordered list, type Badge, relation peers, accessible-label + relatedRecords parity surface, zero invented hrefs) wired into both home graph slots and both research indexes; CMS-mocked build renders per-locale payloads, collapses duplicate edges, drops orphan + blank-label rows; snapshot build omits honestly`,
);
