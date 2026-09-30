# MicroTask — Micro Tasking & Earning Platform

Next.js 16 + Tailwind CSS v4 + shadcn-style UI + MongoDB (native driver) + Better-Auth.

Roles: **Worker** (10 signup coins), **Buyer** (50 signup coins), **Admin** (via `ADMIN_EMAILS`).

## Getting Started

1. Copy env and fill secrets (never commit real keys):

```bash
cp .env.example .env.local
```

Required: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
Optional: Google OAuth (`GOOGLE_CLIENT_ID/SECRET`), Stripe (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — without keys, payments run in dummy mode and credit instantly), imgBB (`NEXT_PUBLIC_IMGBB_API_KEY` — file upload; image-URL paste always works), `NEXT_PUBLIC_GITHUB_REPO` (Join as Developer button), `ADMIN_EMAILS` (comma-separated admin seed emails).

2. Install & run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key routes

- `/` home (hero slider, best workers, testimonials, how-it-works, stats/calculator, FAQ)
- `/login`, `/register` (email+password with validation, Google sign-in, role select, imgBB upload)
- `/dashboard` role-aware home (worker / buyer / admin stats + buyer review queue)
- Worker: `/dashboard/tasks`, `/dashboard/tasks/[id]`, `/dashboard/submissions` (paginated), `/dashboard/withdrawals` (20 coins = $1, min 200)
- Buyer: `/dashboard/add-task`, `/dashboard/my-tasks`, `/dashboard/purchase-coin` (Stripe or dummy), `/dashboard/payment-history`
- Admin: `/dashboard/manage-users`, `/dashboard/manage-tasks`, `/dashboard/withdraw-requests` (+ `/api/reports` for invalid-submission reports)

API: `/api/tasks`, `/api/submissions` (approve pays worker / reject refunds slot), `/api/payments`, `/api/withdrawals` (approval deducts coins), `/api/notifications`, `/api/users`, `/api/stats`, `/api/reports`. Role checks live in `lib/session.ts` (`requireSession`) + `middleware.ts` guards `/dashboard` by session cookie only, so reloads never kick out logged-in users. A session token is also persisted to `localStorage` (`microtask-access-token`).
