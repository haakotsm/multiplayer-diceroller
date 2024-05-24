import { nanoid } from 'nanoid';
import { useSubscribe } from 'replicache-react';
import { DiceRollResult } from 'shared';
import './App.css';
import { AppProps } from './main.js';
import { roll_dice } from './pkg/dice_roller';

function App({ rep }: AppProps) {

  const results = useSubscribe(rep, async (tx) => {
    const list = await tx.scan<DiceRollResult>({ prefix: "roll_dice" }).entries().toArray();
    list.sort(([, a], [, b]) => a.timestamp.localeCompare(b.timestamp));
    console.log(list);
    return list;
  }, { default: [] })
  function rollDice(user_id: string, sides: number, amount: number) {
    const diceRoll = roll_dice(sides, amount);
    const result = Array.from(diceRoll);
    const id = nanoid();
    void rep.mutate.rollDice({ id, result, timestamp: new Date().toISOString(), user_id });
  }
  console.log(results)
  return (
    <div className='flex flex-col gap-4  bg-white text-black p-4 rounded-sm shadow-md'>
      <h1>Terningkast</h1>
      <div className='flex gap-10'>

        <form className="flex flex-col gap-4" onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const user_id = formData.get('user_id')
          const sides = formData.get('sides')
          const amount = formData.get('amount')
          if (!user_id) {
            alert("Brukernavn må oppgis");
            return;
          }
          console.log(sides);
          if (Number.isNaN(sides) || (Number(sides) < 4 || Number(sides) > 20)) {
            alert('Sider måste vara mellan 4 och 20.')
            return
          }
          if (Number.isNaN(amount) || Number(amount) < 1) {
            alert('Antalet terningar måste vara ett positivt tal.')
            return
          }
          rollDice(user_id.toString(), Number(sides ?? 6), Number(amount ?? 1))
        }}>
          <label className='flex flex-col items-start'>
            Brukernavn
            <input type="text" name="user_id" className='w-full p-1 bg-yellow-50 border-gray-300 border-2 rounded-md' />
          </label>
          <label className='flex flex-col items-start'>
            Antall sider:
            <input defaultValue="6" name='sides' className='w-full p-1 bg-yellow-50 border-gray-300 border-2 rounded-md' />
          </label>
          <label className='flex flex-col items-start'>
            Antall terninger:
            <input defaultValue="1" name="amount" className='w-full p-1 bg-yellow-50 border-gray-300 border-2 rounded-md' />
          </label>
          <div className='flex justify-end'>
            {/* <button type='button' className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded' onClick={() => rep.mutate.reset_rolls()}>Reset</button> */}
            <button type="submit" className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Kast</button>
          </div>
        </form>
        <ul className=''>
          {results.map(([, result], index) => (
            <li key={index} className='flex flex-col gap-1 border-b-2 border-gray-700 m-2 justify-start items-start'>
              <div className='flex gap-2 justify-between w-full'>
                <span>Bruker: {result.user_id}</span>
                <span>Dato: {new Date(result.timestamp).toLocaleString()}</span>
              </div>
              <span>Resultat: [ {result.result.join(' | ')} ]</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
