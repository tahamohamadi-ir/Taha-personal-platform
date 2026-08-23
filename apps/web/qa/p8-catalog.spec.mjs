import http from "node:http";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  mkdtempSync,
  rmSync,
  openSync,
  closeSync,
} from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const distDir = new URL("../dist/", import.meta.url);
const webRoot = dirname(fileURLToPath(distDir));
const snapshotPath = new URL("../src/data/profile.snapshot.json", import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readHtml(relativePath) {
  return readFileSync(new URL(relativePath, distDir), "utf8");
}

function countLinks(html, locale, resource) {
  // Matches href="/en/publications/<slug>/" or "/fa/books/<slug>/"
  const re = new RegExp(`href="/${locale}/${resource}/[^/]+/"`, "g");
  const matches = html.match(re);
  return matches ? matches.length : 0;
}

// --- Mock catalog data (API source of truth) ---
const catalogMocks = {
  publications: {
    en: [
      {
        locale: "en",
        slug: "pub-en-1",
        title: "Pub EN 1 - P8 Parity",
        authors: "A. Author",
        venue: "Journal of Testing",
        date: "2024-01-01",
        doi: "10.1234/pub1",
        license: "cc-by",
        publication_type: "journal",
        academic_stage: "phd",
        access_state: "public",
        published_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        locale: "en",
        slug: "pub-en-2",
        title: "Pub EN 2 - P8 Parity",
        authors: "B. Author",
        venue: "Conference X",
        date: "2023-12-01",
        doi: "",
        license: "cc-by",
        publication_type: "conference",
        academic_stage: "masters",
        access_state: "public",
        published_at: "2023-12-01T00:00:00Z",
        updated_at: "2023-12-01T00:00:00Z",
      },
    ],
    fa: [
      {
        locale: "fa",
        slug: "pub-fa-1",
        title: "انتشار FA 1",
        authors: "نویسنده الف",
        venue: "مجله تست",
        date: "2024-02-01",
        doi: "",
        license: "cc-by",
        publication_type: "journal",
        academic_stage: "phd",
        access_state: "public",
        published_at: "2024-02-01T00:00:00Z",
        updated_at: "2024-02-01T00:00:00Z",
      },
    ],
  },
  books: {
    en: [
      {
        locale: "en",
        slug: "book-en-1",
        title: "Book EN 1 - P8 Parity",
        authors: "Author B",
        isbn: "978-0-0000000-0-0",
        publisher: "Publisher",
        publication_date: "2023-01-01",
        license: "cc-by",
        access_state: "public",
        published_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ],
    fa: [],
  },
  talks: {
    en: [
      {
        locale: "en",
        slug: "talk-en-1",
        title: "Talk EN 1 - P8 Parity",
        speakers: "Speaker 1",
        event_name: "Event 1",
        event_date: "2024-03-01",
        location: "Tehran",
        license: "cc-by",
        access_state: "public",
        published_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-03-01T00:00:00Z",
      },
      {
        locale: "en",
        slug: "talk-en-2",
        title: "Talk EN 2 - P8 Parity",
        speakers: "Speaker 2",
        event_name: "Event 2",
        event_date: "2024-04-01",
        location: "Berlin",
        license: "cc-by",
        access_state: "public",
        published_at: "2024-04-01T00:00:00Z",
        updated_at: "2024-04-01T00:00:00Z",
      },
    ],
    fa: [
      {
        locale: "fa",
        slug: "talk-fa-1",
        title: "سخنرانی FA 1",
        speakers: "سخنران",
        event_name: "رویداد",
        event_date: "2024-05-01",
        location: "تهران",
        license: "cc-by",
        access_state: "public",
        published_at: "2024-05-01T00:00:00Z",
        updated_at: "2024-05-01T00:00:00Z",
      },
    ],
  },
  downloads: {
    en: [
      {
        locale: "en",
        slug: "dl-en-1",
        title: "Download EN 1 - P8 Parity",
        description: "Desc EN 1",
        download_type: "pdf",
        language: "en",
        license: "cc-by",
        access_state: "public",
        published_at: "2024-01-15T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
      },
    ],
    fa: [
      {
        locale: "fa",
        slug: "dl-fa-1",
        title: "دانلود FA 1",
        description: "توضیح ۱",
        download_type: "pdf",
        language: "fa",
        license: "cc-by",
        access_state: "public",
        published_at: "2024-01-16T00:00:00Z",
        updated_at: "2024-01-16T00:00:00Z",
      },
      {
        locale: "fa",
        slug: "dl-fa-2",
        title: "دانلود FA 2",
        description: "توضیح ۲",
        download_type: "dataset",
        language: "fa",
        license: "cc-by",
        access_state: "public",
        published_at: "2024-01-17T00:00:00Z",
        updated_at: "2024-01-17T00:00:00Z",
      },
    ],
  },
};

function toPublicationDetail(item) {
  return {
    ...item,
    url: "",
    pdf_url: "",
    abstract: `Abstract for ${item.title}`,
    isbn: "",
    preprint_url: "",
    code_url: "",
    dataset_url: "",
    accessibility_notes: "",
    citation_count: null,
    citation_text: null,
    pdf: null,
  };
}
function toBookDetail(item) {
  return {
    ...item,
    description: `Description for ${item.title}`,
    url: "",
    accessibility_notes: "",
    cover: null,
  };
}
function toTalkDetail(item) {
  return {
    ...item,
    abstract: `Abstract for ${item.title}`,
    video_url: "",
    slides_url: "",
    accessibility_notes: "",
    slides: null,
  };
}
function toDownloadDetail(item) {
  return {
    ...item,
    accessibility_notes: "",
    file: null,
    mime: null,
    size_bytes: null,
  };
}

const detailMappers = {
  publications: toPublicationDetail,
  books: toBookDetail,
  talks: toTalkDetail,
  downloads: toDownloadDetail,
};

let profileSnapshot = null;
try {
  profileSnapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
} catch {
  profileSnapshot = null;
}

function jsonOk(res, body) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ detail: "not found" }));
}

function startMockServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      const pathname = url.pathname;
      const page = url.searchParams.get("page");

      // Site settings
      if (pathname === "/api/site") {
        return jsonOk(res, {
          primaryColor: "#087c73",
          downloads: [],
          contact: {
            email: "owner@example.com",
            location: "Tehran, Iran",
            linkedin: "",
            orcid: "",
            employer: "",
            employerUrl: "",
            formEnabled: false,
          },
          brandName: "Taha Test",
          tagline: "Test tagline",
          footerText: "Test footer",
        });
      }

      // Profile
      if (pathname.startsWith("/api/profiles/")) {
        const parts = pathname.split("/").filter(Boolean); // api, profiles, locale, slug
        if (parts.length >= 4) {
          const locale = parts[2];
          if (profileSnapshot && profileSnapshot.profiles && profileSnapshot.profiles[locale]) {
            return jsonOk(res, profileSnapshot.profiles[locale]);
          }
        }
        return notFound(res);
      }

      // P8 catalog: /api/publications/en , /api/publications/en/slug etc.
      // Also supports legacy /api/research/publications/en
      const catalogMatch = pathname.match(
        /^\/api\/(?:research\/)?(publications|books|talks|downloads)\/(en|fa)(?:\/([^\/]+))?\/?$/,
      );
      if (catalogMatch) {
        const [, resource, locale, slug] = catalogMatch;
        const list = (catalogMocks[resource] && catalogMocks[resource][locale]) || [];
        if (slug) {
          const item = list.find((x) => x.slug === slug);
          if (!item) return notFound(res);
          const mapper = detailMappers[resource];
          return jsonOk(res, mapper(item));
        }
        // List with pagination
        if (page && page !== "1") {
          return jsonOk(res, []);
        }
        // Also handle ?page without value? default to first page
        // Return array or {items: []} — paginateAll handles both
        return jsonOk(res, list);
      }

      // Generic fallback for other /api/* (articles, projects, research topics, etc.)
      if (pathname.startsWith("/api/")) {
        // Detail endpoints have an extra slug beyond the locale (e.g. /api/articles/en/slug or /api/research/projects/en/slug)
        if (/^\/api\/.+\/(en|fa)\/[^\/]+\/?$/.test(pathname)) {
          return notFound(res);
        }
        // List endpoints end with the locale (e.g. /api/articles/en, /api/research/projects/en, /api/series/en)
        if (/^\/api\/.+\/(en|fa)\/?$/.test(pathname)) {
          if (page && page !== "1") {
            return jsonOk(res, []);
          }
          return jsonOk(res, []);
        }
        // Fallback for other /api paths (e.g. /api/site already handled, /api/health)
        if (page && page !== "1") {
          return jsonOk(res, []);
        }
        return jsonOk(res, []);
      }

      res.writeHead(404);
      res.end();
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      assert(addr && typeof addr === "object", "mock server address missing");
      resolve({ server, base: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function runBuild(envOverrides = {}) {
  return new Promise((resolve, reject) => {
    const logDir = mkdtempSync(join(tmpdir(), "p8-catalog-"));
    const logPath = join(logDir, "build.log");
    const logFd = openSync(logPath, "w");
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    const env = { ...process.env, ...envOverrides };
    if (!("CMS_API_BASE" in envOverrides)) {
      delete env.CMS_API_BASE;
    }
    const args =
      process.platform === "win32" ? ["/c", "npm", "run", "build"] : ["run", "build"];
    const cmd = process.platform === "win32" ? "cmd.exe" : npmCmd;
    const child = spawn(cmd, args, {
      cwd: webRoot,
      env,
      stdio: ["ignore", logFd, logFd],
    });
    child.on("error", reject);
    child.on("close", (status) => {
      closeSync(logFd);
      const output = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
      try {
        rmSync(logDir, { recursive: true, force: true });
      } catch {}
      resolve({ status, output });
    });
    // Safety timeout: kill after 180s via parent timer if needed (spawn will be killed externally if hangs)
    setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {}
    }, 180_000).unref?.();
  });
}

