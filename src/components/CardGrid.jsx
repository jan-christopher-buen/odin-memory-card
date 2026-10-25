import MemoryCard from './MemoryCard.jsx'

export default function CardGrid({ cards, onSelect, locked = true }) {
  return (
    <ul className="card-grid" aria-label="Pokémon cards">
      {cards.map((card) => (
        <MemoryCard
          key={card.id}
          card={card}
          onSelect={onSelect}
          locked={locked}
        />
      ))}
    </ul>
  )
}
