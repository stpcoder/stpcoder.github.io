import { useCallback, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import ArcadeMinesweeper from '../games/ArcadeMinesweeper'
import ArcadeSnake from '../games/ArcadeSnake'
import { normalizeArcadeUnlocks } from '../../lib/arcadeProgress'
import { getAllItems, profile, SECTION_META } from '../../lib/profileData'
import './SnakeView.css'

const UNLOCKS_KEY = 'portfolio-arcade-unlocked-v1'
const SELECTED_KEY = 'portfolio-arcade-selected-v1'
const ACTIVE_GAME_KEY = 'portfolio-arcade-game-v1'
const LEGACY_BEST_KEY = 'portfolio-snake-best-score'
const GAMES = new Set(['snake', 'minesweeper'])

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
    // The game remains playable when storage is unavailable.
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

  // Older builds only stored BEST. Preserve every record earned there.
  const legacyBest = Math.max(0, Number(readStorage(LEGACY_BEST_KEY, '0')) || 0)
  const normalized = normalizeArcadeUnlocks(FACTS, stored, legacyBest)
  if (normalized.length) writeStorage(UNLOCKS_KEY, JSON.stringify(normalized))
  return normalized
}

function initialGame() {
  const stored = readStorage(ACTIVE_GAME_KEY, 'snake')
  return GAMES.has(stored) ? stored : 'snake'
}

export default function SnakeView() {
  const [unlockedIds, setUnlockedIds] = useState(initialUnlocks)
  const unlockedRef = useRef(new Set(unlockedIds))
  const [activeGame, setActiveGame] = useState(initialGame)
  const [selectedId, setSelectedId] = useState(() => {
    const stored = readStorage(SELECTED_KEY)
    return unlockedIds.includes(stored) ? stored : unlockedIds.at(-1) || ''
  })

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds])
  const unlockedFacts = useMemo(
    () => FACTS.filter(({ id }) => unlockedSet.has(id)),
    [unlockedSet]
  )
  const selectedFact = FACT_BY_ID.get(selectedId) || unlockedFacts.at(-1) || null

  const selectFact = useCallback((factId) => {
    if (!unlockedRef.current.has(factId)) return
    setSelectedId(factId)
    writeStorage(SELECTED_KEY, factId)
  }, [])

  const saveUnlock = useCallback((fact) => {
    if (!fact) return false

    setSelectedId(fact.id)
    writeStorage(SELECTED_KEY, fact.id)
    if (unlockedRef.current.has(fact.id)) return false

    unlockedRef.current.add(fact.id)
    const nextIds = FACTS.filter(({ id }) => unlockedRef.current.has(id)).map(({ id }) => id)
    setUnlockedIds(nextIds)
    writeStorage(UNLOCKS_KEY, JSON.stringify(nextIds))
    return true
  }, [])

  const unlockSnakeFact = useCallback((scoreIndex) => {
    if (!FACTS.length) return false
    return saveUnlock(FACTS[Math.max(0, scoreIndex) % FACTS.length])
  }, [saveUnlock])

  const unlockNextFact = useCallback(() => {
    const next = FACTS.find(({ id }) => !unlockedRef.current.has(id))
    if (next) return saveUnlock(next)
    if (FACTS.length) selectFact(FACTS.at(-1).id)
    return false
  }, [saveUnlock, selectFact])

  const chooseGame = (gameId) => {
    setActiveGame(gameId)
    writeStorage(ACTIVE_GAME_KEY, gameId)
  }

  return (
    <main className="arcade-view">
      <header className="arcade-header">
        <div className="arcade-brand" aria-label="Taeho Arcade">
          <span className="arcade-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <strong>TAEHO ARCADE</strong>
        </div>

        <nav className="arcade-tabs" aria-label="Arcade games">
          <button type="button" className={activeGame === 'snake' ? 'active' : ''} onClick={() => chooseGame('snake')}>Snake</button>
          <button type="button" className={activeGame === 'minesweeper' ? 'active' : ''} onClick={() => chooseGame('minesweeper')}>Mines</button>
        </nav>

        <div className="arcade-record-count"><strong>{unlockedIds.length}</strong><span>/{FACTS.length} saved</span></div>
      </header>

      <div className="arcade-layout">
        <section className="arcade-cabinet" aria-label={activeGame === 'snake' ? 'Snake game' : 'Minesweeper game'}>
          {activeGame === 'snake'
            ? <ArcadeSnake onUnlock={unlockSnakeFact} />
            : <ArcadeMinesweeper onUnlock={unlockNextFact} />}
        </section>

        <aside className="arcade-story">
          <header className="arcade-story-heading">
            <span>Play. Discover. Keep.</span>
            <h1>Unlock my story.</h1>
            <p>Every discovery stays in this browser, even after the game ends.</p>
          </header>

          <article className={`arcade-fact-card ${selectedFact ? 'unlocked' : ''}`} key={selectedFact?.id || 'locked'}>
            {selectedFact ? (
              <>
                <span>{sectionLabel(selectedFact.section)}</span>
                <h2>{selectedFact.title}</h2>
                {selectedFact.subtitle ? <h3>{selectedFact.subtitle}</h3> : null}
                {selectedFact.period ? <time>{selectedFact.period}</time> : null}
                {selectedFact.description ? <p>{selectedFact.description}</p> : null}
                {selectedFact.link ? <a href={selectedFact.link} target="_blank" rel="noopener noreferrer">Open record</a> : null}
              </>
            ) : (
              <>
                <span>Collection empty</span>
                <h2>Your first record is waiting.</h2>
                <p>Eat an apple or clear safe cells to begin.</p>
              </>
            )}
          </article>

          <section className="arcade-collection" aria-label="Unlocked portfolio records">
            <div className="arcade-collection-title"><span>Collection</span><small>{unlockedIds.length} saved</small></div>
            {unlockedFacts.length ? (
              <div className="arcade-collection-list">
                {unlockedFacts.map((fact, index) => (
                  <button type="button" key={fact.id} className={fact.id === selectedFact?.id ? 'active' : ''} onClick={() => selectFact(fact.id)}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{fact.title}</strong>
                    <i>{sectionLabel(fact.section)}</i>
                  </button>
                ))}
              </div>
            ) : <p className="arcade-collection-empty">No records unlocked yet.</p>}
          </section>
        </aside>
      </div>

      <StyleSwitcher />
    </main>
  )
}
