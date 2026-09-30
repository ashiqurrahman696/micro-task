"use client";
import { useEffect, useState } from "react";
import { Table, THead, TRow, TH, TD, Badge, Empty } from "@/components/ui/bits";

export default function PaymentHistoryPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    fetch("/api/payments?mine=1").then((r) => r.json()).then((d) => setItems(d.payments || [])).catch(() => {});
  }, []);
  return (
    <div>
      <h1 className="text-xl font-extrabold">Payment History</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">All coin purchases made by you.</p>
      {items.length === 0 ? <div className="mt-3"><Empty title="No payments yet" hint="Buy your first coin pack to post bigger tasks." /></div> : (
        <Table>
          <THead><TRow><TH>Coins</TH><TH>Amount</TH><TH>Payment ID</TH><TH>Status</TH><TH>Date</TH></TRow></THead>
          <tbody>
            {items.map((p: Record<string, unknown>) => (
              <TRow key={String(p._id)}>
                <TD className="font-bold">{Number(p.coins)}</TD>
                <TD>${Number(p.amount)}</TD>
                <TD className="max-w-40 truncate text-xs">{String(p.paymentId)}</TD>
                <TD><Badge variant="success">{String(p.status)}</Badge></TD>
                <TD className="text-xs">{new Date(String(p.createdAt)).toLocaleString()}</TD>
              </TRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
