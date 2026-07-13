import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import { getRealityVisualState, normalizeRealityStoryIndex } from '../../lib/realityLab'
import memoryCutout from '../../assets/reality-lab/memory-cutout.webp'
import memoryReal from '../../assets/reality-lab/memory-real.webp'
import memoryScene from '../../assets/reality-lab/memory-scene.webp'
import memoryWafer from '../../assets/reality-lab/memory-wafer.webp'
import memoryCircuit from '../../assets/reality-lab/memory-circuit.webp'
import memoryPackage from '../../assets/reality-lab/memory-package.webp'
import memoryEveryday from '../../assets/reality-lab/memory-everyday.webp'
import mementoCutout from '../../assets/reality-lab/memento-cutout.webp'
import mementoReal from '../../assets/reality-lab/memento-real.webp'
import mementoCapture from '../../assets/reality-lab/memento-capture.webp'
import mementoForgotten from '../../assets/reality-lab/memento-forgotten.webp'
import mementoReopen from '../../assets/reality-lab/memento-reopen.webp'
import mementoRemember from '../../assets/reality-lab/memento-remember.webp'
import heritageCutout from '../../assets/reality-lab/heritage-cutout.webp'
import heritageScene from '../../assets/reality-lab/heritage-scene.webp'
import heritageInspect from '../../assets/reality-lab/heritage-inspect.webp'
import heritageCapture from '../../assets/reality-lab/heritage-capture.webp'
import heritageModel from '../../assets/reality-lab/heritage-model.webp'
import heritagePrint from '../../assets/reality-lab/heritage-print.webp'
import heritageApply from '../../assets/reality-lab/heritage-apply.webp'
import aitopCutout from '../../assets/reality-lab/aitop-cutout.webp'
import aitopScene from '../../assets/reality-lab/aitop-scene.webp'
import aitopStudy from '../../assets/reality-lab/aitop-study.webp'
import aitopCode from '../../assets/reality-lab/aitop-code.webp'
import aitopChallenge from '../../assets/reality-lab/aitop-challenge.webp'
import aitopBreakthrough from '../../assets/reality-lab/aitop-breakthrough.webp'
import './RealityLabView.css'

