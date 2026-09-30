"use client";
import { authClient } from "@/lib/auth-client";
import { ReactNode, useEffect } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Persist the session token to localStorage per assessment requirement
// ("store a secret access-token for users in their browser local storage")
export function TokenPersistor() {
  const { data } = authClient.useSession();
  useEffect(() => {
    try {
      const token = (data as unknown as { session?: { token?: string } })?.session?.token;
      if (token) localStorage.setItem("microtask-access-token", token);
    } catch {
      /* ignore */
    }
  }, [data]);
  return null;
}
