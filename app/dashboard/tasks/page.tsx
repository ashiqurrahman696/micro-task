"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Empty } from "@/components/ui/bits";
import { formatDate } from "@/lib/utils";

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(query = "") {
    setLoading(true);
    try {
      const r = await fetch(`/api/tasks${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      const d = await r.json();
      setTasks(d.tasks || []);
    } catch {}
    setLoading(false);
  }
  useEffect(() => { const t = setTimeout(() => load(), 0); return () => clearTimeout(t); }, []);

  return (
    <div>
      <h1 className="text-xl font-extrabold">Available Tasks</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Only tasks with open worker slots are shown.</p>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); load(q); }}>
        <Input placeholder="Search tasks... (e.g. YouTube, review)" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit" variant="outline">Search</Button>
      </form>
      {loading ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading tasks...</p>
      : tasks.length === 0 ? <div className="mt-4"><Empty title="No tasks available" hint="Check back soon — buyers post new tasks daily." /></div>
      : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((t: Record<string, unknown>) => (
            <Card key={String(t._id)} className="overflow-hidden">
              {(t.task_image_url as string) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.task_image_url as string} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-emerald-100 to-amber-100 text-4xl">📋</div>
              )}
              <div className="p-4">
                <p className="font-bold leading-snug">{String(t.task_title)}</p>
                <p className="mt-1 text-xs text-slate-500">By {String(t.buyer_name)} · Due {formatDate(t.completion_date as string)}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-extrabold text-emerald-700">{Number(t.payable_amount)} coins</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold">{Number(t.required_workers)} spots left</span>
                </div>
                <Link href={`/dashboard/tasks/${String(t._id)}`}><Button size="sm" className="mt-3 w-full">View Details</Button></Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