// Start mock and build with CMS_API_BASE
const mock = await startMockServer();
let buildResult;
try {
  console.log(`[p8-catalog] mock CMS_API_BASE=${mock.base}`);
  buildResult = await runBuild({ CMS_API_BASE: mock.base });
  assert(
    buildResult.status === 0,
    `Expected build with CMS_API_BASE=${mock.base} to succeed; exit=${buildResult.status}\n${buildResult.output.slice(-3000)}`,
  );
  // Also ensure no CmsOriginError in log (should be success)
  assert(
    !/CmsOriginError|unreachable/i.test(buildResult.output),
    `Build log contains unexpected CmsOriginError: ${buildResult.output.slice(-2000)}`,
  );
} finally {
  await new Promise((resolve) => mock.server.close(resolve));
}

// --- Parity assertions: API count == dist links ---
const resources = ["publications", "books", "talks", "downloads"];
const locales = ["en", "fa"];

for (const locale of locales) {
  for (const resource of resources) {
    const expectedItems = catalogMocks[resource][locale];
    const expectedCount = expectedItems.length;
    const indexPath = `${locale}/${resource}/index.html`;
    assert(
      existsSync(new URL(indexPath, distDir)),
      `Missing catalog index: ${indexPath}`,
    );
    const html = readHtml(indexPath);
    // Parity: count links in HTML must equal API count
    const linkCount = countLinks(html, locale, resource);
    assert(
      linkCount === expectedCount,
      `Parity mismatch ${locale}/${resource}: API count ${expectedCount} != dist links ${linkCount}. Expected slugs: ${expectedItems.map((i) => i.slug).join(", ")}`,
    );
    // Each expected slug must have a link and detail page
    for (const item of expectedItems) {
      const href = `/${locale}/${resource}/${item.slug}/`;
      assert(
        html.includes(href),
        `Catalog ${locale}/${resource} missing link href="${href}" for slug ${item.slug}`,
      );
      const detailPath = `${locale}/${resource}/${item.slug}/index.html`;
      assert(
        existsSync(new URL(detailPath, distDir)),
        `Missing detail page: ${detailPath} for slug ${item.slug}`,
      );
      const detailHtml = readHtml(detailPath);
      assert(
        detailHtml.includes(item.title),
        `Detail page ${detailPath} missing title "${item.title}"`,
      );
    }
    // Empty-honest check
    if (expectedCount === 0) {
      assert(
        html.includes('class="empty"') || html.includes("empty"),
        `Empty catalog ${locale}/${resource} should contain honest empty state (class="empty")`,
      );
    }
  }
}

console.log(
  `PASS p8-catalog parity: API count == dist links for ${resources.join(", ")} (en/fa) with mock CMS_API_BASE`,
);

// --- Restore offline snapshot dist for downstream CI specs ---
for (const cacheDir of [join(webRoot, "node_modules", ".vite"), join(webRoot, "node_modules", ".astro")]) {
  try {
    rmSync(cacheDir, { recursive: true, force: true });
  } catch {}
}
const restore = await runBuild();
assert(restore.status === 0, `Failed to restore snapshot build after p8-catalog check; exit=${restore.status}\n${restore.output.slice(-2000)}`);
console.log("PASS p8-catalog restore snapshot");
