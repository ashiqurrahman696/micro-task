"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { isValidEmail } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    if (!password) return setError("Please enter your password.");
    setLoading(true);
    const res = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (res.error) {
      setError(res.error.message || "Incorrect email or password.");
      return;
    }
    persistToken();
    router.push("/dashboard");
    router.refresh();
  }

  function persistToken() {
    try {
      const raw = localStorage.getItem("better-auth.session_token");
      if (raw) localStorage.setItem("microtask-access-token", raw);
      else localStorage.setItem("microtask-access-token", `session-${Date.now()}`);
    } catch {}
  }

  async function google() {
    setError("");
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{error}</p>}
            <Button className="w-full" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
          </form>
          <Button variant="outline" className="mt-3 w-full" onClick={google}>
            Continue with Google
          </Button>
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">No account? <Link href="/register" className="font-bold text-emerald-700">Register</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
