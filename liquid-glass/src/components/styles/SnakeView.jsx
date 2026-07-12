import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import ArcadeSignalFrontier from '../games/ArcadeSignalFrontier'
import ArcadeMinesweeper from '../games/ArcadeMinesweeper'
import ArcadeSnake from '../games/ArcadeSnake'
import { normalizeArcadeSessionResult, normalizeArcadeUnlocks } from '../../lib/arcadeProgress'
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

function getResultOutcome(result) {
  if (result.game === 'runner') return result.completed ? 'Mission complete' : 'Mission ended'
  if (result.game === 'minesweeper') return result.completed ? 'Field cleared' : 'Mine hit'
  return 'Run complete'
}

function RecordSummary({ fact, isNew = false, showToggle = true }) {
  return (
    <>
      <div>
        <div className="arcade-record-title"><h3>{fact.title}</h3>{isNew ? <b>New</b> : null}</div>
        {fact.subtitle || fact.period ? (
          <div className="arcade-record-meta">
            {fact.subtitle ? <p>{fact.subtitle}</p> : null}
            {fact.period ? <time>{fact.period}</time> : null}
          </div>
        ) : null}
      </div>
      {showToggle ? <i aria-hidden="true" /> : null}
    </>
  )
}

function RecordDisclosure({ fact, defaultOpen = false, className = '', isNew = false }) {
  const hasDetails = Boolean(fact.description || fact.link)

  if (!hasDetails) {
    return (
      <article className={`arcade-record static ${isNew ? 'new' : ''} ${className}`}>
        <div className="arcade-record-static"><RecordSummary fact={fact} isNew={isNew} showToggle={false} /></div>
      </article>
    )
  }

  return (
    <details className={`arcade-record ${isNew ? 'new' : ''} ${className}`} defaultOpen={defaultOpen}>
      <summary><RecordSummary fact={fact} isNew={isNew} /></summary>
      <div className="arcade-record-body">
        {fact.description ? <p>{fact.description}</p> : null}
        {fact.link ? <a href={fact.link} target="_blank" rel="noopener noreferrer">Open original</a> : null}
      </div>
    </details>
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
  const [selectedSection, setSelectedSection] = useState(() => {
    const stored = readStorage(SELECTED_SECTION_KEY)
    if (SECTION_IDS.has(stored)) return stored
    return FACT_BY_ID.get(readStorage(SELECTED_KEY))?.section || SECTION_META[0].id
  })

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds])
  const unlockedFacts = useMemo(() => FACTS.filter(({ id }) => unlockedSet.has(id)), [unlockedSet])
  const sectionSummaries = useMemo(() => SECTION_META.map((section) => {
    const facts = FACTS_BY_SECTION.get(section.id) || []
    const unlocked = facts.filter(({ id }) => unlockedSet.has(id))
    return { ...section, facts, unlocked }
  }), [unlockedSet])

  const selectSection = useCallback((sectionId) => {
    if (!SECTION_IDS.has(sectionId)) return
    setSelectedSection(sectionId)
    writeStorage(SELECTED_SECTION_KEY, sectionId)
  }, [])

  const beginSession = useCallback(() => {
    sessionSeenRef.current = []
    sessionNewRef.current = []
    setSessionResult(null)
    setUnlockEvent(null)
  }, [])

  const saveUnlock = useCallback((fact) => {
    if (!fact) return { fact: null, isNew: false }

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
    const result = normalizeArcadeSessionResult(sessionNewRef.current, sessionSeenRef.current)
    setSessionResult({
      ...summary,
      ...result,
      totalUnlocked: unlockedRef.current.size
    })
  }, [])

  const chooseGame = (gameId) => {
    setActiveGame(gameId)
    setSessionResult(null)
    setUnlockEvent(null)
    writeStorage(ACTIVE_GAME_KEY, gameId)
  }

  const resultNewIds = new Set(sessionResult?.newIds || [])
  const resultRecords = sessionResult?.recordIds
    .map((id) => ({ fact: FACT_BY_ID.get(id), isNew: resultNewIds.has(id) }))
    .filter(({ fact }) => Boolean(fact)) || []
  const resultGroups = SECTION_META.map((section) => ({
    ...section,
    records: resultRecords.filter(({ fact }) => fact.section === section.id)
  })).filter(({ records }) => records.length)
  const newResultCount = resultRecords.filter(({ isNew }) => isNew).length
  const revisitedCount = resultRecords.length - newResultCount

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

        <div className="arcade-record-count"><strong>{unlockedIds.length} / {FACTS.length}</strong><span>records</span></div>
      </header>

      {sessionResult ? (
        <section className="arcade-results">
          <header className="arcade-results-hero">
            <p>{getResultOutcome(sessionResult)}</p>
            <h1>{resultRecords.length
              ? `${resultRecords.length} ${resultRecords.length === 1 ? 'record' : 'records'} reached`
              : 'No record reached'}</h1>
            <div className="arcade-results-summary">
              <span>{GAME_LABELS[sessionResult.game] || 'Arcade'}</span>
              <span>{sessionResult.metricLabel || 'Score'} <strong>{sessionResult.score ?? 0}</strong></span>
              {newResultCount ? <span>New <strong>{newResultCount}</strong></span> : null}
              {revisitedCount > 0 ? <span>Revisited <strong>{revisitedCount}</strong></span> : null}
              <span>Collection <strong>{sessionResult.totalUnlocked}/{FACTS.length}</strong></span>
            </div>
          </header>

          <div className="arcade-results-sections">
            {resultGroups.length ? resultGroups.map((section) => (
              <section className="arcade-result-section" key={section.id}>
                <header><h2>{section.label}</h2></header>
                <div>
                  {section.records.map(({ fact, isNew }) => <RecordDisclosure key={fact.id} fact={fact} isNew={isNew} defaultOpen />)}
                </div>
              </section>
            )) : <div className="arcade-results-empty"><strong>Try one more run</strong><span>Capture a zone, eat an apple, or open eight safe cells.</span></div>}
          </div>

          <footer className="arcade-results-actions">
            <button type="button" className="primary" onClick={() => setSessionResult(null)}>Play again</button>
            <button type="button" onClick={() => setCollectionOpen(true)}>All records</button>
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
              <h1>{profile.name}</h1>
              <p>{profile.title}</p>
            </header>

            <div className="arcade-section-browser" aria-label="Portfolio sections">
              {sectionSummaries.map((section) => (
                <section key={section.id} className={`${selectedSection === section.id ? 'active' : ''} ${unlockEvent?.fact.section === section.id ? 'recent' : ''}`}>
                  <button type="button" onClick={() => selectSection(section.id)} aria-expanded={selectedSection === section.id}>
                    <strong>{section.label}</strong>
                    <span>{section.unlocked.length} / {section.facts.length}</span>
                    <i aria-hidden="true" />
                  </button>
                  {selectedSection === section.id ? (
                    <div className="arcade-section-records">
                      {section.unlocked.length
                        ? section.unlocked.map((fact, index) => <RecordDisclosure fact={fact} key={fact.id} className="sidebar" isNew={unlockEvent?.isNew && fact.id === unlockEvent.fact.id} defaultOpen={unlockEvent?.fact.section === section.id ? fact.id === unlockEvent.fact.id : index === 0} />)
                        : <p className="arcade-section-empty">No record discovered yet.</p>}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>

            <footer className="arcade-story-footer">
              <span>{unlockedFacts.length} of {FACTS.length} records discovered</span>
              <button type="button" onClick={() => setCollectionOpen(true)}>Open all records</button>
            </footer>
          </aside>
        </div>
      )}

      {collectionOpen ? (
        <div className="arcade-collection-layer" onPointerDown={() => setCollectionOpen(false)}>
          <section className="arcade-collection-window" onPointerDown={(event) => event.stopPropagation()}>
            <header><h2>Discovered records</h2><button type="button" onClick={() => setCollectionOpen(false)} aria-label="Close collection">Close</button></header>
            <div className="arcade-collection-sections">
              {sectionSummaries.map((section) => (
                <section key={section.id}>
                  <header><h3>{section.label}</h3><span>{section.unlocked.length} / {section.facts.length}</span></header>
                  <div>
                    {section.unlocked.length
                      ? section.unlocked.map((fact, index) => <RecordDisclosure fact={fact} key={fact.id} isNew={unlockEvent?.isNew && fact.id === unlockEvent.fact.id} defaultOpen={index === 0} />)
                      : <p className="arcade-collection-locked">No record discovered yet.</p>}
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
