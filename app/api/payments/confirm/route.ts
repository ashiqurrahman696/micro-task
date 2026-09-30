import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

// Confirm a stripe payment after client-side success
export async function POST(req: Request) {
  const { session, error } = await requireSession(["buyer", "admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const { paymentId, coins, amount } = await req.json();
  if (!paymentId || !coins) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  try {
    const payments = await getCollection("payments");
    const exists = await payments.findOne({ paymentId });
    if (exists) return NextResponse.json({ ok: true, duplicate: true });
    await payments.insertOne({
      buyer_email: user.email,
      buyer_name: user.name,
      coins: Number(coins),
      amount: Number(amount || 0),
      paymentId,
      status: "succeeded",
      createdAt: new Date(),
    });
    const users = await getCollection("user");
    await users.updateOne({ email: user.email }, { $inc: { coins: Number(coins) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Confirm failed" }, { status: 500 });
  }
}
