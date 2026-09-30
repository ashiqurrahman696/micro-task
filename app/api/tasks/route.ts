import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, serialize } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

// GET /api/tasks?mine=1&q=&sort=  (worker: available tasks; buyer mine=1: own tasks)
export async function GET(req: Request) {
  const { session } = await requireSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";
  const all = url.searchParams.get("all") === "1";
  const q = url.searchParams.get("q") || "";
  const user = session.user as unknown as Record<string, unknown>;
  try {
    const tasks = await getCollection("tasks");
    const filter: Record<string, unknown> = {};
    if (mine) filter.buyer_email = user.email;
    else if (all && (user.role as string) === "admin") { /* no slot filter for admin */ }
    else filter.required_workers = { $gt: 0 };
    if (q) filter.task_title = { $regex: q, $options: "i" };
    const list = await tasks.find(filter).sort({ completion_date: -1 }).limit(200).toArray();
    return NextResponse.json({ tasks: serialize(list) });
  } catch {
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

// POST /api/tasks (buyer only)
export async function POST(req: Request) {
  const { session, error } = await requireSession(["buyer", "admin"]);
  if (error || !session?.user) return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const body = await req.json();
  const { task_title, task_detail, required_workers, payable_amount, completion_date, submission_info, task_image_url } = body;
  if (!task_title || !required_workers || !payable_amount || !completion_date)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  const need = Number(required_workers);
  const pay = Number(payable_amount);
  if (!(need > 0) || !(pay > 0)) return NextResponse.json({ error: "Workers and payable amount must be positive" }, { status: 400 });
  const total = need * pay;
  try {
    const users = await getCollection("user");
    const me = await users.findOne({ email: user.email });
    const coins = Number((me as Record<string, unknown> | null)?.coins ?? 0);
    if (total > coins) return NextResponse.json({ error: "Not available Coin. Purchase Coin", needPurchase: true }, { status: 400 });
    const tasks = await getCollection("tasks");
    const doc = {
      task_title,
      task_detail: task_detail || "",
      required_workers: need,
      payable_amount: pay,
      total_payable: total,
      completion_date,
      submission_info: submission_info || "",
      task_image_url: task_image_url || "",
      buyer_email: user.email,
      buyer_name: user.name,
      createdAt: new Date(),
    };
    const r = await tasks.insertOne(doc);
    await users.updateOne({ email: user.email }, { $inc: { coins: -total } });
    return NextResponse.json({ taskId: String(r.insertedId) });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PATCH /api/tasks?id= (buyer: update title/detail/submission)  DELETE /api/tasks?id=
export async function PATCH(req: Request) {
  const { session, error } = await requireSession(["buyer", "admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const body = await req.json();
  try {
    const tasks = await getCollection("tasks");
    const filter: Record<string, unknown> = { _id: new ObjectId(id) };
    if ((user.role as string) !== "admin") filter.buyer_email = user.email;
    await tasks.updateOne(filter, {
      $set: {
        ...(body.task_title ? { task_title: body.task_title } : {}),
        ...(body.task_detail !== undefined ? { task_detail: body.task_detail } : {}),
        ...(body.submission_info !== undefined ? { submission_info: body.submission_info } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { session, error } = await requireSession(["buyer", "admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const tasks = await getCollection("tasks");
    const filter: Record<string, unknown> = { _id: new ObjectId(id) };
    if ((user.role as string) !== "admin") filter.buyer_email = user.email;
    const task = (await tasks.findOne(filter)) as Record<string, unknown> | null;
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await tasks.deleteOne({ _id: new ObjectId(id) });
    // Refill buyer coin for uncompleted slots
    const refill = Number(task.required_workers) * Number(task.payable_amount);
    const users = await getCollection("user");
    await users.updateOne({ email: task.buyer_email }, { $inc: { coins: refill } });
    return NextResponse.json({ ok: true, refill });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
