import type { Medication } from './domain/medication'

const KEY = 'medications'

export function loadMedications(): Medication[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Medication[]) : []
  } catch {
    // Bad data should cost the user their list, not the whole app.
    return []
  }
}

export function saveMedications(medications: Medication[]): void {
  localStorage.setItem(KEY, JSON.stringify(medications))
}
