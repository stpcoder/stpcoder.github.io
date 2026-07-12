import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import { getRealityJourneyState, normalizeRealityStoryIndex } from '../../lib/realityLab'
import siliconSketch from '../../assets/reality-lab/silicon-sketch.webp'
import siliconReal from '../../assets/reality-lab/silicon-real.webp'
import intelligenceSketch from '../../assets/reality-lab/intelligence-sketch.webp'
import intelligenceReal from '../../assets/reality-lab/intelligence-real.webp'
import heritageSketch from '../../assets/reality-lab/heritage-sketch.webp'
import heritageReal from '../../assets/reality-lab/heritage-real.webp'
import realityRoom from '../../assets/reality-lab/reality-room.webp'
import './RealityLabView.css'

const ALL_RECORDS = SECTION_META.flatMap(({ id }) => getSectionItems(id, true))

function findRecord(section, pattern) {
  return ALL_RECORDS.find((item) => item.section === section && pattern.test(item.title))
}

const STORIES = [
  {
    id: 'silicon',
    number: '01',
    noun: 'Silicon',
    eyebrow: 'SYSTEMS / CURRENT',
    title: 'Engineer the invisible.',
    question: 'How do you make memory trustworthy at scale?',
    direction: 'Turn device behavior into evidence, then turn evidence into a decision.',
    accent: '#36d8cf',
    sketch: siliconSketch,
    real: siliconReal,
    records: [
      findRecord('experience', /^SK hynix$/i),
      findRecord('education', /POSTECH/i),
      findRecord('scholarships', /Presidential Science/i),
    ].filter(Boolean),
  },
  {
    id: 'intelligence',
    number: '02',
    noun: 'Intelligence',
    eyebrow: 'AI / ENTREPRENEURSHIP',
    title: 'Find the unsolved edge.',
    question: 'What becomes possible when AI meets the problems others overlook?',
    direction: 'Prototype quickly, test in public, and keep the useful parts real.',
    accent: '#2865ff',
    sketch: intelligenceSketch,
    real: intelligenceReal,
    records: [
      findRecord('awards', /AI TOP 100 Grand Prize/i),
      findRecord('awards', /Challenge K-Startup/i),
      findRecord('projects', /Memento Land/i),
      findRecord('media', /Kakao Impact/i),
    ].filter(Boolean),
  },
  {
    id: 'heritage',
    number: '03',
    noun: 'Heritage',
    eyebrow: 'CULTURE / RESEARCH',
    title: 'Move forward without erasing the past.',
    question: 'Can frontier models help old knowledge survive?',
    direction: 'Treat culture as living data: study it carefully, then restore with restraint.',
    accent: '#e16d47',
    sketch: heritageSketch,
    real: heritageReal,
    records: [
      findRecord('projects', /Heritage Science/i),
      findRecord('awards', /MuEunJae/i),
      findRecord('media', /POSTECH Times/i),
      findRecord('media', /Nobel Week/i),
    ].filter(Boolean),
  },
]

const JOURNEY_STEPS = [
  {
    id: 'question',
    number: '01',
    label: 'Question',
    title: 'Start before the answer is obvious.',
    description: 'The sketch is not decoration. It is the first test of a question worth pursuing.',
  },
  {
    id: 'build',
    number: '02',
    label: 'Build',
    title: 'Give the question a working shape.',
    description: 'Code, models, and systems turn a loose hypothesis into something that can push back.',
  },
  {
    id: 'iterate',
    number: '03',
    label: 'Iterate',
    title: 'One answer is never the whole search.',
    description: 'Research, startups, hackathons, and field work become variations in the same long experiment.',
  },
  {
    id: 'reality',
    number: '04',
    label: 'Reality',
    title: 'Ship the lesson into the real world.',
    description: 'Today that journey continues in DRAM AE at SK hynix, where invisible behavior has physical consequences.',
  },
]

function StoryImage({ story, priority = false, className = '' }) {
  return (
    <div className={`reality-story-image ${className}`} style={{ '--story-accent': story.accent }}>
      <img
        className="reality-story-sketch"
        src={story.sketch}
        alt={`${story.noun} concept sketch`}
        width="1344"
        height="768"
        fetchPriority={priority ? 'high' : 'auto'}
      />
      <div className="reality-story-real-wrap">
        <img
          className="reality-story-real"
          src={story.real}
          alt={`${story.noun} realized concept`}
          width="1344"
          height="768"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </div>
      <div className="reality-reveal-line" aria-hidden="true"><i /></div>
      <span className="reality-corner is-nw" aria-hidden="true" />
      <span className="reality-corner is-ne" aria-hidden="true" />
      <span className="reality-corner is-sw" aria-hidden="true" />
      <span className="reality-corner is-se" aria-hidden="true" />
    </div>
  )
}

