"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Stat, Table, THead, TRow, TH, TD, Badge, Empty } from "@/components/ui/bits";
import { formatDate } from "@/lib/utils";

export default function DashboardHome() {
  const { data: session } = authClient.useSession();
  const role = String((session?.user as unknown as Record<string, unknown> | undefined)?.role ?? "worker");
  if (role === "buyer") return <BuyerHome />;
  if (role === "admin") return <AdminHome />;
  return <WorkerHome />;
}

function useStats<T>() {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  return data;
}

/* ---------------- WORKER HOME ---------------- */
function WorkerHome() {
  const s = useStats<{ total: number; pending: number; earning: number; coins: number }>();
  const [approved, setApproved] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    fetch("/api/submissions?scope=approved&limit=10").then((r) => r.json()).then((d) => setApproved(d.submissions || [])).catch(() => {});
  }, []);
  return (
    <div>
      <h1 className="text-xl font-extrabold">Worker Dashboard</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Track submissions and earnings.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Total Submissions" value={s?.total ?? "—"} />
        <Stat label="Pending Submissions" value={s?.pending ?? "—"} />
        <Stat label="Total Earning (coins)" value={s?.earning ?? "—"} sub={`≈ $${((s?.earning || 0) / 20).toFixed(2)}`} />
      </div>
      <h2 className="mt-6 font-bold">Approved Submissions</h2>
      {approved.length === 0 ? <div className="mt-2"><Empty title="No approved submissions yet" hint="Complete tasks from the TaskList." /></div> : (
        <Table>
          <THead><TRow><TH>Task</TH><TH>Payable</TH><TH>Buyer</TH><TH>Status</TH></TRow></THead>
          <tbody>
            {approved.map((a: Record<string, unknown>) => (
              <TRow key={String(a._id)}><TD>{String(a.task_title)}</TD><TD className="font-bold">{Number(a.payable_amount)} coins</TD><TD>{String(a.buyer_name)}</TD><TD><Badge variant="success">{String(a.status)}</Badge></TD></TRow>
            ))}
          </tbody>
        </Table>
      )}
      <Link href="/dashboard/tasks"><Button className="mt-4">Browse tasks</Button></Link>
    </div>
  );
}

/* ---------------- BUYER HOME ---------------- */
function BuyerHome() {
  const s = useStats<{ taskCount: number; pendingWorkers: number; paid: number; toReview: number }>();
  const [pending, setPending] = useState<Record<string, unknown>[]>([]);
  const [msg, setMsg] = useState("");
  const [view, setView] = useState<Record<string, unknown> | null>(null);

  async function load() {
    const r = await fetch("/api/submissions?scope=todo-review&limit=50").then((r) => r.json()).catch(() => ({ submissions: [] }));
    setPending(r.submissions || []);
  }
  useEffect(() => { const t = setTimeout(() => load(), 0); return () => clearTimeout(t); }, []);

  async function review(id: string, action: "approve" | "reject") {
    setMsg("");
    const r = await fetch(`/api/submissions?id=${id}&action=${action}`, { method: "PATCH" });
    const d = await r.json();
    if (!r.ok) setMsg(d.error || "Action failed");
    else { setMsg(action === "approve" ? "Approved & worker paid." : "Rejected."); load(); }
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold">Buyer Dashboard</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Manage tasks, reviews and payments.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Total Tasks" value={s?.taskCount ?? "—"} />
        <Stat label="Pending Workers (slots)" value={s?.pendingWorkers ?? "—"} />
        <Stat label="Total Paid ($)" value={s ? `$${s.paid}` : "—"} />
      </div>

      <h2 className="mt-6 font-bold">Tasks To Review <span className="text-sm font-normal text-slate-500">({pending.length} pending)</span></h2>
      {msg && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{msg}</p>}
      {pending.length === 0 ? <div className="mt-2"><Empty title="Nothing to review" hint="New worker submissions will appear here." /></div> : (
        <Table>
          <THead><TRow><TH>Worker</TH><TH>Task</TH><TH>Payable</TH><TH>Submission</TH><TH>Actions</TH></TRow></THead>
          <tbody>
            {pending.map((p: Record<string, unknown>) => (
              <TRow key={String(p._id)}>
                <TD>{String(p.worker_name)}</TD>
                <TD className="max-w-48 truncate">{String(p.task_title)}</TD>
                <TD className="font-bold">{Number(p.payable_amount)}</TD>
                <TD><Button size="sm" variant="outline" onClick={() => setView(p)}>View</Button></TD>
                <TD>
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => review(String(p._id), "approve")}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => review(String(p._id), "reject")}>Reject</Button>
                  </div>
                </TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setView(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">Submission detail</h3>
            <p className="mt-2 text-sm"><span className="font-semibold">Worker:</span> {String(view.worker_name)} ({String(view.worker_email)})</p>
            <p className="text-sm"><span className="font-semibold">Task:</span> {String(view.task_title)}</p>
            <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">{String(view.submission_details)}</p>
            <p className="mt-2 text-xs text-slate-500">Submitted {formatDate(view.createdAt as string)}</p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => setView(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- ADMIN HOME ---------------- */
function AdminHome() {
  const s = useStats<{ workers: number; buyers: number; totalCoins: number; totalPayments: number; taskCount: number; subCount: number }>();
  return (
    <div>
      <h1 className="text-xl font-extrabold">Admin Dashboard</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Platform overview & integrity.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Workers" value={s?.workers ?? "—"} />
        <Stat label="Total Buyers" value={s?.buyers ?? "—"} />
        <Stat label="Available Coins" value={s?.totalCoins ?? "—"} sub="sum of all users" />
        <Stat label="Total Payments ($)" value={s ? `$${s.totalPayments}` : "—"} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Stat label="Total Tasks" value={s?.taskCount ?? "—"} />
        <Stat label="Total Submissions" value={s?.subCount ?? "—"} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/dashboard/manage-users"><Button size="sm">Manage Users</Button></Link>
        <Link href="/dashboard/manage-tasks"><Button size="sm" variant="outline">Manage Tasks</Button></Link>
        <Link href="/dashboard/withdraw-requests"><Button size="sm" variant="outline">Withdraw Requests</Button></Link>
      </div>
    </div>
  );
}
