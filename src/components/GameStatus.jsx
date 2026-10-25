export default function GameStatus({ message, won, onRestart }) {
  return (
    <section
      className={`game-status${won ? ' won' : ''}`}
      aria-label="Round status"
    >
      <p role="status" aria-live="polite" aria-atomic="true">
        {message}
      </p>
      <button className="action" onClick={onRestart}>
        {won ? 'Play again' : 'Restart round'}
      </button>
    </section>
  )
}
