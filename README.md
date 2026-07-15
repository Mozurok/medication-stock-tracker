# Medication stock

[![CI](https://github.com/Mozurok/medication-stock-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/Mozurok/medication-stock-tracker/actions/workflows/ci.yml)

Know a medication box is running out before it actually does.

**Live:** https://mozurok.github.io/medication-stock-tracker/

You record what you take (`Aymee 40mg`, 30 pills, bought 15 Jul, 1 per day at 10:00). Every
time you open the page it tells you how many pills are left, what day the box runs out, and
flags it once you are inside a week of empty. Everything lives in your browser's
localStorage. There is no account and no server.

## Run it

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | oxlint |
| `npm run build` | Typecheck + production build |

CI runs all four on every push and PR.

## The choices

**Vite + React + TypeScript, no framework.** The app has no server-side anything: no auth, no
database, no API. Next.js would have shipped a server that never gets used. On a blank page
with an hour on the clock, picking the batteries-included default is not a choice, it's the
absence of one.

**localStorage, no backend.** One user, one device, data that matters to nobody else. A
backend would have been the single biggest time sink and would have bought nothing.

**Tests only on `src/domain/medication.ts`.** That module is the whole app's reasoning: pills
remaining, days left, the run-out date, the low-stock threshold. It is pure, so it costs
nothing to test, and it is the only place a bug can hide in plain sight. The UI, by contrast,
is wrong in ways you see immediately by looking at it. So: unit tests on the arithmetic, my
own eyes on the rest, no E2E harness.

**CI before the app.** The first commit is an empty scaffold with a green pipeline. A CI
problem found at minute 50 costs you the delivery; found at minute 10 it costs nothing.

## What I cut, on purpose

**Notifications.** This is the interesting one, because it's what I originally wanted to
build: the browser taps you on the shoulder at 10:00. Doing that for real, with the tab
closed, needs a service worker, the Push API, VAPID keys, and a server to run the schedule.
That is not a one-hour feature, and it's most of a product. So the app computes on open
instead. It's a smaller promise, and it's a promise this app actually keeps. With more time
this is the first thing I'd build, and I'd start with the scheduling backend, not the
notification.

**Everything else:** no accounts, no sync across devices, no dose history, no charts, no drug
interactions, no refill ordering, no i18n. Multiple doses per day work, but only at a single
time of day.

## What I cut and then put back

The design pass. I cut it first, and I cut it for a real reason: the brief grades choices and
judgment, not visual fidelity, so with an hour on the clock the README and the tests were worth
more than the pixels.

Then the work came in under budget, so I went back and did it. That is the time box working
rather than the time box as an excuse: the cut was real when I made it, and it stopped being
necessary, so it stopped.

The restyle is grounded in shipped patterns, not my taste. I pulled references for medication
tracking through [Mobbin](https://mobbin.com) and took three things:
[GoodRx's medicine cabinet](https://mobbin.com/screens/b60c0f17-3561-4a1e-ba28-414f45c12d14)
(white cards on a tinted page, a divider splitting identity from the actionable fact),
[Apple Health](https://mobbin.com/screens/5131c92e-1670-4e62-b0ea-55c3b96bfc2c) (generous radii,
soft-tinted containers), and [Epsy](https://mobbin.com/screens/edd9e352-63f8-40b9-9b7a-dfd7876a625d)
(the full-width pill action at the foot of a card, and the reassurance that purple is not a
strange choice in this domain).

It stayed inside one boundary I set before starting: CSS only, no new dependency. The whole
restyle is `src/App.css` and `src/index.css`. Adding Tailwind or a component kit would have
contradicted the argument this README rests on, that nothing here needs a framework.

## What the browser caught that the tests didn't

Worth writing down, because it's the actual lesson of the hour.

The unit tests were green. Then I drove the real page and found the run-out date sliding
backward a day every time I took a pill. The bug: `runOutDate = today + daysLeft` quietly
assumed today's dose was still due, so taking it looked like losing a day of supply. But you
were always going to take today's pill.

The tests passed because they encoded the same wrong assumption I'd coded. That is what
tests do when you write them from the same misunderstanding. The fix tracks doses taken today,
so only doses *still due* shorten the calendar.

The same pass caught a second one: the card read "Runs out in 29 days, on Aug 14" on 15 Jul,
which is self-contradictory. `daysLeft` counted doses in hand while the date counted the first
uncovered day, so one sentence carried two clocks. They're separate values now, and a test
asserts they can never disagree.

## Layout

```
src/
  domain/medication.ts       the only real logic; pure, no React
  domain/medication.test.ts  11 tests, including the two bugs above
  storage.ts                 localStorage read/write; bad JSON yields an empty list
  components/                form + list
  App.tsx                    state and wiring
  App.css, index.css         the whole restyle; no CSS framework
```

## Built with

Claude Code, driven through [Fhorja](http://fhorja.dev/), an open-source workflow operating
system for AI-assisted engineering that I build and maintain. It is why this repo has a plan
that was approved before any code was written, why the stack choice is a recorded decision with
the rejected alternatives attached, and why cutting the design pass and later restoring it are
both on the record instead of being quietly rewritten.

Where I overrode the AI: the date model. The first contract it proposed, and that I signed off
on, carried the off-by-one described above. Tests were written from the same wrong assumption
and passed. A subagent driving a real browser is what caught it, and it also caught the second
one (the days figure and the date disagreeing) on the re-check after the fix.

The honest version of "how AI helped": it was fast at everything mechanical and it was wrong
about the one thing that required thinking carefully about a calendar. Both of those are worth
knowing.
