import Link from "next/link";
import { Zap, Globe, AtSign, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
              <Zap className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold text-white">MicroTask</span>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Complete small tasks, earn real rewards. Trusted by workers and buyers worldwide.
          </p>
          <div className="mt-4 flex gap-2">
            <a href="https://linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950"><AtSign className="h-4 w-4" /></a>
            <a href="https://facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950"><Globe className="h-4 w-4" /></a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950"><Code2 className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-white">Marketplace</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/#tasks" className="hover:text-emerald-400">Browse tasks</Link></li>
            <li><Link href="/register" className="hover:text-emerald-400">Become a worker</Link></li>
            <li><Link href="/register" className="hover:text-emerald-400">Hire talent</Link></li>
            <li><Link href="/dashboard/purchase-coin" className="hover:text-emerald-400">Buy coins</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/#how" className="hover:text-emerald-400">How it works</Link></li>
            <li><Link href="/#testimonials" className="hover:text-emerald-400">Testimonials</Link></li>
            <li><Link href="/#faq" className="hover:text-emerald-400">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-white">Get started</p>
          <p className="mt-3 text-sm text-slate-400">Workers join free with 10 bonus coins. Buyers start with 50 coins.</p>
          <Link href="/register" className="mt-4 inline-block rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400">Create free account</Link>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MicroTask. All rights reserved.
      </div>
    </footer>
  );
}
