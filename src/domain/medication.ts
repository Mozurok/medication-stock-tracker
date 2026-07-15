export type Medication = {
  id: string
  /** Display name including dose, e.g. "Aymee 40mg". */
  name: string
  pillsBought: number
  /** ISO date, YYYY-MM-DD. */
  purchaseDate: string
  dosesPerDay: number
  /** HH:MM, 24h. Shown to the user; not used in the stock maths. */
  timeOfDay: string
  dosesTaken: number
  /** ISO date of the most recent dose, or null if none taken yet. */
  lastTakenDate: string | null
  /** Doses taken on `lastTakenDate`. Meaningless on any other day. */
  dosesTakenToday: number
}

export type MedicationStatus = {
  pillsRemaining: number
  /** Days of cover remaining, counting today when a dose is still due today. */
  daysLeft: number
  /**
   * Calendar days from today until `runOutDate`. One more than `daysLeft` once
   * today's dose is taken, because today is already covered. Use this for "runs
   * out in N days" copy so the number and the date agree; use `daysLeft` for the
   * low-stock warning, which is about doses in hand.
   */
  daysUntilRunOut: number
  /** ISO date, YYYY-MM-DD. The first day with no dose available. */
  runOutDate: string
  lowStock: boolean
}

export const LOW_STOCK_DAYS = 7

// All date maths runs in UTC on whole days. Local time would make the result
// depend on the viewer's timezone and shift by one across a DST boundary.
function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

export function getStatus(med: Medication, today: string): MedicationStatus {
  const pillsRemaining = Math.max(0, med.pillsBought - med.dosesTaken)

  if (pillsRemaining === 0) {
    return {
      pillsRemaining: 0,
      daysLeft: 0,
      daysUntilRunOut: 0,
      runOutDate: today,
      lowStock: true,
    }
  }

  // Today's doses are already accounted for, so taking one must not move the
  // run-out date: you were always going to take today's dose. Only the doses
  // still due today can shorten the remaining calendar.
  const takenToday = med.lastTakenDate === today ? med.dosesTakenToday : 0
  const dosesStillDueToday = Math.max(0, med.dosesPerDay - takenToday)

  const pillsAfterToday = Math.max(0, pillsRemaining - dosesStillDueToday)
  const daysAfterToday = Math.ceil(pillsAfterToday / med.dosesPerDay)

  const daysLeft = (dosesStillDueToday > 0 ? 1 : 0) + daysAfterToday
  const daysUntilRunOut = 1 + daysAfterToday

  return {
    pillsRemaining,
    daysLeft,
    daysUntilRunOut,
    runOutDate: addDays(today, daysUntilRunOut),
    lowStock: daysLeft <= LOW_STOCK_DAYS,
  }
}

/** Records one dose taken on `today`, rolling the per-day counter over midnight. */
export function takeDose(med: Medication, today: string): Medication {
  const startsNewDay = med.lastTakenDate !== today

  return {
    ...med,
    dosesTaken: med.dosesTaken + 1,
    lastTakenDate: today,
    dosesTakenToday: startsNewDay ? 1 : med.dosesTakenToday + 1,
  }
}
