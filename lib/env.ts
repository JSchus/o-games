import "server-only";
import { z } from "zod";

/**
 * Server settings, checked the first time they're used (so `next build`
 * works without secrets). Without RESEND_API_KEY or DATABASE_URL the idea
 * box says "opening soon"; everything else works either way.
 */
const schema = z.object({
  /** Postgres (Neon) for the game-idea log. */
  DATABASE_URL: z.string().url().optional(),
  /** Resend API key for emailing game ideas. Unset = ideas aren't emailed. Never print it. */
  RESEND_API_KEY: z.string().optional(),
  /** Sender of the idea emails; must be on a domain verified in Resend. */
  IDEAS_EMAIL_FROM: z.string().default("O Games <ideas@mail.schuster.me>"),
  /** Who reviews new game ideas: one address, or several separated by commas. */
  IDEAS_EMAIL_TO: z
    .string()
    .default("info@companychicago.com, jeff@jeffschuster.com, jeffsgotmilk@gmail.com")
    .transform((list) => list.split(",").map((a) => a.trim()).filter(Boolean))
    .pipe(z.array(z.string().email()).min(1).max(50)),
});

export type Env = z.infer<typeof schema>;
let cached: Env | undefined;

export function env(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
    cached = parsed.data;
  }
  return cached;
}
