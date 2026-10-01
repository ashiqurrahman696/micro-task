"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ArrowRight, BadgeCheck, Coins, ShieldCheck, Star, Users, Wallet, Clapperboard, MousePointerClick, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SLIDES = [
  {
    kicker: "For Workers",
    title: "Complete micro-tasks. Earn real coins.",
    desc: "Watch videos, test apps, write reviews and get paid per task. Cash out from 200 coins.",
    cta: "Start earning",
    href: "/register",
    gradient: "from-emerald-700 via-emerald-600 to-teal-500",
  },
  {
    kicker: "For Buyers",
    title: "Get 100+ workers on your task today.",
    desc: "Launch YouTube, SEO and testing campaigns in minutes. Pay only for approved work.",
    cta: "Post a task",
    href: "/register",
    gradient: "from-slate-900 via-slate-800 to-emerald-700",
  },
  {
    kicker: "Trusted Platform",
    title: "Secure payments. Fast reviews.",
    desc: "Role-based dashboard, submission reviews, Stripe coin purchase and instant notifications.",
    cta: "Explore tasks",
    href: "/#tasks",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
];

const TESTIMONIALS = [
  { name: "Tanvir Hasan", role: "Top Worker", img: "https://i.pravatar.cc/150?img=12", quote: "I earned my first payout in a week doing video tasks in the evening. Reviews are fast and fair." },
  { name: "Sarah Miller", role: "Buyer, SEO Agency", img: "https://i.pravatar.cc/150?img=47", quote: "We got 300+ real comments on our launch video in two days. The approval workflow saves hours." },
  { name: "Rakib Ahmed", role: "Worker", img: "https://i.pravatar.cc/150?img=33", quote: "Withdrawal was smooth. The coin system is transparent — 20 coins always equals a dollar." },
  { name: "Elena Petrova", role: "Buyer, App Founder", img: "https://i.pravatar.cc/150?img=45", quote: "Posting a task takes minutes. I only pay when submissions are approved. Highly recommended." },
];

const FAQS = [
  { q: "How do workers earn?", a: "Browse the TaskList, submit proof of work, and receive coins when the buyer approves. 20 coins = $1, withdrawable from 200 coins." },
  { q: "How do buyers pay?", a: "Buy coin packs with Stripe (10 coins/$1 up to 1000 coins/$35). Coins are locked per task and refunded if you delete an unfinished task." },
  { q: "What roles exist?", a: "Worker completes tasks, Buyer posts and reviews tasks, Admin manages users, tasks and withdrawals." },
];

