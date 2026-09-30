import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

// GET /api/stats -> role-aware dashboard stats
export async function GET() {
  const { session, role } = await requireSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  try {
    if (role === "worker") {
      const subs = await getCollection("submissions");
      const mine = { worker_email: user.email };
      const total = await subs.countDocuments(mine);
      const pending = await subs.countDocuments({ ...mine, status: "pending" });
      const approved = await subs.find({ ...mine, status: "approved" }).toArray();
      const earning = approved.reduce((s: number, d: Record<string, unknown>) => s + Number(d.payable_amount || 0), 0);
      const users = await getCollection("user");
      const me = (await users.findOne({ email: user.email })) as Record<string, unknown> | null;
      return NextResponse.json({ total, pending, earning, coins: Number(me?.coins ?? 0) });
    }
    if (role === "buyer") {
      const tasks = await getCollection("tasks");
      const mine = await tasks.find({ buyer_email: user.email }).toArray();
      const taskCount = mine.length;
      const pendingWorkers = mine.reduce((s: number, t: Record<string, unknown>) => s + Number(t.required_workers || 0), 0);
      const payments = await getCollection("payments");
      const mine2 = await payments.find({ buyer_email: user.email }).toArray();
      const paid = mine2.reduce((s: number, p: Record<string, unknown>) => s + Number(p.amount || 0), 0);
      const subs = await getCollection("submissions");
      const toReview = await subs.countDocuments({ buyer_email: user.email, status: "pending" });
      return NextResponse.json({ taskCount, pendingWorkers, paid, toReview });
    }
    // admin
    const users = await getCollection("user");
    const workers = await users.countDocuments({ role: "worker" });
    const buyers = await users.countDocuments({ role: "buyer" });
    const all = await users.find({}).toArray();
    const totalCoins = all.reduce((s: number, u: Record<string, unknown>) => s + Number(u.coins || 0), 0);
    const payments = await getCollection("payments");
    const pays = await payments.find({}).toArray();
    const totalPayments = pays.reduce((s: number, p: Record<string, unknown>) => s + Number(p.amount || 0), 0);
    const tasks = await getCollection("tasks");
    const taskCount = await tasks.countDocuments({});
    const subs = await getCollection("submissions");
    const subCount = await subs.countDocuments({});
    return NextResponse.json({ workers, buyers, totalCoins, totalPayments, taskCount, subCount });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
