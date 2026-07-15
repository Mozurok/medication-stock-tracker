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

**A design pass.** I considered pulling UI references and building something polished. That
time went into this README and the tests instead. The app is plain on purpose.

**Everything else:** no accounts, no sync across devices, no dose history, no charts, no drug
interactions, no refill ordering, no i18n, no dark mode. Multiple doses per day work, but only
at a single time of day.

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
```

## Built with

Claude Code, working from a plan I approved before any code was written. The date model is
the one place I overrode it: the first contract it proposed (and I signed off on) was the
off-by-one above. A subagent driving a real browser is what caught it.
