import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: string }) {
  const variant = (props as { variant?: string }).variant;
  const styles =
    variant === "success"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
      : variant === "warning"
        ? "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300"
        : variant === "danger"
          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
          : variant === "info"
            ? "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", styles, className)}
      {...props}
    />
  );
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className={cn("w-full min-w-[640px] border-collapse bg-white text-left text-sm dark:bg-slate-900", className)} {...props} />
    </div>
  );
}
export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400" {...props} />;
}
export function TRow(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className="border-t border-slate-100 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60" {...props} />;
}
export function TH(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className="px-4 py-3 font-semibold" {...props} />;
}
export function TD(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-4 py-3 text-slate-700 dark:text-slate-300" {...props} />;
}

export function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/60">
      <p className="font-bold text-slate-800 dark:text-slate-100">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
