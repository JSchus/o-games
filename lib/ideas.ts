/**
 * The "Create a new game" questions and the idea a player sends in.
 * Shared by the page and the server (the form check is in idea-schema.ts, kept out of the page bundle).
 */
export type Choice = { id: string; label: string; emoji: string; tip: string };
export type Question = { id: "kind" | "goal" | "challenge" | "reward"; ask: string; choices: Choice[] };

export const QUESTIONS: Question[] = [
  {
    id: "kind",
    ask: "What kind of game do you want to make?",
    choices: [
      { id: "action", label: "Action / shooting", emoji: "🚀", tip: "Action games are about quick reactions. Make dodging and aiming feel great." },
      { id: "racing", label: "Racing", emoji: "🏁", tip: "Racing games are about speed and steering. Tracks with fun turns matter a lot." },
      { id: "collecting", label: "Collecting / cards", emoji: "👾", tip: "Collecting games are about the thrill of finding something rare." },
      { id: "building", label: "Building / crafting", emoji: "⛏️", tip: "Building games give players tools and let them create. Freedom is the fun." },
      { id: "puzzle", label: "Puzzle", emoji: "🧩", tip: "Puzzle games are about the 'aha!' moment. Start easy and add one new idea at a time." },
      { id: "adventure", label: "Adventure / story", emoji: "🗺️", tip: "Adventure games are about exploring a world and finding out what happens next." },
      { id: "sports", label: "Sports", emoji: "⚽", tip: "Sports games take rules people already know and make them extra exciting." },
      { id: "other", label: "Something new", emoji: "✨", tip: "New kinds of games are the best! Explain the main idea really clearly." },
    ],
  },
  {
    id: "goal",
    ask: "How do you win?",
    choices: [
      { id: "score", label: "Get the highest score", emoji: "🏆", tip: "Scores let players beat their own best. Show the high score on screen." },
      { id: "finish", label: "Reach the finish", emoji: "🚩", tip: "A finish line gives a clear goal. Show how far there is still to go." },
      { id: "collect", label: "Collect them all", emoji: "📚", tip: "Show a collection book with empty spaces, so players see what's still missing." },
      { id: "boss", label: "Beat the boss", emoji: "🐉", tip: "Bosses are big tests of everything the player has learned so far." },
      { id: "build", label: "Build something amazing", emoji: "🏰", tip: "With no winner, the fun is in creating. Let players save and show off what they made." },
      { id: "survive", label: "Survive as long as you can", emoji: "⏳", tip: "Survival games get harder over time. Every extra second feels like a win." },
    ],
  },
  {
    id: "challenge",
    ask: "What makes it hard?",
    choices: [
      { id: "enemies", label: "Enemies", emoji: "👹", tip: "Give each enemy one clear trick, so players can learn how to beat it." },
      { id: "timer", label: "A timer", emoji: "⏱️", tip: "A timer adds pressure. Show it big, and let it tick louder near the end." },
      { id: "jumps", label: "Tricky moves", emoji: "🤸", tip: "Hard moves need controls that feel fair. Practice spots help a lot." },
      { id: "thinking", label: "Thinking and planning", emoji: "🧠", tip: "Give players the information they need, then let them figure it out." },
      { id: "limited", label: "Not enough coins or lives", emoji: "💔", tip: "Running low makes every choice matter. Don't make it too stingy!" },
      { id: "players", label: "Other players", emoji: "🤝", tip: "Playing against friends is exciting. Make sure everyone has a fair chance." },
    ],
  },
  {
    id: "reward",
    ask: "What do players earn?",
    choices: [
      { id: "coins", label: "Coins to spend", emoji: "🪙", tip: "Coins are great when there's something exciting to buy with them." },
      { id: "characters", label: "New characters", emoji: "🦊", tip: "Give each character something special, not just a new look." },
      { id: "levels", label: "New levels or worlds", emoji: "🌋", tip: "New places keep things fresh. Each one can bring a new idea." },
      { id: "upgrades", label: "Upgrades", emoji: "⚡", tip: "Upgrades let players feel themselves getting stronger." },
      { id: "items", label: "Rare cards or items", emoji: "💎", tip: "Rare things feel special when players can see how rare they are." },
      { id: "bragging", label: "Bragging rights", emoji: "😎", tip: "High scores, trophies and badges are rewards players love to show off." },
    ],
  },
];

export function choice(question: Question["id"], id: string): Choice | undefined {
  return QUESTIONS.find((q) => q.id === question)?.choices.find((c) => c.id === id);
}

/** Flood limits: per device, and for everyone together (so the review inbox can't be swamped). */
export const PER_DEVICE_PER_HOUR = 3;
export const ALL_PER_HOUR = 30;

export const MAX_DESCRIPTION = 1000;
export const MAX_TITLE = 60;

/** The four answers, by question id. */
export type Answers = Record<Question["id"], string>;

/** One plain sentence built from the answers, e.g. "A racing game where you reach the finish…". */
export function summary(a: Answers): string {
  const label = (q: Question["id"], id: string) => (choice(q, id)?.label ?? id).toLowerCase();
  const kind = a.kind === "other" ? "brand-new kind of" : label("kind", a.kind);
  return `A ${kind} game where you win when you ${label("goal", a.goal)}. The hard part: ${label("challenge", a.challenge)}. You earn ${label("reward", a.reward)}.`;
}
