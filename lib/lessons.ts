/**
 * Game-design lessons for the "Create a new game" page, from the basics to
 * advanced ideas. Each visit on a device unlocks the next one, so a returning
 * designer always learns something new. Shared by the page and the tests.
 */
export type Lesson = { title: string; text: string; tryIt: string };

export const LESSONS: Lesson[] = [
  {
    title: "Every game has a goal",
    text: "A goal tells the player what they're trying to do: reach the finish line, collect every card, or beat the high score. Without a goal, it's a toy, not a game.",
    tryIt: "Say your game's goal in one short sentence.",
  },
  {
    title: "Rules make it a game",
    text: "Rules say what you can and can't do: you can only jump twice, you lose a heart when you get hit, a pack costs 100 coins. Good rules are simple to learn.",
    tryIt: "Write down the 3 most important rules of your game.",
  },
  {
    title: "A good challenge",
    text: "If a game is too easy it's boring, and if it's too hard it's annoying. The best games sit right in between, where you have to try hard but can still win.",
    tryIt: "What is the hardest thing the player has to do in your game?",
  },
  {
    title: "Rewards keep players going",
    text: "Coins, new cars, a shiny card or just a big 'YOU WIN!' make players feel great and want to keep playing. Give small rewards often and big rewards now and then.",
    tryIt: "List one small reward and one BIG reward in your game.",
  },
  {
    title: "The core loop",
    text: "The core loop is what the player does again and again. In a racing game it might be: race → earn money → buy a faster car → race again. A fun loop is the heart of a game.",
    tryIt: "Write your game's loop as 3 or 4 steps with arrows.",
  },
  {
    title: "Feedback: show what happened",
    text: "When something happens, the game should show it: a sound, a flash, a number popping up, the screen shaking. Feedback tells players they did something, good or bad.",
    tryIt: "Pick 3 things in your game and decide what sound or effect each one makes.",
  },
  {
    title: "Teach by playing",
    text: "Players don't like reading long instructions. The first level can teach them: start with one easy enemy, then add a new idea at a time, so they learn by doing.",
    tryIt: "Describe your first level. What does it teach the player?",
  },
  {
    title: "The difficulty curve",
    text: "Games should get harder slowly, with breaks in between. Many games have a boss every few levels: build up, big fight, then a calmer level to rest.",
    tryIt: "Plan 5 levels: which one is the hardest, and where is a break?",
  },
  {
    title: "Meaningful choices",
    text: "A choice is interesting when both answers are good in different ways. A fast car that's hard to steer, or a slow car that's easy? Choices let players play their own way.",
    tryIt: "Invent one choice in your game where both options are tempting.",
  },
  {
    title: "Risk and reward",
    text: "Bigger rewards should come with bigger risks. A shortcut through lava, or spending all your coins on one pricey pack. Taking a risk and winning feels amazing.",
    tryIt: "Add one risky option to your game. What can the player win or lose?",
  },
  {
    title: "Balancing the numbers",
    text: "Games are full of numbers: prices, damage, speed, how many coins you earn. If one thing is too strong, everyone uses only that. Designers tweak numbers until everything feels fair.",
    tryIt: "If a level gives 50 coins, how much should the best upgrade cost? Why?",
  },
  {
    title: "Luck and skill",
    text: "Luck (random packs, dice) adds surprise. Skill (aiming, timing, planning) lets players get better. Most fun games mix both, but players should feel they won because they were good.",
    tryIt: "What part of your game is luck, and what part is skill?",
  },
  {
    title: "Different kinds of players",
    text: "Some players love racing to win, some love collecting everything, some love building, and some love exploring. A great game gives more than one kind of player something to enjoy.",
    tryIt: "What would a collector enjoy in your game? And a builder?",
  },
  {
    title: "Make a small version first",
    text: "Real game studios build a tiny, rough version first (a prototype) to check whether it's fun. You can even make one on paper with drawings and dice before anything is coded.",
    tryIt: "Describe the smallest version of your game that would still be fun.",
  },
  {
    title: "Playtesting",
    text: "Watch someone else play your game without helping or explaining. Where do they get stuck? When do they smile? What they do tells you more than what they say.",
    tryIt: "Write 3 questions you'd ask someone after they played your game.",
  },
  {
    title: "Change it and try again",
    text: "Every great game was changed many times. Test, change one thing, test again. That's called iterating. Don't be afraid to remove an idea that isn't fun.",
    tryIt: "What's one thing you'd change in your favourite game, and why?",
  },
  {
    title: "Game feel",
    text: "Game feel is how good it is to just move around: a jump that's snappy, a car that drifts, a punch that lands with a thump. Players notice it in the first few seconds.",
    tryIt: "Describe how the main action in your game should FEEL in 3 words.",
  },
  {
    title: "Be fair to players",
    text: "Good games respect players: you can win without paying, the rules are clear, and losing feels like 'I'll do better next time', not 'that's unfair'. Players come back to fair games.",
    tryIt: "How could a player lose in your game? Would it feel fair to them?",
  },
];

/** The lesson for a device's nth visit (1-based). After the last one, they come round again as review. */
export function lessonNumber(visit: number): number {
  const v = Math.max(1, Math.floor(visit));
  return ((v - 1) % LESSONS.length) + 1;
}

/** True once every lesson has been seen, so the page can call it a review. */
export function isReview(visit: number): boolean {
  return Math.floor(visit) > LESSONS.length;
}

/** Lessons already unlocked before this visit's lesson (shown as "learned"), newest first. */
export function learnedBefore(visit: number): number[] {
  const unlocked = Math.min(Math.max(1, Math.floor(visit)), LESSONS.length);
  const current = lessonNumber(visit);
  return Array.from({ length: unlocked }, (_, i) => unlocked - i).filter((n) => n !== current);
}
