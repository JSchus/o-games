# O Games: notes for Claude

A small public arcade of kids' games, served at **https://schuster.me/o-games**. This is its own repo and Vercel project; schuster.me forwards `/o-games/*` here, so players stay on schuster.me. It started empty, with a "Create a new game" page that teaches game design and collects the kid's game ideas; his games get added from those ideas. The GitHub owner is `JSchus`. (A sister arcade, L Games, lives in `JSchus/l-games` and works the same way.)

## Privacy
- **Never put the kid's first name anywhere:** not in pages, game files, code, comments, commits, PR text or docs. Use "O" / "O Games". `tests/site.test.ts` checks the public files.
- Never ask kids for names or contact details (the idea form says not to write them).
- localStorage keys start with `o-games:` so they never mix with other arcades on schuster.me (same browser storage). Once a game has players, never rename its keys: that would wipe their saves.

## Stack
- Next.js 15 with `basePath: "/o-games"`. Arcade page `app/page.tsx` (shows "No games yet!" while `lib/games.ts` is empty).
- Each game is static files in `public/<slug>/` (`index.html`, `style.css`, `logic.js` pure rules, `game.js` screens) plus one entry in `lib/games.ts`. `next.config.ts` rewrites `/o-games/<slug>` to its `index.html`, so asset paths in `index.html` must be absolute (`/o-games/<slug>/…`). Slugs `api` and `create` are taken.
- "Create a new game" (`app/create/`, `app/api/ideas`): a lesson per visit (`lib/lessons.ts`), 4 questions (`lib/ideas.ts`), then the idea is logged in `game_ideas` (Drizzle, `drizzle/`) and emailed for review via Resend (`RESEND_API_KEY`) to `IDEAS_EMAIL_TO` (default info@companychicago.com).

## Hard rules
- Never ask for, print or commit secrets (`DATABASE_URL`, `RESEND_API_KEY`). John sets them in Vercel.
- No AI model names in commits, PR text or code.
- Games must be original: their own names, art and creatures, no copies of existing games.
- Schema changes go in a new additive Drizzle migration (`pnpm db:generate`); `scripts/migrate.mjs` runs on production builds only, and only when `DATABASE_URL` is set.

## How John likes to work
- Plain language, one step at a time, for anything he has to do (he uses a Mac and an iPhone, no local terminal).
- Every change on a branch with a pull request he merges himself; afterwards, tell him what to check on the live site.
- Times in Chicago time.

## Before opening a PR
`pnpm typecheck && pnpm lint && pnpm test && pnpm build`, and try the changed pages or game in a browser (headless Chromium + Playwright), including a phone-size check.
