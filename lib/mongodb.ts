import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "micro_task";

if (!uri && process.env.NODE_ENV === "production") {
  console.warn("MONGODB_URI is not set");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined = global._mongoClientPromise;

function getClientPromise() {
  if (!clientPromise) {
    if (!uri) {
      return Promise.reject(new Error("MONGODB_URI is not set. Please add it to .env.local"));
    }
    const client = new MongoClient(uri);
    clientPromise = client.connect();
    global._mongoClientPromise = clientPromise;
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

// Intentionally untyped (any) so route handlers stay lean across collections
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCollection(name: string): Promise<any> {
  const db = await getDb();
  return db.collection(name);
}

export function serialize<T>(doc: T): T {
  return JSON.parse(
    JSON.stringify(doc, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}
