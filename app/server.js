import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const workspace = resolve(root, "..");
const outDir = join(workspace, "output", "console-specs");
const port = Number(process.env.PORT || 4317);
const host = process.env.HOST || "127.0.0.1";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function ext(path) {
  const match = path.match(/\.[^.]+$/);
  return match ? match[0] : "";
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function saveSpec(payload) {
  await mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const base = `structural-elucidation-${stamp}`;
  const jsonPath = join(outDir, `${base}.json`);
  const promptPath = join(outDir, `${base}.prompt.md`);
  await writeFile(jsonPath, JSON.stringify(payload.spec, null, 2), "utf8");
  await writeFile(promptPath, payload.prompt || "", "utf8");
  return { jsonPath, promptPath };
}

function runCodex(prompt) {
  return new Promise((resolvePromise) => {
    const child = spawn("codex", ["exec", "-C", workspace, "--skip-git-repo-check", "-"], {
      cwd: workspace,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });
    child.on("close", (code) => resolvePromise({ code, stdout, stderr }));
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (req.method === "POST" && url.pathname === "/api/save") {
      const payload = JSON.parse(await readBody(req));
      const result = await saveSpec(payload);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/run-codex") {
      const payload = JSON.parse(await readBody(req));
      const files = await saveSpec(payload);
      const result = await runCodex(payload.prompt || "");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ...files, ...result }));
      return;
    }

    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    const filePath = resolve(root, pathname.slice(1));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": mime[ext(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: String(error?.message || error) }));
  }
});

server.listen(port, host, () => {
  console.log(`Structural elucidation console: http://${host}:${port}`);
});
