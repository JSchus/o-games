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

export const GAMES: Game[] = [];
