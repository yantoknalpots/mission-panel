import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";

const PRESETS = [
  { label: "Agent Status", cmd: "openclaw status" },
  { label: "Ollama Models", cmd: "ollama ps" },
  { label: "Agent Sessions", cmd: "ls -la /Users/yanto/.openclaw/agents/*/sessions/sessions.json" },
  { label: "Heartbeat Logs", cmd: "ls -lt /Users/yanto/.openclaw/workspace/heartbeat-logs/ | head -20" },
  { label: "Asep Memory", cmd: "cat /Users/yanto/.openclaw/workspace-asep/memory/2026-03-19.md" },
  { label: "Bosku Memory", cmd: "cat /Users/yanto/.openclaw/workspace-bosku/memory/2026-03-19.md" },
  { label: "Dimas Memory", cmd: "cat /Users/yanto/.openclaw/workspace-dimas/memory/2026-03-19.md" },
  { label: "Dashboard Port", cmd: "curl -s http://localhost:3000/api/agents | head -20" },
];

export default function Terminal() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const run = async (cmd) => {
    if (!cmd.trim()) return;
    setRunning(true);
    setHistory(h => [...h, { type: "cmd", text: cmd }]);
    setInput("");
    try {
      const res = await fetch("/api/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      setHistory(h => [...h, {
        type: res.ok && !data.error ? "out" : "err",
        text: data.output || data.error || "No output",
        code: data.exitCode,
      }]);
    } catch (e) {
      setHistory(h => [...h, { type: "err", text: e.message }]);
    }
    setRunning(false);
    inputRef.current?.focus();
  };

  return (
    <Layout title="Terminal" subtitle="Execute commands on the host (whitelisted)">
      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map(p => (
          <button key={p.cmd} onClick={() => run(p.cmd)}
            className="px-3 py-1.5 bg-surface-1 border border-border rounded-lg text-2xs text-t-2 hover:bg-surface-2 hover:text-t-1 transition-colors whitespace-nowrap">
            {p.label}
          </button>
        ))}
      </div>

      {/* Terminal */}
      <div className="bg-surface-1 border border-border rounded-xl overflow-hidden flex flex-col" style={{ minHeight: "60vh" }}>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 scrollbar-hide" onClick={() => inputRef.current?.focus()}>
          {history.length === 0 && (
            <div className="text-t-3 py-8 text-center">
              <p className="text-sm mb-1">Welcome to Mission Control Terminal</p>
              <p className="text-2xs">Allowed: openclaw, ollama, cat, ls, head, tail, grep, wc, curl localhost</p>
            </div>
          )}
          {history.map((h, i) => (
            <div key={i}>
              {h.type === "cmd" && (
                <div className="flex gap-2"><span className="text-green-1 shrink-0">❯</span><span className="text-t-1">{h.text}</span></div>
              )}
              {h.type === "out" && <pre className="text-t-2 whitespace-pre-wrap pl-4 break-all">{h.text}</pre>}
              {h.type === "err" && <pre className="text-red-1 whitespace-pre-wrap pl-4 break-all">{h.text}</pre>}
            </div>
          ))}
          {running && <div className="text-t-3 animate-pulse pl-4">Running...</div>}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3 flex items-center gap-2">
          <span className="text-green-1 font-mono text-sm shrink-0">❯</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !running && run(input)}
            className="flex-1 bg-transparent text-sm text-t-1 font-mono focus:outline-none placeholder-t-3"
            placeholder="Type a command..." autoFocus disabled={running} />
          <button onClick={() => run(input)} disabled={running || !input.trim()}
            className="px-3 py-1 bg-surface-3 text-t-2 rounded text-xs hover:bg-surface-4 disabled:opacity-30 transition-colors">
            Run
          </button>
        </div>
      </div>
    </Layout>
  );
}
