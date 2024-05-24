import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Replicache, WriteTransaction } from 'replicache'
import App from './App.tsx'
import './index.css'
import init, { roll_dice } from "./pkg/dice_roller.js"
export type DiceResult = {
  amount: number;
  sides: number;
};

export type AppProps = {
  rep: Replicache<typeof mutators>;
}
const mutators = {
  roll_dice: async (
    tx: WriteTransaction,
    { amount, sides }: DiceResult
  ) => {
    const diceRoll = roll_dice(sides, amount);
    console.log(diceRoll);
    const result = Array.from(diceRoll);
    console.log(result);
    const prev = (await tx.get<number[][]>("roll_dice")) ?? [];
    const next = [...prev, result];
    await tx.set("roll_dice", next);
    return next;
  },
  reset_rolls: async (tx: WriteTransaction) => {
    await tx.set("roll_dice", []);
  },
}

function Root() {
  const [r, setR] = useState<Replicache<typeof mutators> | null>(null);
  useEffect(() => {
    void init();
    const rep = new Replicache({
      name: "user42",
      licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE,
      mutators
    });
    setR(rep);
    return () => {
      void rep.close();
    }
  }, [])

  return r && <App rep={r} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
