# Video script (2-4 min)

Conversational, not a demo reel. Talk over the screen. Rough beats, not a teleprompter.

---

## 0:00 - 0:30 | What it is

Show the live page. Add "Aymee 40mg", 30 pills, 1 per day, bought today.

> I take a pill every morning and I keep discovering the box is empty on the morning it's
> empty. So: you record what you take and when you bought it, and every time you open the
> page it tells you when it runs out and warns you when you're inside a week.
>
> Click "take one now": the count drops, the date holds. That date holding is the whole app,
> and I'll come back to why.

## 0:30 - 1:30 | The choices

Show `package.json`, then `ci.yml`.

> Vite, React, TypeScript, localStorage. No framework. There's no server-side anything here,
> no auth, no database, no API, so Next.js would've shipped me a server I never use. With one
> hour and a blank page, taking the batteries-included default isn't a decision, it's skipping
> one.
>
> First commit is an empty scaffold with green CI: lint, typecheck, test, build. Nothing else.
> A CI problem at minute 50 costs you the delivery. At minute 10 it costs nothing.
>
> Tests only on the domain module. It's pure, so it's free to test, and it's the one place a
> bug hides in plain sight. A broken UI you see by looking at it. So: tests on the arithmetic,
> my eyes on the rest, no E2E.

## 1:30 - 2:30 | What I cut, and the honest bit

> The thing I actually set out to build was notifications. Browser taps you at 10am. Doing
> that for real, tab closed, is a service worker plus Push plus VAPID plus a server running
> the schedule. That's not an hour, that's most of a product. So it computes when you open the
> page instead. Smaller promise, but one the app keeps. More time, that's the first thing I
> build, starting with the scheduler, not the notification.
>
> Also cut: any design pass. No accounts, no sync, no history, no charts. That time went to
> the README and the tests.

## 2:30 - 3:30 | Where AI helped and where I overrode it

Show `medication.ts`, the `dosesTakenToday` bit.

> Claude Code did the whole thing off a plan I approved before a line got written. Fast, and
> the boring parts were basically free.
>
> Here's where it bit me. Tests green, all of them. Then I had a subagent drive the real page
> in a browser, and the run-out date slid backward a day every time I took a pill. The bug was
> `runOutDate = today + daysLeft`: it assumed today's dose was still due, so taking your pill
> looked like losing a day of supply. But you were always going to take today's pill.
>
> The tests passed because they encoded the same wrong assumption as the code. Same
> misunderstanding, written twice, agreeing with itself. That's the failure mode, and it's not
> an AI failure mode, it's mine, AI just does it faster.
>
> Same pass caught the card saying "runs out in 29 days, on Aug 14" on July 15. Two clocks in
> one sentence. Both fixed, both pinned by tests now.

## 3:30 - 4:00 | Close

> Roughly an hour. If you gave me the next one: real scheduled notifications, and I'd have to
> build a backend for it, which changes basically every decision on this list.
>
> The thing I'd want you to take from this is the browser check. Green tests told me it worked.
> Driving it for thirty seconds told me it didn't.

---

## Do not

- Don't apologise for the plainness. It's a decision, say it like one.
- Don't skip the bug. It's the strongest thing in here.
- Don't read this aloud.
