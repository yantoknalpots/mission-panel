import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    const r = await signIn("credentials", { username: u, password: p, redirect: false });
    setLoading(false);
    r?.ok ? router.push("/") : setErr("Invalid credentials");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-0 px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-1/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-1/5 rounded-full blur-[80px]" />
      </div>
      <div className="w-full max-w-[360px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-1 to-purple-1 items-center justify-center mb-4 shadow-lg shadow-blue-1/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-t-1">Mission Control</h1>
          <p className="text-sm text-t-3 mt-1">Agent management dashboard</p>
        </div>
        <form onSubmit={submit} className="bg-surface-1 border border-border rounded-xl p-6 shadow-xl shadow-black/30 space-y-4">
          <div>
            <label className="block text-xs font-medium text-t-2 mb-1.5">Username</label>
            <input type="text" value={u} onChange={e => setU(e.target.value)} autoFocus autoComplete="username"
              className="w-full bg-surface-0 border border-border rounded-lg px-3.5 py-2.5 text-sm text-t-1 placeholder-t-3 focus:outline-none focus:ring-2 focus:ring-blue-1/40 focus:border-blue-1 transition-all" placeholder="admin" />
          </div>
          <div>
            <label className="block text-xs font-medium text-t-2 mb-1.5">Password</label>
            <input type="password" value={p} onChange={e => setP(e.target.value)} autoComplete="current-password"
              className="w-full bg-surface-0 border border-border rounded-lg px-3.5 py-2.5 text-sm text-t-1 placeholder-t-3 focus:outline-none focus:ring-2 focus:ring-blue-1/40 focus:border-blue-1 transition-all" placeholder="••••••••" />
          </div>
          {err && <div className="text-sm text-red-1 bg-red-1/5 border border-red-1/20 rounded-lg px-3 py-2">{err}</div>}
          <button type="submit" disabled={loading || !u || !p}
            className="w-full bg-blue-1 hover:bg-blue-1/90 active:scale-[0.98] text-white rounded-lg py-2.5 text-sm font-semibold transition-all disabled:opacity-40 shadow-lg shadow-blue-1/20">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-1 animate-pulse"/>
          <span className="text-2xs text-t-3">5 agents online</span>
        </div>
      </div>
    </div>
  );
}