const STORIES = [
  {
    id: 'memory',
    number: '01',
    noun: 'Memory Device',
    shortName: 'Memory',
    accent: '#36d8cf',
    cutout: memoryCutout,
    proofSection: 'experience',
    frames: [
      { id: 'wafer', label: 'Wafer', title: 'A wafer begins it.', src: memoryWafer, motion: 'zoom', alt: 'A silicon wafer on a semiconductor transfer tray' },
      { id: 'circuit', label: 'Circuit', title: 'Patterns become memory.', src: memoryCircuit, motion: 'macro', alt: 'A macro view of memory circuitry and interconnects' },
      { id: 'package', label: 'Package', title: 'Memory takes form.', src: memoryPackage, motion: 'lift', alt: 'A mobile DRAM package above a circuit board' },
      { id: 'device', label: 'Device', title: 'It enters the device.', src: memoryReal, motion: 'slide', alt: 'A mobile DRAM package installed inside a phone prototype' },
      { id: 'validate', label: 'Validate', title: 'Signals become evidence.', src: memoryScene, motion: 'focus', alt: 'A phone on a professional memory validation bench' },
      { id: 'everyday', label: 'Everyday', title: 'Then it disappears into life.', src: memoryEveryday, motion: 'resolve', alt: 'A person naturally using a smartphone in everyday life' },
    ],
  },
  {
    id: 'memento',
    number: '02',
    noun: 'Memento',
    shortName: 'Memento',
    accent: '#2865ff',
    cutout: mementoCutout,
    proofSection: 'projects',
    frames: [
      { id: 'capture', label: 'Capture', title: 'A place is captured.', src: mementoCapture, motion: 'slide', alt: 'A traveler photographing a coastal hillside town' },
      { id: 'forgotten', label: 'Forgotten', title: 'Then the photo sleeps.', src: mementoForgotten, motion: 'fade', alt: 'A forgotten travel photograph inside a closed album' },
      { id: 'reopen', label: 'Reopen', title: 'One page wakes it.', src: mementoReopen, motion: 'unfold', alt: 'Hands reopening an album as a photograph begins to rise' },
      { id: 'unfold', label: 'Unfold', title: 'The memory gains depth.', src: mementoReal, motion: 'zoom', alt: 'A travel photograph transformed into a miniature coastal town' },
      { id: 'remember', label: 'Remember', title: 'And finds its way back.', src: mementoRemember, motion: 'resolve', alt: 'A person remembering a trip through the miniature and album' },
    ],
  },
  {
    id: 'heritage',
    number: '03',
    noun: 'Heritage',
    shortName: 'Heritage',
    accent: '#e16d47',
    cutout: heritageCutout,
    proofSection: 'projects',
    frames: [
      { id: 'inspect', label: 'Inspect', title: 'First, see the loss.', src: heritageInspect, motion: 'focus', alt: 'A conservator examining damaged painting fibers through a magnifier' },
      { id: 'capture', label: 'Capture', title: 'Capture every fiber.', src: heritageCapture, motion: 'slide', alt: 'A traditional painting under a precise digitization camera' },
      { id: 'model', label: 'Model', title: 'Let the model infer.', src: heritageModel, motion: 'macro', alt: 'A workstation comparing restoration model layers' },
      { id: 'print', label: 'Print', title: 'Print only what is missing.', src: heritagePrint, motion: 'lift', alt: 'Precision-printed restoration fragments on a conservation tray' },
      { id: 'apply', label: 'Apply', title: 'Place the fragment.', src: heritageApply, motion: 'focus', alt: 'A conservator placing a small restoration fragment with tweezers' },
      { id: 'preserve', label: 'Preserve', title: 'Return it to memory.', src: heritageScene, motion: 'resolve', alt: 'The conserved painting in a heritage digitization lab' },
    ],
  },
  {
    id: 'aitop',
    number: '04',
    noun: 'AI_TOP_100',
    shortName: 'AI_TOP_100',
    accent: '#f0a43d',
    cutout: aitopCutout,
    proofSection: 'awards',
    frames: [
      { id: 'study', label: 'Study', title: 'A question begins.', src: aitopStudy, motion: 'focus', alt: 'A university student studying alone at night' },
      { id: 'code', label: 'Code', title: 'Practice becomes code.', src: aitopCode, motion: 'slide', alt: 'A student coding in a university computer lab' },
      { id: 'challenge', label: 'Challenge', title: 'The wall gets real.', src: aitopChallenge, motion: 'zoom', alt: 'A student facing a wall of competition challenges' },
      { id: 'breakthrough', label: 'Breakthrough', title: 'Break through.', src: aitopBreakthrough, motion: 'spin', alt: 'The challenge wall opening in an upward spiral' },
      { id: 'award', label: 'Award', title: 'The work rises with you.', src: aitopScene, motion: 'resolve', alt: 'A student raising an award on a large stage' },
    ],
  },
]

const STORY_SCROLL_VH_PER_FRAME = 1.4

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value))

function getFrameTransform(distance, motion) {
  const amount = clamp(Math.abs(distance), 0, 1.25)
  const direction = distance < 0 ? -1 : 1
  const base = {
    x: 0,
    y: direction * amount * 10,
    scale: 1 + direction * amount * 0.045,
    rotate: 0,
    opacity: clamp(1 - amount * 0.94),
  }

  if (motion === 'slide') base.x = direction * amount * 18
  if (motion === 'macro') base.scale = 1 + direction * amount * 0.13
  if (motion === 'lift') base.y = direction * amount * 20
  if (motion === 'unfold') {
    base.y = direction * amount * 15
    base.rotate = direction * amount * -3
    base.scale = 1 + direction * amount * 0.07
  }
  if (motion === 'focus') base.scale = 1 + direction * amount * 0.08
  if (motion === 'fade') base.scale = 1 - amount * 0.02
  if (motion === 'spin') {
    base.x = direction * amount * 14
    base.y = direction * amount * 12
    base.rotate = direction * amount * 30
    base.scale = 1 + direction * amount * 0.1
  }
  if (motion === 'resolve') {
    base.y = direction * amount * 6
    base.scale = 1 + direction * amount * 0.03
  }

  return base
}

function getHeroSlideSlot(index, current, total) {
  if (index === current) return 0
  if (index === normalizeRealityStoryIndex(current - 1, total)) return -1
  if (index === normalizeRealityStoryIndex(current + 1, total)) return 1
  return 2
}

