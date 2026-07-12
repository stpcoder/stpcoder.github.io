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
const SELECTED_SECTION_KEY = 'portfolio-arcade-section-v1'
const ACTIVE_GAME_KEY = 'portfolio-arcade-game-v1'
const LEGACY_BEST_KEY = 'portfolio-snake-best-score'
const LEGACY_PROFILE_FACT_ID = 'profile-intro'
const GAMES = new Set(['snake', 'runner', 'minesweeper'])
const GAME_LABELS = { snake: 'Snake', runner: 'Signal Frontier', minesweeper: 'Mines' }

const FACTS = getAllItems(false)

const FACT_BY_ID = new Map(FACTS.map((fact) => [fact.id, fact]))
const SECTION_IDS = new Set(SECTION_META.map(({ id }) => id))
const FACTS_BY_SECTION = new Map(SECTION_META.map(({ id }) => [id, FACTS.filter((fact) => fact.section === id)]))

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
  if (stored.includes(LEGACY_PROFILE_FACT_ID) && FACTS[0] && !normalized.includes(FACTS[0].id)) normalized.unshift(FACTS[0].id)
  if (normalized.length) writeStorage(UNLOCKS_KEY, JSON.stringify(normalized))
  return normalized
}

function initialGame() {
  const stored = readStorage(ACTIVE_GAME_KEY, 'snake')
  return GAMES.has(stored) ? stored : 'snake'
}

