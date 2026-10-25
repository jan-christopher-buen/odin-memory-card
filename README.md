# Pokémon Memory

A responsive React memory game built for [The Odin Project’s Memory Card assignment](https://www.theodinproject.com/lessons/node-path-react-new-memory-card). Pick twelve different Pokémon while keeping track of your choices as the deck shuffles.

[Play the live game](https://odin-memory-card-eta-silk.vercel.app/)

## How to play

- All twelve cards stay face up. Choose a Pokémon you have not selected in the current round.
- Each unique pick adds one point. Every accepted pick shuffles the deck, including the final winning pick.
- A repeated pick resets your score and starts a fresh round immediately. Your best score stays intact.
- Pick all twelve to win. Cards remain locked until you choose **Play again**.
- **Restart round** clears your current selections while preserving your best score.

Scores last for the mounted app session. Refreshing resets both scores. Selected cards are deliberately unmarked: remembering them is the challenge.

## Stack and setup

React function components, JavaScript ES modules, Vite, plain CSS, native Fetch, ESLint with React Hooks checks, and project-local Prettier. No backend, API keys, or environment variables are required.

Use a current supported Node.js release satisfying `>=22.13.0` and npm. Development was verified with Linux Node 24 and npm 11.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To build and inspect the production bundle:

```sh
npm run build
npm run preview
```

The build outputs `dist/` with root-hosted assets. For Vercel, select the Vite framework preset, `npm run build` as the build command, and `dist` as the output directory.

## Code quality

```sh
npm run lint
npm run format:check
npm run format
```

Prettier uses single quotes and no semicolons. The lockfile is committed for reproducible installation. There is no automated application test suite.

## Design

- `src/App.jsx` owns loading status, retry attempts, and one coordinated game-state object. Current score is derived from selected IDs; best score and round phase are stored with the deck.
- `Scoreboard`, `GameStatus`, and `CardGrid` receive data and event handlers through props. `MemoryCard` owns only its artwork-failure state.
- `src/utils/game.js` contains pure round transitions. Event handlers generate candidate shuffled decks before calling functional state updaters, so queued clicks calculate from the latest selections without random side effects inside an updater.
- `src/utils/shuffle.js` implements Fisher–Yates over a copy. Pokémon IDs provide stable React keys as cards move. A shuffle can legitimately return the same order.

### API loading and recovery

`src/services/pokemon-api.js` fetches a fixed roster of twelve IDs from the [PokéAPI v2 Pokémon endpoint](https://pokeapi.co/docs/v2#pokemon) using bounded `Promise.all` requests. Displayed IDs, names, and image URLs come from API responses. Official artwork is preferred; the response’s default sprite is the metadata fallback.

An effect loads the roster on mount or retry because fetching synchronizes the UI with an external service. It checks HTTP responses and validates the fields used by the UI. A module-level memory cache retains successful normalized entries, including successes from a partially failed attempt. Errors and pending requests are not cached. Gameplay and round restarts reuse loaded cards without fetching.

Each effect instance has its own AbortController, a 15-second timeout, and an active guard. Cleanup clears the timer, aborts requests, and blocks stale state updates. StrictMode stays enabled and may start and cancel an extra request cycle during development. Card selection and restart happen in event handlers because they are direct user actions.

Loading and errors replace the deck until all twelve cards are ready. Retry recovers from failed requests; timeout and connectivity errors have useful messages. Failed artwork becomes a local text fallback while the Pokémon name remains available. No static replacement deck is substituted for API failures.

### Accessibility and layout

Cards are native buttons in a list, with readable names, visible keyboard focus, and Enter/Space support. Stable keys preserve card identity during shuffles. Won cards use `aria-disabled` and ignore activation while retaining focus; **Play again** remains reachable by Tab or Shift+Tab. Round messages use a polite live status region.

The layout adapts from two to four columns, reserves artwork space, and wraps long names and messages. It uses system fonts and has no animations. Layouts were reviewed from 320px through desktop widths.

## Limitations and learning

Internet access to PokéAPI and its artwork host is required for a fresh load. The in-memory cache does not survive page refreshes. The roster is intentionally fixed, with no difficulty settings, saved scores, or accounts.

This project practices shared state, derived values, immutable updates, pure functional updaters, effect dependencies and cleanup, parallel API requests, and accessible responsive interfaces.

## Credits

Data is supplied by [PokéAPI](https://pokeapi.co/), following its local-caching guidance. Pokémon names and artwork belong to their respective owners, including Nintendo, Game Freak, and Creatures. API access does not grant an artwork license. This is an unofficial, unaffiliated, noncommercial educational project.
