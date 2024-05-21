import { useEffect, useState } from 'react'
import './App.css'
import init, { roll_dice } from './pkg/dice_roller.js'

function App() {
  const [results, setResult] = useState<Uint32Array[]>([])

  useEffect(() => {
    init()
  }, [])

  function rollDice(sides: number, amount: number) {
    const result = roll_dice(sides, amount)
    setResult(state => [...state, result])
  }
  return (
    <>
      <h1>Terningkast</h1>
      <form onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const sides = formData.get('sides')
        const amount = formData.get('amount')
        if (Number.isNaN(sides) || (Number(sides) < 4 || Number(sides) > 20)) {
          alert('Sider måste vara mellan 4 och 20.')
          return
        }
        if (Number.isNaN(amount) || Number(amount) < 1) {
          alert('Antalet terningar måste vara ett positivt tal.')
          return
        }
        rollDice(Number(sides ?? 6), Number(amount ?? 1))
      }}>
        <label>
          Antal sidor:
          <input type="number" name="sides" min="4" max="20" step="1" defaultValue="6" />
        </label>
        <label>
          Antal terningar:
          <input type="number" name="amount" min="1" step="1" defaultValue="1" />
        </label>
        <button type="submit">Kast</button>
        <button type='button' onClick={() => setResult([])}>Rensa</button>
      </form>
      <ul>
        {results.map((result, index) => (
          <li key={index}>{result.join(", ")}</li>
        ))}
      </ul>
    </>
  )
}

export default App
