import type { Metadata } from "next";
import { CreateGame } from "./create-game";

export const metadata: Metadata = {
  title: "Create a new game · O Games",
  description: "Learn the basics of game design and send in your own game idea.",
  robots: { index: false, follow: false },
};

/** Public page (no sign-in): a short game-design lesson, a few questions, then the player's idea. */
export default function CreatePage() {
  return (
    <main className="create">
      <a href="/o-games" className="dim back">
        ← All games
      </a>
      <header>
        <div className="logo" aria-hidden>
          🎨
        </div>
        <h1>Create a new game</h1>
        <p className="dim">Answer 4 quick questions, describe your game, and send it in to be built!</p>
      </header>
      <CreateGame />
    </main>
  );
}
