import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Game ideas sent in from the "Create a new game" page, for a grown-up to review. */
export const gameIdeas = pgTable(
  "game_ideas",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    goal: text("goal").notNull(),
    challenge: text("challenge").notNull(),
    reward: text("reward").notNull(),
    title: text("title").notNull().default(""),
    description: text("description").notNull(),
    /** Random id the page keeps on the device (no names or accounts); used to stop floods. */
    deviceId: text("device_id").notNull(),
    /** Whether the review email went out. */
    emailed: boolean("emailed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("game_ideas_created_idx").on(t.createdAt), index("game_ideas_device_idx").on(t.deviceId, t.createdAt)],
);
export type GameIdea = typeof gameIdeas.$inferSelect;
