declare module '../../movies-100.js' {
  export type MovieSourceEntry = {
    t: string
    y: number
    g: string[]
    b: string
  }

  export const MOVIES: MovieSourceEntry[]
}