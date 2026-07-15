import { describe, expect, test } from 'vitest'
import { getStatus, takeDose, type Medication } from './medication'

const aymee: Medication = {
  id: '1',
  name: 'Aymee 40mg',
  pillsBought: 30,
  purchaseDate: '2026-07-15',
  dosesPerDay: 1,
  timeOfDay: '10:00',
  dosesTaken: 0,
  lastTakenDate: null,
  dosesTakenToday: 0,
}

describe('getStatus', () => {
  test('a fresh 30-pill box at 1 per day runs out 30 days later', () => {
    expect(getStatus(aymee, '2026-07-15')).toEqual({
      pillsRemaining: 30,
      daysLeft: 30,
      daysUntilRunOut: 30,
      runOutDate: '2026-08-14',
      lowStock: false,
    })
  })

  test('the days figure always agrees with the run-out date', () => {
    // The card renders "runs out in N days, on <date>" as one sentence, so the
    // two must never disagree. They diverge if N is read off daysLeft, which
    // counts doses in hand rather than calendar days.
    const cases: Medication[] = [
      aymee,
      takeDose(aymee, '2026-07-15'),
      { ...aymee, dosesPerDay: 2 },
      takeDose({ ...aymee, dosesPerDay: 2 }, '2026-07-15'),
    ]

    for (const med of cases) {
      const status = getStatus(med, '2026-07-15')
      const [y, m, d] = status.runOutDate.split('-').map(Number)
      const diff = (Date.UTC(y, m - 1, d) - Date.UTC(2026, 6, 15)) / 86_400_000
      expect(status.daysUntilRunOut).toBe(diff)
    }
  })

  test('7 days left is low stock', () => {
    const status = getStatus({ ...aymee, dosesTaken: 23 }, '2026-07-15')
    expect(status.daysLeft).toBe(7)
    expect(status.lowStock).toBe(true)
  })

  test('8 days left is not low stock', () => {
    const status = getStatus({ ...aymee, dosesTaken: 22 }, '2026-07-15')
    expect(status.daysLeft).toBe(8)
    expect(status.lowStock).toBe(false)
  })

  test('an empty box runs out today', () => {
    const status = getStatus({ ...aymee, dosesTaken: 30 }, '2026-07-15')
    expect(status.pillsRemaining).toBe(0)
    expect(status.daysLeft).toBe(0)
    expect(status.runOutDate).toBe('2026-07-15')
  })

  test('a partial final day still counts as a day', () => {
    // 5 pills at 2 per day covers today plus 2 more days, so it runs out on day 3.
    const status = getStatus({ ...aymee, pillsBought: 5, dosesPerDay: 2 }, '2026-07-15')
    expect(status.daysLeft).toBe(3)
    expect(status.runOutDate).toBe('2026-07-18')
  })
})

describe('takeDose', () => {
  // The regression a browser check caught: the run-out date slid backward a day
  // every time a dose was taken, because today's dose was double-counted.
  test('taking today\'s dose does not move the run-out date', () => {
    const before = getStatus(aymee, '2026-07-15')
    const after = getStatus(takeDose(aymee, '2026-07-15'), '2026-07-15')

    expect(before.runOutDate).toBe('2026-08-14')
    expect(after.runOutDate).toBe('2026-08-14')
    expect(after.pillsRemaining).toBe(29)

    // 29 doses in hand, but the box still covers 30 more calendar days: today's
    // dose is already taken, not gone from the calendar.
    expect(after.daysLeft).toBe(29)
    expect(after.daysUntilRunOut).toBe(30)
  })

  test('the run-out date holds steady when tomorrow arrives', () => {
    const taken = takeDose(aymee, '2026-07-15')
    expect(getStatus(taken, '2026-07-16').runOutDate).toBe('2026-08-14')
  })

  test('skipping a day brings the run-out date forward', () => {
    // Doses are not taken on the 16th or 17th, so the same 29 pills now cover
    // the 18th through 15 Aug, pushing run-out two days out from 14 to 16 Aug.
    const taken = takeDose(aymee, '2026-07-15')
    expect(getStatus(taken, '2026-07-18').runOutDate).toBe('2026-08-16')
  })

  test('the per-day counter rolls over at midnight', () => {
    const day1 = takeDose(aymee, '2026-07-15')
    const day2 = takeDose(day1, '2026-07-16')

    expect(day2.dosesTaken).toBe(2)
    expect(day2.dosesTakenToday).toBe(1)
    expect(day2.lastTakenDate).toBe('2026-07-16')
  })

  test('two doses on the same day accumulate', () => {
    const twice = takeDose(takeDose(aymee, '2026-07-15'), '2026-07-15')

    expect(twice.dosesTaken).toBe(2)
    expect(twice.dosesTakenToday).toBe(2)
  })
})