function RecordCard({ item, onOpen }) {
  if (!item) return null

  return (
    <button
      type="button"
      className="reality-record-card"
      onClick={() => onOpen(item)}
    >
      <span>{SECTION_META.find(({ id }) => id === item.section)?.shortLabel}</span>
      <strong>{item.title}</strong>
      <small>{[item.subtitle, item.period].filter(Boolean).join(' / ')}</small>
      <i aria-hidden="true">↗</i>
    </button>
  )
}

export default function RealityLabView() {
  const scrollerRef = useRef(null)
  const heroVisualRef = useRef(null)
  const journeyRef = useRef(null)
  const journeyStageRef = useRef(null)
  const revealFrameRef = useRef(0)
  const scrollFrameRef = useRef(0)
  const activeStepRef = useRef(0)
  const returnFocusRef = useRef(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const [rangeReveal, setRangeReveal] = useState(52)
  const [activeStep, setActiveStep] = useState(0)
  const [activeSection, setActiveSection] = useState('experience')
  const [selectedRecord, setSelectedRecord] = useState(null)

  const story = STORIES[storyIndex]
  const sectionItems = useMemo(() => getSectionItems(activeSection, false), [activeSection])

  const openRecord = useCallback((record) => {
    returnFocusRef.current = document.activeElement
    setSelectedRecord(record)
  }, [])

  const closeRecord = useCallback(() => {
    setSelectedRecord(null)
    window.requestAnimationFrame(() => returnFocusRef.current?.focus?.())
  }, [])

  const setReveal = useCallback((value) => {
    const next = Math.max(4, Math.min(96, value))
    window.cancelAnimationFrame(revealFrameRef.current)
    revealFrameRef.current = window.requestAnimationFrame(() => {
      heroVisualRef.current?.style.setProperty('--reveal', `${next}%`)
    })
  }, [])

  const selectStory = useCallback((nextIndex) => {
    const normalized = normalizeRealityStoryIndex(nextIndex, STORIES.length)
    setStoryIndex(normalized)
    setRangeReveal(52)
    setReveal(52)
  }, [setReveal])

  const updateRevealFromPointer = useCallback((event) => {
    if (event.pointerType === 'touch') return
    const rect = heroVisualRef.current?.getBoundingClientRect()
    if (!rect) return
    setReveal(((event.clientX - rect.left) / rect.width) * 100)
  }, [setReveal])

  const jumpToStep = useCallback((index) => {
    const scroller = scrollerRef.current
    const journey = journeyRef.current
    if (!scroller || !journey) return
    const travel = Math.max(0, journey.scrollHeight - scroller.clientHeight)
    const progress = index === 0 ? 0 : index / 4 + 0.015
    scroller.scrollTo({
      top: journey.offsetTop + travel * progress,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    const journey = journeyRef.current
    const stage = journeyStageRef.current
    if (!scroller || !journey || !stage) return undefined

    const updateJourney = () => {
      scrollFrameRef.current = 0
      const travel = Math.max(1, journey.scrollHeight - scroller.clientHeight)
      const journeyState = getRealityJourneyState((scroller.scrollTop - journey.offsetTop) / travel)
      const { progress, index: nextStep, localProgress } = journeyState
      stage.style.setProperty('--journey-progress', progress.toFixed(4))
      stage.style.setProperty('--step-progress', localProgress.toFixed(4))
      stage.style.setProperty('--step-reveal', `${Math.round(localProgress * 100)}%`)
      if (activeStepRef.current !== nextStep) {
        activeStepRef.current = nextStep
        setActiveStep(nextStep)
      }
    }

    const scheduleJourneyUpdate = () => {
      if (scrollFrameRef.current) return
      scrollFrameRef.current = window.requestAnimationFrame(updateJourney)
    }

    updateJourney()
    scroller.addEventListener('scroll', scheduleJourneyUpdate, { passive: true })
    window.addEventListener('resize', scheduleJourneyUpdate, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', scheduleJourneyUpdate)
      window.removeEventListener('resize', scheduleJourneyUpdate)
      window.cancelAnimationFrame(scrollFrameRef.current)
    }
  }, [])

  useEffect(() => {
    if (!selectedRecord) return undefined
    const close = (event) => {
      if (event.key === 'Escape') closeRecord()
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [closeRecord, selectedRecord])

  useEffect(() => {
    if (navigator.connection?.saveData) return undefined

    const preload = () => {
      STORIES.slice(1).flatMap(({ sketch, real }) => [sketch, real]).forEach((source) => {
        const image = new Image()
        image.decoding = 'async'
        image.src = source
      })
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 2500 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timer = window.setTimeout(preload, 900)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => () => {
    window.cancelAnimationFrame(revealFrameRef.current)
    window.cancelAnimationFrame(scrollFrameRef.current)
  }, [])

  return (
    <main className="reality-lab" ref={scrollerRef}>
      <header className="reality-nav">
        <a href="#reality-top" className="reality-wordmark" aria-label="Taeho Je, top">T/J</a>
        <nav aria-label="Reality Lab sections">
          <a href="#process">Process</a>
          <a href="#proof">Proof</a>
          <a href={`mailto:${profile.email}`}>Contact</a>
        </nav>
        <span>PORTFOLIO / 2026</span>
      </header>

      <section className="reality-hero" id="reality-top">
        <div className="reality-paper-grid" aria-hidden="true" />
        <div className="reality-hero-title" aria-hidden="true">
          <span className="is-script">ideas</span>
          <strong>MAKE IT</strong>
          <strong>MATTER</strong>
        </div>

        <div className="reality-hero-stage">
          <div className="reality-hero-meta">
            <span>{story.eyebrow}</span>
            <span>{story.number} / {String(STORIES.length).padStart(2, '0')}</span>
          </div>

          <div
            className="reality-hero-visual"
            ref={heroVisualRef}
            onPointerMove={updateRevealFromPointer}
            onPointerLeave={() => setReveal(rangeReveal)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') selectStory(storyIndex - 1)
              if (event.key === 'ArrowRight') selectStory(storyIndex + 1)
            }}
            tabIndex={0}
            role="group"
            aria-label={`${story.noun}: move the pointer to reveal sketch and realized states; use left and right arrow keys to change story`}
          >
            <StoryImage key={story.id} story={story} priority />
            <div className="reality-prompt-chip">
              <span>Turning {story.noun.toLowerCase()} into evidence...</span>
              <i aria-hidden="true">→</i>
            </div>
          </div>

          <div className="reality-hero-controls">
            <button type="button" onClick={() => selectStory(storyIndex - 1)} aria-label="Previous story">←</button>
            <div className="reality-story-tabs" role="group" aria-label="Portfolio stories">
              {STORIES.map((entry, index) => (
                <button
                  type="button"
                  aria-pressed={storyIndex === index}
                  className={storyIndex === index ? 'active' : ''}
                  key={entry.id}
                  onClick={() => selectStory(index)}
                >
                  <span>{entry.number}</span>{entry.noun}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => selectStory(storyIndex + 1)} aria-label="Next story">→</button>
          </div>

          <label className="reality-mobile-reveal">
            <span>Sketch</span>
            <input
              type="range"
              min="4"
              max="96"
              value={rangeReveal}
              onChange={(event) => {
                const value = Number(event.target.value)
                setRangeReveal(value)
                setReveal(value)
              }}
              aria-label="Reveal realized image"
            />
            <span>Real</span>
          </label>

          <div className="reality-hero-copy">
            <p>{story.question}</p>
            <strong>{story.title}</strong>
            <button type="button" onClick={() => jumpToStep(0)}>Follow the process <span aria-hidden="true">↓</span></button>
          </div>
        </div>
      </section>

      <section className="reality-journey" id="process" ref={journeyRef}>
        <div
          className="reality-journey-stage"
          ref={journeyStageRef}
          data-step={JOURNEY_STEPS[activeStep].id}
          style={{ '--story-accent': story.accent }}
        >
          <div className="reality-journey-grid" aria-hidden="true" />
          <div className="reality-journey-progress" role="group" aria-label="Process steps">
            {JOURNEY_STEPS.map((step, index) => (
              <button
                type="button"
                aria-pressed={activeStep === index}
                className={activeStep === index ? 'active' : ''}
                key={step.id}
                onClick={() => jumpToStep(index)}
              >
                <span>{step.number}</span><strong>{step.label}</strong><i />
              </button>
            ))}
          </div>

          <aside className="reality-layers-panel" aria-label="Selected story records">
            <header><strong>Layers</strong><span>+</span></header>
            {story.records.map((record, index) => (
              <button type="button" key={record.id} onClick={() => openRecord(record)}>
                <i style={{ '--layer-color': index === 0 ? story.accent : '#d4d0c5' }} />
                <span><strong>{record.title}</strong><small>{record.period || record.section}</small></span>
                <em>{index === 0 ? '100%' : '72%'}</em>
              </button>
            ))}
          </aside>

          <div className="reality-journey-canvas">
            <div className="reality-stage-copy" key={JOURNEY_STEPS[activeStep].id} aria-live="polite">
              <span>{JOURNEY_STEPS[activeStep].number} / {JOURNEY_STEPS[activeStep].label}</span>
              <h2>{JOURNEY_STEPS[activeStep].title}</h2>
              <p>{JOURNEY_STEPS[activeStep].description}</p>
            </div>

            <div className="reality-process-visual is-sketch">
              <img src={story.sketch} alt="" width="1344" height="768" />
              <span className="reality-process-annotation is-one">first principles</span>
              <span className="reality-process-annotation is-two">what if?</span>
            </div>

            <div className="reality-process-visual is-build">
              <img src={story.sketch} alt="" width="1344" height="768" />
              <div><img src={story.real} alt="" width="1344" height="768" /></div>
              <i aria-hidden="true" />
            </div>

            <div className="reality-iteration-wall" aria-label="Portfolio iterations">
              {STORIES.flatMap((entry) => [
                { id: `${entry.id}-sketch`, src: entry.sketch, label: `${entry.noun} sketch` },
                { id: `${entry.id}-real`, src: entry.real, label: `${entry.noun} realized` },
              ]).map((asset, index) => (
                <figure key={asset.id} style={{ '--tile-index': index }}>
                  <img src={asset.src} alt={asset.label} width="1344" height="768" loading="lazy" />
                  <figcaption>{String(index + 1).padStart(2, '0')} / {asset.label}</figcaption>
                </figure>
              ))}
            </div>

            <div className="reality-room-scene">
              <img src={realityRoom} alt="Engineering studio combining memory, AI, and heritage science" width="1344" height="768" loading="lazy" />
              <div>
                <span>NOW / 2026</span>
                <strong>DRAM AE<br />@ SK hynix</strong>
                <p>From unexplored questions to systems that have to work.</p>
              </div>
            </div>
          </div>

          <aside className="reality-direction-panel">
            <header><strong>Direction</strong><span>•••</span></header>
            <div>
              <small>ACTIVE QUESTION</small>
              <p>{story.question}</p>
            </div>
            <nav>
              <button type="button" className="active" onClick={() => selectStory(storyIndex + 1)}>Change story</button>
              <button type="button" onClick={() => jumpToStep(1)}>Build</button>
              <button type="button" onClick={() => jumpToStep(2)}>Explore</button>
            </nav>
            <footer><span>Mode</span><strong>{JOURNEY_STEPS[activeStep].label}</strong><i /></footer>
          </aside>
        </div>
      </section>

      <section className="reality-proof" id="proof">
        <header className="reality-proof-heading">
          <span>THE OUTPUT IS NOT THE END.</span>
          <h2>The work<br /><i>is the proof.</i></h2>
          <p>{profile.about}</p>
        </header>

        <div className="reality-proof-tabs" role="group" aria-label="Portfolio sections">
          {SECTION_META.map((section) => (
            <button
              type="button"
              aria-pressed={activeSection === section.id}
              className={activeSection === section.id ? 'active' : ''}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.symbol}</span>{section.label}
            </button>
          ))}
        </div>

        <div className="reality-proof-grid">
          {sectionItems.map((item) => <RecordCard key={item.id} item={item} onOpen={openRecord} />)}
        </div>
      </section>

      <footer className="reality-footer">
        <div><span>TAEHO JE</span><strong>Keep making<br />questions tangible.</strong></div>
        <nav>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href={`mailto:${profile.email}`}>Email ↗</a>
        </nav>
        <small>{profile.location} / 2026</small>
      </footer>

      {selectedRecord ? (
        <div className="reality-record-dialog-layer" role="presentation" onPointerDown={closeRecord}>
          <section
            className="reality-record-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reality-record-title"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <header>
              <span>{SECTION_META.find(({ id }) => id === selectedRecord.section)?.label}</span>
              <button type="button" onClick={closeRecord} aria-label="Close record" autoFocus>×</button>
            </header>
            <h2 id="reality-record-title">{selectedRecord.title}</h2>
            <h3>{selectedRecord.subtitle}</h3>
            <time>{selectedRecord.period || 'Ongoing'}</time>
            {selectedRecord.description ? <p>{selectedRecord.description}</p> : null}
            {selectedRecord.link ? <a href={selectedRecord.link} target="_blank" rel="noopener noreferrer">Open original <span aria-hidden="true">↗</span></a> : null}
          </section>
        </div>
      ) : null}

      <StyleSwitcher />
    </main>
  )
}
