import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const nav = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/agents", label: "Agents", icon: "🤖" },
  { href: "/tasks", label: "Tasks", icon: "📋" },
  { href: "/activity", label: "Activity", icon: "📊" },
  { href: "/terminal", label: "Terminal", icon: "▸" },
];

function NavItem({ href, label, icon, active, onClick }) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
        active ? "bg-surface-3 text-t-1 shadow-sm" : "text-t-2 hover:bg-surface-2 hover:text-t-1"
      }`}>
      <span className="text-base w-5 text-center">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function Layout({ children, title, subtitle }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const active = (h) => h === "/" ? router.pathname === "/" : router.pathname.startsWith(h);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      {/* Mobile bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-surface-1/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="text-t-2 hover:text-t-1">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h14M3 10h14M3 14h14"/></svg>
        </button>
        <span className="font-semibold text-t-1 text-sm">Mission Control</span>
      </div>

      {/* Overlay */}
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-surface-1 border-r border-border flex flex-col transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-1 to-purple-1 flex items-center justify-center text-xs font-bold text-white">M</div>
              <div>
                <div className="font-semibold text-t-1 text-sm leading-tight">Mission Control</div>
                <div className="text-2xs text-t-3">OpenClaw Agents</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="lg:hidden text-t-3 hover:text-t-1">✕</button>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(n => <NavItem key={n.href} {...n} active={active(n.href)} onClick={() => setOpen(false)} />)}
        </nav>
        <div className="px-3 py-3 border-t border-border space-y-2">
          <div className="flex items-center gap-1.5 text-2xs text-t-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-1 animate-pulse" />Gateway online
          </div>
          {session && (
            <button onClick={() => signOut({ callbackUrl: `${typeof window!=='undefined'?window.location.origin:''}/login` })}
              className="text-2xs text-t-3 hover:text-red-1 transition-colors">
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-xl sm:text-2xl font-bold text-t-1">{title}</h1>}
              {subtitle && <p className="text-t-2 text-sm mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
