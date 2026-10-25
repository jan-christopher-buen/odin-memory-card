import { useState } from 'react'

export default function MemoryCard({ card, onSelect, locked }) {
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <li>
      <button
        className="memory-card"
        aria-disabled={locked || undefined}
        onClick={() => onSelect?.(card.id)}
      >
        <span className="artwork">
          {imageFailed ? (
            <span className="image-fallback">Artwork unavailable</span>
          ) : (
            <img
              src={card.imageUrl}
              alt=""
              width="200"
              height="200"
              onError={() => setImageFailed(true)}
            />
          )}
        </span>
        <span className="card-name">{card.name.replaceAll('-', ' ')}</span>
      </button>
    </li>
  )
}
