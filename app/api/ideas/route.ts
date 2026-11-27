import { HttpError, handle, parseJson } from "@/lib/api";
import { dbIdeaLog, memoryIdeaLog, type IdeaLog } from "@/lib/db/idea-store";
import { env } from "@/lib/env";
import { ideaEmail } from "@/lib/idea-email";
import { ideaSchema } from "@/lib/idea-schema";
import { ALL_PER_HOUR, PER_DEVICE_PER_HOUR } from "@/lib/ideas";
import { getMailer } from "@/lib/mailer";

export const maxDuration = 10;

let memory: IdeaLog | undefined;
function ideaLog(): IdeaLog {
  if (env().DATABASE_URL) return dbIdeaLog;
  return (memory ??= memoryIdeaLog());
}

/** Is the idea box open? (The page asks before showing the form.) */
export const GET = handle(async () => Response.json({ open: !!env().DATABASE_URL || !!getMailer() }));

/** A player sends in a game idea: it's logged, then emailed to a grown-up for review. */
export const POST = handle(async (req: Request) => {
  const mailer = getMailer();
  const log = ideaLog();
  if (!mailer && !log.saves) throw new HttpError(503, "The idea box opens soon!");
  const idea = await parseJson(req, ideaSchema);
  // Robots fill in the hidden field; pretend it worked and drop it.
  if (idea.website) return Response.json({ ok: true }, { status: 201 });

  const hourAgo = new Date(Date.now() - 3_600_000);
  if ((await log.count(hourAgo, idea.device)) >= PER_DEVICE_PER_HOUR) throw new HttpError(429, "You've sent lots of ideas! Try again in an hour.");
  if ((await log.count(hourAgo)) >= ALL_PER_HOUR) throw new HttpError(429, "The idea box is very full right now. Try again later.");

  const id = crypto.randomUUID();
  await log.add({ id, kind: idea.kind, goal: idea.goal, challenge: idea.challenge, reward: idea.reward, title: idea.title, description: idea.description, deviceId: idea.device });
  console.log(`[ideas] new idea ${id} (${idea.kind})`);

  let emailed = false;
  if (mailer) {
    try {
      await mailer.send({ to: env().IDEAS_EMAIL_TO, ...ideaEmail(id, idea) });
      emailed = true;
      await log.markEmailed(id);
    } catch (err) {
      console.error(`[ideas] email for ${id} failed:`, err);
    }
  }
  if (!emailed && !log.saves) throw new HttpError(502, "Sorry, it didn't send. Please try again.");
  return Response.json({ ok: true }, { status: 201 });
});
