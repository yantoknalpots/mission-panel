import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";
const TASKS_DIR = "/Users/yanto/.openclaw/workspace/mission-control/tasks";

function ensureDir() { if (!existsSync(TASKS_DIR)) mkdirSync(TASKS_DIR, { recursive: true }); }

function loadTasks() {
  ensureDir();
  return readdirSync(TASKS_DIR).filter(f => f.endsWith(".json")).map(f => {
    try { return JSON.parse(readFileSync(join(TASKS_DIR, f), "utf8")); } catch { return null; }
  }).filter(Boolean).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function saveTask(task) {
  ensureDir();
  writeFileSync(join(TASKS_DIR, `${task.id}.json`), JSON.stringify(task, null, 2));
  // Auto-sync to agent workspaces
  try { syncAgentTasks(); } catch {}
}

function syncAgentTasks() {
  const AGENT_WORKSPACES = {
    Asep: "/Users/yanto/.openclaw/workspace-asep",
    Bosku: "/Users/yanto/.openclaw/workspace-bosku",
    Dimas: "/Users/yanto/.openclaw/workspace-dimas",
    Lesti: "/Users/yanto/.openclaw/workspace-lesti",
  };
  const tasks = readdirSync(TASKS_DIR).filter(f => f.endsWith(".json")).map(f => {
    try { return JSON.parse(readFileSync(join(TASKS_DIR, f), "utf8")); } catch { return null; }
  }).filter(Boolean);

  for (const [agent, ws] of Object.entries(AGENT_WORKSPACES)) {
    if (!existsSync(ws)) continue;
    const mine = tasks.filter(t => t.assignee === agent);
    if (mine.length === 0) continue;
    const active = mine.filter(t => t.status !== "done");
    const lines = [`# Tasks for ${agent}`, `_Synced: ${new Date().toLocaleString("en-GB", {timeZone: "Asia/Jakarta"})}_`, ""];
    if (active.length) {
      lines.push("## Active Tasks");
      for (const t of active) {
        lines.push(`\n### [${t.status.toUpperCase()}] ${t.title}`);
        lines.push(`- Priority: ${t.priority}`);
        if (t.description) lines.push(`- ${t.description}`);
        lines.push(`- ID: ${t.id}`);
      }
    }
    const done = mine.filter(t => t.status === "done");
    if (done.length) { lines.push("\n## Done"); done.forEach(t => lines.push(`- ~~${t.title}~~`)); }
    writeFileSync(join(ws, "TASK.md"), lines.join("\n"));
  }
}

export default function handler(req, res) {
  if (req.method === "GET") return res.json(loadTasks());

  if (req.method === "POST") {
    const { title, description, assignee, priority, status } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const task = { id: `task-${Date.now()}`, title, description: description || "", assignee: assignee || "unassigned", priority: priority || "medium", status: status || "todo", createdAt: Date.now(), updatedAt: Date.now() };
    saveTask(task);
    return res.json(task);
  }

  if (req.method === "PUT") {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });
    const path = join(TASKS_DIR, `${id}.json`);
    if (!existsSync(path)) return res.status(404).json({ error: "not found" });
    const task = { ...JSON.parse(readFileSync(path, "utf8")), ...updates, updatedAt: Date.now() };
    saveTask(task);
    return res.json(task);
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    const path = join(TASKS_DIR, `${id}.json`);
    if (existsSync(path)) require("fs").unlinkSync(path);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "method not allowed" });
}
