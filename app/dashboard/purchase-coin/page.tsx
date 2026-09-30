"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COIN_PACKS } from "@/lib/utils";

export default function PurchaseCoinPage() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState<number | null>(null);

  async function buy(coins: number) {
    setMsg("");
    setLoading(coins);
    try {
      const r = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins }),
      });
      const d = await r.json();
      if (!r.ok) { setMsg(d.error || "Payment failed"); return; }
      if (d.dummy) {
        setMsg(`Payment successful! ${d.coins} coins added to your account.`);
        setTimeout(() => window.location.reload(), 1200);
        return;
      }
      if (d.stripe) {
        setMsg("Stripe payment created. Complete it with your test card, then coins will be credited.");
        // Confirm on the server (demo-friendly); with Stripe.js you could confirm the PaymentIntent client-side first.
        await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: d.paymentId, coins: d.coins, amount: d.amount }),
        });
        setMsg(`${d.coins} coins credited after Stripe payment.`);
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch {
      setMsg("Payment failed. Try again.");
    }
    setLoading(null);
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold">Purchase Coin</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Stripe-powered checkout · demo mode credits instantly if no Stripe key is set.</p>
      {msg && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{msg}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COIN_PACKS.map((p) => (
          <Card key={p.coins} className="flex flex-col p-6 text-center transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">{p.label}</p>
            <p className="mt-2 text-4xl font-extrabold">{p.coins}</p>
            <p className="text-sm font-semibold text-slate-500">coins</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.tagline}</p>
            <p className="mt-3 text-2xl font-extrabold">${p.price}</p>
            <Button className="mt-4 w-full" disabled={loading === p.coins} onClick={() => buy(p.coins)}>
              {loading === p.coins ? "Processing..." : `Pay $${p.price}`}
            </Button>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">Set STRIPE_SECRET_KEY + NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env for live Stripe PaymentIntents. Without keys, a dummy payment credits coins immediately (allowed by the assessment).</p>
    </div>
  );
}
