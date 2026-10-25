import { useEffect, useState } from 'react'
import { loadRoster } from './services/pokemon-api.js'
import { shuffle } from './utils/shuffle.js'
import CardGrid from './components/CardGrid.jsx'

export default function App() {
  const [attempt, setAttempt] = useState(0)
  const [load, setLoad] = useState({ status: 'loading', error: '' })
  const [cards, setCards] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 15000)

    async function start() {
      try {
        const roster = await loadRoster(controller.signal)
        if (active) {
          setCards(shuffle(roster))
          setLoad({ status: 'ready', error: '' })
        }
      } catch (error) {
        if (active && (timedOut || !controller.signal.aborted)) {
          setLoad({
            status: 'error',
            error: timedOut
              ? 'Loading took too long. Check your connection and try again.'
              : error.message === 'Failed to fetch'
                ? 'Could not reach PokéAPI. Check your connection and try again.'
                : error.message,
          })
          controller.abort()
        }
      } finally {
        clearTimeout(timer)
      }
    }
    start()
    return () => {
      active = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [attempt])

  function retry() {
    if (load.status !== 'error') return
    setLoad({ status: 'loading', error: '' })
    setAttempt((previous) => previous + 1)
  }

  return (
    <main>
      <h1>Pokémon Memory</h1>
      <p>Choose each Pokémon once. The cards shuffle after every pick.</p>
      <div role="status" aria-live="polite">
        {load.status === 'loading' && <p>Gathering your Pokémon…</p>}
        {load.status === 'error' && (
          <>
            <p>{load.error}</p>
            <button onClick={retry}>Retry</button>
          </>
        )}
      </div>
      {load.status === 'ready' && <CardGrid cards={cards} />}
    </main>
  )
}
