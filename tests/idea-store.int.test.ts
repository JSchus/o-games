/** The game-idea log against Postgres. Skipped without TEST_DATABASE_URL. */
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("game ideas SQL (Postgres)", async () => {
  process.env.DATABASE_URL = url;
  const { db } = await import("@/lib/db");
  const { gameIdeas } = await import("@/lib/db/schema");
  const { dbIdeaLog } = await import("@/lib/db/idea-store");
  const { eq } = await import("drizzle-orm");
  const device = randomUUID();
  const ids = [randomUUID(), randomUUID()];

  afterAll(async () => {
    await db().delete(gameIdeas).where(eq(gameIdeas.deviceId, device));
  });

  it("stores ideas, marks them emailed and counts them per device", async () => {
    const hourAgo = new Date(Date.now() - 3_600_000);
    const before = await dbIdeaLog.count(hourAgo);
    for (const id of ids) {
      await dbIdeaLog.add({ id, kind: "racing", goal: "finish", challenge: "timer", reward: "coins", title: "", description: "A test idea from the test suite.", deviceId: device });
    }
    await dbIdeaLog.markEmailed(ids[0]!);
    const rows = await db().select().from(gameIdeas).where(eq(gameIdeas.deviceId, device));
    expect(rows.map((r) => [r.id, r.emailed]).sort()).toEqual(
      [
        [ids[0], true],
        [ids[1], false],
      ].sort(),
    );
    expect(await dbIdeaLog.count(hourAgo, device)).toBe(2);
    expect(await dbIdeaLog.count(hourAgo)).toBeGreaterThanOrEqual(before + 2);
    expect(await dbIdeaLog.count(new Date(Date.now() + 60_000), device)).toBe(0);
  });
});
