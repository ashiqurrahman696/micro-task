"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, THead, TRow, TH, TD, Empty } from "@/components/ui/bits";

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);

  async function load() {
    // admin reuses /api/tasks?mine via direct collection? Use all tasks through admin fetch:
    const d = await fetch("/api/tasks?all=1").then((r) => r.json()).catch(() => ({ tasks: [] }));
    setTasks(d.tasks || []);
    const rep = await fetch("/api/reports").then((r) => r.json()).catch(() => ({ reports: [] }));
    setReports(rep.reports || []);
  }
  useEffect(() => { const t = setTimeout(() => load(), 0); return () => clearTimeout(t); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this task permanently?")) return;
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold">Manage Tasks</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{tasks.length} open tasks · delete invalid ones.</p>
      {tasks.length === 0 ? <div className="mt-3"><Empty title="No open tasks" /></div> : (
        <Table>
          <THead><TRow><TH>Title</TH><TH>Buyer</TH><TH>Pay</TH><TH>Slots</TH><TH></TH></TRow></THead>
          <tbody>
            {tasks.map((t: Record<string, unknown>) => (
              <TRow key={String(t._id)}>
                <TD className="max-w-52 truncate font-semibold">{String(t.task_title)}</TD>
                <TD className="text-xs">{String(t.buyer_email)}</TD>
                <TD>{Number(t.payable_amount)}</TD>
                <TD>{Number(t.required_workers)}</TD>
                <TD><Button size="sm" variant="destructive" onClick={() => remove(String(t._id))}>Delete</Button></TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
      <h2 className="mt-6 font-bold">Reports on invalid submissions ({reports.length})</h2>
      {reports.length === 0 ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No reports filed.</p> : (
        <Table>
          <THead><TRow><TH>Submission</TH><TH>Reason</TH><TH>Reporter</TH><TH>Date</TH></TRow></THead>
          <tbody>
            {reports.map((r: Record<string, unknown>) => (
              <TRow key={String(r._id)}>
                <TD className="text-xs">{String(r.submission_id)}</TD>
                <TD>{String(r.reason)}</TD>
                <TD className="text-xs">{String(r.reporter_email)}</TD>
                <TD className="text-xs">{new Date(String(r.createdAt)).toLocaleDateString()}</TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
