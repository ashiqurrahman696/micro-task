"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, THead, TRow, TH, TD, Empty } from "@/components/ui/bits";
import { formatDate } from "@/lib/utils";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const d = await fetch("/api/tasks?mine=1").then((r) => r.json()).catch(() => ({ tasks: [] }));
    setTasks(d.tasks || []);
  }
  useEffect(() => { const t = setTimeout(() => load(), 0); return () => clearTimeout(t); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this task? Uncompleted coin slots will be refunded.")) return;
    const r = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    const d = await r.json();
    setMsg(r.ok ? `Deleted. Refunded ${d.refill} coins.` : d.error || "Delete failed");
    load();
  }

  async function save() {
    if (!editing) return;
    const r = await fetch(`/api/tasks?id=${String(editing._id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_title: editing.task_title, task_detail: editing.task_detail, submission_info: editing.submission_info }),
    });
    setMsg(r.ok ? "Task updated." : "Update failed");
    setEditing(null);
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold">My Task&apos;s</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Sorted by completion date · update title/detail/proof or delete for refund.</p>
      {msg && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{msg}</p>}
      {tasks.length === 0 ? <div className="mt-3"><Empty title="No tasks yet" hint="Create your first task to hire workers." /></div> : (
        <Table>
          <THead><TRow><TH>Title</TH><TH>Workers left</TH><TH>Pay</TH><TH>Deadline</TH><TH>Actions</TH></TRow></THead>
          <tbody>
            {tasks.map((t: Record<string, unknown>) => (
              <TRow key={String(t._id)}>
                <TD className="max-w-52 truncate font-semibold">{String(t.task_title)}</TD>
                <TD>{Number(t.required_workers)}</TD>
                <TD>{Number(t.payable_amount)}</TD>
                <TD className="text-xs">{formatDate(t.completion_date as string)}</TD>
                <TD>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => setEditing(t)}>Update</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(String(t._id))}>Delete</Button>
                  </div>
                </TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-6 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">Update task</h3>
            <Input value={String(editing.task_title)} onChange={(e) => setEditing({ ...editing, task_title: e.target.value })} />
            <textarea className="min-h-24 w-full rounded-xl border border-slate-200 bg-transparent p-2 text-sm dark:border-slate-700" value={String(editing.task_detail || "")} onChange={(e) => setEditing({ ...editing, task_detail: e.target.value })} />
            <textarea className="min-h-20 w-full rounded-xl border border-slate-200 bg-transparent p-2 text-sm dark:border-slate-700" value={String(editing.submission_info || "")} onChange={(e) => setEditing({ ...editing, submission_info: e.target.value })} />
            <div className="flex gap-2"><Button className="flex-1" onClick={save}>Save</Button><Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
