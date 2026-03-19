import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const COLS = [
  { key: "todo", label: "To Do", dot: "bg-t-3" },
  { key: "in-progress", label: "In Progress", dot: "bg-blue-1" },
  { key: "review", label: "Review", dot: "bg-amber-1" },
  { key: "done", label: "Done", dot: "bg-green-1" },
];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const ASSIGNEES = ["unassigned", "Asep", "Bosku", "Dimas", "Lesti", "Main"];

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-surface-1 border border-border rounded-t-2xl sm:rounded-xl shadow-2xl shadow-black/40 max-h-[85vh] flex flex-col"
        style={{ animation: "slideUp .2s ease-out" }}>
        {children}
      </div>
      <style jsx>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

function TaskForm({ task, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(task || { title: "", description: "", assignee: "unassigned", priority: "medium", status: "todo" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-t-1">{task ? "Edit Task" : "New Task"}</h2>
        <button onClick={onClose} className="text-t-3 hover:text-t-1">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-t-2 mb-1">Title</label>
          <input value={form.title} onChange={e => set("title", e.target.value)}
            className="w-full bg-surface-0 border border-border rounded-lg px-3 py-2 text-sm text-t-1 focus:outline-none focus:ring-2 focus:ring-blue-1/40" placeholder="Task title..." autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-t-2 mb-1">Description</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4}
            className="w-full bg-surface-0 border border-border rounded-lg px-3 py-2 text-sm text-t-1 focus:outline-none focus:ring-2 focus:ring-blue-1/40 resize-none" placeholder="Details..." />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-t-2 mb-1">Assignee</label>
            <select value={form.assignee} onChange={e => set("assignee", e.target.value)}
              className="w-full bg-surface-0 border border-border rounded-lg px-3 py-2 text-sm text-t-1">
              {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-t-2 mb-1">Priority</label>
            <select value={form.priority} onChange={e => set("priority", e.target.value)}
              className="w-full bg-surface-0 border border-border rounded-lg px-3 py-2 text-sm text-t-1">
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-t-2 mb-1">Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="w-full bg-surface-0 border border-border rounded-lg px-3 py-2 text-sm text-t-1">
              {COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-4 border-t border-border">
        <div>
          {task && onDelete && <button onClick={() => { onDelete(task.id); onClose(); }} className="text-xs text-red-1 hover:underline">Delete task</button>}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs text-t-2 hover:text-t-1 rounded-lg hover:bg-surface-2">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} disabled={!form.title}
            className="px-4 py-2 text-xs bg-blue-1 text-white rounded-lg hover:bg-blue-1/90 disabled:opacity-40 font-medium">
            {task ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </>
  );
}

function TaskCard({ task, onClick }) {
  const prioColors = { urgent: "text-red-1 bg-red-1/10", high: "text-amber-1 bg-amber-1/10", medium: "text-t-2 bg-surface-3", low: "text-t-3 bg-surface-2" };
  return (
    <div onClick={() => onClick(task)}
      className="bg-surface-0 border border-border rounded-lg p-3 hover:border-border-light transition-all cursor-pointer active:scale-[0.98] group">
      <p className="text-sm text-t-1 mb-2 group-hover:text-blue-2 transition-colors">{task.title}</p>
      {task.description && <p className="text-2xs text-t-3 mb-2 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between">
        <span className="text-2xs text-t-3">{task.assignee}</span>
        <span className={`text-2xs px-1.5 py-0.5 rounded font-medium ${prioColors[task.priority] || prioColors.medium}`}>{task.priority}</span>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "new" | task object

  const load = () => fetch("/api/tasks").then(r => r.json()).then(setTasks).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async (form) => {
    const method = form.id ? "PUT" : "POST";
    await fetch("/api/tasks", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    load();
  };

  const del = async (id) => {
    await fetch("/api/tasks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  if (loading) return <Layout title="Tasks"><div className="text-t-3 animate-pulse text-center py-20">Loading...</div></Layout>;

  return (
    <Layout title="Tasks" subtitle="Kanban board — create, assign, and track">
      {/* New task button */}
      <div className="flex justify-end mb-4">
        <button onClick={() => setModal("new")}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-1 text-white rounded-lg text-xs font-medium hover:bg-blue-1/90 transition-colors shadow-lg shadow-blue-1/20">
          <span className="text-base leading-none">+</span> New Task
        </button>
      </div>

      {/* Desktop kanban */}
      <div className="hidden md:grid grid-cols-4 gap-4 min-h-[60vh]">
        {COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="flex flex-col">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-semibold text-t-2">{col.label}</span>
                <span className="text-2xs text-t-3 bg-surface-2 px-1.5 rounded-full ml-auto">{colTasks.length}</span>
              </div>
              <div className="flex-1 bg-surface-1 rounded-xl p-2 space-y-2 border border-border min-h-[100px]">
                {colTasks.map(t => <TaskCard key={t.id} task={t} onClick={setModal} />)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile stacked */}
      <div className="md:hidden space-y-5">
        {COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          if (!colTasks.length) return null;
          return (
            <div key={col.key}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-semibold text-t-2">{col.label}</span>
                <span className="text-2xs text-t-3 bg-surface-2 px-1.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map(t => <TaskCard key={t.id} task={t} onClick={setModal} />)}
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && <div className="text-center py-12 text-t-3">No tasks yet. Tap + to create one.</div>}
      </div>

      {/* Modal */}
      <Modal open={modal !== null} onClose={() => setModal(null)}>
        <TaskForm
          task={modal && modal !== "new" ? modal : null}
          onSave={save} onClose={() => setModal(null)} onDelete={del}
        />
      </Modal>
    </Layout>
  );
}
