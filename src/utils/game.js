export function createRound(cards, best = 0) {
  return {
    cards,
    selectedIds: [],
    best,
    phase: 'playing',
    message: 'Pick a Pokémon to begin. Remember each one you choose!',
  }
}

export function selectCard(previous, id, shuffledCards) {
  if (
    previous.phase !== 'playing' ||
    !previous.cards.some((card) => card.id === id)
  )
    return previous
  if (previous.selectedIds.includes(id)) {
    const name = previous.cards
      .find((card) => card.id === id)
      .name.replaceAll('-', ' ')
    return {
      ...createRound(shuffledCards, previous.best),
      message: `You already chose ${name}! Your score is back to 0. A fresh round is ready.`,
    }
  }
  const selectedIds = [...previous.selectedIds, id]
  const won = selectedIds.length === previous.cards.length
  return {
    ...previous,
    cards: shuffledCards,
    selectedIds,
    best: Math.max(previous.best, selectedIds.length),
    phase: won ? 'won' : 'playing',
    message: won
      ? 'You remembered all 12 Pokémon! Play again for a fresh round.'
      : `${selectedIds.length} of 12 remembered. Choose a Pokémon you haven’t picked yet.`,
  }
}
