import http from "node:http";
import { closeSync, existsSync, mkdtempSync, openSync, readFileSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const distDir = new URL("../dist/", import.meta.url);
const webRoot = dirname(fileURLToPath(distDir));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function jsonOk(res, body) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function json503(res) {
  res.writeHead(503, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ detail: "service unavailable" }));
}

/** Minimal empty CMS responses so builds reach the endpoint under test. */
function defaultCmsHandler(req, res, failPrefix) {
  const path = req.url?.split("?")[0] ?? "";
  if (failPrefix && path.startsWith(failPrefix)) {
    return json503(res);
  }
  if (path === "/api/site") {
    return jsonOk(res, { primaryColor: "#087c73", downloads: [] });
  }
  if (path.startsWith("/api/profiles/")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ detail: "not found" }));
    return;
  }
  if (path.startsWith("/api/")) {
    return jsonOk(res, []);
  }
  res.writeHead(404);
  res.end();
}

function startMockServer(failPrefix) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!failPrefix) {
        return json503(res);
      }
      defaultCmsHandler(req, res, failPrefix);
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      assert(address && typeof address === "object", "mock server address missing");
      resolve({ server, base: `http://127.0.0.1:${address.port}` });
    });
  });
}

function runBuild(envOverrides = {}) {
  const logDir = mkdtempSync(join(tmpdir(), "cms-origin-honesty-"));
  const logPath = join(logDir, "build.log");
  const logFd = openSync(logPath, "w");
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const env = { ...process.env, ...envOverrides };
  if (!("CMS_API_BASE" in envOverrides)) {
    delete env.CMS_API_BASE;
  }
  const child = spawn(
    process.platform === "win32" ? "cmd.exe" : npmCmd,
    process.platform === "win32" ? ["/c", "npm", "run", "build"] : ["run", "build"],
    {
      cwd: webRoot,
      env,
      stdio: ["ignore", logFd, logFd],
    },
  );

  return new Promise((resolve, reject) => {
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

function expectBuildFailure(label, result, pattern) {
  assert(
    result.status !== 0 && result.status !== null,
    `${label}: expected npm run build to fail; exit=${result.status}`,
  );
  assert(
    pattern.test(result.output),
    `${label}: build log did not match ${pattern} (${result.output.length} bytes)`,
  );
}

const articlesCase = await startMockServer("/api/articles");
try {
  const articlesBuild = await runBuild({ CMS_API_BASE: articlesCase.base });
  expectBuildFailure(
    "articles 503",
    articlesBuild,
    /articles\/(en|fa)|CmsOriginError|failed with HTTP 503/i,
  );
} finally {
  await new Promise((resolve) => articlesCase.server.close(resolve));
}

const profileCase = await startMockServer("/api/profiles");
try {
  const profileBuild = await runBuild({ CMS_API_BASE: profileCase.base });
  expectBuildFailure(
    "profile 503",
    profileBuild,
    /CMS profile origin HTTP 503|profiles\/(en|fa)/i,
  );
} finally {
  await new Promise((resolve) => profileCase.server.close(resolve));
}

// Restore offline snapshot dist for downstream QA specs (projects-catalog, smoke).
const restore = await runBuild();
assert(
  restore.status === 0,
  `Failed to restore snapshot build after cms-origin-honesty checks; exit=${restore.status}`,
);

console.log("PASS cms-origin-honesty (503 fail-build for articles + profile)");
