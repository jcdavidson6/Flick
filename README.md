# Flix

Flix is a dark, mobile-first movie discovery app built around fast swiping and shared movie nights. Choose your favorite genres, swipe through a randomized catalog, save personal picks, and create a two-person session to discover mutual matches.

## Features

- First-visit welcome screen with a guided onboarding flow
- Multi-select genre preferences
- Randomized Discover batches sourced from 100 movies
- Genre-aware recommendations on the **Your Taste** screen
- Like/dislike tracking with duplicate prevention
- Persistent local watchlist
- Two-person Sessions with shareable room codes
- Shared session swiping and mutual-match results
- Scrollable watchlist and match-results views
- Generic gradient and emoji card artwork instead of movie posters
- Responsive dark mobile-app shell

## Tech stack

- React 19
- TypeScript
- Vite
- Framer Motion
- Lucide React
- Tailwind CSS via `@tailwindcss/vite`
- Browser `localStorage` for local-first persistence

## Getting started

### Requirements

- Node.js 20 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Movie data

The canonical catalog lives in [`movies-100.js`](./movies-100.js). It contains 100 movie records with titles, years, genres, and short descriptions. [`src/lib/catalog.ts`](./src/lib/catalog.ts) normalizes those records into the card model used throughout the app.

The same catalog powers:

- Discover deck generation
- Genre filtering and fallback backfill
- Unseen-movie recommendations
- Watchlist and session lookups

Every new deck uses a Fisher–Yates shuffle and excludes movies already liked or disliked in the current local profile.

## Application state

Flix is intentionally local-first. The following data is stored in the browser’s `localStorage`:

- Selected genres and onboarding progress
- Liked and disliked movie IDs
- Session records and participant progress
- Current session and participant identifiers

Use **Reset all data** from the Profile tab to clear the local profile and return to the welcome screen.

## Optional TMDB integration

The project includes a TMDB integration layer for future/API-backed extensions. If you use that integration, create a local `.env` file from [`.env.example`](./.env.example) and set:

```bash
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

Never commit `.env` or API keys. The current app experience uses the local catalog so discovery remains deterministic, fast, and free of poster-image dependencies.

## Project structure

```text
├── movies-100.js          # Canonical 100-title movie catalog
├── public/                 # Static public assets
├── src/
│   ├── App.tsx             # App screens, state, and interaction flows
│   ├── App.css             # Mobile shell and dark-theme styling
│   ├── index.css           # Global styles and font setup
│   └── lib/
│       ├── catalog.ts      # Catalog normalization, filtering, shuffle, scoring
│       ├── recommendation.ts
│       └── tmdb.ts         # Optional TMDB integration layer
├── .env.example
├── package.json
└── vite.config.ts
```

## Attribution

The app includes a TMDB attribution label in the interface and keeps the optional TMDB integration isolated in `src/lib/tmdb.ts`. Movie discovery in the current build uses the bundled catalog and generic UI artwork rather than movie posters or stills.

## License

This project is for demonstration and portfolio use. Movie titles and descriptions in the bundled catalog are provided as app data; this project does not include movie poster or studio marketing artwork.
