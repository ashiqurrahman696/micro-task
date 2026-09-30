import { headers } from "next/headers";
import { auth } from "./auth";

export type Role = "worker" | "buyer" | "admin";

export async function getServerSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
}

export async function requireSession(roles?: Role[]) {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 as const, session: null };
  }
  const role = ((session.user as Record<string, unknown>).role as string) || "worker";
  if (roles && !roles.includes(role as Role)) {
    return { error: "Forbidden", status: 403 as const, session: null };
  }
  return { error: null, status: 200 as const, session, role: role as Role };
}
