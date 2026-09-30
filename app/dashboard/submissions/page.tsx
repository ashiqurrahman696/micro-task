"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, THead, TRow, TH, TD, Badge, Empty } from "@/components/ui/bits";

function StatusBadge({ s }: { s: string }) {
  const v = s === "approved" ? "success" : s === "rejected" ? "danger" : "warning";
  return <Badge variant={v}>{s}</Badge>;
}

export default function MySubmissionsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  async function load(p = 1) {
    const r = await fetch(`/api/submissions?scope=mine&page=${p}&limit=${limit}`).then((r) => r.json()).catch(() => null);
    if (r) { setItems(r.submissions || []); setPages(r.pages || 1); setTotal(r.total || 0); setPage(r.page || 1); }
  }
  useEffect(() => { const t = setTimeout(() => load(1), 0); return () => clearTimeout(t); }, []);

  async function report(id: string) {
    const reason = prompt("Report reason for this submission:");
    if (!reason) return;
    await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submission_id: id, reason }) });
    alert("Report sent to admin.");
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold">My Submissions</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{total} total · page {page} of {pages}</p>
      {items.length === 0 ? <div className="mt-3"><Empty title="No submissions yet" hint="Go to TaskList and submit your first task." /></div> : (
        <>
          <Table>
            <THead><TRow><TH>Task</TH><TH>Payable</TH><TH>Buyer</TH><TH>Date</TH><TH>Status</TH><TH></TH></TRow></THead>
            <tbody>
              {items.map((s: Record<string, unknown>) => (
                <TRow key={String(s._id)}>
                  <TD className="max-w-48 truncate font-semibold">{String(s.task_title)}</TD>
                  <TD>{Number(s.payable_amount)}</TD>
                  <TD>{String(s.buyer_name)}</TD>
                  <TD className="text-xs">{new Date(String(s.createdAt)).toLocaleDateString()}</TD>
                  <TD><StatusBadge s={String(s.status)} /></TD>
                  <TD><Button size="sm" variant="ghost" onClick={() => report(String(s._id))}>Report</Button></TD>
                </TRow>
              ))}
            </tbody>
          </Table>
          <div className="mt-3 flex items-center justify-between">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</Button>
            <span className="text-sm text-slate-500 dark:text-slate-400">Page {page} / {pages}</span>
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => load(page + 1)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}
