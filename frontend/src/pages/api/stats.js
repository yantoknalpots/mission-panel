import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
const OC = "/Users/yanto/.openclaw";

export default function handler(req, res) {
  try {
    const cfg = JSON.parse(readFileSync(join(OC, "openclaw.json"), "utf8"));
    const agents = cfg.agents.list;
    let totalMemories = 0;
    for (const a of agents) {
      const d = join(a.workspace, "memory");
      if (existsSync(d)) totalMemories += readdirSync(d).filter(f => f.endsWith(".md")).length;
    }
    const tasksDir = join(OC, "workspace/mission-control/tasks");
    const totalTasks = existsSync(tasksDir) ? readdirSync(tasksDir).filter(f => f.endsWith(".json")).length : 0;
    const hbDir = join(OC, "workspace/heartbeat-logs");
    const totalHeartbeatLogs = existsSync(hbDir) ? readdirSync(hbDir).filter(f => f.endsWith(".out")).length : 0;
    const models = {};
    for (const a of agents) { const m = (a.model?.primary || "unknown").split("/").pop(); models[m] = (models[m] || 0) + 1; }
    let gatewayOk = false;
    try { gatewayOk = execSync("openclaw status 2>&1", { timeout: 5000, encoding: "utf8" }).includes("running"); } catch {}
    res.json({ agents: agents.length, totalMemories, totalTasks, totalHeartbeatLogs, models, gatewayOk, timestamp: new Date().toISOString() });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
