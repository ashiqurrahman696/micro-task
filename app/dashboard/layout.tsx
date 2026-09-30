"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home, ListChecks, ClipboardList, Wallet, PlusCircle, FolderKanban,
  Coins, History, Users, Settings2, Banknote, Menu, X, Zap, Bell,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme";
import { cn } from "@/lib/utils";

const NAV: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  worker: [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/tasks", label: "TaskList", icon: ListChecks },
    { href: "/dashboard/submissions", label: "My Submissions", icon: ClipboardList },
    { href: "/dashboard/withdrawals", label: "Withdrawals", icon: Wallet },
  ],
  buyer: [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/add-task", label: "Add New Tasks", icon: PlusCircle },
    { href: "/dashboard/my-tasks", label: "My Task's", icon: FolderKanban },
    { href: "/dashboard/purchase-coin", label: "Purchase Coin", icon: Coins },
    { href: "/dashboard/payment-history", label: "Payment History", icon: History },
  ],
  admin: [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/manage-users", label: "Manage Users", icon: Users },
    { href: "/dashboard/manage-tasks", label: "Manage Task", icon: Settings2 },
    { href: "/dashboard/withdraw-requests", label: "Withdraw Requests", icon: Banknote },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);

  const user = session?.user as unknown as Record<string, unknown> | undefined;
  const role = String(user?.role ?? "worker");
  const links = NAV[role] || NAV.worker;

  // IMPORTANT: only redirect after session has finished loading — prevents
  // redirect-to-login on page reload (private route persistence).
  useEffect(() => {
    if (!isPending && !session?.user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isPending, session, router, pathname]);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/stats").then((r) => r.json()).then((d) => {
      if (typeof d.coins === "number") setCoins(d.coins);
    }).catch(() => {});
  }, [session]);

  // Fallback to the coin value embedded in the session while stats load
  const displayCoins = coins ?? Number(user?.coins ?? 0);

  useEffect(() => { const t = setTimeout(() => setDrawer(false), 0); return () => clearTimeout(t); }, [pathname]);

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6">
        <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 grid gap-4 md:grid-cols-[240px_1fr]">
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-bold">Checking your session...</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">If you are not redirected, <Link href="/login" className="font-bold text-emerald-700 dark:text-emerald-400">login here</Link>.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
      {/* Top bar per spec: Logo | Available coin | userImage / role name + notification */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 md:hidden dark:border-slate-700" onClick={() => setDrawer(!drawer)} aria-label="Toggle nav">
            {drawer ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white"><Zap className="h-4 w-4" /></span>
            <span className="font-extrabold">MicroTask</span>
          </Link>
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600 sm:inline dark:bg-slate-800 dark:text-slate-300">{role} · {String(user?.name || "")}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
            <Coins className="h-4 w-4" /> {displayCoins} coins
          </span>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2 dark:border-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={String(user?.image || "/avatar.png")} alt="user" className="h-7 w-7 rounded-full object-cover" />
            <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className={cn("md:block", drawer ? "block" : "hidden")}>
          <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:sticky md:top-20 dark:border-slate-800 dark:bg-slate-900">
            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</p>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold",
                  pathname === l.href ? "bg-emerald-600 text-white shadow" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            ))}
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <p className="font-bold text-slate-700 dark:text-slate-200">{String(user?.name)}</p>
              <p className="truncate">{String(user?.email)}</p>
              <p className="mt-1 capitalize">Role: {role}</p>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <div className="min-w-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">{children}</div>
          <p className="mt-3 text-center text-xs text-slate-400">© {new Date().getFullYear()} MicroTask Dashboard</p>
        </div>
      </div>
    </div>
  );
}
