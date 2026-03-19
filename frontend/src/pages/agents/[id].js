import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";

const COLORS = { blue: "from-blue-1 to-blue-2", green: "from-green-1 to-green-2", amber: "from-amber-1 to-amber-2", red: "from-red-1 to-red-2", purple: "from-purple-1 to-purple-2" };

function Section({ title, children, empty }) {
  return (
    <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-t-1">{title}</h3></div>
      <div className="p-4">{children || <p className="text-sm text-t-3 text-center py-4">{empty || "Nothing here"}</p>}</div>
    </div>
  );
}

export default function AgentDetail() {
  const { id } = useRouter().query;
  const [agent, setAgent] = useState(null);
  const [activity, setActivity] = useState([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch("/api/agents").then(r => r.json()),
      fetch("/api/activity").then(r => r.json()),
    ]).then(([agents, acts]) => {
      setAgent(agents.find(a => a.id === id));
      setActivity(acts.filter(a => a.agentId === id));
    });
  }, [id]);

  if (!agent) return <Layout><div className="text-t-3 animate-pulse text-center py-20">Loading...</div></Layout>;

  const tabs = ["overview", "memory", "heartbeat", "soul"];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-t-3 mb-4">
        <Link href="/agents" className="hover:text-t-2">Agents</Link><span>/</span><span className="text-t-1">{agent.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${COLORS[agent.color]} flex items-center justify-center text-2xl`}>{agent.emoji}</div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-t-1">{agent.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${agent.active ? "bg-green-1/10 text-green-1" : "bg-surface-3 text-t-3"}`}>{agent.active ? "active" : "idle"}</span>
          </div>
          <p className="text-sm text-t-2">{agent.role}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { l: "Model", v: (agent.model||"").split("/").pop() },
          { l: "Heartbeat", v: agent.heartbeatInterval },
          { l: "Sessions", v: agent.sessions || 0 },
          { l: "Memories", v: agent.memories?.length || 0 },
        ].map(s => (
          <div key={s.l} className="bg-surface-1 border border-border rounded-xl p-3">
            <p className="text-2xs text-t-3 uppercase tracking-wider">{s.l}</p>
            <p className="text-sm font-semibold text-t-1 mt-1 font-mono">{s.v}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface-1 border border-border rounded-lg p-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap ${tab === t ? "bg-surface-3 text-t-1" : "text-t-3 hover:text-t-2"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-4">
          {agent.currentTask && (
            <Section title="Current Task">
              <pre className="text-xs text-t-2 whitespace-pre-wrap font-mono leading-relaxed">{agent.currentTask}</pre>
            </Section>
          )}
          <Section title="Activity Log" empty="No activity recorded yet">
            {activity.length > 0 && (
              <div className="space-y-2">
                {activity.slice(0, 10).map((e, i) => (
                  <div key={i} className="p-3 bg-surface-0 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xs text-t-3">{e.file}</span>
                      <span className="text-2xs text-t-3">{new Date(e.modifiedAt).toLocaleString("en-GB",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"})}</span>
                    </div>
                    <p className="text-xs text-t-2 whitespace-pre-wrap">{e.preview}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {tab === "memory" && (
        <div className="space-y-3">
          {(agent.memories || []).length === 0 ? (
            <Section title="Memory" empty="No memory files yet" />
          ) : agent.memories.map((m, i) => (
            <Section key={i} title={m.file}>
              <pre className="text-xs text-t-2 whitespace-pre-wrap font-mono leading-relaxed">{m.content}</pre>
              <p className="text-2xs text-t-3 mt-2">{m.size} bytes</p>
            </Section>
          ))}
        </div>
      )}

      {tab === "heartbeat" && (
        <Section title="HEARTBEAT.md" empty="No heartbeat config">
          {agent.heartbeatMd && <pre className="text-xs text-t-2 whitespace-pre-wrap font-mono leading-relaxed">{agent.heartbeatMd}</pre>}
        </Section>
      )}

      {tab === "soul" && (
        <Section title="SOUL.md" empty="No soul file">
          {agent.soul && <pre className="text-xs text-t-2 whitespace-pre-wrap font-mono leading-relaxed">{agent.soul}</pre>}
        </Section>
      )}
    </Layout>
  );
}
