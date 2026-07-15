import { useEffect, useState } from 'react'
import { MedicationForm } from './components/MedicationForm'
import { MedicationList } from './components/MedicationList'
import { takeDose, type Medication } from './domain/medication'
import { loadMedications, saveMedications } from './storage'
import './App.css'

// UTC, to match the domain module's whole-day maths.
const today = new Date().toISOString().slice(0, 10)

function App() {
  const [medications, setMedications] = useState<Medication[]>(loadMedications)

  useEffect(() => {
    saveMedications(medications)
  }, [medications])

  function addMedication(medication: Medication) {
    setMedications((current) => [...current, medication])
  }

  function handleTakeDose(id: string) {
    setMedications((current) =>
      current.map((medication) =>
        medication.id === id ? takeDose(medication, today) : medication,
      ),
    )
  }

  function removeMedication(id: string) {
    setMedications((current) => current.filter((medication) => medication.id !== id))
  }

  return (
    <main>
      <header>
        <h1>Medication stock</h1>
        <p className="lede">
          Know a box is running out before it actually does. This page does not remind you to
          take anything: it works the numbers out each time you open it, and they stay in this
          browser.
        </p>
      </header>

      <MedicationForm onAdd={addMedication} today={today} />

      <MedicationList
        medications={medications}
        today={today}
        onTakeDose={handleTakeDose}
        onRemove={removeMedication}
      />
    </main>
  )
}

export default App
