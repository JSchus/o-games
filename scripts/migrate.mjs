// Apply pending Drizzle migrations (drizzle/*.sql) before `next build`.
//
// Runs on Vercel *production* builds only (locally: `pnpm db:migrate`), and
// only once DATABASE_URL is set: the arcade works without a database, the
// idea log needs one. Migrations are additive; if one fails the build fails
// and the previous deployment keeps serving.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const force = process.argv.includes("--force");
if (!force && process.env.VERCEL_ENV !== "production") {
  console.log(`[migrate] skipped (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"})`);
  process.exit(0);
}
const raw = process.env.DATABASE_URL;
if (!raw) {
  console.log("[migrate] skipped: no DATABASE_URL (idea log not set up yet)");
  process.exit(0);
}

// postgres.js sends unknown URL parameters (e.g. Neon's channel_binding=require)
// to the server as settings, which it rejects. Keep only the TLS choice.
const url = new URL(raw);
const sslmode = url.searchParams.get("sslmode");
url.search = "";
const client = postgres(url.toString(), { max: 1, prepare: false, ssl: sslmode && sslmode !== "disable" ? "require" : false, onnotice: () => {} });

try {
  await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  console.log("[migrate] database is up to date");
} catch (err) {
  console.error("[migrate] failed:", err);
  process.exitCode = 1;
} finally {
  await client.end();
}
