import { NextResponse } from "next/server";
import { getCollection, serialize } from "@/lib/mongodb";

export async function GET() {
  try {
    const users = await getCollection("user");
    const top = await users
      .find({ role: "worker" })
      .sort({ coins: -1 })
      .limit(6)
      .toArray();
    return NextResponse.json({
      workers: serialize(
        top.map((u: Record<string, unknown>) => ({
          name: u.name,
          image: u.image,
          coins: u.coins ?? 0,
          email: u.email,
        }))
      ),
    });
  } catch {
    return NextResponse.json({ workers: [] });
  }
}
