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
      <header className="masthead">
        <div>
          <p className="eyebrow">A little focus. A little adventure.</p>
          <h1>
            Pokémon <span>Memory</span>
          </h1>
          <p className="instructions">
            Twelve familiar faces. Choose each Pokémon only once — the cards
            shuffle after every pick. How many can you remember?
          </p>
        </div>
        <Scoreboard score={game.selectedIds.length} best={game.best} />
      </header>
      <div className="load-status" role="status" aria-live="polite">
        {load.status === 'loading' && <p>Gathering your Pokémon…</p>}
        {load.status === 'error' && (
          <>
            <p>{load.error}</p>
            <button className="action" onClick={retry}>
              Retry
            </button>
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
      <footer>
        <p>
          Made for{' '}
          <a href="https://www.theodinproject.com/lessons/node-path-react-new-memory-card">
            The Odin Project
          </a>{' '}
          · Data from <a href="https://pokeapi.co/">PokéAPI</a>
        </p>
        <p>
          A noncommercial learning project. Pokémon names and artwork belong to
          their respective owners, including Nintendo, Game Freak, and
          Creatures. Unofficial and unaffiliated.
        </p>
      </footer>
    </main>
  )
}
