"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Stat, Table, THead, TRow, TH, TD, Badge } from "@/components/ui/bits";

export default function WithdrawalsPage() {
  const [coins, setCoins] = useState(0);
  const [amount, setAmount] = useState(200);
  const [system, setSystem] = useState("Stripe");
  const [account, setAccount] = useState("");
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);

  async function load() {
    const s = await fetch("/api/stats").then((r) => r.json()).catch(() => null);
    if (s && typeof s.coins === "number") setCoins(s.coins);
    const h = await fetch("/api/withdrawals?scope=mine").then((r) => r.json()).catch(() => ({ withdrawals: [] }));
    setHistory(h.withdrawals || []);
  }
  useEffect(() => { const t = setTimeout(() => load(), 0); return () => clearTimeout(t); }, []);

  const dollars = (Number(amount) / 20).toFixed(2);
  const canWithdraw = coins >= 200 && Number(amount) >= 200 && Number(amount) <= coins;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coins: Number(amount), payment_system: system, account_number: account }),
    });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error || "Failed");
    setMsg("Withdrawal request submitted (pending admin approval).");
    setAccount("");
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold">Withdrawals</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">20 coins = $1 · Minimum 200 coins ($10).</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="My Coins" value={coins} />
        <Stat label="Withdrawable ($)" value={`$${(coins / 20).toFixed(2)}`} />
        <Stat label="This Request ($)" value={`$${dollars}`} />
      </div>

      {!canWithdraw && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Insufficient coin — you need at least 200 coins and the amount cannot exceed your balance.</p>}

      {canWithdraw ? (
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-800">
          <div><Label>Coin To Withdraw</Label><Input type="number" min={200} max={coins} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
          <div><Label>Withdraw Amount ($)</Label><Input value={dollars} disabled /></div>
          <div>
            <Label>Payment System</Label>
            <select value={system} onChange={(e) => setSystem(e.target.value)} className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
              <option>Stripe</option><option>bKash</option><option>Rocket</option><option>Nagad</option><option>PayPal</option>
            </select>
          </div>
          <div><Label>Account Number</Label><Input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="01XXXXXXXXX" /></div>
          <div className="sm:col-span-2"><Button className="w-full">Withdraw</Button></div>
        </form>
      ) : null}
      {msg && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{msg}</p>}

      <h2 className="mt-6 font-bold">My withdrawal history</h2>
      <Table>
        <THead><TRow><TH>Coins</TH><TH>Amount</TH><TH>System</TH><TH>Status</TH><TH>Date</TH></TRow></THead>
        <tbody>
          {history.map((h: Record<string, unknown>) => (
            <TRow key={String(h._id)}>
              <TD className="font-bold">{Number(h.withdrawal_coin)}</TD>
              <TD>${Number(h.withdrawal_amount)}</TD>
              <TD>{String(h.payment_system)}</TD>
              <TD><Badge variant={String(h.status) === "approved" ? "success" : "warning"}>{String(h.status)}</Badge></TD>
              <TD className="text-xs">{new Date(String(h.createdAt)).toLocaleDateString()}</TD>
            </TRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
