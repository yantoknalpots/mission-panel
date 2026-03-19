import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import AgentWorld from "../components/AgentWorld";

const COLORS = { blue: "from-blue-1 to-blue-2", green: "from-green-1 to-green-2", amber: "from-amber-1 to-amber-2", red: "from-red-1 to-red-2", purple: "from-purple-1 to-purple-2" };

function Stat({ label, value, sub, color = "blue" }) {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-4 relative overflow-hidden group hover:border-border-light transition-colors">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${COLORS[color]} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
      <p className="text-2xs uppercase tracking-wider text-t-3 font-medium">{label}</p>
      <p className="text-2xl font-bold text-t-1 mt-1">{value}</p>
      {sub && <p className="text-2xs text-t-3 mt-1">{sub}</p>}
    </div>
  );
}

function AgentRow({ agent }) {
  const modelShort = (agent.model || "").split("/").pop();
  return (
    <Link href={`/agents/${agent.id}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer group">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${COLORS[agent.color]} flex items-center justify-center text-base shrink-0`}>
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-t-1 group-hover:text-blue-2 transition-colors">{agent.name}</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent.active ? "bg-green-1" : "bg-t-3"}`} />
          </div>
          <p className="text-2xs text-t-3 truncate">{agent.role} · <span className="font-mono">{modelShort}</span></p>
        </div>
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-2xs text-t-3">{agent.heartbeatInterval}</p>
          <p className="text-2xs text-t-3">
            {agent.lastSeen ? new Date(agent.lastSeen).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function TaskRow({ task }) {
  const statusColors = { todo: "bg-t-3", "in-progress": "bg-blue-1", review: "bg-amber-1", done: "bg-green-1" };
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors">
      <span className={`w-2 h-2 rounded-full shrink-0 ${statusColors[task.status] || "bg-t-3"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-t-1 truncate">{task.title}</p>
        <p className="text-2xs text-t-3">{task.assignee} · {task.priority}</p>
      </div>
      <span className="text-2xs text-t-3 capitalize shrink-0">{task.status}</span>
    </div>
  );
}

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/agents").then(r => r.json()),
      fetch("/api/tasks").then(r => r.json()),
      fetch("/api/stats").then(r => r.json()),
    ]).then(([a, t, s]) => { setAgents(a); setTasks(t); setStats(s); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [load]);

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="text-t-3 animate-pulse">Loading dashboard...</div></div></Layout>;

  const activeAgents = agents.filter(a => a.active).length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;

  return (
    <Layout title="Dashboard" subtitle="Multi-agent mission control overview">
      {/* Agent Office Visualization */}
      <div className="mb-6">
        <AgentWorld agents={agents} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <Stat label="Agents" value={agents.length} sub={`${activeAgents} active`} color="blue" />
        <Stat label="Tasks" value={tasks.length} sub={`${inProgress} in progress`} color="purple" />
        <Stat label="Memory Files" value={stats?.totalMemories || 0} color="green" />
        <Stat label="Heartbeat Logs" value={stats?.totalHeartbeatLogs || 0} color="amber" />
        <Stat label="Gateway" value={stats?.gatewayOk ? "Online" : "Offline"} sub={stats?.gatewayOk ? "Healthy" : "Check logs"} color={stats?.gatewayOk ? "green" : "red"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents */}
        <div className="bg-surface-1 border border-border rounded-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-t-1">Agents</h2>
            <Link href="/agents" className="text-2xs text-blue-2 hover:underline">View all →</Link>
          </div>
          <div className="p-1 divide-y divide-border">
            {agents.map(a => <AgentRow key={a.id} agent={a} />)}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-surface-1 border border-border rounded-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-t-1">Recent Tasks</h2>
            <Link href="/tasks" className="text-2xs text-blue-2 hover:underline">View board →</Link>
          </div>
          <div className="p-1 divide-y divide-border">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-t-3 text-sm">No tasks yet. <Link href="/tasks" className="text-blue-2 hover:underline">Create one →</Link></div>
            ) : tasks.slice(0, 8).map(t => <TaskRow key={t.id} task={t} />)}
          </div>
        </div>
      </div>

      {/* Model breakdown */}
      {stats?.models && (
        <div className="mt-6 bg-surface-1 border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-t-1 mb-3">Model Distribution</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.models).map(([model, count]) => (
              <div key={model} className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2">
                <code className="text-2xs text-t-2 font-mono">{model.split("/").pop()}</code>
                <span className="text-2xs bg-surface-3 text-t-1 px-1.5 py-0.5 rounded-full font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
