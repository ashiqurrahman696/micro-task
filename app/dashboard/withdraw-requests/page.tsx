"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, THead, TRow, TH, TD, Badge, Empty } from "@/components/ui/bits";

export default function WithdrawRequestsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const d = await fetch("/api/withdrawals?scope=pending").then((r) => r.json()).catch(() => ({ withdrawals: [] }));
    setItems(d.withdrawals || []);
  }
  useEffect(() => { const t = setTimeout(() => load(), 0); return () => clearTimeout(t); }, []);

  async function approve(id: string) {
    const r = await fetch(`/api/withdrawals?id=${id}`, { method: "PATCH" });
    const d = await r.json();
    setMsg(r.ok ? "Payment success — coins deducted & worker notified." : d.error || "Failed");
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold">Withdraw Requests</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{items.length} pending · approval deducts worker coins.</p>
      {msg && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{msg}</p>}
      {items.length === 0 ? <div className="mt-3"><Empty title="No pending withdrawals" /></div> : (
        <Table>
          <THead><TRow><TH>Worker</TH><TH>Coins</TH><TH>Amount</TH><TH>System</TH><TH>Account</TH><TH></TH></TRow></THead>
          <tbody>
            {items.map((w: Record<string, unknown>) => (
              <TRow key={String(w._id)}>
                <TD><p className="font-semibold">{String(w.worker_name)}</p><p className="text-xs text-slate-500">{String(w.worker_email)}</p></TD>
                <TD className="font-bold">{Number(w.withdrawal_coin)}</TD>
                <TD>${Number(w.withdrawal_amount)}</TD>
                <TD><Badge>{String(w.payment_system)}</Badge></TD>
                <TD className="text-xs">{String(w.account_number)}</TD>
                <TD><Button size="sm" onClick={() => approve(String(w._id))}>Payment Success</Button></TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
