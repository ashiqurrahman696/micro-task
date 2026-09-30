import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, serialize } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session } = await requireSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const tasks = await getCollection("tasks");
    const task = await tasks.findOne({ _id: new ObjectId(id) });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ task: serialize(task) });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
