export type GenreIdMap = Record<string, number>

export type ScoredMovie = {
  score: number
  reasons: string[]
}

export const genreIdMap: GenreIdMap = {
  'Sci-Fi': 878,
  Action: 28,
  Horror: 27,
  Comedy: 35,
  Drama: 18,
  Romance: 10749,
  Indie: 99,
  Thriller: 53,
}

export function scoreMovieForPreferences(
  movie: { genre_ids?: number[]; vote_average?: number; title?: string },
  selectedGenres: string[],
  likedGenres: string[] = [],
  dislikedGenres: string[] = [],
): ScoredMovie {
  let score = 0
  const reasons: string[] = []

  const selectedSet = new Set(selectedGenres)
  const likedSet = new Set(likedGenres)

  const genreIds = movie.genre_ids ?? []
  for (const genre of selectedGenres) {
    const genreId = genreIdMap[genre]
    if (genreId && genreIds.includes(genreId)) {
      score += 1.4
      reasons.push(`${genre} matches your taste`)
    }
  }

  for (const genre of likedGenres) {
    const genreId = genreIdMap[genre]
    if (genreId && genreIds.includes(genreId)) {
      score += 0.8
      reasons.push(`${genre} is a favorite`)
    }
  }

  for (const genre of dislikedGenres) {
    const genreId = genreIdMap[genre]
    if (genreId && genreIds.includes(genreId)) {
      score -= 0.7
      reasons.push(`${genre} is down-weighted`)
    }
  }

  if (movie.vote_average) {
    score += movie.vote_average / 11
  }

  if (selectedSet.size > 0 && reasons.length === 0) {
    score += 0.25
    reasons.push('Broad appeal fits your discovery mix')
  }

  if (movie.title && likedSet.size > 0 && movie.title.toLowerCase().includes('love')) {
    score += 0.2
    reasons.push('Romance-forward energy')
  }

  return {
    score: Number(score.toFixed(2)),
    reasons: reasons.slice(0, 3),
  }
}
