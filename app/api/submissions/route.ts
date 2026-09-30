import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, serialize } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

// GET /api/submissions?scope=mine|todo-review|approved&email=&page=&limit=
export async function GET(req: Request) {
  const { session } = await requireSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") || "mine";
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 10)));
  try {
    const subs = await getCollection("submissions");
    let filter: Record<string, unknown> = {};
    if (scope === "mine") filter.worker_email = user.email;
    else if (scope === "approved") filter = { worker_email: user.email, status: "approved" };
    else if (scope === "todo-review") filter = { buyer_email: user.email, status: "pending" };
    else if (scope === "all") {
      if ((user.role as string) !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const total = await subs.countDocuments(filter);
    const list = await subs.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
    return NextResponse.json({ submissions: serialize(list), total, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST /api/submissions (worker submits)
export async function POST(req: Request) {
  const { session, error } = await requireSession(["worker", "admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const body = await req.json();
  const { task_id, submission_details } = body;
  if (!task_id || !submission_details) return NextResponse.json({ error: "Task and submission details required" }, { status: 400 });
  try {
    const tasks = await getCollection("tasks");
    const task = (await tasks.findOne({ _id: new ObjectId(task_id) })) as Record<string, unknown> | null;
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (Number(task.required_workers) <= 0) return NextResponse.json({ error: "No slots left for this task" }, { status: 400 });
    const subs = await getCollection("submissions");
    const dup = await subs.findOne({ task_id: String(task_id), worker_email: user.email });
    if (dup) return NextResponse.json({ error: "You already submitted for this task" }, { status: 400 });
    const doc = {
      task_id: String(task_id),
      task_title: task.task_title,
      payable_amount: Number(task.payable_amount),
      worker_email: user.email,
      worker_name: user.name,
      buyer_email: task.buyer_email,
      buyer_name: task.buyer_name,
      submission_details,
      status: "pending",
      current_date: new Date(),
      createdAt: new Date(),
    };
    await subs.insertOne(doc);
    await tasks.updateOne({ _id: new ObjectId(task_id) }, { $inc: { required_workers: -1 } });
    const notifs = await getCollection("notifications");
    await notifs.insertOne({
      message: `New submission from ${String(user.name)} for "${String(task.task_title)}"`,
      toEmail: String(task.buyer_email),
      actionRoute: "/dashboard",
      createdAt: new Date(),
      read: false,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}

// PATCH /api/submissions?id=&action=approve|reject (buyer reviews own tasks)
export async function PATCH(req: Request) {
  const { session, error } = await requireSession(["buyer", "admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");
  if (!id || !["approve", "reject"].includes(action || "")) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  try {
    const subs = await getCollection("submissions");
    const filter: Record<string, unknown> = { _id: new ObjectId(id) };
    if ((user.role as string) !== "admin") filter.buyer_email = user.email;
    const sub = (await subs.findOne(filter)) as Record<string, unknown> | null;
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (sub.status !== "pending") return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
    const users = await getCollection("user");
    const notifs = await getCollection("notifications");
    if (action === "approve") {
      await subs.updateOne({ _id: new ObjectId(id) }, { $set: { status: "approved" } });
      await users.updateOne({ email: sub.worker_email }, { $inc: { coins: Number(sub.payable_amount) } });
      await notifs.insertOne({
        message: `You have earned ${Number(sub.payable_amount)} coins from ${String(sub.buyer_name)} for completing "${String(sub.task_title)}"`,
        toEmail: String(sub.worker_email),
        actionRoute: "/dashboard",
        createdAt: new Date(),
        read: false,
      });
    } else {
      await subs.updateOne({ _id: new ObjectId(id) }, { $set: { status: "rejected" } });
      const tasks = await getCollection("tasks");
      await tasks.updateOne({ _id: new ObjectId(String(sub.task_id)) }, { $inc: { required_workers: 1 } });
      await notifs.insertOne({
        message: `Your submission for "${String(sub.task_title)}" was rejected by ${String(sub.buyer_name)}`,
        toEmail: String(sub.worker_email),
        actionRoute: "/dashboard",
        createdAt: new Date(),
        read: false,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Review failed" }, { status: 500 });
  }
}
