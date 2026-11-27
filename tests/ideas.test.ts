import { beforeEach, describe, expect, it, vi } from "vitest";
import { ideaSchema } from "@/lib/idea-schema";
import { ALL_PER_HOUR, PER_DEVICE_PER_HOUR, QUESTIONS, summary } from "@/lib/ideas";
import { LESSONS, isReview, learnedBefore, lessonNumber } from "@/lib/lessons";
import type { NewIdea } from "@/lib/db/idea-store";

vi.hoisted(() => {
  process.env.DATABASE_URL ??= "postgres://test@localhost/test";
});

// A stand-in for the database log, so the route can be tested without Postgres.
const log = vi.hoisted(() => ({ rows: [] as { row: unknown; emailed: boolean; at: number }[] }));
vi.mock("@/lib/db/idea-store", async (orig) => ({
  ...(await orig<typeof import("@/lib/db/idea-store")>()),
  dbIdeaLog: {
    saves: true,
    add: async (row: NewIdea) => void log.rows.push({ row, emailed: false, at: Date.now() }),
    markEmailed: async (id: string) => {
      const r = log.rows.find((x) => (x.row as NewIdea).id === id);
      if (r) r.emailed = true;
    },
    count: async (since: Date, device?: string) =>
      log.rows.filter((x) => x.at > since.getTime() && (!device || (x.row as NewIdea).deviceId === device)).length,
  },
}));

const { setMailerForTests } = await import("@/lib/mailer");
const { memoryIdeaLog } = await import("@/lib/db/idea-store");
const { ideaEmail } = await import("@/lib/idea-email");
const route = await import("@/app/api/ideas/route");

const DEVICE = "0b8f6f0e-2c4b-4c8a-9f5e-1a2b3c4d5e6f";
const device = (n: number) => `${String(n).padStart(8, "0")}-2c4b-4c8a-9f5e-1a2b3c4d5e6f`;
const idea = (extra: Record<string, unknown> = {}) => ({
  kind: "racing",
  goal: "finish",
  challenge: "timer",
  reward: "upgrades",
  title: "Dragon Drift",
  description: "You ride a dragon through a canyon and collect gems to buy faster dragons.",
  device: DEVICE,
  ...extra,
});
const post = (body: unknown) => new Request("https://o-games.vercel.app/o-games/api/ideas", { method: "POST", body: JSON.stringify(body) });

describe("game-design lessons", () => {
  it("has a full set, each with a title, a lesson and something to try", () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(15);
    for (const l of LESSONS) {
      expect(l.title.length).toBeGreaterThan(3);
      expect(l.text.length).toBeGreaterThan(40);
      expect(l.tryIt.length).toBeGreaterThan(10);
    }
    expect(new Set(LESSONS.map((l) => l.title)).size).toBe(LESSONS.length);
  });

  it("unlocks the next lesson on every visit, then comes round again as review", () => {
    expect([1, 2, 3].map(lessonNumber)).toEqual([1, 2, 3]);
    expect(lessonNumber(LESSONS.length)).toBe(LESSONS.length);
    expect(lessonNumber(LESSONS.length + 1)).toBe(1);
    expect(isReview(LESSONS.length)).toBe(false);
    expect(isReview(LESSONS.length + 1)).toBe(true);
    expect(lessonNumber(0)).toBe(1);
  });

  it("lists the lessons already learned, newest first, without today's", () => {
    expect(learnedBefore(1)).toEqual([]);
    expect(learnedBefore(4)).toEqual([3, 2, 1]);
    expect(learnedBefore(LESSONS.length + 2)).not.toContain(2);
    expect(learnedBefore(LESSONS.length + 2)).toHaveLength(LESSONS.length - 1);
  });
});

