import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, Check, Heart, Info, Sparkles, Star, UserRound, Users, X } from 'lucide-react'
import './App.css'
import {
  buildDeck,
  genreMoodImages,
  genrePriority,
  getRecommendedTitles,
  movieCatalog,
  type CatalogMovie,
} from './lib/catalog'

type Tab = 'discover' | 'watchlist' | 'sessions' | 'profile'
type WatchlistTab = 'solo' | 'mutual'
type SessionScreen = 'home' | 'swipe' | 'waiting' | 'results'

type SessionParticipant = {
  id: string
  name: string
  likes: string[]
  dislikes: string[]
  done: boolean
  deckIndex: number
}

type SessionRecord = {
  code: string
  deck: CatalogMovie[]
  participants: Record<string, SessionParticipant>
}

const GENRES = [...genrePriority] as const

const storageKeys = {
  hasStarted: 'reelmatch:hasStarted',
  selectedGenres: 'reelmatch:selectedGenres',
  onboardingComplete: 'reelmatch:onboardingComplete',
  likedMovies: 'reelmatch:likedMovies',
  dislikedIds: 'reelmatch:dislikedIds',
  sessions: 'reelmatch:sessions',
  currentSession: 'reelmatch:currentSession',
  currentParticipant: 'reelmatch:currentParticipant',
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(() => getStored(storageKeys.hasStarted, false))
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => getStored(storageKeys.selectedGenres, []))
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => getStored(storageKeys.onboardingComplete, false))
  const [activeTab, setActiveTab] = useState<Tab>('discover')
  const [watchlistTab, setWatchlistTab] = useState<WatchlistTab>('solo')
  const [deck, setDeck] = useState<CatalogMovie[]>(() => buildDeck(
    getStored(storageKeys.selectedGenres, []),
    12,
    [...getStored<CatalogMovie[]>(storageKeys.likedMovies, []), ...getStored<string[]>(storageKeys.dislikedIds, [])].map((item) => typeof item === 'string' ? item : item.id),
  ))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [tasteScreen, setTasteScreen] = useState(false)
  const [swipesInBatch, setSwipesInBatch] = useState(0)
  const [likedMovies, setLikedMovies] = useState<CatalogMovie[]>(() => getStored(storageKeys.likedMovies, []))
  const [dislikedIds, setDislikedIds] = useState<string[]>(() => getStored(storageKeys.dislikedIds, []))
  const [sessionInputName, setSessionInputName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')
  const [sessionScreen, setSessionScreen] = useState<SessionScreen>('home')
  const [currentSessionCode, setCurrentSessionCode] = useState<string | null>(() => getStored(storageKeys.currentSession, null))
  const [currentParticipantId, setCurrentParticipantId] = useState<string>(() => getStored(storageKeys.currentParticipant, 'guest'))
  const [sessions, setSessions] = useState<Record<string, SessionRecord>>(() => getStored(storageKeys.sessions, {}))

  useEffect(() => {
    localStorage.setItem(storageKeys.hasStarted, JSON.stringify(hasStarted))
  }, [hasStarted])

  useEffect(() => {
    localStorage.setItem(storageKeys.selectedGenres, JSON.stringify(selectedGenres))
  }, [selectedGenres])

  useEffect(() => {
    localStorage.setItem(storageKeys.onboardingComplete, JSON.stringify(onboardingComplete))
  }, [onboardingComplete])

  useEffect(() => {
    localStorage.setItem(storageKeys.likedMovies, JSON.stringify(likedMovies))
  }, [likedMovies])

  useEffect(() => {
    localStorage.setItem(storageKeys.dislikedIds, JSON.stringify(dislikedIds))
  }, [dislikedIds])

  useEffect(() => {
    localStorage.setItem(storageKeys.sessions, JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    if (currentSessionCode) localStorage.setItem(storageKeys.currentSession, JSON.stringify(currentSessionCode))
    else localStorage.removeItem(storageKeys.currentSession)
  }, [currentSessionCode])

  useEffect(() => {
    localStorage.setItem(storageKeys.currentParticipant, JSON.stringify(currentParticipantId))
  }, [currentParticipantId])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKeys.sessions) {
        setSessions(getStored(storageKeys.sessions, {}))
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    const nextDeck = buildDeck(selectedGenres, 12, [...likedMovies.map((movie) => movie.id), ...dislikedIds])
    setDeck(nextDeck)
    setCurrentIndex(0)
    setShowInfo(false)
    setSwipesInBatch(0)
  }, [selectedGenres])

  const currentMovie = deck[currentIndex] ?? movieCatalog[0]

  const affinityByGenre = useMemo(() => {
    const result: Record<string, number> = Object.fromEntries(GENRES.map((genre) => [genre, 0]))

    likedMovies.forEach((movie) => {
      movie.genres.forEach((genre) => {
        if (genre in result) result[genre] += 1
      })
    })

    dislikedIds.forEach((id) => {
      const movie = movieCatalog.find((entry) => entry.id === id)
      movie?.genres.forEach((genre) => {
        if (genre in result) result[genre] -= 0.5
      })
    })

    return result
  }, [dislikedIds, likedMovies])

  const unseenRecommendations = useMemo(() => {
    const unseen = movieCatalog.filter((movie) => !likedMovies.some((liked) => liked.id === movie.id) && !dislikedIds.includes(movie.id))
    return getRecommendedTitles(unseen, selectedGenres, likedMovies, dislikedIds, 5)
  }, [dislikedIds, likedMovies, selectedGenres])

  const buildNextDiscoverBatch = () => {
    const excludedIds = [...likedMovies.map((movie) => movie.id), ...dislikedIds]
    const nextDeck = buildDeck(selectedGenres, 12, excludedIds)
    setDeck(nextDeck)
    setCurrentIndex(0)
    setSwipesInBatch(0)
    setShowInfo(false)
    setTasteScreen(false)
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((current) => (current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre]))
  }

  const handleConfirmGenres = () => {
    if (selectedGenres.length > 0) {
      setOnboardingComplete(true)
      setActiveTab('discover')
    }
  }

  const handleLike = () => {
    if (!currentMovie) return

    setLikedMovies((current) => {
      const alreadyLiked = current.some((movie) => movie.id === currentMovie.id)
      return alreadyLiked ? current : [...current, currentMovie]
    })

    advanceDeck('like')
  }

  const handleDislike = () => {
    if (!currentMovie) return
    setDislikedIds((current) => (current.includes(currentMovie.id) ? current : [...current, currentMovie.id]))
    advanceDeck('dislike')
  }

  const advanceDeck = (direction: 'like' | 'dislike') => {
    if (direction === 'like') setLikedMovies((current) => (current.some((movie) => movie.id === currentMovie.id) ? current : [...current, currentMovie]))
    if (direction === 'dislike') setDislikedIds((current) => (current.includes(currentMovie.id) ? current : [...current, currentMovie.id]))

    const nextCount = swipesInBatch + 1
    setSwipesInBatch(nextCount)
    const nextIndex = currentIndex + 1

    if (nextIndex >= deck.length || nextCount >= 10) {
      setTasteScreen(true)
      return
    }

    setCurrentIndex(nextIndex)
    setShowInfo(false)
  }

  const currentSession = currentSessionCode ? sessions[currentSessionCode] : null
  const currentParticipant = currentSession && currentParticipantId ? currentSession.participants[currentParticipantId] : undefined

  const sessionMutualMatches = useMemo(() => {
    const participantEntries = currentSession ? Object.values(currentSession.participants) : []
    if (participantEntries.length < 2) return []

    const sets = participantEntries.map((participant) => new Set(participant.likes))
    const common = [...sets[0]].filter((id) => sets.every((set) => set.has(id)))
    return common
      .map((id) => movieCatalog.find((movie) => movie.id === id))
      .filter((movie): movie is CatalogMovie => Boolean(movie))
  }, [currentSession])

  const startSession = () => {
    const name = sessionInputName.trim() || 'Guest'
    const code = Math.random().toString(36).slice(2, 6).toUpperCase()
    const participantId = `${name}-${Date.now()}`

    const session: SessionRecord = {
      code,
      deck: buildDeck(selectedGenres.length ? selectedGenres : genrePriority, 10),
      participants: {
        [participantId]: {
          id: participantId,
          name,
          likes: [],
          dislikes: [],
          done: false,
          deckIndex: 0,
        },
      },
    }

    setSessions((current) => ({ ...current, [code]: session }))
    setCurrentSessionCode(code)
    setCurrentParticipantId(participantId)
    setSessionScreen('swipe')
    setActiveTab('sessions')
  }

  const joinSession = () => {
    const code = joinCode.trim().toUpperCase()
    const name = joinName.trim() || 'Guest'
    const existing = sessions[code]
    if (!existing) return

    const participantId = `${name}-${Date.now()}`
    const nextSession: SessionRecord = {
      ...existing,
      participants: {
        ...existing.participants,
        [participantId]: {
          id: participantId,
          name,
          likes: [],
          dislikes: [],
          done: false,
          deckIndex: 0,
        },
      },
    }

    setSessions((current) => ({ ...current, [code]: nextSession }))
    setCurrentSessionCode(code)
    setCurrentParticipantId(participantId)
    setSessionScreen('swipe')
    setActiveTab('sessions')
  }

  const updateCurrentSession = (nextSession: SessionRecord) => {
    setSessions((current) => ({ ...current, [nextSession.code]: nextSession }))
  }

  const sessionCard = currentSession && currentParticipant ? currentSession.deck[currentParticipant.deckIndex] : null

  const handleSessionSwipe = (direction: 'like' | 'dislike') => {
    if (!currentSession || !currentParticipant) return

    const card = currentSession.deck[currentParticipant.deckIndex]
    if (!card) return

    const nextParticipant: SessionParticipant = {
      ...currentParticipant,
      likes: direction === 'like' ? [...currentParticipant.likes, card.id] : currentParticipant.likes,
      dislikes: direction === 'dislike' ? [...currentParticipant.dislikes, card.id] : currentParticipant.dislikes,
      deckIndex: currentParticipant.deckIndex + 1,
      done: currentParticipant.deckIndex + 1 >= currentSession.deck.length,
    }

    const nextSession: SessionRecord = {
      ...currentSession,
      participants: {
        ...currentSession.participants,
        [currentParticipantId]: nextParticipant,
      },
    }

    updateCurrentSession(nextSession)

    const doneCount = Object.values(nextSession.participants).filter((participant) => participant.done).length
    setSessionScreen(doneCount >= 2 ? 'results' : 'waiting')
  }

  const resetAll = () => {
    setHasStarted(false)
    setSelectedGenres([])
    setOnboardingComplete(false)
    setLikedMovies([])
    setDislikedIds([])
    setDeck(buildDeck([], 12))
    setCurrentIndex(0)
    setTasteScreen(false)
    setSwipesInBatch(0)
    localStorage.removeItem(storageKeys.selectedGenres)
    localStorage.removeItem(storageKeys.hasStarted)
    localStorage.removeItem(storageKeys.onboardingComplete)
    localStorage.removeItem(storageKeys.likedMovies)
    localStorage.removeItem(storageKeys.dislikedIds)
  }

  const renderCover = () => (
    <div className="phone-shell">
      <div className="status-bar"><div className="status-icons"><span className="status-pill" /><span className="status-pill small" /><span className="status-pill tiny" /></div></div>
      <div className="panel cover-panel">
        <div className="cover-mark">FLIX</div>
        <div className="cover-content">
          <div className="eyebrow">YOUR NEXT FAVORITE MOVIE</div>
          <h1>Swipe into something worth watching.</h1>
          <p>Flix learns your taste as you swipe, builds a personal watchlist, and helps you find movies you and your friends will both love.</p>
          <div className="cover-points">
            <span><Sparkles size={16} /> Discover movies matched to your mood.</span>
            <span><Heart size={16} /> Save the ones you want to remember.</span>
            <span><Users size={16} /> Match with a friend for your next movie night.</span>
          </div>
        </div>
        <button type="button" className="primary-button" onClick={() => setHasStarted(true)}>Get Started</button>
      </div>
    </div>
  )

  const renderDiscover = () => {
    if (!onboardingComplete || selectedGenres.length === 0) {
      return (
        <div className="phone-shell">
          <div className="status-bar"><div className="status-icons"><span className="status-pill" /><span className="status-pill small" /><span className="status-pill tiny" /></div></div>
          <div className="panel onboarding-panel">
            <div className="eyebrow">CURATE YOUR SLATE</div>
            <h1>Choose your flavors.</h1>
            <p>Select your core genres to train your swipe recommendations.</p>

            <div className="genre-grid full-height-grid">
              {GENRES.map((genre) => {
                const selected = selectedGenres.includes(genre)
                return (
                  <button
                    type="button"
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`genre-card ${selected ? 'selected' : ''}`}
                    style={{ backgroundImage: `linear-gradient(180deg, rgba(12,12,16,0.18), rgba(8,8,12,0.8)), url(${genreMoodImages[genre]})` }}
                  >
                    <span>{genre}</span>
                    {selected && <span className="check-badge"><Check size={12} /></span>}
                  </button>
                )
              })}
            </div>

            <button type="button" className="primary-button" disabled={selectedGenres.length === 0} onClick={handleConfirmGenres}>
              Confirm Choices
            </button>
            <div className="helper-text">You can tweak preferences anytime in Settings</div>
          </div>
        </div>
      )
    }

    if (tasteScreen) {
      return (
        <div className="phone-shell">
          <div className="status-bar"><div className="status-icons"><span className="status-pill" /><span className="status-pill small" /><span className="status-pill tiny" /></div></div>
          <div className="panel taste-panel">
            <div className="eyebrow">YOUR TASTE</div>
            <h2>Your Taste</h2>
            <div className="taste-breakdown">
              {GENRES.map((genre) => (
                <div key={genre} className="bar-row">
                  <span>{genre}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(8, Math.min(100, ((affinityByGenre[genre] ?? 0) + 3) * 20))}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="recommendation-list">
              {unseenRecommendations.map((movie) => (
                <div className="recommendation-row" key={movie.id}>
                  <div className="recommendation-emoji" style={{ background: movie.gradient }}>{movie.emoji}</div>
                  <div>
                    <strong>{movie.title}</strong>
                    <small>{movie.score} match</small>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="primary-button" onClick={buildNextDiscoverBatch}>Keep Swiping</button>
          </div>
        </div>
      )
    }

    return (
      <div className="phone-shell">
        <div className="status-bar"><div className="status-icons"><span className="status-pill" /><span className="status-pill small" /><span className="status-pill tiny" /></div></div>
        <div className="panel discover-panel">
          <div className="movie-card-wrap">
            <AnimatePresence mode="wait">
              {!showInfo && (
                <motion.div
                  key={currentMovie.id}
                  className="movie-card"
                  initial={{ opacity: 0.2, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  style={{ background: `${currentMovie.gradient}` }}
                >
                  <div className="movie-card-topline">
                    <span className="rating-badge"><Star size={12} fill="currentColor" /> {currentMovie.genres.join(' • ')}</span>
                    <span className="recommended-tag">RECOMMENDED</span>
                  </div>
                  <div className="movie-card-copy">
                    <span className="hero-title">{currentMovie.emoji}</span>
                    <span className="hero-title title-stack">{currentMovie.title}</span>
                    <div className="movie-meta-link">{currentMovie.year}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showInfo && (
                <motion.div key={`${currentMovie.id}-info`} className="movie-card movie-card-info" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
                  <div className="info-header">Overview</div>
                  <h3>{currentMovie.title}</h3>
                  <p>{currentMovie.description}</p>
                  <div className="info-meta-row">
                    <span>{currentMovie.genres.join(' • ')}</span>
                    <span>{currentMovie.year}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="swipe-actions">
            <button type="button" className="action-btn nope-btn" onClick={handleDislike} aria-label="Dislike movie"><X size={30} /></button>
            <button type="button" className="action-btn info-btn" onClick={() => setShowInfo((value) => !value)} aria-label="Toggle info"><Info size={18} /></button>
            <button type="button" className="action-btn like-btn" onClick={handleLike} aria-label="Like movie"><Heart size={24} /></button>
          </div>

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    )
  }

  const renderWatchlist = () => (
    <div className="phone-shell">
      <div className="status-bar"><div className="status-icons"><span className="status-pill" /></div></div>
      <div className="panel watchlist-panel">
        <h1>Watchlist</h1>
        <div className="pill-count-box">{watchlistTab === 'solo' ? likedMovies.length : sessionMutualMatches.length} Saved</div>

        <div className="segment-row">
          <button type="button" className={`segment ${watchlistTab === 'solo' ? 'active' : ''}`} onClick={() => setWatchlistTab('solo')}>Solo Likes</button>
          <button type="button" className={`segment ${watchlistTab === 'mutual' ? 'active' : ''}`} onClick={() => setWatchlistTab('mutual')}>Mutual Matches</button>
        </div>

        <div className="watchlist-list">
          {watchlistTab === 'solo' ? (
            likedMovies.length === 0 ? (
              <div className="empty-state">No movies saved yet.</div>
            ) : (
              likedMovies.map((movie) => (
                <div className="watchlist-item" key={movie.id}>
                  <div className="watchlist-art" style={{ background: movie.gradient }}>{movie.emoji}</div>
                  <div>
                    <div className="watchlist-title">{movie.title}</div>
                    <div className="watchlist-meta">{movie.year} • {movie.genres.join(' • ')}</div>
                  </div>
                </div>
              ))
            )
          ) : (
            sessionMutualMatches.length === 0 ? (
              <div className="empty-state">No mutual matches yet.</div>
            ) : (
              sessionMutualMatches.map((movie) => (
                <div className="watchlist-item" key={movie.id}>
                  <div className="watchlist-art" style={{ background: movie.gradient }}>{movie.emoji}</div>
                  <div>
                    <div className="watchlist-title">{movie.title}</div>
                    <div className="watchlist-meta">{movie.year} • {movie.genres.join(' • ')}</div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )

  const renderSessionsHome = () => (
    <div className="phone-shell">
      <div className="status-bar"><div className="status-icons"><span className="status-pill" /></div></div>
      <div className="panel sessions-panel">
        <h1>Sessions</h1>
        <p>You and your friend swipe the exact same 10 movies separately. We’ll show you what you both liked!</p>

        <div className="session-form">
          <label>
            <span>Your name</span>
            <input value={sessionInputName} onChange={(event) => setSessionInputName(event.target.value)} placeholder="e.g. Sam" />
          </label>
          <button type="button" className="primary-button" onClick={startSession}>Start a new session</button>
        </div>

        <div className="divider">or</div>

        <div className="session-form">
          <label>
            <span>Session code</span>
            <input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="E.G. F3QX" />
          </label>
          <label>
            <span>Your name</span>
            <input value={joinName} onChange={(event) => setJoinName(event.target.value)} placeholder="e.g. Alex" />
          </label>
          <button type="button" className="secondary-button" onClick={joinSession}>Join a session</button>
        </div>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )

  const renderSessionsSwipe = () => {
    if (!currentSession || !currentParticipant) return renderSessionsHome()

    const doneCount = Object.values(currentSession.participants).filter((participant) => participant.done).length

    if (doneCount >= 2) {
      const mutualIds = sessionMutualMatches.map((movie) => movie.id)
      const heroMovie = sessionMutualMatches[0] ?? currentSession.deck[0]

      return (
        <div className="phone-shell">
          <div className="status-bar"><div className="status-icons"><span className="status-pill" /></div></div>
          <div className="panel sessions-results-panel">
            <div className="eyebrow">MATCH RESULTS</div>
            <h2>{mutualIds.length ? 'You both matched!' : 'No exact overlap — here is what fits you both'}</h2>
            {heroMovie && (
              <div className="hero-match-card" style={{ background: heroMovie.gradient }}>
                <div className="hero-match-backdrop" />
                <div className="hero-match-content">
                  <span className="match-emoji">{heroMovie.emoji}</span>
                  <strong>{heroMovie.title}</strong>
                  <small>{heroMovie.year}</small>
                </div>
              </div>
            )}

            <div className="results-list">
              {(mutualIds.length ? sessionMutualMatches : currentSession.deck.slice(0, 4)).map((movie) => (
                <div key={movie.id} className="result-row">
                  <div className="watchlist-art" style={{ background: movie.gradient }}>{movie.emoji}</div>
                  <div>
                    <div className="watchlist-title">{movie.title}</div>
                    <div className="watchlist-meta">{movie.year} • {movie.genres.join(' • ')}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="session-actions">
              <button type="button" className="primary-button" onClick={() => { setSessionScreen('home'); setActiveTab('discover') }}>Keep Swiping</button>
              <button type="button" className="secondary-button" onClick={() => { setSessionScreen('home'); setCurrentSessionCode(null); setActiveTab('sessions') }}>Return to Menu</button>
            </div>
          </div>
        </div>
      )
    }

    if (!sessionCard) {
      return (
        <div className="phone-shell">
          <div className="status-bar"><div className="status-icons"><span className="status-pill" /></div></div>
          <div className="panel sessions-panel">
            <div className="eyebrow">WAITING ROOM</div>
            <h1>Session {currentSession.code}</h1>
            <p>Share this code while your partner finishes swiping.</p>
            <div className="session-code">{currentSession.code}</div>
            <div className="participants-list">
              {Object.values(currentSession.participants).map((participant) => (
                <div key={participant.id} className="participant-row">
                  <span>{participant.name}</span>
                  <span>{participant.done ? '✓ done' : '… waiting'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="phone-shell">
        <div className="status-bar"><div className="status-icons"><span className="status-pill" /></div></div>
        <div className="panel sessions-panel">
          <div className="session-code-banner">Code: <strong>{currentSession.code}</strong></div>
          <h1>Session {currentSession.code}</h1>
          <div className="participants-list">
            {Object.values(currentSession.participants).map((participant) => (
              <div key={participant.id} className="participant-row">
                <span>{participant.name}</span>
                <span>{participant.done ? '✓ done' : '… waiting'}</span>
              </div>
            ))}
          </div>

          <div className="movie-card-wrap compact-wrap">
            <div className="movie-card" style={{ background: sessionCard.gradient }}>
              <div className="movie-card-topline">
                <span className="rating-badge"><Star size={12} fill="currentColor" /> {sessionCard.genres.join(' • ')}</span>
                <span className="recommended-tag">SESSION</span>
              </div>
              <div className="movie-card-copy">
                <span className="hero-title">{sessionCard.emoji}</span>
                <span className="hero-title title-stack">{sessionCard.title}</span>
                <div className="movie-meta-link">{sessionCard.year}</div>
              </div>
            </div>
          </div>

          <div className="swipe-actions compact-actions">
            <button type="button" className="action-btn nope-btn" onClick={() => handleSessionSwipe('dislike')}><X size={30} /></button>
            <button type="button" className="action-btn info-btn" onClick={() => {}}><Info size={18} /></button>
            <button type="button" className="action-btn like-btn" onClick={() => handleSessionSwipe('like')}><Heart size={24} /></button>
          </div>
        </div>
      </div>
    )
  }

  const renderProfile = () => (
    <div className="phone-shell">
      <div className="status-bar"><div className="status-icons"><span className="status-pill" /></div></div>
      <div className="panel profile-panel">
        <h1>Flavor Profile</h1>

        <div className="genre-grid full-height-grid profile-grid">
          {GENRES.map((genre) => {
            const selected = selectedGenres.includes(genre)
            return (
              <button
                type="button"
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`genre-card ${selected ? 'selected' : ''}`}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.18), rgba(0,0,0,0.8)), url(${genreMoodImages[genre]})` }}
              >
                <span>{genre}</span>
                {selected && <span className="check-badge"><Check size={12} /></span>}
              </button>
            )
          })}
        </div>

        <div className="taste-breakdown">
          {GENRES.map((genre) => (
            <div key={genre} className="bar-row">
              <span>{genre}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(10, Math.min(100, ((affinityByGenre[genre] ?? 0) + 3) * 22))}%` }} /></div>
            </div>
          ))}
        </div>

        <button type="button" className="reset-btn" onClick={resetAll}>Reset all data</button>
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )

  const renderSessions = () => {
    if (sessionScreen === 'swipe' || sessionScreen === 'waiting' || sessionScreen === 'results') return renderSessionsSwipe()
    return renderSessionsHome()
  }

  const renderMain = () => {
    if (!hasStarted) return renderCover()
    if (activeTab === 'watchlist') return renderWatchlist()
    if (activeTab === 'sessions') return renderSessions()
    if (activeTab === 'profile') return renderProfile()
    return renderDiscover()
  }

  return (
    <div className="app-shell">
      <div className="app-stage">{renderMain()}</div>
      <div className="tmdb-branding">TMDB</div>
    </div>
  )
}

function BottomNav({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: Dispatch<SetStateAction<Tab>> }) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Sparkles },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'sessions', label: 'Sessions', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserRound },
  ] as const

  return (
    <div className="bottom-nav">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button type="button" key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

export default App