export default function HomePage() {
  const [workers, setWorkers] = useState<{ name: string; image: string; coins: number }[]>([]);
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch("/api/best-workers").then((r) => r.json()).then((d) => setWorkers(d.workers || [])).catch(() => {});
    fetch("/api/tasks/featured").then((r) => r.json()).then((d) => setTasks(d.tasks || [])).catch(() => {});
  }, []);

  return (
    <main>
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Swiper modules={[Autoplay, Pagination, Navigation]} autoplay={{ delay: 4500 }} pagination={{ clickable: true }} navigation loop className="overflow-hidden rounded-3xl">
          {SLIDES.map((s) => (
            <SwiperSlide key={s.title}>
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-14 sm:px-12 sm:py-20 ${s.gradient}`}>
                <div className="animate-fade-up max-w-2xl text-white">
                  <p className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest">{s.kicker}</p>
                  <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">{s.title}</h1>
                  <p className="mt-3 max-w-xl text-white/85 sm:text-lg">{s.desc}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={s.href}><Button variant="secondary" size="lg">{s.cta} <ArrowRight /></Button></Link>
                    <Link href="/login"><Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">Login</Button></Link>
                  </div>
                  <div className="mt-6 flex gap-5 text-sm font-semibold text-white/90">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Secure</span>
                    <span className="flex items-center gap-1.5"><Coins className="h-4 w-4" /> Instant coins</span>
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 3 roles</span>
                  </div>
                </div>
                <div className="animate-float pointer-events-none absolute -right-10 -top-10 hidden h-72 w-72 rounded-full bg-white/15 sm:block" />
                <div className="animate-float pointer-events-none absolute -bottom-16 right-40 hidden h-40 w-40 rounded-full bg-black/10 sm:block" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* BEST WORKERS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Leaderboard</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Best Workers</h2>
          </div>
          <Link href="/register" className="text-sm font-bold text-emerald-700 hover:underline">Join them →</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(workers.length ? workers : Array.from({ length: 6 }).map((_, i) => ({ name: ["Nusrat J.", "Karim U.", "Mim Akter", "John D.", "Priya S.", "Arif H."][i], image: `https://i.pravatar.cc/150?img=${i + 5}`, coins: [2450, 1980, 1760, 1540, 1320, 1180][i] }))).map((w, i) => (
            <Card key={i} className="p-4 text-center transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative mx-auto h-16 w-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.image || "/avatar.png"} alt={w.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-500" />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-extrabold">#{i + 1}</span>
              </div>
              <p className="mt-2 truncate text-sm font-bold">{w.name}</p>
              <p className="mt-0.5 flex items-center justify-center gap-1 text-xs font-bold text-amber-700"><Coins className="h-3.5 w-3.5" /> {w.coins} coins</p>
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURED TASKS */}
      <section id="tasks" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Live marketplace</p>
          <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Featured tasks</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tasks.length === 0 && (
              <>
                {[
                  { t: "Watch my YouTube video & comment", pay: 10, need: 100, icon: Clapperboard },
                  { t: "Test my landing page on mobile", pay: 15, need: 40, icon: MousePointerClick },
                  { t: "Write a 50-word app review", pay: 12, need: 80, icon: Star },
                  { t: "Share my product launch post", pay: 8, need: 150, icon: Megaphone },
                ].map((d, i) => (
                  <Card key={i} className="p-5">
                    <d.icon className="h-8 w-8 text-emerald-600" />
                    <p className="mt-3 font-bold leading-snug">{d.t}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{d.need} spots · <span className="font-bold text-emerald-700">{d.pay} coins</span> each</p>
                    <Link href="/register"><Button size="sm" className="mt-4 w-full">View details</Button></Link>
                  </Card>
                ))}
              </>
            )}
            {tasks.map((t: Record<string, unknown>) => (
              <Card key={String(t._id)} className="overflow-hidden">
                {(t.task_image_url as string) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.task_image_url as string} alt="" className="h-32 w-full object-cover" />
                )}
                <CardContent className="p-5">
                  <p className="font-bold leading-snug">{String(t.task_title).slice(0, 60)}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{Number(t.required_workers)} spots · <span className="font-bold text-emerald-700">{Number(t.payable_amount)} coins</span></p>
                  <Link href="/register"><Button size="sm" className="mt-4 w-full">View details</Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* EXTRA 1: HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600">How it works</p>
        <h2 className="mt-1 text-center text-2xl font-extrabold sm:text-3xl">From task to payout in 3 steps</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: MousePointerClick, title: "1. Pick a task", desc: "Workers browse verified tasks with clear proof requirements and deadlines." },
            { icon: BadgeCheck, title: "2. Submit & get approved", desc: "Buyers review submissions, approve great work instantly and coins land in wallets." },
            { icon: Wallet, title: "3. Withdraw earnings", desc: "20 coins = $1. Withdraw from 200 coins via Stripe, bKash, Rocket or Nagad." },
          ].map((s, i) => (
            <Card key={i} className="p-6 transition hover:shadow-lg">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><s.icon className="h-6 w-6" /></span>
              <p className="mt-4 text-lg font-bold">{s.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* EXTRA 2: STATS / EARNING CALC */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Why MicroTask</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Real math, real money</h2>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[["12k+", "Tasks done"], ["4.9/5", "Avg rating"], ["$28k", "Paid out"]].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-extrabold text-amber-400">{v}</p>
                  <p className="text-xs text-slate-400">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-400">Buyers fund tasks at 10 coins/$1. Workers cash out at 20 coins/$1 — the spread keeps the platform running and fraud-free.</p>
          </div>
          <Card className="border-slate-800 bg-slate-900 p-6 text-white">
            <p className="font-bold">Earning calculator</p>
            <p className="text-sm text-slate-400">Slide to see your payout.</p>
            <Calc />
          </Card>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600">Testimonials</p>
        <h2 className="mt-1 text-center text-2xl font-extrabold sm:text-3xl">Loved by workers & buyers</h2>
        <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 3500 }} pagination={{ clickable: true }} spaceBetween={16} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} className="mt-8 pb-10">
          {TESTIMONIALS.map((t) => (
            <SwiperSlide key={t.name}>
              <Card className="h-full p-6">
                <div className="flex gap-1 text-amber-400">{"★★★★★"}</div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">“{t.quote}”</p>
                <div className="mt-4 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  <div><p className="text-sm font-bold">{t.name}</p><p className="text-xs text-slate-500">{t.role}</p></div>
                </div>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* EXTRA 3: FAQ + CTA */}
      <section id="faq" className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Extra · FAQ</p>
            <h2 className="mt-1 text-2xl font-extrabold">Questions, answered</h2>
            <div className="mt-4 space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <summary className="cursor-pointer font-bold">{f.q}</summary>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-white">
            <h3 className="text-2xl font-extrabold">Ready to earn your first 10 coins?</h3>
            <p className="mt-2 text-white/85">Join free as a Worker, or start with 50 coins as a Buyer. No credit card needed.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/register"><Button variant="secondary">Create account</Button></Link>
              <Link href="/login"><Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">Login</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Calc() {
  const [tasks, setTasks] = useState(25);
  const coins = tasks * 10;
  return (
    <div className="mt-4">
      <input type="range" min={5} max={200} value={tasks} onChange={(e) => setTasks(Number(e.target.value))} className="w-full accent-emerald-500" />
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-800 p-4">
        <div><p className="text-xs text-slate-400">{tasks} tasks × 10 coins</p><p className="text-xl font-extrabold text-emerald-400">{coins} coins</p></div>
        <div className="text-right"><p className="text-xs text-slate-400">You withdraw</p><p className="text-xl font-extrabold text-amber-400">${(coins / 20).toFixed(2)}</p></div>
      </div>
    </div>
  );
}
