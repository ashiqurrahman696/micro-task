"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";

export default function AddTaskPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    task_title: "", task_detail: "", required_workers: 10, payable_amount: 10,
    completion_date: "", submission_info: "", task_image_url: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set(k: string, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function upload(file: File) {
    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!key) { setMsg("Add NEXT_PUBLIC_IMGBB_API_KEY for uploads, or paste an image URL."); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body: fd });
      const d = await r.json();
      if (d?.data?.url) set("task_image_url", d.data.url);
      else setMsg("Upload failed.");
    } catch { setMsg("Upload failed."); }
    setUploading(false);
  }

  const total = Number(form.required_workers || 0) * Number(form.payable_amount || 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!form.task_title || !form.completion_date) return setMsg("Title and deadline are required.");
    setLoading(true);
    const r = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) {
      setMsg(d.error || "Failed to add task");
      if (d.needPurchase) setTimeout(() => router.push("/dashboard/purchase-coin"), 1200);
      return;
    }
    router.push("/dashboard/my-tasks");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-extrabold">Add New Task</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Total cost = required workers × payable amount. Coins are deducted instantly.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div><Label>Task title (e.g. watch my YouTube video and comment)</Label><Input value={form.task_title} onChange={(e) => set("task_title", e.target.value)} /></div>
        <div><Label>Task detail</Label><Textarea value={form.task_detail} onChange={(e) => set("task_detail", e.target.value)} placeholder="Full description..." /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Required workers</Label><Input type="number" min={1} value={form.required_workers} onChange={(e) => set("required_workers", Number(e.target.value))} /></div>
          <div><Label>Payable amount (per worker)</Label><Input type="number" min={1} value={form.payable_amount} onChange={(e) => set("payable_amount", Number(e.target.value))} /></div>
        </div>
        <div><Label>Completion date (deadline)</Label><Input type="date" value={form.completion_date} onChange={(e) => set("completion_date", e.target.value)} /></div>
        <div><Label>Submission info (what proof to submit)</Label><Textarea value={form.submission_info} onChange={(e) => set("submission_info", e.target.value)} placeholder="e.g. screenshot + comment link" /></div>
        <div>
          <Label>Task image URL</Label>
          <Input value={form.task_image_url} onChange={(e) => set("task_image_url", e.target.value)} placeholder="https://..." />
          <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          {uploading && <p className="text-xs text-slate-500">Uploading...</p>}
        </div>
        <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold dark:bg-slate-800">Total payable: {total} coins</p>
        {msg && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{msg}</p>}
        <Button className="w-full" disabled={loading || uploading}>{loading ? "Adding..." : "Add Task"}</Button>
      </form>
    </div>
  );
}
