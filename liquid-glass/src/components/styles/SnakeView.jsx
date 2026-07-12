import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import ArcadeSignalFrontier from '../games/ArcadeSignalFrontier'
import ArcadeMinesweeper from '../games/ArcadeMinesweeper'
import ArcadeSnake from '../games/ArcadeSnake'
import { normalizeArcadeUnlocks } from '../../lib/arcadeProgress'
import { getAllItems, profile, SECTION_META } from '../../lib/profileData'
import './SnakeView.css'

const UNLOCKS_KEY = 'portfolio-arcade-unlocked-v1'
const SELECTED_KEY = 'portfolio-arcade-selected-v1'
const ACTIVE_GAME_KEY = 'portfolio-arcade-game-v1'
const LEGACY_BEST_KEY = 'portfolio-snake-best-score'
const GAMES = new Set(['snake', 'runner', 'minesweeper'])
const GAME_LABELS = { snake: 'Snake', runner: 'Signal Frontier', minesweeper: 'Mines' }

const FACTS = [
  {
    id: 'profile-intro',
    section: 'profile',
    title: profile.title,
    subtitle: profile.location,
    description: profile.about
  },
  ...getAllItems(false)
]

const FACT_BY_ID = new Map(FACTS.map((fact) => [fact.id, fact]))

function sectionLabel(section) {
  return SECTION_META.find((entry) => entry.id === section)?.label || 'Profile'
}

function readStorage(key, fallback = '') {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage is an enhancement; games still work without it.
  }
}

function initialUnlocks() {
  let stored = []
  try {
    const parsed = JSON.parse(readStorage(UNLOCKS_KEY, '[]'))
    if (Array.isArray(parsed)) stored = parsed
  } catch {
    stored = []
  }

  const legacyBest = Math.max(0, Number(readStorage(LEGACY_BEST_KEY, '0')) || 0)
  const normalized = normalizeArcadeUnlocks(FACTS, stored, legacyBest)
  if (normalized.length) writeStorage(UNLOCKS_KEY, JSON.stringify(normalized))
  return normalized
}

function initialGame() {
  const stored = readStorage(ACTIVE_GAME_KEY, 'snake')
  return GAMES.has(stored) ? stored : 'snake'
}

function StoryCard({ fact, index, featured = false }) {
  return (
    <article className={`arcade-story-card ${featured ? 'featured' : ''}`}>
      <header><span>{sectionLabel(fact.section)}</span><b>{String(index + 1).padStart(2, '0')}</b></header>
      <h2>{fact.title}</h2>
      {fact.subtitle ? <h3>{fact.subtitle}</h3> : null}
      {fact.period ? <time>{fact.period}</time> : null}
      {fact.description ? <p>{fact.description}</p> : null}
      {fact.link ? <a href={fact.link} target="_blank" rel="noopener noreferrer">Open record</a> : null}
    </article>
  )
}

