import { useEffect, useState } from 'react'
import { loadRoster } from './services/pokemon-api.js'
import { shuffle } from './utils/shuffle.js'
import CardGrid from './components/CardGrid.jsx'
import Scoreboard from './components/Scoreboard.jsx'
import GameStatus from './components/GameStatus.jsx'
import { createRound, selectCard } from './utils/game.js'

export default function App() {
  const [attempt, setAttempt] = useState(0)
  const [load, setLoad] = useState({ status: 'loading', error: '' })
  const [game, setGame] = useState(() => createRound([]))

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
          setGame(createRound(shuffle(roster)))
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

  function chooseCard(id) {
    if (load.status !== 'ready' || game.phase !== 'playing') return
    const shuffledCards = shuffle(game.cards)
    setGame((previous) => selectCard(previous, id, shuffledCards))
  }

  function restartRound() {
    if (load.status !== 'ready') return
    const shuffledCards = shuffle(game.cards)
    setGame((previous) => createRound(shuffledCards, previous.best))
  }

  return (
    <main>
      <h1>Pokémon Memory</h1>
      <p>Choose each Pokémon once. The cards shuffle after every pick.</p>
      <Scoreboard score={game.selectedIds.length} best={game.best} />
      <div role="status" aria-live="polite">
        {load.status === 'loading' && <p>Gathering your Pokémon…</p>}
        {load.status === 'error' && (
          <>
            <p>{load.error}</p>
            <button onClick={retry}>Retry</button>
          </>
        )}
      </div>
      {load.status === 'ready' && (
        <>
          <GameStatus
            message={game.message}
            won={game.phase === 'won'}
            onRestart={restartRound}
          />
          <CardGrid
            cards={game.cards}
            onSelect={chooseCard}
            locked={game.phase === 'won'}
          />
        </>
      )}
    </main>
  )
}
