import { getStatus, type Medication } from '../domain/medication'

type Props = {
  medications: Medication[]
  today: string
  onTakeDose: (id: string) => void
  onRemove: (id: string) => void
}

// The locale is pinned rather than left to the browser: every other string here is
// hardcoded English, and `undefined` renders "14 de ago. de 2026" next to "Runs out
// in 30 days" on a pt-BR browser. One sentence, one language.
function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function MedicationList({ medications, today, onTakeDose, onRemove }: Props) {
  if (medications.length === 0) {
    return <p className="empty">Nothing tracked yet. Add the first medication above.</p>
  }

  return (
    <ul className="list">
      {medications.map((medication) => {
        const status = getStatus(medication, today)
        const empty = status.pillsRemaining === 0

        return (
          <li key={medication.id} className={status.lowStock ? 'card low' : 'card'}>
            <div className="card-head">
              <h2>{medication.name}</h2>
              <button
                type="button"
                className="remove"
                onClick={() => onRemove(medication.id)}
                aria-label={`Remove ${medication.name}`}
              >
                &times;
              </button>
            </div>

            <p className="meta">
              {medication.dosesPerDay}x per day at {medication.timeOfDay} &middot; bought{' '}
              {formatDate(medication.purchaseDate)}
            </p>

            <progress value={status.pillsRemaining} max={medication.pillsBought} />

            <p className="count">
              {status.pillsRemaining} of {medication.pillsBought} pills left
            </p>

            <p className={status.lowStock ? 'runout warn' : 'runout'}>
              {empty
                ? 'Out of pills'
                : `Runs out in ${status.daysUntilRunOut} days, on ${formatDate(status.runOutDate)}`}
            </p>

            <button type="button" onClick={() => onTakeDose(medication.id)} disabled={empty}>
              Take one now
            </button>
          </li>
        )
      })}
    </ul>
  )
}
