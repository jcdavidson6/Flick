export type GenreOption = {
  id: number
  label: string
  backdrop: string
}

export type MovieRecord = {
  id: number
  title: string
  vote_average: number
  overview: string
  release_date: string
  poster_path: string
  backdrop_path: string
  genre_ids: number[]
}

export const genreOptions: GenreOption[] = [
  { id: 878, label: 'Sci-Fi', backdrop: 'https://image.tmdb.org/t/p/original/nR0G4p70lQJ7IQ2AcHBhA9m1zJf.jpg' },
  { id: 28, label: 'Action', backdrop: 'https://image.tmdb.org/t/p/original/8s4h9friP6Ci3adRGahHARVd76E.jpg' },
  { id: 27, label: 'Horror', backdrop: 'https://image.tmdb.org/t/p/original/8b2K8wE0E5nW7hOQfuz4WKpXSB6.jpg' },
  { id: 35, label: 'Comedy', backdrop: 'https://image.tmdb.org/t/p/original/9O4YOU3x74pHhYab4g3f6Q9A4Qk.jpg' },
  { id: 18, label: 'Drama', backdrop: 'https://image.tmdb.org/t/p/original/jP1nm5H6TBA8H5xl8SgIw6M0Qw0.jpg' },
  { id: 10749, label: 'Romance', backdrop: 'https://image.tmdb.org/t/p/original/4MCKNAc6AbWjEsM2h9Xc3o0i2vT.jpg' },
  { id: 99, label: 'Indie', backdrop: 'https://image.tmdb.org/t/p/original/4j9Y9d4oO3LrWeXwDA0M3VQb7y.jpg' },
  { id: 53, label: 'Thriller', backdrop: 'https://image.tmdb.org/t/p/original/6RZguOBiRZgN7bTNCzA9T3QIt3o.jpg' },
]

export const genreMap = Object.fromEntries(genreOptions.map((genre) => [genre.label, genre.id]))

export const imageUrl = (path: string | null | undefined, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/500x750/1c1a22/ffffff?text=Movie'

const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY

export async function fetchMoviePool(selectedGenres: string[], count = 12): Promise<MovieRecord[]> {
  if (!tmdbApiKey) {
    return []
  }

  const genreIds = selectedGenres
    .map((genre) => genreMap[genre])
    .filter(Boolean)
    .join('|')

  const url = new URL('https://api.themoviedb.org/3/discover/movie')
  url.searchParams.set('api_key', tmdbApiKey)
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('sort_by', 'popularity.desc')
  url.searchParams.set('page', '1')
  if (genreIds) {
    url.searchParams.set('with_genres', genreIds)
  }

  const response = await fetch(url)
  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as { results?: Array<Record<string, unknown>> }
  const results = Array.isArray(data.results) ? data.results : []
  return results
    .slice(0, count)
    .map((movie) => {
      const typedMovie = movie as {
        id?: number
        title?: string
        vote_average?: number
        overview?: string
        release_date?: string
        poster_path?: string
        backdrop_path?: string
        genre_ids?: number[]
      }

      return {
        id: typedMovie.id ?? 0,
        title: typedMovie.title ?? 'Untitled Movie',
        vote_average: typedMovie.vote_average ?? 0,
        overview: typedMovie.overview ?? 'A cinematic pick for your watchlist.',
        release_date: typedMovie.release_date ?? '2024-01-01',
        poster_path: typedMovie.poster_path ?? '',
        backdrop_path: typedMovie.backdrop_path ?? '',
        genre_ids: typedMovie.genre_ids ?? [],
      }
    })
}
