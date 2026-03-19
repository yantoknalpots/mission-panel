import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
const OC = "/Users/yanto/.openclaw";

export default function handler(req, res) {
  try {
    const cfg = JSON.parse(readFileSync(join(OC, "openclaw.json"), "utf8"));
    const entries = [];
    for (const agent of cfg.agents.list) {
      const dir = join(agent.workspace, "memory");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir).filter(f => f.endsWith(".md"))) {
        const full = join(dir, f);
        const stat = statSync(full);
        const content = readFileSync(full, "utf8");
        entries.push({ agent: agent.name, agentId: agent.id, file: f, date: f.replace(".md",""), modifiedAt: stat.mtime.toISOString(), content, preview: content.slice(0, 400), type: "memory" });
      }
    }
    const hbDir = join(OC, "workspace/heartbeat-logs");
    if (existsSync(hbDir)) {
      for (const f of readdirSync(hbDir).filter(f => f.endsWith(".out")).sort().reverse().slice(0, 30)) {
        const full = join(hbDir, f);
        const stat = statSync(full);
        const content = readFileSync(full, "utf8");
        if (!content.trim()) continue;
        entries.push({ agent: f.split(".")[0], agentId: f.split(".")[0].toLowerCase(), file: f, date: stat.mtime.toISOString().split("T")[0], modifiedAt: stat.mtime.toISOString(), content, preview: content.slice(0, 400), type: "heartbeat" });
      }
    }
    entries.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
    res.json(entries.slice(0, 100));
  } catch (e) { res.status(500).json({ error: e.message }); }
}