export default function SnakeView() {
  const [unlockedIds, setUnlockedIds] = useState(initialUnlocks)
  const unlockedRef = useRef(new Set(unlockedIds))
  const sessionSeenRef = useRef([])
  const sessionNewRef = useRef([])
  const unlockSerialRef = useRef(0)
  const [activeGame, setActiveGame] = useState(initialGame)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionResult, setSessionResult] = useState(null)
  const [unlockEvent, setUnlockEvent] = useState(null)
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(() => {
    const stored = readStorage(SELECTED_KEY)
    return unlockedIds.includes(stored) ? stored : unlockedIds.at(-1) || ''
  })

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds])
  const unlockedFacts = useMemo(() => FACTS.filter(({ id }) => unlockedSet.has(id)), [unlockedSet])
  const selectedFact = FACT_BY_ID.get(selectedId) || unlockedFacts.at(-1) || null
  const levelStart = Math.max(0, Math.min(FACTS.length - 6, unlockedIds.length - 2))
  const visibleLevels = FACTS.slice(levelStart, levelStart + 6)

  const selectFact = useCallback((factId) => {
    if (!unlockedRef.current.has(factId)) return
    setSelectedId(factId)
    writeStorage(SELECTED_KEY, factId)
  }, [])

  const beginSession = useCallback(() => {
    sessionSeenRef.current = []
    sessionNewRef.current = []
    setSessionResult(null)
    setUnlockEvent(null)
    setSessionActive(true)
  }, [])

  const saveUnlock = useCallback((fact) => {
    if (!fact) return { fact: null, isNew: false, level: unlockedRef.current.size }

    setSelectedId(fact.id)
    writeStorage(SELECTED_KEY, fact.id)
    if (!sessionSeenRef.current.includes(fact.id)) sessionSeenRef.current.push(fact.id)

    const isNew = !unlockedRef.current.has(fact.id)
    if (isNew) {
      unlockedRef.current.add(fact.id)
      sessionNewRef.current.push(fact.id)
      const nextIds = FACTS.filter(({ id }) => unlockedRef.current.has(id)).map(({ id }) => id)
      setUnlockedIds(nextIds)
      writeStorage(UNLOCKS_KEY, JSON.stringify(nextIds))
    }

    unlockSerialRef.current += 1
    const result = { fact, isNew, level: unlockedRef.current.size, serial: unlockSerialRef.current }
    setUnlockEvent(result)
    return result
  }, [])

  const unlockSnakeFact = useCallback((scoreIndex) => {
    if (!FACTS.length) return { fact: null, isNew: false, level: 0 }
    return saveUnlock(FACTS[Math.max(0, scoreIndex) % FACTS.length])
  }, [saveUnlock])

  const unlockNextFact = useCallback(() => {
    const next = FACTS.find(({ id }) => !unlockedRef.current.has(id))
      || FACTS[sessionSeenRef.current.length % FACTS.length]
    return saveUnlock(next)
  }, [saveUnlock])

  const finishSession = useCallback((summary) => {
    const newIds = [...sessionNewRef.current]
    const seenIds = [...sessionSeenRef.current]
    const fallbackIds = [...unlockedRef.current].slice(-3)
    const storyIds = newIds.length ? newIds : seenIds.length ? seenIds : fallbackIds
    setSessionActive(false)
    setSessionResult({
      ...summary,
      newIds,
      storyIds: [...new Set(storyIds)],
      totalUnlocked: unlockedRef.current.size
    })
  }, [])

  const chooseGame = (gameId) => {
    setActiveGame(gameId)
    setSessionActive(false)
    setSessionResult(null)
    setUnlockEvent(null)
    writeStorage(ACTIVE_GAME_KEY, gameId)
  }

  const resultFacts = sessionResult?.storyIds.map((id) => FACT_BY_ID.get(id)).filter(Boolean) || []

  useEffect(() => {
    if (!collectionOpen) return undefined
    const close = (event) => { if (event.key === 'Escape') setCollectionOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [collectionOpen])

  return (
    <main className="arcade-view">
      <header className="arcade-header">
        <div className="arcade-brand" aria-label="Taeho Arcade">
          <span className="arcade-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <strong>TAEHO ARCADE</strong>
        </div>

        <nav className="arcade-tabs" aria-label="Arcade games">
          <button type="button" className={activeGame === 'snake' ? 'active' : ''} onClick={() => chooseGame('snake')}>Snake</button>
          <button type="button" className={activeGame === 'runner' ? 'active' : ''} onClick={() => chooseGame('runner')}>Frontier</button>
          <button type="button" className={activeGame === 'minesweeper' ? 'active' : ''} onClick={() => chooseGame('minesweeper')}>Mines</button>
        </nav>

        <div className="arcade-record-count"><strong>{unlockedIds.length}</strong><span>/{FACTS.length} saved</span></div>
      </header>

      {sessionResult ? (
        <section className="arcade-results">
          <header className="arcade-results-hero">
            <div>
              <span>{GAME_LABELS[sessionResult.game] || 'Arcade'} / Run complete</span>
              <h1>{sessionResult.newIds.length ? `${sessionResult.newIds.length} new stories.` : 'Story recap.'}</h1>
              <p>{sessionResult.newIds.length
                ? 'The records you reached are now permanently saved in your collection.'
                : 'No new level this time, so here are the stories connected to this run.'}</p>
            </div>
            <dl>
              <div><dt>{sessionResult.metricLabel || 'Score'}</dt><dd>{sessionResult.score ?? 0}</dd></div>
              <div><dt>Collection</dt><dd>{sessionResult.totalUnlocked}/{FACTS.length}</dd></div>
            </dl>
          </header>

          <div className="arcade-results-cards">
            {resultFacts.length
              ? resultFacts.map((fact, index) => <StoryCard key={fact.id} fact={fact} index={index} featured={index === 0} />)
              : <div className="arcade-results-empty"><strong>No story reached yet.</strong><span>Try one more run and complete the first objective.</span></div>}
          </div>

          <footer className="arcade-results-actions">
            <button type="button" className="primary" onClick={() => setSessionResult(null)}>Play {GAME_LABELS[activeGame]} again</button>
            <button type="button" onClick={() => setCollectionOpen(true)}>Open collection</button>
            <button type="button" onClick={() => chooseGame(activeGame)}>Back to arcade</button>
          </footer>
        </section>
      ) : (
        <div className="arcade-layout">
          <section className="arcade-cabinet" aria-label={`${GAME_LABELS[activeGame]} game`}>
            {activeGame === 'snake' ? (
              <ArcadeSnake onUnlock={unlockSnakeFact} onSessionStart={beginSession} onGameEnd={finishSession} />
            ) : activeGame === 'runner' ? (
              <ArcadeSignalFrontier onUnlock={unlockNextFact} onSessionStart={beginSession} onGameEnd={finishSession} />
            ) : (
              <ArcadeMinesweeper onUnlock={unlockNextFact} onSessionStart={beginSession} onGameEnd={finishSession} />
            )}
          </section>

          <aside className={`arcade-story ${sessionActive ? 'session-active' : ''}`}>
            <header className="arcade-story-heading">
              <span>{sessionActive ? 'Live progression' : 'Permanent collection'}</span>
              <h1>Unlock my story.</h1>
              <p>Play without interruption. Every reached level returns as a story card when the run ends.</p>
            </header>

            <section className="arcade-levels" aria-label="Story level progress">
              <div className="arcade-levels-title"><span>Story levels</span><b>{unlockedIds.length}/{FACTS.length}</b></div>
              <div className="arcade-level-rail">
                {visibleLevels.map((fact, index) => {
                  const unlocked = unlockedSet.has(fact.id)
                  return (
                    <button type="button" key={fact.id} className={unlocked ? 'unlocked' : 'locked'} disabled={!unlocked} onClick={() => selectFact(fact.id)} aria-label={`${unlocked ? 'Unlocked' : 'Locked'} level ${levelStart + index + 1}`}>
                      <i>{unlocked ? 'OK' : String(levelStart + index + 1).padStart(2, '0')}</i><span />
                    </button>
                  )
                })}
              </div>
            </section>

            <div className="arcade-unlock-stage" aria-live="polite">
              {unlockEvent ? (
                <article className={`arcade-unlock-signal ${unlockEvent.isNew ? 'new' : 'revisit'}`} key={unlockEvent.serial}>
                  <div><span>{unlockEvent.isNew ? 'New level unlocked' : 'Story checkpoint'}</span><b>LV.{String(unlockEvent.level).padStart(2, '0')}</b></div>
                  <h2>{unlockEvent.fact.title}</h2>
                  <p>{unlockEvent.isNew ? 'Saved permanently. Keep playing.' : 'Already saved. Keep the run alive.'}</p>
                  <i aria-hidden="true"><b /></i>
                </article>
              ) : selectedFact ? (
                <article className="arcade-unlock-signal saved">
                  <div><span>Latest saved story</span><b>READY</b></div>
                  <h2>{selectedFact.title}</h2>
                  <p>Start a game to reach the next story level.</p>
                </article>
              ) : (
                <article className="arcade-unlock-signal saved">
                  <div><span>Level 01</span><b>LOCKED</b></div>
                  <h2>Your first story is waiting.</h2>
                  <p>Eat an apple, clear safe cells, or secure a frontier sector.</p>
                </article>
              )}
            </div>

            <footer className="arcade-story-footer">
              <div><span>{sessionActive ? 'Run active - story cards appear at the finish.' : `${unlockedFacts.length} stories available in this browser.`}</span><button type="button" onClick={() => setCollectionOpen(true)}>Open collection</button></div>
              <i><b style={{ width: `${Math.min(100, unlockedIds.length / FACTS.length * 100)}%` }} /></i>
            </footer>
          </aside>
        </div>
      )}

      {collectionOpen ? (
        <div className="arcade-collection-layer" onPointerDown={() => setCollectionOpen(false)}>
          <section className="arcade-collection-window" onPointerDown={(event) => event.stopPropagation()}>
            <header><div><span>Permanent unlocks</span><h2>Story collection</h2></div><button type="button" onClick={() => setCollectionOpen(false)} aria-label="Close collection">Close</button></header>
            <div className="arcade-collection-layout">
              <nav aria-label="Unlocked stories">
                {unlockedFacts.length ? unlockedFacts.map((fact, index) => (
                  <button type="button" key={fact.id} className={fact.id === selectedFact?.id ? 'active' : ''} onClick={() => selectFact(fact.id)}>
                    <span>{String(index + 1).padStart(2, '0')}</span><strong>{fact.title}</strong><i>{sectionLabel(fact.section)}</i>
                  </button>
                )) : <p>No stories unlocked yet.</p>}
              </nav>
              <div className="arcade-collection-preview">
                {selectedFact ? <StoryCard fact={selectedFact} index={Math.max(0, unlockedFacts.findIndex(({ id }) => id === selectedFact.id))} featured /> : <div className="arcade-results-empty"><strong>Collection empty</strong><span>Play a game to unlock the first story.</span></div>}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <StyleSwitcher />
    </main>
  )
}
