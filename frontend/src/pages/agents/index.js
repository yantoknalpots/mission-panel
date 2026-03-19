import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";

const COLORS = { blue: "from-blue-1 to-blue-2", green: "from-green-1 to-green-2", amber: "from-amber-1 to-amber-2", red: "from-red-1 to-red-2", purple: "from-purple-1 to-purple-2" };

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents").then(r => r.json()).then(setAgents).finally(() => setLoading(false));
    const iv = setInterval(() => fetch("/api/agents").then(r => r.json()).then(setAgents), 15000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return <Layout title="Agents"><div className="text-t-3 animate-pulse text-center py-20">Loading...</div></Layout>;

  return (
    <Layout title="Agents" subtitle="All configured OpenClaw agents">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(a => (
          <Link key={a.id} href={`/agents/${a.id}`}>
            <div className="bg-surface-1 border border-border rounded-xl p-5 hover:border-border-light hover:shadow-lg hover:shadow-black/10 transition-all group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[a.color]} flex items-center justify-center text-lg`}>{a.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-t-1 group-hover:text-blue-2 transition-colors">{a.name}</span>
                    <span className={`w-2 h-2 rounded-full ${a.active ? "bg-green-1 animate-pulse" : "bg-t-3"}`} />
                  </div>
                  <p className="text-2xs text-t-3">{a.role}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-t-3 text-xs">Model</span><code className="text-2xs bg-surface-2 px-1.5 py-0.5 rounded text-t-2">{(a.model||"").split("/").pop()}</code></div>
                <div className="flex justify-between"><span className="text-t-3 text-xs">Heartbeat</span><span className="text-xs text-t-2">{a.heartbeatInterval}</span></div>
                <div className="flex justify-between"><span className="text-t-3 text-xs">Sessions</span><span className="text-xs text-t-2">{a.sessions || 0}</span></div>
                <div className="flex justify-between"><span className="text-t-3 text-xs">Last seen</span><span className="text-xs text-t-2">{a.lastSeen ? new Date(a.lastSeen).toLocaleString("en-GB",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"}) : "never"}</span></div>
              </div>
              {a.memories?.[0] && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-2xs text-t-3 mb-1">Latest: {a.memories[0].file}</p>
                  <p className="text-2xs text-t-2 line-clamp-2">{a.memories[0].content.slice(0,150)}</p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
