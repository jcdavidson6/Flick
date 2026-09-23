import { MOVIES } from '../../movies-100.js'

export type GenreName = 'Sci-Fi' | 'Action' | 'Horror' | 'Comedy' | 'Drama' | 'Romance' | 'Indie' | 'Thriller'

export type CatalogMovie = {
  id: string
  title: string
  year: number
  genres: GenreName[]
  description: string
  emoji: string
  gradient: string
}

const normalisedGenres: Record<string, GenreName> = {
  'Sci-Fi': 'Sci-Fi',
  Action: 'Action',
  Horror: 'Horror',
  Comedy: 'Comedy',
  Drama: 'Drama',
  Romance: 'Romance',
  Indie: 'Indie',
  Thriller: 'Thriller',
  Fantasy: 'Drama',
  Mystery: 'Thriller',
  Animation: 'Comedy',
}

export const genreMoodImages: Record<GenreName, string> = {
  'Sci-Fi': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  Action: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  Horror: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
  Comedy: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
  Drama: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
  Romance: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  Indie: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
  Thriller: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=900&q=80',
}

const gradientByGenre: Record<GenreName, string> = {
  'Sci-Fi': 'linear-gradient(135deg, #1d2238, #7c3aed)',
  Action: 'linear-gradient(135deg, #3d0f1f, #f97316)',
  Horror: 'linear-gradient(135deg, #090d14, #3b82f6)',
  Comedy: 'linear-gradient(135deg, #3a2416, #f59e0b)',
  Drama: 'linear-gradient(135deg, #102031, #22c55e)',
  Romance: 'linear-gradient(135deg, #2a1b27, #f472b6)',
  Indie: 'linear-gradient(135deg, #1f2937, #a78bfa)',
  Thriller: 'linear-gradient(135deg, #111827, #ef4444)',
}

const emojiByGenre: Record<GenreName, string> = {
  'Sci-Fi': '🚀',
  Action: '🔥',
  Horror: '🕷️',
  Comedy: '😂',
  Drama: '🎭',
  Romance: '💖',
  Indie: '🎧',
  Thriller: '📡',
}

const toId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const normalizeGenre = (value: string): GenreName => normalisedGenres[value] ?? 'Drama'

const unique = <T,>(items: T[]) => Array.from(new Set(items))

const shuffle = <T,>(items: T[]) => {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

type MovieSourceEntry = {
  t: string
  y: number
  g: string[]
  b: string
}

export const movieCatalog: CatalogMovie[] = (MOVIES as MovieSourceEntry[]).map((entry: MovieSourceEntry, index: number) => {
  const genres = unique(entry.g.map(normalizeGenre))
  const primaryGenre = genres[0] ?? 'Drama'

  return {
    id: `${toId(entry.t)}-${entry.y || index}`,
    title: entry.t,
    year: entry.y,
    genres,
    description: entry.b,
    emoji: emojiByGenre[primaryGenre as GenreName] ?? '🎬',
    gradient: gradientByGenre[primaryGenre as GenreName] ?? 'linear-gradient(135deg, #0f172a, #f97316)',
  }
})

export const genrePriority: GenreName[] = ['Sci-Fi', 'Action', 'Horror', 'Comedy', 'Drama', 'Romance', 'Indie', 'Thriller']

export const buildDeck = (selectedGenres: string[], count = 12, excludedIds: string[] = []): CatalogMovie[] => {
  const excluded = new Set(excludedIds)
  const unseen = movieCatalog.filter((movie) => !excluded.has(movie.id))
  const filteredPool = selectedGenres.length
    ? unseen.filter((movie) => movie.genres.some((genre) => selectedGenres.includes(genre)))
    : unseen

  // Keep the selected-genre pool primary. Only backfill with unseen movies when it cannot fill a batch.
  const fallbackPool = filteredPool.length < count && selectedGenres.length
    ? unseen.filter((movie) => !filteredPool.some((entry) => entry.id === movie.id))
    : []
  const candidatePool = shuffle([...filteredPool, ...fallbackPool])
  const deck = candidatePool.slice(0, count)

  console.debug('[Reelmatch] new deck', {
    filteredPoolSize: filteredPool.length,
    excludedCount: excluded.size,
    titles: deck.map((movie) => movie.title),
  })

  return deck
}

export const getAffinityScore = (movie: CatalogMovie, selectedGenres: string[], likedMovies: CatalogMovie[], dislikedIds: string[]) => {
  let score = 0
  const likedSet = new Set(likedMovies.map((item) => item.id))
  const dislikedSet = new Set(dislikedIds)

  for (const genre of movie.genres) {
    if (selectedGenres.includes(genre)) score += 1
    if (likedSet.has(movie.id)) score += 1
    if (dislikedSet.has(movie.id)) score -= 0.5
  }

  return score
}

export const getRecommendedTitles = (
  unseen: CatalogMovie[],
  selectedGenres: string[],
  likedMovies: CatalogMovie[],
  dislikedIds: string[],
  count = 5,
) => {
  const selectedPool = selectedGenres.length
    ? unseen.filter((movie) => movie.genres.some((genre) => selectedGenres.includes(genre)))
    : unseen
  const recommendationPool = selectedPool.length ? selectedPool : unseen

  return shuffle(recommendationPool)
    .map((movie) => ({
      ...movie,
      score: getAffinityScore(movie, selectedGenres, likedMovies, dislikedIds),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}
