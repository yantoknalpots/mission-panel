import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
const OC = "/Users/yanto/.openclaw";

function getMemories(workspace, limit = 3) {
  const dir = join(workspace, "memory");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith(".md")).sort().reverse().slice(0, limit).map(f => {
    const content = readFileSync(join(dir, f), "utf8");
    return { file: f, date: f.replace(".md",""), content: content.slice(0, 800), size: content.length };
  });
}

function getSession(agentId) {
  const f = join(OC, "agents", agentId, "sessions", "sessions.json");
  if (!existsSync(f)) return { active: false, lastSeen: null, sessions: 0 };
  try {
    const data = JSON.parse(readFileSync(f, "utf8"));
    let latest = 0, count = 0;
    for (const [, s] of Object.entries(data)) {
      count++;
      if (s.updatedAt > latest) latest = s.updatedAt;
    }
    return { active: latest > 0 && Date.now() - latest < 3600000, lastSeen: latest > 0 ? new Date(latest).toISOString() : null, sessions: count };
  } catch { return { active: false, lastSeen: null, sessions: 0 }; }
}

function readFile(path) {
  try { return existsSync(path) ? readFileSync(path, "utf8") : null; } catch { return null; }
}

const ROLES = {
  main: { role: "Gateway / Coordinator", emoji: "🦞", color: "blue" },
  bosku: { role: "Project Manager", emoji: "👔", color: "purple" },
  asep: { role: "Full-stack Developer", emoji: "💻", color: "green" },
  dimas: { role: "QA Engineer", emoji: "🔍", color: "amber" },
  lesti: { role: "Staff / Utility", emoji: "⚡", color: "red" },
};

export default function handler(req, res) {
  try {
    const cfg = JSON.parse(readFileSync(join(OC, "openclaw.json"), "utf8"));
    const agents = cfg.agents.list.map(a => {
      const sess = getSession(a.id);
      const meta = ROLES[a.id] || { role: "Agent", emoji: "🤖", color: "blue" };
      return {
        ...meta, id: a.id, name: a.name, model: a.model?.primary,
        heartbeatInterval: a.heartbeat?.every || "disabled",
        heartbeatModel: a.heartbeat?.model || a.model?.primary,
        ...sess,
        memories: getMemories(a.workspace),
        soul: readFile(join(a.workspace, "SOUL.md"))?.slice(0, 1000),
        heartbeatMd: readFile(join(a.workspace, "HEARTBEAT.md")),
        currentTask: readFile(join(a.workspace, "TASK.md")),
        workspace: a.workspace,
      };
    });
    res.json(agents);
  } catch (e) { res.status(500).json({ error: e.message }); }
}
