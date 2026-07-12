import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import ArcadeSignalFrontier from '../games/ArcadeSignalFrontier'
import ArcadeMinesweeper from '../games/ArcadeMinesweeper'
import ArcadeSnake from '../games/ArcadeSnake'
import { normalizeArcadeSessionResult, normalizeArcadeUnlocks } from '../../lib/arcadeProgress'
import { getAllItems, SECTION_META } from '../../lib/profileData'
import './SnakeView.css'

const UNLOCKS_KEY = 'portfolio-arcade-unlocked-v1'
const SELECTED_KEY = 'portfolio-arcade-selected-v1'
const SELECTED_SECTION_KEY = 'portfolio-arcade-section-v1'
const ACTIVE_GAME_KEY = 'portfolio-arcade-game-v1'
const TUTORIAL_KEY = 'portfolio-arcade-journey-seen-v1'
const LEGACY_BEST_KEY = 'portfolio-snake-best-score'
const LEGACY_PROFILE_FACT_ID = 'profile-intro'
const GAMES = new Set(['snake', 'runner', 'minesweeper'])
const GAME_LABELS = { snake: 'Snake', runner: 'Signal Frontier', minesweeper: 'Mines' }
const DISCOVERY_GUIDES = [
  { id: 'runner', name: 'Frontier', action: '1 zone' },
  { id: 'snake', name: 'Snake', action: '1 apple' },
  { id: 'minesweeper', name: 'Mines', action: '8 cells' }
]

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
  const [journeyOpen, setJourneyOpen] = useState(() => readStorage(TUTORIAL_KEY) !== 'seen')
  const [selectedSection, setSelectedSection] = useState(() => {
    const stored = readStorage(SELECTED_SECTION_KEY)
    if (SECTION_IDS.has(stored)) return stored
    return FACT_BY_ID.get(readStorage(SELECTED_KEY))?.section || SECTION_META[0].id
  })

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds])
  const sectionSummaries = useMemo(() => SECTION_META.map((section) => {
    const facts = FACTS_BY_SECTION.get(section.id) || []
    const unlocked = facts.filter(({ id }) => unlockedSet.has(id))
    return { ...section, facts, unlocked }
  }), [unlockedSet])

  const selectSection = useCallback((sectionId) => {
    if (!sectionId) {
      setSelectedSection('')
      return
    }
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
    const next = FACTS.find(({ id }) => !unlockedRef.current.has(id))
      || FACTS[Math.max(0, scoreIndex) % FACTS.length]
    return saveUnlock(next)
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
    setJourneyOpen(false)
    writeStorage(ACTIVE_GAME_KEY, gameId)
    writeStorage(TUTORIAL_KEY, 'seen')
  }

  const closeJourney = useCallback(() => {
    setJourneyOpen(false)
    writeStorage(TUTORIAL_KEY, 'seen')
  }, [])

  const resultNewIds = new Set(sessionResult?.newIds || [])
  const resultRecords = sessionResult?.recordIds
    .map((id) => ({ fact: FACT_BY_ID.get(id), isNew: resultNewIds.has(id) }))
    .filter(({ fact }) => Boolean(fact)) || []
  const resultGroups = SECTION_META.map((section) => ({
    ...section,
    records: resultRecords.slice(1).filter(({ fact }) => fact.section === section.id)
  })).filter(({ records }) => records.length)
  const primaryResult = resultRecords[0] || null
  const nextFact = FACTS.find(({ id }) => !unlockedSet.has(id)) || null
  const nextSection = SECTION_META.find(({ id }) => id === nextFact?.section)
  const recommendedGuide = DISCOVERY_GUIDES[unlockedIds.length % DISCOVERY_GUIDES.length]

  useEffect(() => {
    if (!journeyOpen) return undefined
    const close = (event) => { if (event.key === 'Escape') closeJourney() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [closeJourney, journeyOpen])

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

        <button type="button" className="arcade-journey-button" onClick={() => setJourneyOpen(true)} aria-label="Open Taeho journey roadmap">
          <strong>Journey</strong><span>{unlockedIds.length}/{FACTS.length}</span>
        </button>
      </header>

      {sessionResult ? (
        <section className="arcade-results">
          <header className="arcade-results-hero">
            {primaryResult ? (
              <>
                <p>{SECTION_META.find(({ id }) => id === primaryResult.fact.section)?.label}</p>
                <div className="arcade-result-title"><h1>{primaryResult.fact.title}</h1>{primaryResult.isNew ? <b>New</b> : null}</div>
                {primaryResult.fact.subtitle ? <h2>{primaryResult.fact.subtitle}</h2> : null}
                {primaryResult.fact.period ? <time>{primaryResult.fact.period}</time> : null}
                {primaryResult.fact.description ? <div className="arcade-result-copy"><p>{primaryResult.fact.description}</p></div> : null}
                {primaryResult.fact.link ? <a href={primaryResult.fact.link} target="_blank" rel="noopener noreferrer">Open original</a> : null}
              </>
            ) : <h1>No record unlocked.</h1>}
          </header>

          <div className="arcade-results-sections">
            {resultGroups.map((section) => (
              <section className="arcade-result-section" key={section.id}>
                <header><h2>{section.label}</h2></header>
                <div>
                  {section.records.map(({ fact, isNew }) => <RecordDisclosure key={fact.id} fact={fact} isNew={isNew} defaultOpen />)}
                </div>
              </section>
            ))}
          </div>

          <footer className="arcade-results-actions">
            <button type="button" className="primary" onClick={() => setSessionResult(null)}>Keep exploring</button>
            <button type="button" onClick={() => setJourneyOpen(true)}>Open roadmap</button>
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
        </div>
      )}

      {journeyOpen ? (
        <div className="arcade-journey-layer" onPointerDown={closeJourney}>
          <section
            className="arcade-journey-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="arcade-journey-title"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <header className="arcade-journey-header">
              <h2 id="arcade-journey-title">Journey</h2>
              <strong className="arcade-journey-progress" aria-label={`${unlockedIds.length} of ${FACTS.length} records discovered`}>{unlockedIds.length}/{FACTS.length}</strong>
              <button type="button" onClick={closeJourney} aria-label="Close journey roadmap">Close</button>
            </header>

            <div className="arcade-journey-content">
              <section className="arcade-journey-intro">
                <div className="arcade-journey-next">
                  <span>Check this out</span>
                  <h3>{nextSection?.label || 'Complete'}</h3>
                </div>

                <div className="arcade-journey-guide" aria-label="Ways to discover records">
                  {DISCOVERY_GUIDES.map((guide) => (
                    <button
                      type="button"
                      key={guide.id}
                      className={guide.id === recommendedGuide.id ? 'recommended' : ''}
                      onClick={() => chooseGame(guide.id)}
                    >
                      <strong>{guide.name}</strong>
                      <span>{guide.action}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="arcade-roadmap" aria-label="Taeho journey chapters">
                {sectionSummaries.map((section) => {
                  const active = selectedSection === section.id
                  const recent = unlockEvent?.fact?.section === section.id
                  return (
                    <section className={`${active ? 'active' : ''} ${recent ? 'recent' : ''}`} key={section.id}>
                      <button
                        type="button"
                        aria-expanded={active}
                        onClick={() => selectSection(active ? '' : section.id)}
                      >
                        <b>{section.symbol}</b>
                        <strong>{section.label}</strong>
                        <span>{section.unlocked.length}/{section.facts.length}</span>
                        <i aria-hidden="true" />
                      </button>
                      {active ? (
                        <div className="arcade-section-records">
                          {section.unlocked.length
                            ? section.unlocked.map((fact, index) => (
                              <RecordDisclosure
                                fact={fact}
                                key={fact.id}
                                isNew={unlockEvent?.isNew && fact.id === unlockEvent.fact.id}
                                defaultOpen={index === 0}
                              />
                            ))
                            : <p className="arcade-section-empty">Play a game to discover this chapter.</p>}
                        </div>
                      ) : null}
                    </section>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <StyleSwitcher />
    </main>
  )
}
