import Pusher from 'pusher-js'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Replicache, WriteTransaction } from 'replicache'
import { DiceRollResultWithID } from 'shared'
import App from './App'
import './index.css'
import initWasm from "./pkg/dice_roller.js"



export type AppProps = {
  rep: Replicache<typeof mutators>;
}

const mutators = {
  rollDice: async (
    tx: WriteTransaction,
    { id, result, timestamp, user_id }: DiceRollResultWithID
  ) => {

    await tx.set(`roll_dice/${id}`, {
      user_id,
      result,
      timestamp,
    });
  },
  reset_rolls: async (tx: WriteTransaction) => {
    await tx.set("roll_dice", []);
  },
}

async function init() {
  const licenseKey =
    import.meta.env.VITE_REPLICACHE_LICENSE;
  if (!licenseKey) {
    throw new Error('Missing VITE_REPLICACHE_LICENSE');
  }

  function Root() {
    const [r, setR] = useState<Replicache<typeof mutators> | null>(null);
    useEffect(() => {
      void initWasm();
      const rep = new Replicache({
        name: "user42",
        licenseKey,
        mutators,
        pushURL: "/api/replicache/push",
        pullURL: "/api/replicache/pull",
      });
      setR(rep);
      listen(rep);
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
}

function listen(rep: Replicache<typeof mutators>) {
  console.log('listening');
  // Listen for pokes, and pull whenever we get one.
  Pusher.logToConsole = true;
  if (
    !import.meta.env.VITE_PUBLIC_REPLICHAT_PUSHER_KEY ||
    !import.meta.env.VITE_PUBLIC_REPLICHAT_PUSHER_CLUSTER
  ) {
    throw new Error('Missing PUSHER_KEY or PUSHER_CLUSTER in env');
  }
  const pusher = new Pusher(import.meta.env.VITE_PUBLIC_REPLICHAT_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUBLIC_REPLICHAT_PUSHER_CLUSTER,
  });
  const channel = pusher.subscribe('default');
  channel.bind('poke', async () => {
    console.log('got poked');
    await rep.pull();
  });
}

await init();
