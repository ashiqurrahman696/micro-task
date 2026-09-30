import { NextResponse } from "next/server";
import { getCollection, serialize } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export async function GET(req: Request) {
  const { session } = await requireSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const limit = Math.min(50, Number(new URL(req.url).searchParams.get("limit") || 20));
  try {
    const col = await getCollection("notifications");
    const list = await col.find({ toEmail: user.email }).sort({ createdAt: -1 }).limit(limit).toArray();
    return NextResponse.json({ notifications: serialize(list) });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH() {
  const { session } = await requireSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const col = await getCollection("notifications");
  await col.updateMany({ toEmail: user.email }, { $set: { read: true } });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  // admin report / general notify
  const { session, error } = await requireSession(["admin", "buyer"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { message, toEmail, actionRoute } = await req.json();
  if (!message || !toEmail) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const col = await getCollection("notifications");
  await col.insertOne({ message, toEmail, actionRoute: actionRoute || "/dashboard", createdAt: new Date(), read: false });
  return NextResponse.json({ ok: true });
}
