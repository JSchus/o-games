import type { Idea } from "@/lib/idea-schema";
import { choice, summary } from "@/lib/ideas";

/** The review email: plain text, so nothing a player types can change how it looks. */
export function ideaEmail(id: string, idea: Idea): { subject: string; text: string } {
  const title = idea.title || "(no name yet)";
  const answer = (q: "kind" | "goal" | "challenge" | "reward") => {
    const c = choice(q, idea[q]);
    return c ? `${c.emoji} ${c.label}` : idea[q];
  };
  return {
    subject: `New O Games idea: ${title.replace(/[\r\n]+/g, " ").slice(0, 60)}`,
    text: [
      "A new game idea was sent in from O Games (schuster.me/o-games/create).",
      "",
      `Name: ${title}`,
      `Kind of game: ${answer("kind")}`,
      `How you win: ${answer("goal")}`,
      `What makes it hard: ${answer("challenge")}`,
      `What you earn: ${answer("reward")}`,
      "",
      `In short: ${summary(idea)}`,
      "",
      "Their description:",
      idea.description,
      "",
      `Idea id: ${id}`,
      "To build it, start a Claude session on the o-games repo and paste this email.",
    ].join("\n"),
  };
}
