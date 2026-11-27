# O Games

A small arcade of kids' games at https://schuster.me/o-games (this Vercel project; schuster.me forwards `/o-games/*` here). It starts with no games and a "Create a new game" page; games get added from the ideas sent in.

- `app/`: the arcade page, the "Create a new game" page (`app/create/`) and the idea API (`api/ideas`).
- `public/<slug>/`: each game (static files), once there are some, plus one entry in `lib/games.ts`.
- `lib/`: the games list, the lessons (`lessons.ts`), questions (`ideas.ts`), form check (`idea-schema.ts`), review email (`idea-email.ts`, `mailer.ts`) and database.
- `tests/`: Vitest. `TEST_DATABASE_URL=postgres://… pnpm test tests/idea-store.int.test.ts` for the database test.

## Create a new game

`/o-games/create` teaches game design and collects ideas:

- Each visit on a device unlocks the next of 18 lessons (basics first, then core loops, difficulty curves, balancing, playtesting…). It's counted in that device's browser, once per tab, so a refresh doesn't skip one. After the last lesson they come round again as review.
- 4 tap-to-answer questions (kind of game, how you win, what makes it hard, what you earn), each with a design tip, then a name and a short description (20–1000 letters). No names or contact details are asked for.
- Sending logs the idea in the `game_ideas` table (when `DATABASE_URL` is set) and emails it to `IDEAS_EMAIL_TO` through Resend (when `RESEND_API_KEY` is set). With neither, the page says "the idea box opens soon".
- Flood limits: 3 ideas per device and 30 in total per hour; a hidden trap field drops robots.

## Environment variables

All optional; set them in Vercel. Without them the arcade works and the idea box says "opening soon".

| Variable | What it's for |
| --- | --- |
| `DATABASE_URL` | Neon Postgres: the game-idea log. Migrations run on production builds. |
| `RESEND_API_KEY` | Emails new game ideas (sending access, domain `mail.schuster.me`). |
| `IDEAS_EMAIL_FROM` | Sender of idea emails (default `O Games <ideas@mail.schuster.me>`). |
| `IDEAS_EMAIL_TO` | Who reviews ideas (default info@companychicago.com). |
