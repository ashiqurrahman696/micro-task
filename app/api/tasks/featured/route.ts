import { NextResponse } from "next/server";
import { getCollection, serialize } from "@/lib/mongodb";

export async function GET() {
  try {
    const tasks = await getCollection("tasks");
    const list = await tasks.find({ required_workers: { $gt: 0 } }).sort({ createdAt: -1 }).limit(8).toArray();
    return NextResponse.json({ tasks: serialize(list) });
  } catch {
    return NextResponse.json({ tasks: [] });
  }
}
