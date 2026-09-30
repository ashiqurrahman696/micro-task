import { NextResponse } from "next/server";
import { getCollection, serialize } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { COIN_PACKS } from "@/lib/utils";

// POST /api/payments { coins } -> creates payment intent/confirm (Stripe if configured, else dummy)
export async function POST(req: Request) {
  const { session, error } = await requireSession(["buyer", "admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const { coins } = await req.json();
  const pack = COIN_PACKS.find((p) => p.coins === Number(coins));
  if (!pack) return NextResponse.json({ error: "Invalid coin pack" }, { status: 400 });
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  try {
    const stripePaymentId = `dummy_${Date.now()}`;
    if (stripeKey) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKey);
      const intent = await stripe.paymentIntents.create({
        amount: pack.price * 100,
        currency: "usd",
        metadata: { coins: String(pack.coins), email: String(user.email) },
      });
      return NextResponse.json({ clientSecret: intent.client_secret, paymentId: intent.id, amount: pack.price, coins: pack.coins, stripe: true });
    }
    // Dummy instant confirm
    const payments = await getCollection("payments");
    await payments.insertOne({
      buyer_email: user.email,
      buyer_name: user.name,
      coins: pack.coins,
      amount: pack.price,
      paymentId: stripePaymentId,
      status: "succeeded",
      createdAt: new Date(),
    });
    const users = await getCollection("user");
    await users.updateOne({ email: user.email }, { $inc: { coins: pack.coins } });
    return NextResponse.json({ ok: true, coins: pack.coins, dummy: true });
  } catch {
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}

// POST /api/payments/confirm { paymentId, coins } (after Stripe success on client)
export async function GET(req: Request) {
  const { session } = await requireSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine");
  try {
    const payments = await getCollection("payments");
    const filter = mine || (user.role as string) === "buyer" ? { buyer_email: user.email } : {};
    const list = await payments.find(filter).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ payments: serialize(list) });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