function StoryCard({ fact, index, featured = false, compact = false }) {
  return (
    <article className={`arcade-story-card ${featured ? 'featured' : ''} ${compact ? 'compact' : ''}`}>
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
  const [activeGame, setActiveGame] = useState(initialGame)
  const [sessionResult, setSessionResult] = useState(null)
  const [unlockEvent, setUnlockEvent] = useState(null)
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(() => {
    const stored = readStorage(SELECTED_KEY)
    return unlockedIds.includes(stored) ? stored : unlockedIds.at(-1) || ''
  })
  const [selectedSection, setSelectedSection] = useState(() => {
    const stored = readStorage(SELECTED_SECTION_KEY)
    if (SECTION_IDS.has(stored)) return stored
    return FACT_BY_ID.get(selectedId)?.section || SECTION_META[0].id
  })

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds])
  const unlockedFacts = useMemo(() => FACTS.filter(({ id }) => unlockedSet.has(id)), [unlockedSet])
  const sectionSummaries = useMemo(() => SECTION_META.map((section) => {
    const facts = FACTS_BY_SECTION.get(section.id) || []
    const unlocked = facts.filter(({ id }) => unlockedSet.has(id))
    return { ...section, facts, unlocked, latest: unlocked.at(-1) || null }
  }), [unlockedSet])
  const selectedSectionSummary = sectionSummaries.find(({ id }) => id === selectedSection) || sectionSummaries[0]
  const selectedFact = selectedSectionSummary.unlocked.find(({ id }) => id === selectedId) || selectedSectionSummary.latest

  const selectFact = useCallback((factId) => {
    if (!unlockedRef.current.has(factId)) return
    const fact = FACT_BY_ID.get(factId)
    setSelectedId(factId)
    writeStorage(SELECTED_KEY, factId)
    if (fact?.section) {
      setSelectedSection(fact.section)
      writeStorage(SELECTED_SECTION_KEY, fact.section)
    }
  }, [])

  const selectSection = useCallback((sectionId) => {
    if (!SECTION_IDS.has(sectionId)) return
    setSelectedSection(sectionId)
    writeStorage(SELECTED_SECTION_KEY, sectionId)
    const latest = (FACTS_BY_SECTION.get(sectionId) || []).filter(({ id }) => unlockedRef.current.has(id)).at(-1)
    if (latest) {
      setSelectedId(latest.id)
      writeStorage(SELECTED_KEY, latest.id)
    }
  }, [])

  const beginSession = useCallback(() => {
    sessionSeenRef.current = []
    sessionNewRef.current = []
    setSessionResult(null)
    setUnlockEvent(null)
  }, [])

  const saveUnlock = useCallback((fact) => {
    if (!fact) return { fact: null, isNew: false }

    setSelectedId(fact.id)
    setSelectedSection(fact.section)
    writeStorage(SELECTED_KEY, fact.id)
    writeStorage(SELECTED_SECTION_KEY, fact.section)
    if (!sessionSeenRef.current.includes(fact.id)) sessionSeenRef.current.push(fact.id)

    const isNew = !unlockedRef.current.has(fact.id)
    if (isNew) {
      unlockedRef.current.add(fact.id)
      sessionNewRef.current.push(fact.id)
      const nextIds = FACTS.filter(({ id }) => unlockedRef.current.has(id)).map(({ id }) => id)
      setUnlockedIds(nextIds)
      writeStorage(UNLOCKS_KEY, JSON.stringify(nextIds))
    }

    const result = { fact, isNew }
    setUnlockEvent(result)
    return result
  }, [])

  const unlockSnakeFact = useCallback((scoreIndex) => {
    if (!FACTS.length) return { fact: null, isNew: false }
    return saveUnlock(FACTS[Math.max(0, scoreIndex) % FACTS.length])
  }, [saveUnlock])

  const unlockNextFact = useCallback((preferredSections = []) => {
    const preferred = Array.isArray(preferredSections) && preferredSections.length
      ? FACTS.filter(({ section }) => preferredSections.includes(section))
      : FACTS
    const next = preferred.find(({ id }) => !unlockedRef.current.has(id))
      || FACTS.find(({ id }) => !unlockedRef.current.has(id))
      || preferred[sessionSeenRef.current.length % preferred.length]
      || FACTS[sessionSeenRef.current.length % FACTS.length]
    return saveUnlock(next)
  }, [saveUnlock])

  const finishSession = useCallback((summary) => {
    const newIds = [...sessionNewRef.current]
    const seenIds = [...sessionSeenRef.current]
    const fallbackIds = [...unlockedRef.current].slice(-3)
    const storyIds = newIds.length ? newIds : seenIds.length ? seenIds : fallbackIds
    setSessionResult({
      ...summary,
      newIds,
      storyIds: [...new Set(storyIds)],
      totalUnlocked: unlockedRef.current.size
    })
  }, [])

  const chooseGame = (gameId) => {
    setActiveGame(gameId)
    setSessionResult(null)
    setUnlockEvent(null)
    writeStorage(ACTIVE_GAME_KEY, gameId)
  }

  const resultFacts = sessionResult?.storyIds.map((id) => FACT_BY_ID.get(id)).filter(Boolean) || []
  const resultGroups = SECTION_META.map((section) => ({
    ...section,
    facts: resultFacts.filter((fact) => fact.section === section.id)
  })).filter(({ facts }) => facts.length)

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

          <div className="arcade-results-sections">
            {resultGroups.length ? resultGroups.map((section) => (
              <section className="arcade-result-section" key={section.id}>
                <header><i>{section.symbol}</i><h2>{section.label}</h2><b>{section.facts.length}</b></header>
                <div>
                  {section.facts.map((fact, index) => <StoryCard key={fact.id} fact={fact} index={index} featured={index === 0} compact />)}
                </div>
              </section>
            )) : <div className="arcade-results-empty"><strong>No story reached yet.</strong><span>Try one more run and complete the first objective.</span></div>}
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

          <aside className="arcade-story">
            <header className="arcade-story-heading">
              <span>Portfolio sections</span>
              <h1>{profile.name}</h1>
              <p>{profile.title}</p>
            </header>

            <nav className="arcade-section-list" aria-label="Portfolio sections">
              {sectionSummaries.map((section) => (
                <button
                  type="button"
                  key={section.id}
                  className={`${selectedSection === section.id ? 'active' : ''} ${unlockEvent?.fact.section === section.id ? 'recent' : ''}`}
                  onClick={() => selectSection(section.id)}
                >
                  <i>{section.symbol}</i>
                  <span><strong>{section.label}</strong><small>{section.latest?.title || 'Not discovered'}</small></span>
                  <b>{section.unlocked.length}/{section.facts.length}</b>
                </button>
              ))}
            </nav>

            <section className={`arcade-section-preview ${selectedFact ? 'unlocked' : 'locked'}`} aria-live="polite">
              <header>
                <span>{selectedSectionSummary.label}</span>
                {selectedSectionSummary.unlocked.length > 1 ? (
                  <nav aria-label={`${selectedSectionSummary.label} records`}>
                    {selectedSectionSummary.unlocked.map((fact, index) => (
                      <button type="button" key={fact.id} className={selectedFact?.id === fact.id ? 'active' : ''} onClick={() => selectFact(fact.id)} aria-label={`Open ${fact.title}`}>{index + 1}</button>
                    ))}
                  </nav>
                ) : <b>{selectedSectionSummary.unlocked.length}/{selectedSectionSummary.facts.length}</b>}
              </header>
              {selectedFact ? (
                <article key={selectedFact.id}>
                  <h2>{selectedFact.title}</h2>
                  <div>{[selectedFact.subtitle, selectedFact.period].filter(Boolean).join(' · ')}</div>
                  {selectedFact.description ? <p>{selectedFact.description}</p> : null}
                  {selectedFact.link ? <a href={selectedFact.link} target="_blank" rel="noopener noreferrer">Open record</a> : null}
                </article>
              ) : <div className="arcade-section-empty"><i>{selectedSectionSummary.symbol}</i><strong>{selectedSectionSummary.label}</strong></div>}
            </section>

            <footer className="arcade-story-footer">
              <div><span>{unlockedFacts.length}/{FACTS.length} records discovered</span><button type="button" onClick={() => setCollectionOpen(true)}>View all sections</button></div>
              <i><b style={{ width: `${Math.min(100, unlockedIds.length / FACTS.length * 100)}%` }} /></i>
            </footer>
          </aside>
        </div>
      )}

      {collectionOpen ? (
        <div className="arcade-collection-layer" onPointerDown={() => setCollectionOpen(false)}>
          <section className="arcade-collection-window" onPointerDown={(event) => event.stopPropagation()}>
            <header><div><span>Permanent collection</span><h2>Portfolio sections</h2></div><button type="button" onClick={() => setCollectionOpen(false)} aria-label="Close collection">Close</button></header>
            <div className="arcade-collection-sections">
              {sectionSummaries.map((section) => (
                <section key={section.id}>
                  <header><i>{section.symbol}</i><div><h3>{section.label}</h3><span>{section.unlocked.length}/{section.facts.length} discovered</span></div></header>
                  <div>
                    {section.unlocked.length
                      ? section.unlocked.map((fact, index) => <StoryCard fact={fact} index={index} compact key={fact.id} />)
                      : <div className="arcade-collection-locked"><i>{section.symbol}</i><span>Not discovered</span></div>}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <StyleSwitcher />
    </main>
  )
}
