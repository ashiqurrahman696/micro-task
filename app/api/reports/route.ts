import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

// POST /api/reports { submission_id, reason } — worker/buyer reports invalid submission
export async function POST(req: Request) {
  const { session, error } = await requireSession();
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as unknown as Record<string, unknown>;
  const { submission_id, reason } = await req.json();
  if (!submission_id || !reason) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const col = await getCollection("reports");
  await col.insertOne({
    submission_id,
    reason,
    reporter_email: user.email,
    createdAt: new Date(),
    status: "open",
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { session, error } = await requireSession(["admin"]);
  if (error || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const col = await getCollection("reports");
  const list = await col.find({}).sort({ createdAt: -1 }).limit(100).toArray();
  return NextResponse.json({ reports: JSON.parse(JSON.stringify(list)) });
}
