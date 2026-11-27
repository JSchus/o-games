"use client";

import { useEffect, useState } from "react";
import { MAX_DESCRIPTION, MAX_TITLE, QUESTIONS, choice, summary, type Question } from "@/lib/ideas";
import { LESSONS, isReview, learnedBefore, lessonNumber } from "@/lib/lessons";

// Saved on this device only (keys start with "o-games:" so they never mix with other arcades on schuster.me).
const VISITS_KEY = "o-games:create:visits";
const COUNTED_KEY = "o-games:create:counted";
const DEVICE_KEY = "o-games:device";

type Answers = Partial<Record<Question["id"], string>>;
type Status = "idle" | "sending" | "sent";

function storage<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** Count one visit per browser tab session, so a refresh doesn't skip a lesson. */
function countVisit(): number {
  return storage(() => {
    const visits = Number(localStorage.getItem(VISITS_KEY) ?? "0") || 0;
    if (sessionStorage.getItem(COUNTED_KEY)) return Math.max(1, visits);
    localStorage.setItem(VISITS_KEY, String(visits + 1));
    sessionStorage.setItem(COUNTED_KEY, "1");
    return visits + 1;
  }, 1);
}

function deviceId(): string {
  return storage(() => {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  }, crypto.randomUUID());
}

export function CreateGame() {
  const [visit, setVisit] = useState(0);
  const [open, setOpen] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setVisit(countVisit());
    fetch("/o-games/api/ideas")
      .then((r) => r.json())
      .then((b: { open?: boolean }) => setOpen(!!b.open))
      .catch(() => setOpen(false));
  }, []);

  const question = QUESTIONS[step];
  const picked = question ? answers[question.id] : undefined;
  const tip = question && picked ? choice(question.id, picked)?.tip : undefined;
  const complete = QUESTIONS.every((q) => answers[q.id]);

  async function send() {
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/o-games/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, title, description, website, device: deviceId() }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(res.status === 400 ? "Please check your answers and try again." : (body.error ?? "Sorry, it didn't send."));
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sorry, it didn't send.");
      setStatus("idle");
    }
  }

  function startOver() {
    setAnswers({});
    setTitle("");
    setDescription("");
    setStep(0);
    setStatus("idle");
  }

  return (
    <>
      {visit > 0 && <LessonCard visit={visit} />}

      <section className="panel" aria-live="polite">
        {status === "sent" ? (
          <div className="done">
            <div className="big" aria-hidden>
              🎉
            </div>
            <h2>Your idea is sent!</h2>
            <p>A grown-up will read it and see about building it. Come back next time for a new game-design lesson.</p>
            <div className="row">
              <button type="button" className="btn" onClick={startOver}>
                Make another game
              </button>
              <a className="btn ghost" href="/o-games">
                Back to the games
              </a>
            </div>
          </div>
        ) : question ? (
          <>
            <p className="dim">
              Question {step + 1} of {QUESTIONS.length}
            </p>
            <h2>{question.ask}</h2>
            <div className="choices">
              {question.choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`choice${picked === c.id ? " on" : ""}`}
                  aria-pressed={picked === c.id}
                  onClick={() => setAnswers((a) => ({ ...a, [question.id]: c.id }))}
                >
                  <span aria-hidden>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
            {tip && <p className="tip">💡 {tip}</p>}
            <div className="row">
              {step > 0 && (
                <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>
                  ← Back
                </button>
              )}
              <button type="button" className="btn" disabled={!picked} onClick={() => setStep(step + 1)}>
                Next →
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="dim">Last step</p>
            <h2>Describe your game</h2>
            {complete && <p className="tip">🎮 So far: {summary(answers as Record<Question["id"], string>)}</p>}
            <label className="field">
              <span>Game name (you can make one up later)</span>
              <input value={title} maxLength={MAX_TITLE} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dragon Drift" />
            </label>
            <label className="field">
              <span>What happens in your game? What does the player do?</span>
              <textarea
                value={description}
                maxLength={MAX_DESCRIPTION}
                rows={6}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. You ride a dragon through a canyon, dodging rocks and collecting gems to buy new dragons…"
              />
              <small className="dim">
                {description.length}/{MAX_DESCRIPTION}. Don&apos;t write your name, school or address.
              </small>
            </label>
            {/* A trap for robots: hidden from people, so only robots fill it in. */}
            <input className="trap" tabIndex={-1} autoComplete="off" aria-hidden value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
            {open === false && <p className="tip">📮 The idea box opens soon. You can still practise designing!</p>}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="row">
              <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
              <button
                type="button"
                className="btn"
                disabled={!complete || description.trim().length < 20 || status === "sending" || open === false}
                onClick={send}
              >
                {status === "sending" ? "Sending…" : "Send my idea 🚀"}
              </button>
            </div>
            {description.trim().length > 0 && description.trim().length < 20 && <p className="dim">Write a little more to send it (at least 20 letters).</p>}
          </>
        )}
      </section>
    </>
  );
}

function LessonCard({ visit }: { visit: number }) {
  const n = lessonNumber(visit);
  const lesson = LESSONS[n - 1]!;
  const learned = learnedBefore(visit);
  return (
    <section className="lesson">
      <p className="dim">
        {isReview(visit) ? "Review" : "New lesson"} · {n} of {LESSONS.length}
      </p>
      <h2>📘 {lesson.title}</h2>
      <p>{lesson.text}</p>
      <p className="tip">✏️ Try it: {lesson.tryIt}</p>
      {learned.length > 0 && (
        <details>
          <summary>Lessons you&apos;ve learned ({learned.length})</summary>
          <ol>
            {learned.map((i) => {
              const l = LESSONS[i - 1]!;
              return (
                <li key={i} value={i}>
                  <strong>{l.title}:</strong> {l.text}
                </li>
              );
            })}
          </ol>
        </details>
      )}
      {!isReview(visit) && n < LESSONS.length && <p className="dim small">Come back next time to unlock lesson {n + 1}.</p>}
    </section>
  );
}
