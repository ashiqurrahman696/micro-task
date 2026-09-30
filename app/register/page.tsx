"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { isValidEmail, passwordStrength } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", image: "", password: "", role: "worker" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const pw = passwordStrength(form.password);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadImage(file: File) {
    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!key) {
      setError("Image upload needs NEXT_PUBLIC_IMGBB_API_KEY. You can paste an image URL instead.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body: fd });
      const data = await res.json();
      if (data?.data?.url) set("image", data.data.url);
      else setError("Image upload failed. Try an image URL.");
    } catch {
      setError("Image upload failed. Try an image URL.");
    }
    setUploading(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!isValidEmail(form.email)) return setError("Please enter a valid email address.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters with a number and letter.");
    if (!/^(worker|buyer)$/.test(form.role)) return setError("Please select a valid role.");
    setLoading(true);
    const res = await authClient.signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
      image: form.image || `https://i.pravatar.cc/150?u=${encodeURIComponent(form.email)}`,
      // @ts-expect-error extra fields allowed by better-auth additionalFields
      role: form.role,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error.message || "Registration failed. Email may already exist.");
      return;
    }
    try {
      localStorage.setItem("microtask-access-token", `session-${Date.now()}`);
    } catch {}
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Workers get 10 coins · Buyers get 50 coins on signup.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" /></div>
            <div>
              <Label htmlFor="image">Profile picture URL</Label>
              <Input id="image" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://... or upload below" />
              <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
              {uploading && <p className="text-xs text-slate-500">Uploading to imgBB...</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 6 chars, letters + number" />
              {form.password && <p className="mt-1 text-xs text-slate-500">Strength: <span className="font-bold">{pw.label}</span> — use upper/lowercase, numbers & symbols.</p>}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select id="role" value={form.role} onChange={(e) => set("role", e.target.value)} className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900">
                <option value="worker">Worker — complete tasks & earn</option>
                <option value="buyer">Buyer — post tasks & hire</option>
              </select>
            </div>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{error}</p>}
            <Button className="w-full" disabled={loading || uploading}>{loading ? "Creating..." : "Register"}</Button>
          </form>
          <Button variant="outline" className="mt-3 w-full" onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })}>
            Continue with Google
          </Button>
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">Have an account? <Link href="/login" className="font-bold text-emerald-700">Login</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
