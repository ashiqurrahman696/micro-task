import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, serialize } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

// GET /api/withdrawals?scope=mine|pending
export async function GET(req: Request) {
  const { session } = await requireSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const scope = new URL(req.url).searchParams.get("scope") || "mine";
  try {
    const col = await getCollection("withdrawals");
    const filter: Record<string, unknown> =
      scope === "pending" ? { status: "pending" } : { worker_email: user.email };
    if (scope === "pending" && (user.role as string) !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const list = await col.find(filter).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ withdrawals: serialize(list) });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST /api/withdrawals (worker)
export async function POST(req: Request) {
  const { session, error } = await requireSession(["worker", "admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const { coins, payment_system, account_number } = await req.json();
  const c = Number(coins);
  if (!(c >= 200)) return NextResponse.json({ error: "Minimum withdrawal is 200 coins ($10)" }, { status: 400 });
  if (!payment_system || !account_number) return NextResponse.json({ error: "Payment system and account number required" }, { status: 400 });
  try {
    const users = await getCollection("user");
    const me = (await users.findOne({ email: user.email })) as Record<string, unknown> | null;
    if (Number(me?.coins ?? 0) < c) return NextResponse.json({ error: "Insufficient coin" }, { status: 400 });
    const col = await getCollection("withdrawals");
    await col.insertOne({
      worker_email: user.email,
      worker_name: user.name,
      withdrawal_coin: c,
      withdrawal_amount: c / 20,
      payment_system,
      account_number,
      withdraw_date: new Date(),
      createdAt: new Date(),
      status: "pending",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH /api/withdrawals?id= (admin approves -> deduct coins)
export async function PATCH(req: Request) {
  const { session, error } = await requireSession(["admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const col = await getCollection("withdrawals");
    const w = (await col.findOne({ _id: new ObjectId(id) })) as Record<string, unknown> | null;
    if (!w || w.status !== "pending") return NextResponse.json({ error: "Not found or already processed" }, { status: 404 });
    await col.updateOne({ _id: new ObjectId(id) }, { $set: { status: "approved" } });
    const users = await getCollection("user");
    await users.updateOne({ email: w.worker_email }, { $inc: { coins: -Number(w.withdrawal_coin) } });
    const notifs = await getCollection("notifications");
    await notifs.insertOne({
      message: `Your withdrawal of ${Number(w.withdrawal_coin)} coins ($${Number(w.withdrawal_amount)}) via ${String(w.payment_system)} has been approved`,
      toEmail: String(w.worker_email),
      actionRoute: "/dashboard/withdrawals",
      createdAt: new Date(),
      read: false,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