function RecordCard({ item, onOpen }) {
  if (!item) return null

  return (
    <button type="button" className="reality-record-card" onClick={() => onOpen(item)}>
      <span>{SECTION_META.find(({ id }) => id === item.section)?.shortLabel}</span>
      <strong>{item.title}</strong>
      <small>{[item.subtitle, item.period].filter(Boolean).join(' / ')}</small>
      <i aria-hidden="true">&rarr;</i>
    </button>
  )
}

export default function RealityLabView() {
  const scrollerRef = useRef(null)
  const heroDeckRef = useRef(null)
  const heroDragRef = useRef(null)
  const heroDragFrameRef = useRef(0)
  const enterTimerRef = useRef([])
  const journeyRef = useRef(null)
  const journeyStageRef = useRef(null)
  const frameRefs = useRef([])
  const scrollFrameRef = useRef(0)
  const activeStepRef = useRef(0)
  const returnFocusRef = useRef(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [enteringStory, setEnteringStory] = useState(false)
  const [activeSection, setActiveSection] = useState(STORIES[0].proofSection)
  const [selectedRecord, setSelectedRecord] = useState(null)

  const story = STORIES[storyIndex]
  const activeFrame = story.frames[activeStep] || story.frames[0]
  const sectionItems = useMemo(() => getSectionItems(activeSection, false), [activeSection])

  const openRecord = useCallback((record) => {
    returnFocusRef.current = document.activeElement
    setSelectedRecord(record)
  }, [])

  const closeRecord = useCallback(() => {
    setSelectedRecord(null)
    window.requestAnimationFrame(() => returnFocusRef.current?.focus?.())
  }, [])

  const selectStory = useCallback((nextIndex) => {
    const normalized = normalizeRealityStoryIndex(nextIndex, STORIES.length)
    setStoryIndex(normalized)
    setActiveSection(STORIES[normalized].proofSection)
    setActiveStep(0)
    activeStepRef.current = 0
    frameRefs.current = []
  }, [])

  const enterStory = useCallback(() => {
    enterTimerRef.current.forEach(window.clearTimeout)
    enterTimerRef.current = []
    setActiveSection(STORIES[storyIndex].proofSection)
    setEnteringStory(true)

    const scrollTimer = window.setTimeout(() => {
      const scroller = scrollerRef.current
      const journey = journeyRef.current
      if (!scroller || !journey) return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      scroller.scrollTo({ top: journey.offsetTop + 1, behavior: reducedMotion ? 'auto' : 'smooth' })
    }, 260)
    const finishTimer = window.setTimeout(() => setEnteringStory(false), 900)
    enterTimerRef.current = [scrollTimer, finishTimer]
  }, [storyIndex])

  const jumpToStep = useCallback((index) => {
    const scroller = scrollerRef.current
    const journey = journeyRef.current
    if (!scroller || !journey) return
    const stepCount = story.frames.length
    const travel = Math.max(0, journey.scrollHeight - scroller.clientHeight)
    const progress = clamp((index + 0.06) / stepCount)
    scroller.scrollTo({
      top: journey.offsetTop + travel * progress,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [story.frames.length])

  const resetHeroDrag = useCallback(() => {
    window.cancelAnimationFrame(heroDragFrameRef.current)
    heroDragFrameRef.current = 0
    const deck = heroDeckRef.current
    if (!deck) return
    deck.classList.remove('is-dragging')
    deck.style.setProperty('--hero-drag', '0px')
  }, [])

  const finishHeroGesture = useCallback((event, cancelled = false) => {
    const drag = heroDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    drag.lastX = event.clientX
    drag.lastY = event.clientY
    heroDragRef.current = null
    resetHeroDrag()

    const dx = drag.lastX - drag.startX
    const dy = drag.lastY - drag.startY
    if (cancelled) return

    const threshold = Math.max(52, Math.min(94, (heroDeckRef.current?.clientWidth || 700) * 0.1))
    if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.08) {
      selectStory(storyIndex + (dx < 0 ? 1 : -1))
      return
    }

    if (Math.hypot(dx, dy) < 12) enterStory()
  }, [enterStory, resetHeroDrag, selectStory, storyIndex])

  const updateHeroDrag = useCallback((event) => {
    const drag = heroDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    drag.lastX = event.clientX
    drag.lastY = event.clientY
    const dx = drag.lastX - drag.startX
    const dy = drag.lastY - drag.startY
    if (Math.abs(dx) <= Math.abs(dy)) return
    event.preventDefault()

    if (heroDragFrameRef.current) return
    heroDragFrameRef.current = window.requestAnimationFrame(() => {
      heroDragFrameRef.current = 0
      const activeDrag = heroDragRef.current
      const deck = heroDeckRef.current
      if (!activeDrag || !deck) return
      const offset = clamp(activeDrag.lastX - activeDrag.startX, -deck.clientWidth * 0.42, deck.clientWidth * 0.42)
      deck.style.setProperty('--hero-drag', `${offset.toFixed(2)}px`)
    })
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    const journey = journeyRef.current
    const stage = journeyStageRef.current
    if (!scroller || !journey || !stage) return undefined

    const stepCount = story.frames.length
    const updateJourney = () => {
      scrollFrameRef.current = 0
      const travel = Math.max(1, journey.scrollHeight - scroller.clientHeight)
      const state = getRealityVisualState((scroller.scrollTop - journey.offsetTop) / travel, stepCount)

      stage.style.setProperty('--journey-progress', state.progress.toFixed(4))
      stage.style.setProperty('--step-progress', state.localProgress.toFixed(4))
      frameRefs.current.forEach((element, index) => {
        if (!element) return
        const values = getFrameTransform(index - state.stagePosition, story.frames[index].motion)
        element.style.setProperty('--frame-x', `${values.x.toFixed(3)}%`)
        element.style.setProperty('--frame-y', `${values.y.toFixed(3)}%`)
        element.style.setProperty('--frame-scale', values.scale.toFixed(4))
        element.style.setProperty('--frame-rotate', `${values.rotate.toFixed(3)}deg`)
        element.style.setProperty('--frame-opacity', values.opacity.toFixed(4))
      })

      if (activeStepRef.current !== state.index) {
        activeStepRef.current = state.index
        setActiveStep(state.index)
      }
    }

    const scheduleJourneyUpdate = () => {
      if (scrollFrameRef.current) return
      scrollFrameRef.current = window.requestAnimationFrame(updateJourney)
    }

    frameRefs.current = frameRefs.current.slice(0, stepCount)
    updateJourney()
    scroller.addEventListener('scroll', scheduleJourneyUpdate, { passive: true })
    window.addEventListener('resize', scheduleJourneyUpdate, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', scheduleJourneyUpdate)
      window.removeEventListener('resize', scheduleJourneyUpdate)
      window.cancelAnimationFrame(scrollFrameRef.current)
    }
  }, [story.frames, story.id])

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
    const entry = STORIES[normalizeRealityStoryIndex(storyIndex + 1, STORIES.length)]
    const sources = [entry.cutout, entry.frames[0]?.src, entry.frames.at(-1)?.src].filter(Boolean)
    const preload = () => sources.forEach((source) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = source
    })

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 2500 })
      return () => window.cancelIdleCallback(idleId)
    }
    const timer = window.setTimeout(preload, 900)
    return () => window.clearTimeout(timer)
  }, [storyIndex])

  useEffect(() => () => {
    resetHeroDrag()
    window.cancelAnimationFrame(scrollFrameRef.current)
    enterTimerRef.current.forEach(window.clearTimeout)
  }, [resetHeroDrag])

  return (
    <main className="reality-lab" ref={scrollerRef}>
      <header className="reality-nav">
        <a href="#reality-top" className="reality-wordmark" aria-label="Taeho Je, top">T/J</a>
        <nav aria-label="Reality Lab sections">
          <a href="#reality-top">Stories</a>
          <a href="#proof">Proof</a>
          <a href={`mailto:${profile.email}`}>Contact</a>
        </nav>
        <span>PORTFOLIO / 2026</span>
      </header>

      <section className="reality-hero" id="reality-top">
        <div className="reality-paper-grid" aria-hidden="true" />

        <div
          className="reality-hero-deck"
          ref={heroDeckRef}
          role="button"
          tabIndex={0}
          aria-label={`${story.noun} selected. Swipe or use arrow keys to choose a story. Press Enter to begin.`}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault()
              selectStory(storyIndex + (event.key === 'ArrowLeft' ? -1 : 1))
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              enterStory()
            }
          }}
          onPointerDown={(event) => {
            if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
            heroDragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              lastX: event.clientX,
              lastY: event.clientY,
            }
            event.currentTarget.setPointerCapture?.(event.pointerId)
            event.currentTarget.classList.add('is-dragging')
          }}
          onPointerMove={updateHeroDrag}
          onPointerUp={(event) => finishHeroGesture(event)}
          onPointerCancel={(event) => finishHeroGesture(event, true)}
          onClick={(event) => {
            if (event.detail === 0) enterStory()
          }}
        >
          {STORIES.map((entry, index) => {
            const slot = getHeroSlideSlot(index, storyIndex, STORIES.length)
            return (
              <figure
                className={`reality-hero-slide slot-${slot === -1 ? 'previous' : slot === 1 ? 'next' : slot === 0 ? 'active' : 'hidden'}`}
                style={{ '--slide-x': slot === -1 ? '-112%' : slot === 1 ? '112%' : slot === 0 ? '0%' : '180%' }}
                aria-hidden={slot !== 0}
                key={entry.id}
              >
                <img
                  src={entry.cutout}
                  alt={slot === 0 ? `${entry.noun} concept sketch` : ''}
                  width="1344"
                  height="768"
                  decoding="async"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  draggable="false"
                />
              </figure>
            )
          })}
        </div>

        <div className="reality-hero-dots" aria-hidden="true">
          {STORIES.map((entry, index) => <i className={index === storyIndex ? 'active' : ''} key={entry.id} />)}
        </div>
        <span className="reality-hero-selection" aria-live="polite">{story.noun}</span>
        <div className={`reality-transition-wash ${enteringStory ? 'is-entering' : ''}`} aria-hidden="true" />
      </section>

      <section
        className="reality-journey"
        id="process"
        ref={journeyRef}
        style={{
          '--story-steps': story.frames.length,
          height: `${(story.frames.length * STORY_SCROLL_VH_PER_FRAME + 1) * 100}svh`,
        }}
      >
        <div
          className="reality-journey-stage"
          ref={journeyStageRef}
          data-story={story.id}
          data-step={activeFrame.id}
          style={{ '--story-accent': story.accent }}
        >
          <div className="reality-cinematic-shell">
            <div className="reality-cinematic-frames">
              {story.frames.map((frame, index) => (
                <figure
                  className={`reality-cinematic-frame motion-${frame.motion} ${activeStep === index ? 'is-active' : ''}`}
                  data-frame-index={index}
                  ref={(element) => { frameRefs.current[index] = element }}
                  aria-hidden={activeStep !== index}
                  key={frame.id}
                >
                  <img
                    src={frame.src}
                    alt={activeStep === index ? frame.alt : ''}
                    width="2752"
                    height="1536"
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <div className="reality-frame-shade" aria-hidden="true" />
                </figure>
              ))}
            </div>

            <div className="reality-journey-progress" role="group" aria-label={`${story.noun} story stages`}>
              {story.frames.map((frame, index) => (
                <button
                  type="button"
                  aria-pressed={activeStep === index}
                  className={activeStep === index ? 'active' : ''}
                  key={frame.id}
                  onClick={() => jumpToStep(index)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{frame.label}</strong>
                  <i />
                </button>
              ))}
            </div>

            <div className="reality-stage-copy" key={`${story.id}-${activeFrame.id}`} aria-live="polite">
              <span>{String(activeStep + 1).padStart(2, '0')} / {story.shortName}</span>
              <h2>{activeFrame.title}</h2>
            </div>
          </div>
        </div>
      </section>

      <section className="reality-proof" id="proof">
        <header className="reality-proof-heading">
          <span>SELECTED RECORDS</span>
          <h2>The work<br /><i>is the proof.</i></h2>
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
              <span>{section.symbol}</span>
              <strong>{section.label}</strong>
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
          <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub &rarr;</a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn &rarr;</a>
          <a href={`mailto:${profile.email}`}>Email &rarr;</a>
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
            {selectedRecord.link ? <a href={selectedRecord.link} target="_blank" rel="noopener noreferrer">Open original <span aria-hidden="true">&rarr;</span></a> : null}
          </section>
        </div>
      ) : null}

      <StyleSwitcher />
    </main>
  )
}
