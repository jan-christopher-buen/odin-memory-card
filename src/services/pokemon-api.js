export const ROSTER_IDS = [1, 4, 7, 25, 39, 52, 54, 58, 94, 133, 143, 149]
const cache = new Map()

async function loadPokemon(id, signal) {
  if (cache.has(id)) return cache.get(id)

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`, {
    signal,
  })
  if (!response.ok)
    throw new Error(
      `PokéAPI returned HTTP ${response.status}. Please try again.`,
    )

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('PokéAPI sent unreadable data. Please try again.')
  }
  const imageUrl =
    data?.sprites?.other?.['official-artwork']?.front_default ||
    data?.sprites?.front_default
  if (
    data?.id !== id ||
    typeof data?.name !== 'string' ||
    !data.name.trim() ||
    typeof imageUrl !== 'string' ||
    !URL.canParse(imageUrl) ||
    !['https:', 'http:'].includes(new URL(imageUrl).protocol)
  ) {
    throw new Error(
      'A Pokémon is missing its name or artwork. Please try again.',
    )
  }
  signal.throwIfAborted()
  const card = { id: data.id, name: data.name, imageUrl }
  cache.set(id, card)
  return card
}

export function loadRoster(signal) {
  return Promise.all(ROSTER_IDS.map((id) => loadPokemon(id, signal)))
}
