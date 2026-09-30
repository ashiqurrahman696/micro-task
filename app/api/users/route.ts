import { NextResponse } from "next/server";
import { getCollection, serialize } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

// GET /api/users?role= (admin: all)
export async function GET() {
  const { session, error } = await requireSession(["admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const users = await getCollection("user");
    const list = await users.find({}).sort({ createdAt: -1 }).limit(200).toArray();
    return NextResponse.json({
      users: serialize(
        list.map((u: Record<string, unknown>) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          image: u.image,
          role: u.role || "worker",
          coins: u.coins ?? 0,
        }))
      ),
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH /api/users?id=&role=  | DELETE /api/users?id=
export async function PATCH(req: Request) {
  const { error } = await requireSession(["admin"]);
  if (error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const id = url.searchParams.get("id") || body.id;
  const role = url.searchParams.get("role") || body.role;
  if (!id || !["admin", "buyer", "worker"].includes(role))
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  try {
    const { ObjectId } = await import("mongodb");
    const users = await getCollection("user");
    await users.updateOne({ _id: new ObjectId(id) }, { $set: { role } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error } = await requireSession(["admin"]);
  if (error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const { ObjectId } = await import("mongodb");
    const users = await getCollection("user");
    await users.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
