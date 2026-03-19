import { useEffect, useState, useRef } from "react";

const AGENTS_META = {
  main: { name: "Claw", emoji: "🦞", skinColor: "#e74c3c", shirtColor: "#c0392b" },
  bosku: { name: "Bosku", emoji: "👔", skinColor: "#f39c12", shirtColor: "#8e44ad" },
  asep: { name: "Asep", emoji: "💻", skinColor: "#2ecc71", shirtColor: "#27ae60" },
  dimas: { name: "Dimas", emoji: "🔍", skinColor: "#3498db", shirtColor: "#2980b9" },
  lesti: { name: "Lesti", emoji: "⚡", skinColor: "#e91e63", shirtColor: "#c2185b" },
};

function Character({ agent, index, containerWidth }) {
  const initX = 60 + index * 100;
  const [pos, setPos] = useState({ x: initX, y: 130 });
  const [target, setTarget] = useState({ x: initX, y: 130 });
  const [facing, setFacing] = useState(1); // 1=right, -1=left
  const [frame, setFrame] = useState(0);
  const meta = AGENTS_META[agent.id] || AGENTS_META.main;
  const isActive = agent.active;

  // Desk positions — spread evenly across container width
  const totalAgents = 5;
  const margin = 50;
  const spacing = Math.max(80, (Math.max(containerWidth, 400) - margin * 2) / totalAgents);
  const deskX = margin + index * spacing;
  const deskY = 140;

  useEffect(() => {
    if (isActive) {
      // Go to desk
      setTarget({ x: deskX, y: deskY });
    } else {
      // Wander randomly
      const wander = () => {
        const maxW = Math.max(containerWidth - 40, 300);
        setTarget({
          x: 20 + Math.random() * (maxW - 40),
          y: 80 + Math.random() * 100,
        });
      };
      wander();
      const iv = setInterval(wander, 3000 + Math.random() * 4000);
      return () => clearInterval(iv);
    }
  }, [isActive, deskX, containerWidth]);

  // Animate position
  useEffect(() => {
    const iv = setInterval(() => {
      setPos(p => {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) return p;
        const speed = isActive ? 2 : 0.8;
        const nx = p.x + (dx / dist) * Math.min(speed, dist);
        const ny = p.y + (dy / dist) * Math.min(speed, dist);
        if (Math.abs(dx) > 1) setFacing(dx > 0 ? 1 : -1);
        return { x: nx, y: ny };
      });
      setFrame(f => f + 1);
    }, 30);
    return () => clearInterval(iv);
  }, [target, isActive]);

  const atDesk = isActive && Math.abs(pos.x - deskX) < 5 && Math.abs(pos.y - deskY) < 5;
  const isMoving = Math.abs(pos.x - target.x) > 2 || Math.abs(pos.y - target.y) > 2;
  const bobble = isMoving ? Math.sin(frame * 0.3) * 2 : 0;

  // Task bubble text
  const taskText = agent.currentTask
    ? agent.currentTask.split("\n").find(l => l.startsWith("# "))?.replace("# ", "").slice(0, 30) || agent.role
    : agent.role;

  return (
    <g transform={`translate(${pos.x}, ${pos.y + bobble})`}>
      {/* Shadow */}
      <ellipse cx="0" cy="32" rx="12" ry="4" fill="rgba(0,0,0,0.3)" />

      {/* Desk (if active and at desk) */}
      {isActive && atDesk && (
        <g transform="translate(-18, 8)">
          {/* Desk surface */}
          <rect x="0" y="10" width="36" height="4" rx="1" fill="#4a3728" />
          <rect x="2" y="14" width="2" height="12" fill="#3d2b1f" />
          <rect x="32" y="14" width="2" height="12" fill="#3d2b1f" />
          {/* Monitor */}
          <rect x="8" y="-4" width="20" height="14" rx="2" fill="#1a1a2e" stroke="#333" strokeWidth="1" />
          <rect x="10" y="-2" width="16" height="10" rx="1" fill="#0f3460" />
          {/* Screen glow */}
          <rect x="11" y="-1" width="14" height="8" rx="0.5" fill="#16213e" opacity="0.8" />
          {/* Code lines on screen */}
          <line x1="12" y1="0" x2="20" y2="0" stroke="#4ade80" strokeWidth="0.5" opacity="0.7" />
          <line x1="12" y1="1.5" x2="22" y2="1.5" stroke="#818cf8" strokeWidth="0.5" opacity="0.7" />
          <line x1="12" y1="3" x2="18" y2="3" stroke="#fbbf24" strokeWidth="0.5" opacity="0.7" />
          <line x1="12" y1="4.5" x2="21" y2="4.5" stroke="#4ade80" strokeWidth="0.5" opacity="0.5" />
          {/* Monitor stand */}
          <rect x="16" y="10" width="4" height="3" fill="#555" />
        </g>
      )}

      {/* Character body */}
      <g transform={`scale(${facing}, 1)`}>
        {/* Body */}
        <rect x="-6" y="8" width="12" height="14" rx="3" fill={meta.shirtColor} />
        {/* Head */}
        <circle cx="0" cy="2" r="8" fill={meta.skinColor} />
        {/* Eyes */}
        <circle cx="-3" cy="0" r="1.5" fill="white" />
        <circle cx="3" cy="0" r="1.5" fill="white" />
        <circle cx={atDesk ? "-2" : "-2.5"} cy={atDesk ? "-0.5" : "0"} r="0.8" fill="#222" />
        <circle cx={atDesk ? "3.5" : "3"} cy={atDesk ? "-0.5" : "0"} r="0.8" fill="#222" />
        {/* Mouth */}
        {isActive ? (
          <path d="M-2 4 Q0 6 2 4" stroke="#222" strokeWidth="0.8" fill="none" />
        ) : (
          <line x1="-2" y1="4" x2="2" y2="4" stroke="#222" strokeWidth="0.8" />
        )}
        {/* Legs */}
        {isMoving ? (
          <>
            <line x1="-3" y1="22" x2={-3 + Math.sin(frame * 0.4) * 4} y2="30" stroke={meta.shirtColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="3" y1="22" x2={3 - Math.sin(frame * 0.4) * 4} y2="30" stroke={meta.shirtColor} strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="-3" y1="22" x2="-3" y2="30" stroke={meta.shirtColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="3" y1="22" x2="3" y2="30" stroke={meta.shirtColor} strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {/* Arms */}
        {atDesk ? (
          <>
            <line x1="-6" y1="12" x2="-12" y2="18" stroke={meta.skinColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="6" y1="12" x2="12" y2="18" stroke={meta.skinColor} strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : isMoving ? (
          <>
            <line x1="-6" y1="12" x2={-8 - Math.sin(frame * 0.4) * 3} y2={18 + Math.cos(frame * 0.4) * 2} stroke={meta.skinColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="6" y1="12" x2={8 + Math.sin(frame * 0.4) * 3} y2={18 - Math.cos(frame * 0.4) * 2} stroke={meta.skinColor} strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="-6" y1="12" x2="-8" y2="20" stroke={meta.skinColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="6" y1="12" x2="8" y2="20" stroke={meta.skinColor} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
      </g>

      {/* Name tag */}
      <text x="0" y="40" textAnchor="middle" fill="#999" fontSize="8" fontFamily="sans-serif" fontWeight="600">
        {meta.name}
      </text>

      {/* Chat bubble */}
      <g transform="translate(0, -24)">
        <rect x="-45" y="-16" width="90" height="20" rx="8" fill="rgba(30,30,30,0.9)" stroke="#333" strokeWidth="0.5" />
        {/* Bubble tail */}
        <polygon points="-2,4 2,4 0,8" fill="rgba(30,30,30,0.9)" />
        <text x="0" y="-3" textAnchor="middle" fill={isActive ? "#4ade80" : "#999"} fontSize="6.5" fontFamily="sans-serif">
          {isActive ? (taskText.length > 28 ? taskText.slice(0, 28) + "…" : taskText) : "💤 idle"}
        </text>
      </g>

      {/* Status indicator */}
      <circle cx="8" cy="-4" r="3" fill={isActive ? "#22c55e" : "#666"}>
        {isActive && <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />}
      </circle>
    </g>
  );
}

export default function AgentWorld({ agents }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(750);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const height = 220;

  return (
    <div ref={containerRef} className="bg-surface-1 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold text-t-1">🏢 Agent Office</span>
        <span className="text-2xs text-t-3">{agents.filter(a => a.active).length}/{agents.length} working</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bg-[#0d0d0d]">
        {/* Floor */}
        <rect x="0" y={height - 30} width={width} height="30" fill="#1a1a1a" />
        <line x1="0" y1={height - 30} x2={width} y2={height - 30} stroke="#262626" strokeWidth="1" />

        {/* Wall pattern */}
        {Array.from({ length: Math.ceil(width / 80) }).map((_, i) => (
          <line key={i} x1={i * 80} y1="0" x2={i * 80} y2={height - 30} stroke="#161616" strokeWidth="0.5" />
        ))}

        {/* Window */}
        <rect x={width - 100} y="20" width="60" height="50" rx="3" fill="#0a1628" stroke="#2a2a2a" strokeWidth="1" />
        <line x1={width - 100} y1="45" x2={width - 40} y2="45" stroke="#2a2a2a" strokeWidth="0.5" />
        <line x1={width - 70} y1="20" x2={width - 70} y2="70" stroke="#2a2a2a" strokeWidth="0.5" />
        {/* Stars */}
        <circle cx={width - 85} cy="30" r="1" fill="#fff" opacity="0.3" />
        <circle cx={width - 55} cy="38" r="0.8" fill="#fff" opacity="0.2" />
        <circle cx={width - 65} cy="55" r="1" fill="#fff" opacity="0.25" />

        {/* Plant */}
        <rect x="15" y={height - 55} width="8" height="20" rx="2" fill="#5d4037" />
        <circle cx="19" cy={height - 60} r="10" fill="#2e7d32" opacity="0.8" />
        <circle cx="14" cy={height - 55} r="7" fill="#388e3c" opacity="0.7" />

        {/* Agents */}
        {agents.map((agent, i) => (
          <Character key={agent.id} agent={agent} index={i} containerWidth={width} />
        ))}
      </svg>
    </div>
  );
}
