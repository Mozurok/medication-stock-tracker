import { useState } from 'react'
import type { Medication } from '../domain/medication'

type Props = {
  onAdd: (medication: Medication) => void
  today: string
}

export function MedicationForm({ onAdd, today }: Props) {
  const [name, setName] = useState('')
  const [pillsBought, setPillsBought] = useState('30')
  const [purchaseDate, setPurchaseDate] = useState(today)
  const [dosesPerDay, setDosesPerDay] = useState('1')
  const [timeOfDay, setTimeOfDay] = useState('10:00')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      pillsBought: Number(pillsBought),
      purchaseDate,
      dosesPerDay: Number(dosesPerDay),
      timeOfDay,
      dosesTaken: 0,
      lastTakenDate: null,
      dosesTakenToday: 0,
    })

    setName('')
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Medication
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aymee 40mg"
          required
        />
      </label>

      <div className="form-row">
        <label>
          Pills
          <input
            type="number"
            min="1"
            value={pillsBought}
            onChange={(e) => setPillsBought(e.target.value)}
            required
          />
        </label>

        <label>
          Per day
          <input
            type="number"
            min="1"
            value={dosesPerDay}
            onChange={(e) => setDosesPerDay(e.target.value)}
            required
          />
        </label>

        <label>
          Time
          <input
            type="time"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            required
          />
        </label>
      </div>

      <label>
        Bought on
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          required
        />
      </label>

      <button type="submit">Add medication</button>
    </form>
  )
}
