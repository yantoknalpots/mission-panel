/**
 * Syncs dashboard tasks assigned to agents into their workspace TASK.md
 * Called automatically when tasks are created/updated, or on GET to force sync.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const OC = "/Users/yanto/.openclaw";
const TASKS_DIR = join(OC, "workspace/mission-control/tasks");

const AGENT_WORKSPACES = {
  Asep: join(OC, "workspace-asep"),
  Bosku: join(OC, "workspace-bosku"),
  Dimas: join(OC, "workspace-dimas"),
  Lesti: join(OC, "workspace-lesti"),
  Main: join(OC, "workspace"),
};

function syncToAgent(agentName, tasks) {
  const ws = AGENT_WORKSPACES[agentName];
  if (!ws || !existsSync(ws)) return;

  const active = tasks.filter(t => t.assignee === agentName && t.status !== "done");
  const done = tasks.filter(t => t.assignee === agentName && t.status === "done");

  if (active.length === 0 && done.length === 0) {
    // Remove TASK.md if no tasks
    return;
  }

  const lines = [
    `# Tasks for ${agentName}`,
    `_Last synced: ${new Date().toISOString()}_`,
    "",
  ];

  if (active.length > 0) {
    lines.push("## Active Tasks");
    for (const t of active) {
      lines.push(`\n### [${t.status.toUpperCase()}] ${t.title}`);
      lines.push(`- **Priority:** ${t.priority}`);
      lines.push(`- **Status:** ${t.status}`);
      if (t.description) lines.push(`- **Description:** ${t.description}`);
      lines.push(`- **ID:** ${t.id}`);
    }
    lines.push("");
  }

  if (done.length > 0) {
    lines.push("## Completed Tasks");
    for (const t of done) {
      lines.push(`- ~~${t.title}~~`);
    }
  }

  lines.push("\n---");
  lines.push("When you complete a task, reply with: TASK_DONE:<task_id>");

  writeFileSync(join(ws, "TASK.md"), lines.join("\n"));
}

export default function handler(req, res) {
  try {
    if (!existsSync(TASKS_DIR)) return res.json({ synced: 0 });
    const tasks = readdirSync(TASKS_DIR).filter(f => f.endsWith(".json")).map(f => {
      try { return JSON.parse(readFileSync(join(TASKS_DIR, f), "utf8")); } catch { return null; }
    }).filter(Boolean);

    let synced = 0;
    for (const agent of Object.keys(AGENT_WORKSPACES)) {
      syncToAgent(agent, tasks);
      synced++;
    }

    res.json({ ok: true, synced, tasks: tasks.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
