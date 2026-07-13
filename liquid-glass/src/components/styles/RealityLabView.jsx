import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import { getRealityJourneyState, normalizeRealityStoryIndex } from '../../lib/realityLab'
import memorySketch from '../../assets/reality-lab/memory-sketch.webp'
import memoryReal from '../../assets/reality-lab/memory-real.webp'
import memoryScene from '../../assets/reality-lab/memory-scene.webp'
import mementoSketch from '../../assets/reality-lab/memento-sketch.webp'
import mementoReal from '../../assets/reality-lab/memento-real.webp'
import mementoScene from '../../assets/reality-lab/memento-scene.webp'
import heritageSketch from '../../assets/reality-lab/heritage-sketch.webp'
import heritageReal from '../../assets/reality-lab/heritage-real.webp'
import heritageScene from '../../assets/reality-lab/heritage-scene.webp'
import './RealityLabView.css'

const ALL_RECORDS = SECTION_META.flatMap(({ id }) => getSectionItems(id, true))

function findRecord(section, pattern) {
  return ALL_RECORDS.find((item) => item.section === section && pattern.test(item.title))
}

const STORIES = [
  {
    id: 'memory',
    number: '01',
    noun: 'Memory Device',
    shortName: 'Memory',
    eyebrow: 'DRAM AE / CURRENT',
    title: 'Make the invisible dependable.',
    question: 'What does memory engineering become when it reaches a real device?',
    direction: 'Trace device behavior, build evidence, and make the memory inside everyday products trustworthy.',
    accent: '#36d8cf',
    sketch: memorySketch,
    real: memoryReal,
    scene: memoryScene,
    objectLabel: 'DRAM package → mobile device',
    annotations: ['inside the device', 'signal / package'],
    contextKicker: 'CURRENT ROLE / 2026',
    contextTitle: 'DRAM, inside the device.',
    contextDescription: "A generic mobile validation scene visualizes the downstream context of Taeho's current DRAM AE work - not phone design or a proprietary product.",
    journey: {
      sketch: ['Start with what is hidden.', 'The first drawing makes an invisible dependency visible: memory behavior inside a complete device.'],
      resolve: ['The package belongs in a system.', 'The sketch resolves into a generic engineering phone, keeping the DRAM package in its real downstream context.'],
      evidence: ['Reliability is a body of evidence.', 'Current engineering work, a POSTECH foundation, and sustained scholarship support the object with verifiable records.'],
      context: ['A small component has a visible consequence.', 'The device arrives at a memory-validation bench where signals, thermal behavior, and decisions meet.'],
    },
    records: [
      findRecord('experience', /^SK hynix$/i),
      findRecord('education', /POSTECH/i),
      findRecord('scholarships', /Presidential Science/i),
    ].filter(Boolean),
  },
  {
    id: 'memento',
    number: '02',
    noun: 'Memento',
    shortName: 'Memento',
    eyebrow: 'GENERATIVE AI / PRODUCT',
    title: 'Make a memory tangible.',
    question: 'Can a travel photograph become something you can keep and hold?',
    direction: 'Begin with an ordinary photo, give it spatial form, then return it to a personal place.',
    accent: '#2865ff',
    sketch: mementoSketch,
    real: mementoReal,
    scene: mementoScene,
    objectLabel: 'Travel photo → 3D collectible',
    annotations: ['photo input', 'kept in 3D'],
    contextKicker: 'MEMENTO LAND / 2025',
    contextTitle: 'A memory you can hold.',
    contextDescription: 'Memento Land turns a travel photograph into a miniature collectible, moving an AI result off the screen and into a lived-in space.',
    journey: {
      sketch: ['Start with a moment worth keeping.', 'A flat snapshot bends upward in the first sketch, testing how a remembered place might gain physical depth.'],
      resolve: ['The photograph becomes an object.', 'The selected sketch resolves into the core Memento Land idea: a travel image transformed into a miniature collectible.'],
      evidence: ['A prototype earns its story in public.', 'Memento Land sits beside AI_TOP_100, Kakao Impact, and startup evidence rather than an abstract AI symbol.'],
      context: ['The output returns to everyday life.', 'The miniature reaches a shelf beside its source photograph—the digital memory now has a place to live.'],
    },
    records: [
      findRecord('projects', /Memento Land/i),
      findRecord('awards', /AI TOP 100 Grand Prize/i),
      findRecord('media', /Kakao Impact/i),
      findRecord('awards', /Challenge K-Startup/i),
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
    scene: heritageScene,
    shortName: 'Heritage',
    objectLabel: 'Damaged painting → conserved panel',
    annotations: ['scan the loss', 'restore with restraint'],
    contextKicker: 'HERITAGE SCIENCE / CURRENT',
    contextTitle: 'Restore without erasing.',
    contextDescription: 'The conserved panel moves into a believable digitization lab, connecting restoration research to the public memory it is meant to preserve.',
    journey: {
      sketch: ['See the loss before changing it.', 'The first concept records fragile fibers, missing passages, and the scanning path rather than inventing a new image.'],
      resolve: ['Intervention becomes restrained and physical.', 'The drawing resolves into a conservation panel where material, glass, scan light, and repair can coexist.'],
      evidence: ['Preservation is accountable work.', "Heritage Science research, the MuEunJae Award, and public media anchor the visual in Taeho's actual record."],
      context: ['The work returns to public memory.', 'The conserved panel reaches a restoration and digitization environment with a museum destination beyond it.'],
    },
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
    id: 'sketch',
    number: '01',
    label: 'Sketch',
  },
  {
    id: 'resolve',
    number: '02',
    label: 'Resolve',
  },
  {
    id: 'evidence',
    number: '03',
    label: 'Evidence',
  },
  {
    id: 'context',
    number: '04',
    label: 'In context',
  },
]

function StoryImage({ story, priority = false }) {
  return (
    <div className="reality-story-image" style={{ '--story-accent': story.accent }}>
      <img
        className="reality-story-sketch"
        src={story.sketch}
        alt=""
        width="1344"
        height="768"
        fetchPriority={priority ? 'high' : 'auto'}
      />
      <div className="reality-story-real-wrap">
        <img
          className="reality-story-real"
          src={story.real}
          alt=""
          width="1344"
          height="768"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </div>
      <div className="reality-reveal-line" aria-hidden="true"><i /></div>
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
  const storyCardRefs = useRef([])
  const journeyRef = useRef(null)
  const journeyStageRef = useRef(null)
  const revealFrameRef = useRef(0)
  const pendingRevealRef = useRef(null)
  const scrollFrameRef = useRef(0)
  const activeStepRef = useRef(0)
  const returnFocusRef = useRef(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const [rangeReveal, setRangeReveal] = useState(4)
  const [activeStep, setActiveStep] = useState(0)
  const [activeSection, setActiveSection] = useState('experience')
  const [selectedRecord, setSelectedRecord] = useState(null)

  const story = STORIES[storyIndex]
  const activeJourneyStep = JOURNEY_STEPS[activeStep]
  const [stageTitle, stageDescription] = story.journey[activeJourneyStep.id]
  const sectionItems = useMemo(() => getSectionItems(activeSection, false), [activeSection])

  const openRecord = useCallback((record) => {
    returnFocusRef.current = document.activeElement
    setSelectedRecord(record)
  }, [])

  const closeRecord = useCallback(() => {
    setSelectedRecord(null)
    window.requestAnimationFrame(() => returnFocusRef.current?.focus?.())
  }, [])

  const setReveal = useCallback((element, value) => {
    const next = Math.max(4, Math.min(96, value))
    pendingRevealRef.current = { element, next }
    if (revealFrameRef.current) return
    revealFrameRef.current = window.requestAnimationFrame(() => {
      revealFrameRef.current = 0
      const pending = pendingRevealRef.current
      pending?.element?.style.setProperty('--reveal', `${pending.next}%`)
    })
  }, [])

  const selectStory = useCallback((nextIndex) => {
    const normalized = normalizeRealityStoryIndex(nextIndex, STORIES.length)
    setStoryIndex(normalized)
    setRangeReveal(4)
    storyCardRefs.current.forEach((card) => card?.style.setProperty('--reveal', '4%'))
  }, [])

  const updateCardRevealFromPointer = useCallback((event) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect) return
    setReveal(event.currentTarget, ((event.clientX - rect.left) / rect.width) * 100)
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
      stage.style.setProperty('--scene-scale', (1.06 - localProgress * .06).toFixed(4))
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
      STORIES.slice(1).flatMap(({ sketch, real, scene }) => [sketch, real, scene]).forEach((source) => {
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
            className="reality-object-carousel"
            style={{ '--story-accent': story.accent }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') {
                event.preventDefault()
                const nextIndex = normalizeRealityStoryIndex(storyIndex - 1, STORIES.length)
                selectStory(nextIndex)
                window.requestAnimationFrame(() => storyCardRefs.current[nextIndex]?.focus({ preventScroll: true }))
              }
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                const nextIndex = normalizeRealityStoryIndex(storyIndex + 1, STORIES.length)
                selectStory(nextIndex)
                window.requestAnimationFrame(() => storyCardRefs.current[nextIndex]?.focus({ preventScroll: true }))
              }
            }}
            role="group"
            aria-label="Choose a Taeho story. Hover over a sketch to reveal its realized object."
          >
            {STORIES.map((entry, index) => {
              const previousIndex = normalizeRealityStoryIndex(storyIndex - 1, STORIES.length)
              const slot = index === storyIndex ? 0 : index === previousIndex ? -1 : 1
              return (
                <button
                  type="button"
                  ref={(element) => { storyCardRefs.current[index] = element }}
                  className={`reality-object-card ${slot === 0 ? 'is-active' : slot < 0 ? 'is-left' : 'is-right'}`}
                  style={{ '--card-accent': entry.accent }}
                  aria-pressed={index === storyIndex}
                  aria-label={`${entry.noun}: ${entry.objectLabel}. Hover or drag to reveal, click to select.`}
                  key={entry.id}
                  onClick={() => selectStory(index)}
                  onPointerMove={updateCardRevealFromPointer}
                  onPointerLeave={(event) => setReveal(event.currentTarget, index === storyIndex ? rangeReveal : 4)}
                  onFocus={(event) => setReveal(event.currentTarget, 58)}
                  onBlur={(event) => setReveal(event.currentTarget, index === storyIndex ? rangeReveal : 4)}
                >
                  <StoryImage story={entry} priority={index === 0} />
                  <span className="reality-object-label">
                    <small>{entry.number}</small>
                    <strong>{entry.shortName}</strong>
                    <em>{entry.objectLabel}</em>
                  </span>
                </button>
              )
            })}
            <div className="reality-prompt-chip">
              <span><b>Selected</b> / {story.objectLabel}</span>
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
                  <span>{entry.number}</span>{entry.shortName}
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
                setReveal(storyCardRefs.current[storyIndex], value)
              }}
              aria-label="Reveal realized image"
            />
            <span>Real</span>
          </label>

          <div className="reality-hero-copy">
            <p>{story.question}</p>
            <strong>{story.title}</strong>
            <button type="button" onClick={() => jumpToStep(0)}>Follow this object <span aria-hidden="true">↓</span></button>
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
            <div className="reality-stage-copy" key={`${story.id}-${activeJourneyStep.id}`} aria-live="polite">
              <span>{activeJourneyStep.number} / {activeJourneyStep.label} / {story.shortName}</span>
              <h2>{stageTitle}</h2>
              <p>{stageDescription}</p>
            </div>

            <div className="reality-process-visual is-sketch">
              <img src={story.sketch} alt="" width="1344" height="768" />
              <span className="reality-process-annotation is-one">{story.annotations[0]}</span>
              <span className="reality-process-annotation is-two">{story.annotations[1]}</span>
            </div>

            <div className="reality-process-visual is-resolve">
              <img src={story.sketch} alt="" width="1344" height="768" />
              <div><img src={story.real} alt="" width="1344" height="768" /></div>
              <i aria-hidden="true" />
            </div>

            <div className="reality-evidence-board" aria-label={`${story.noun} verified evidence`}>
              <figure>
                <img src={story.real} alt={`${story.noun} realized object`} width="1344" height="768" loading="lazy" />
                <figcaption>{story.objectLabel}</figcaption>
              </figure>
              <div>
                <span>VERIFIED PORTFOLIO LAYERS</span>
                {story.records.map((record, index) => (
                  <button type="button" key={record.id} onClick={() => openRecord(record)}>
                    <small>{String(index + 1).padStart(2, '0')} / {record.section}</small>
                    <strong>{record.title}</strong>
                    <em>{record.period || record.subtitle}</em>
                    <i aria-hidden="true">↗</i>
                  </button>
                ))}
              </div>
            </div>

            <div className="reality-context-scene">
              <img src={story.scene} alt={`${story.noun} in its real-world context`} width="1344" height="768" loading="lazy" />
              <div>
                <span>{story.contextKicker}</span>
                <strong>{story.contextTitle}</strong>
                <p>{story.contextDescription}</p>
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
              <button type="button" className="active" onClick={() => selectStory(storyIndex + 1)}>Next object</button>
              <button type="button" onClick={() => jumpToStep(1)}>Resolve</button>
              <button type="button" onClick={() => jumpToStep(3)}>Context</button>
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
