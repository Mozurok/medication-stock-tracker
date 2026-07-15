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
}

export type MedicationStatus = {
  pillsRemaining: number
  daysLeft: number
  /** ISO date, YYYY-MM-DD. The first day with no dose available. */
  runOutDate: string
  lowStock: boolean
}

export const LOW_STOCK_DAYS = 7

// All date maths runs in UTC on whole days. Local time would make the result
// depend on the viewer's timezone and shift by one across a DST boundary.
function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d + days)
  return new Date(t).toISOString().slice(0, 10)
}

export function getStatus(med: Medication, today: string): MedicationStatus {
  const pillsRemaining = Math.max(0, med.pillsBought - med.dosesTaken)
  const daysLeft = Math.ceil(pillsRemaining / med.dosesPerDay)

  return {
    pillsRemaining,
    daysLeft,
    runOutDate: addDays(today, daysLeft),
    lowStock: daysLeft <= LOW_STOCK_DAYS,
  }
}
