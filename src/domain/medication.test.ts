import { describe, expect, test } from 'vitest'
import { getStatus, type Medication } from './medication'

const aymee: Medication = {
  id: '1',
  name: 'Aymee 40mg',
  pillsBought: 30,
  purchaseDate: '2026-07-15',
  dosesPerDay: 1,
  timeOfDay: '10:00',
  dosesTaken: 0,
}

describe('getStatus', () => {
  test('a fresh 30-pill box at 1 per day runs out 30 days later', () => {
    expect(getStatus(aymee, '2026-07-15')).toEqual({
      pillsRemaining: 30,
      daysLeft: 30,
      runOutDate: '2026-08-14',
      lowStock: false,
    })
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
    // 5 pills at 2 per day is 2.5 days of supply, which is 3 days of cover.
    const status = getStatus({ ...aymee, pillsBought: 5, dosesPerDay: 2 }, '2026-07-15')
    expect(status.daysLeft).toBe(3)
  })
})
