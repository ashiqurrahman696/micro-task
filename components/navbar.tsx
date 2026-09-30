"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Coins, LayoutDashboard, Menu, X, Zap } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme";
import { cn } from "@/lib/utils";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_REPO || "https://github.com/";

type Notif = {
  _id: string;
  message: string;
  actionRoute?: string;
  createdAt: string;
  read?: boolean;
};

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const user = session?.user as unknown as Record<string, unknown> | undefined;
  const coins = Number(user?.coins ?? 0);
  const role = String(user?.role ?? "worker");

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notifications?limit=8")
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => setNotifs(d.notifications || []))
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setShowNotif(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => { const t = setTimeout(() => setOpen(false), 0); return () => clearTimeout(t); }, [pathname]);

  async function logout() {
    try {
      localStorage.removeItem("microtask-access-token");
    } catch {}
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
            <Zap className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Micro<span className="text-emerald-600 dark:text-emerald-400">Task</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/" className={cn("rounded-lg px-3 py-2 text-sm font-semibold", pathname === "/" ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>Home</Link>
          <Link href="/#how" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">How it works</Link>
          <Link href="/#tasks" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Tasks</Link>
          {session?.user && (
            <Link href="/dashboard" className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold", pathname.startsWith("/dashboard") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ) : session?.user ? (
            <>
              <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
                <Coins className="h-4 w-4" /> {coins}
              </span>
              <div className="relative" ref={popRef}>
                <button onClick={() => setShowNotif((v) => !v)} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  {notifs.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                      {notifs.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 top-11 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
                      <p className="text-sm font-bold">Notifications</p>
                      <button className="text-xs font-semibold text-emerald-700 dark:text-emerald-400" onClick={markAllRead}>Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifs.length === 0 && <p className="p-4 text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>}
                      {notifs.map((n) => (
                        <Link key={n._id} href={n.actionRoute || "/dashboard"} onClick={() => setShowNotif(false)} className="block border-b border-slate-100 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                          <p className="text-sm text-slate-800 dark:text-slate-200">{n.message}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/dashboard" className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={String(user?.image || "/avatar.png")} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
                <span className="max-w-24 truncate text-sm font-semibold capitalize">{String(user?.name || role)}</span>
              </Link>
              <Button size="sm" variant="outline" onClick={logout}>Logout</Button>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer"><Button size="sm" variant="dark">Join as Developer</Button></a>
            </>
          ) : (
            <>
              <Link href="/login"><Button size="sm" variant="ghost">Login</Button></Link>
              <Link href="/register"><Button size="sm">Register</Button></Link>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer"><Button size="sm" variant="dark">Join as Developer</Button></a>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Home</Link>
            {session?.user && <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Dashboard ({coins} coins)</Link>}
            {!session?.user ? (
              <div className="mt-1 flex gap-2">
                <Link href="/login" className="flex-1"><Button className="w-full" variant="outline">Login</Button></Link>
                <Link href="/register" className="flex-1"><Button className="w-full">Register</Button></Link>
              </div>
            ) : (
              <Button variant="outline" onClick={logout}>Logout</Button>
            )}
            <a href={GITHUB_URL} target="_blank" rel="noreferrer"><Button variant="dark" className="mt-1 w-full">Join as Developer</Button></a>
          </div>
        </div>
      )}
    </header>
  );

  async function markAllRead() {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
    } catch {}
  }
}
