import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const AGENT_COLORS = { Main: "border-l-blue-1", Bosku: "border-l-purple-1", Asep: "border-l-green-1", Dimas: "border-l-amber-1", Lesti: "border-l-red-1" };

export default function Activity() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity").then(r => r.json()).then(setEntries).finally(() => setLoading(false));
    const iv = setInterval(() => fetch("/api/activity").then(r => r.json()).then(setEntries), 20000);
    return () => clearInterval(iv);
  }, []);

  const filtered = filter === "all" ? entries : entries.filter(e => e.type === filter);
  const grouped = {};
  for (const e of filtered) {
    const d = e.date || e.modifiedAt?.split("T")[0];
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  }

  if (loading) return <Layout title="Activity"><div className="text-t-3 animate-pulse text-center py-20">Loading...</div></Layout>;

  return (
    <Layout title="Activity" subtitle="Agent activity timeline">
      {/* Filters */}
      <div className="flex gap-1 mb-5 bg-surface-1 border border-border rounded-lg p-1 overflow-x-auto">
        {["all", "memory", "heartbeat"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors ${filter === f ? "bg-surface-3 text-t-1" : "text-t-3 hover:text-t-2"}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface-1 border border-border rounded-xl p-12 text-center">
          <p className="text-t-3 text-lg">No activity yet</p>
          <p className="text-t-3 text-sm mt-1">Activity appears as agents run heartbeats</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(grouped).sort().reverse().map(date => (
            <div key={date}>
              <h2 className="text-xs font-semibold text-t-3 mb-3 sticky top-0 bg-surface-0 py-1 z-10 uppercase tracking-wider">
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h2>
              <div className="space-y-2">
                {grouped[date].map((e, i) => (
                  <div key={i} className={`bg-surface-1 border border-border rounded-xl p-4 border-l-2 ${AGENT_COLORS[e.agent] || "border-l-border"}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-t-1">{e.agent}</span>
                        <span className={`text-2xs px-1.5 py-0.5 rounded font-medium ${e.type === "heartbeat" ? "bg-amber-1/10 text-amber-1" : "bg-blue-1/10 text-blue-1"}`}>{e.type}</span>
                      </div>
                      <span className="text-2xs text-t-3 shrink-0">{new Date(e.modifiedAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
                    </div>
                    <pre className="text-xs text-t-2 whitespace-pre-wrap font-mono leading-relaxed break-words">{e.preview}</pre>
                    <p className="text-2xs text-t-3 mt-2">{e.file}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
