/**
 * The games, shown on the public /o-games page, newest first. A game built
 * here is a folder of static files in public/{slug}/ with an index.html, plus
 * one entry here. A game hosted somewhere else just sets `url` (no folder).
 */
export type Game = {
  slug: string;
  title: string;
  blurb: string;
  emoji: string;
  /** When it was added (YYYY-MM-DD), newest shown first. */
  added: string;
  /** For a game hosted elsewhere: its https address. Without it, the game is public/{slug}/. */
  url?: string;
};

/** Where a game's card links to. */
export function gameHref(g: Game): string {
  return g.url ?? `/o-games/${g.slug}`;
}

export const GAMES: Game[] = [
  {
    slug: "goat-baseball",
    title: "GOAT Baseball",
    blurb: "Step up to the plate, swing for the fences and become the greatest of all time!",
    emoji: "⚾",
    added: "2026-11-26",
    url: "https://goat-baseball-play-20261126.companychicago.chatgpt.site/",
  },
  {
    slug: "mallkeeper",
    title: "Mallkeeper: Everything Store",
    blurb: "Run a store that sells everything. Stock the shelves, help shoppers and grow your mall!",
    emoji: "🛍️",
    added: "2026-11-26",
    url: "https://mallkeeper-everything-store-20261126.companychicago.chatgpt.site/",
  },
  {
    slug: "block-meadow",
    title: "Block Meadow",
    blurb: "Build and explore in a world of blocks and meadows.",
    emoji: "🌼",
    added: "2026-11-26",
    url: "https://block-meadow-play-20261126.companychicago.chatgpt.site/",
  },
];
