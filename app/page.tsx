import type { Metadata } from "next";
import { GAMES, gameHref } from "@/lib/games";

export const metadata: Metadata = { title: "O Games", description: "Games made by O." };

/** Public arcade (no sign-in): every game, newest first. */
export default function GamesPage() {
  const games = [...GAMES].sort((a, b) => b.added.localeCompare(a.added));
  return (
    <main className="arcade">
      <header>
        <div className="logo" aria-hidden>
          🕹️
        </div>
        <h1>O Games</h1>
        <p className="dim">{games.length ? "Made by O. Tap a game to play: no sign-in needed." : "Made by O. No sign-in needed."}</p>
      </header>
      {games.length === 0 && (
        <section className="empty">
          <div className="big" aria-hidden>
            🎨
          </div>
          <h2>No games yet!</h2>
          <p className="dim">Design the very first one: learn a little game design, answer 4 quick questions and send in your idea.</p>
          <a href="/o-games/create" className="btn">
            Create the first game
          </a>
        </section>
      )}
      <ul className="games">
        {games.map((g) => (
          <li key={g.slug}>
            {/* A plain link: games are their own pages, not part of this app. */}
            <a href={gameHref(g)}>
              <span className="emoji" aria-hidden>
                {g.emoji}
              </span>
              <span className="title">{g.title}</span>
              <span className="dim">{g.blurb}</span>
              <span className="play">▶ Play</span>
            </a>
          </li>
        ))}
      </ul>
      <footer>
        <span>{games.length ? "More games coming soon!" : "Games coming soon!"}</span>
        <a href="/o-games/create" className="create-link">
          🎨 Create a new game
        </a>
      </footer>
    </main>
  );
}
