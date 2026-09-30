import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/micro_task";
const dbName = process.env.MONGODB_DB || "micro_task";

// Reuse a single client for the auth adapter (better-auth needs a Db instance)
declare global {
  var _authMongoClient: MongoClient | undefined;
}

function getAuthDb() {
  if (!global._authMongoClient) {
    global._authMongoClient = new MongoClient(uri);
  }
  return global._authMongoClient.db(dbName);
}

const adminEmails = (process.env.ADMIN_EMAILS || "admin@microtask.io")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: mongodbAdapter(getAuthDb()),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "worker" },
      // NOTE: no defaultValue for coins on purpose. better-auth injects
      // defaultValues into the user BEFORE user.create.before hooks run, so a
      // default here would mask the role-based bonus below (buyer got 10).
      // Coins are assigned solely by the hook as the single source of truth.
      coins: { type: "number", required: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 7 },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const body = (ctx?.body ?? {}) as Record<string, unknown>;
          const rawRole = typeof body.role === "string" ? body.role : (user as Record<string, unknown>).role;
          let role = rawRole === "buyer" || rawRole === "worker" || rawRole === "admin" ? rawRole : "worker";
          const email = (user.email || "").toLowerCase();
          if (adminEmails.includes(email)) role = "admin";
          // Coins are ALWAYS derived from the role at creation time. Never
          // trust a client-supplied coins value (a crafted signup body could
          // otherwise grant arbitrary coins).
          const coins = role === "admin" ? 100 : role === "buyer" ? 50 : 10;
          return { data: { ...user, role, coins } };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
