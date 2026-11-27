import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "./index";
import { gameIdeas, type GameIdea } from "./schema";

export type NewIdea = Omit<GameIdea, "emailed" | "createdAt">;

/** Where ideas are logged: the database once DATABASE_URL is set, else this server's memory (counts only). */
export interface IdeaLog {
  readonly saves: boolean;
  add(row: NewIdea): Promise<void>;
  markEmailed(id: string): Promise<void>;
  /** Ideas since `since`, from one device or (without a device) from everyone. */
  count(since: Date, device?: string): Promise<number>;
}

export const dbIdeaLog: IdeaLog = {
  saves: true,
  async add(row) {
    await db().insert(gameIdeas).values(row);
  },
  async markEmailed(id) {
    await db().update(gameIdeas).set({ emailed: true }).where(eq(gameIdeas.id, id));
  },
  async count(since, device) {
    const recent = gt(gameIdeas.createdAt, since);
    const [row] = await db()
      .select({ n: sql<number>`count(*)::int` })
      .from(gameIdeas)
      .where(device ? and(recent, eq(gameIdeas.deviceId, device)) : recent);
    return row?.n ?? 0;
  },
};

/** Without a database: nothing is stored, but the flood limits still work per server instance. */
export function memoryIdeaLog(): IdeaLog {
  const seen: { device: string; at: number }[] = [];
  return {
    saves: false,
    async add(row) {
      seen.push({ device: row.deviceId, at: Date.now() });
      if (seen.length > 500) seen.splice(0, seen.length - 500);
    },
    async markEmailed() {},
    async count(since, device) {
      return seen.filter((s) => s.at > since.getTime() && (!device || s.device === device)).length;
    },
  };
}