describe("the idea form", () => {
  it("has 4 questions, each with a tip for every choice", () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual(["kind", "goal", "challenge", "reward"]);
    for (const q of QUESTIONS) for (const c of q.choices) expect(c.tip.length).toBeGreaterThan(20);
  });

  it("only accepts real choices and a long enough description", () => {
    expect(ideaSchema.safeParse(idea()).success).toBe(true);
    expect(ideaSchema.safeParse(idea({ kind: "nope" })).success).toBe(false);
    expect(ideaSchema.safeParse(idea({ description: "too short" })).success).toBe(false);
    expect(ideaSchema.safeParse(idea({ description: "x".repeat(1001) })).success).toBe(false);
    expect(ideaSchema.safeParse(idea({ device: "not-a-device" })).success).toBe(false);
  });

  it("sums the answers up in one plain sentence", () => {
    expect(summary(idea())).toBe("A racing game where you win when you reach the finish. The hard part: a timer. You earn upgrades.");
  });
});

describe("the review email", () => {
  it("is plain text with every answer and the description", () => {
    const parsed = ideaSchema.parse(idea());
    const mail = ideaEmail("abc", parsed);
    expect(mail.subject).toBe("New O Games idea: Dragon Drift");
    expect(mail.text).toContain("Kind of game: 🏁 Racing");
    expect(mail.text).toContain("What you earn: ⚡ Upgrades");
    expect(mail.text).toContain(parsed.description);
  });

  it("can't be given extra header lines through the game name", () => {
    const mail = ideaEmail("abc", ideaSchema.parse(idea({ title: "Hi\r\nBcc: x@example.com" })));
    expect(mail.subject).not.toMatch(/[\r\n]/);
  });
});

describe("sending an idea", () => {
  let sent: { to: string; subject: string; text: string }[];
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    log.rows = [];
    sent = [];
    setMailerForTests({ send: async (m) => void sent.push(m) });
  });

  it("says the idea box is open", async () => {
    expect(await (await route.GET()).json()).toEqual({ open: true });
  });

  it("logs the idea and emails it for review", async () => {
    const res = await route.POST(post(idea()));
    expect(res.status).toBe(201);
    expect(log.rows).toHaveLength(1);
    expect(log.rows[0]).toMatchObject({ emailed: true, row: { kind: "racing", title: "Dragon Drift", deviceId: DEVICE } });
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe("info@companychicago.com");
  });

  it("still keeps the idea when the email fails", async () => {
    setMailerForTests({ send: async () => Promise.reject(new Error("down")) });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await route.POST(post(idea()));
    expect(res.status).toBe(201);
    expect(log.rows[0]).toMatchObject({ emailed: false });
  });

  it("turns away bad answers", async () => {
    expect((await route.POST(post(idea({ goal: "?" })))).status).toBe(400);
    expect(log.rows).toHaveLength(0);
  });

  it("quietly drops robots that fill in the hidden field", async () => {
    const res = await route.POST(post(idea({ website: "http://spam.example" })));
    expect(res.status).toBe(201);
    expect(log.rows).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });

  it("limits each device, and everyone together, per hour", async () => {
    for (let i = 0; i < PER_DEVICE_PER_HOUR; i++) expect((await route.POST(post(idea()))).status).toBe(201);
    expect((await route.POST(post(idea()))).status).toBe(429);

    for (let i = 1; log.rows.length < ALL_PER_HOUR; i++) expect((await route.POST(post(idea({ device: device(i) })))).status).toBe(201);
    expect((await route.POST(post(idea({ device: device(999) })))).status).toBe(429);
    expect(sent).toHaveLength(ALL_PER_HOUR);
  });
});

describe("without a database", () => {
  it("still counts ideas for the flood limits, but stores nothing", async () => {
    const mem = memoryIdeaLog();
    expect(mem.saves).toBe(false);
    await mem.add({ id: "1", kind: "racing", goal: "finish", challenge: "timer", reward: "coins", title: "", description: "x", deviceId: DEVICE });
    const hourAgo = new Date(Date.now() - 3_600_000);
    expect(await mem.count(hourAgo, DEVICE)).toBe(1);
    expect(await mem.count(hourAgo, device(5))).toBe(0);
    expect(await mem.count(hourAgo)).toBe(1);
  });
});
