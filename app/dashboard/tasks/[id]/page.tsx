"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Record<string, unknown> | null>(null);
  const [details, setDetails] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/tasks/${id}`).then((r) => r.json()).then((d) => setTask(d.task || null)).catch(() => {});
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!details.trim()) return setMsg("Please describe your completed work / proof.");
    setLoading(true);
    const r = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: id, submission_details: details }),
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) return setMsg(d.error || "Submission failed");
    setMsg("Submitted! Status: pending review.");
    setDetails("");
    setTimeout(() => router.push("/dashboard/submissions"), 1200);
  }

  if (!task) return <p className="text-sm text-slate-500 dark:text-slate-400">Loading task...</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        {(task.task_image_url as string) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={task.task_image_url as string} alt="" className="w-full rounded-2xl object-cover" />
        )}
        <h1 className="mt-3 text-xl font-extrabold">{String(task.task_title)}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">By {String(task.buyer_name)} ({String(task.buyer_email)}) · Due {formatDate(task.completion_date as string)}</p>
        <div className="mt-3 flex gap-2 text-sm">
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800">{Number(task.payable_amount)} coins / worker</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-900">{Number(task.required_workers)} spots left</span>
        </div>
        <h3 className="mt-4 font-bold">Task detail</h3>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{String(task.task_detail || "No extra details.")}</p>
        <h3 className="mt-4 font-bold">What to submit</h3>
        <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{String(task.submission_info || "Describe your completed work with proof.")}</p>
      </div>
      <div>
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-bold">Submit your work</h3>
          <p className="text-xs text-slate-500">Saved with task_id, payable amount, buyer info, date & pending status.</p>
          <Textarea className="mt-3 bg-white" rows={7} placeholder="Paste links, describe steps, attach proof details..." value={details} onChange={(e) => setDetails(e.target.value)} />
          {msg && <p className="mt-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{msg}</p>}
          <Button className="mt-3 w-full" disabled={loading}>{loading ? "Submitting..." : "Submit for review"}</Button>
        </form>
      </div>
    </div>
  );
}
