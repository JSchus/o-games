import { z } from "zod";
import { MAX_DESCRIPTION, MAX_TITLE, choice, type Question } from "@/lib/ideas";

const pick = (q: Question["id"]) => z.string().refine((id) => !!choice(q, id), "Pick one of the choices");

/** What the page sends. `website` is a hidden trap field that only robots fill in. */
export const ideaSchema = z.object({
  kind: pick("kind"),
  goal: pick("goal"),
  challenge: pick("challenge"),
  reward: pick("reward"),
  title: z.string().trim().max(MAX_TITLE).default(""),
  description: z.string().trim().min(20, "Tell us a little more (at least 20 letters).").max(MAX_DESCRIPTION),
  device: z.string().regex(/^[0-9a-f-]{36}$/, "Bad device"),
  website: z.string().max(200).optional(),
});
export type Idea = z.output<typeof ideaSchema>;
