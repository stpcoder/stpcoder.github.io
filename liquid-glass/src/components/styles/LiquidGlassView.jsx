import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Modal from '../Modal'
import StyleSwitcher from '../StyleSwitcher'
import LiquidGlassFallback from '../LiquidGlassFallback'
import { profile } from '../../lib/profileData'
import { useStyle } from '../../contexts/StyleContext'

const LiquidSceneCanvas = lazy(() => import('../LiquidSceneCanvas'))

class SceneErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Loader({ sceneReady }) {
  const [show, setShow] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (sceneReady) {
      const fadeTimer = window.setTimeout(() => setFadeOut(true), 180)
      const hideTimer = window.setTimeout(() => setShow(false), 620)
      return () => {
        window.clearTimeout(fadeTimer)
        window.clearTimeout(hideTimer)
      }
    }

    const fallbackTimer = window.setTimeout(() => {
      setFadeOut(true)
      window.setTimeout(() => setShow(false), 420)
    }, 5000)
    return () => window.clearTimeout(fallbackTimer)
  }, [sceneReady])

  if (!show) return null

  return (
    <div className={`loader-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loader-content">
        <div className="loader-orbit" aria-hidden="true"><span /></div>
        <div className="loader-text">Taeho Je</div>
        <div className="loader-progress">Preparing the glass field</div>
      </div>
    </div>
  )
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true })
      || canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

function SocialLinks() {
  return (
    <div className="social-links">
      <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.3c0 .32.19.69.8.57A12 12 0 0 0 24 12C24 5.37 18.63 0 12 0Z" />
        </svg>
      </a>
      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5ZM8 19H5V8h3v11ZM6.5 6.73A1.76 1.76 0 1 1 6.5 3.2a1.76 1.76 0 0 1 0 3.53ZM20 19h-3v-5.6c0-3.37-4-3.12-4 0V19h-3V8h3v1.77c1.4-2.59 7-2.78 7 2.47V19Z" />
        </svg>
      </a>
      <a href={`mailto:${profile.email}`} aria-label="Email">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </a>
    </div>
  )
}

export default function LiquidGlassView() {
  const { reducedGraphics, requestReducedGraphics } = useStyle()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const [canvasMounted, setCanvasMounted] = useState(false)
  const [webglAvailable, setWebglAvailable] = useState(() => supportsWebGL())
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches)

  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)')
    const updateMobile = () => setIsMobile(query.matches)
    const updateVisibility = () => setPageVisible(!document.hidden)
    query.addEventListener?.('change', updateMobile)
    document.addEventListener('visibilitychange', updateVisibility)

    const mountTimer = window.setTimeout(() => setCanvasMounted(true), 80)

    return () => {
      query.removeEventListener?.('change', updateMobile)
      document.removeEventListener('visibilitychange', updateVisibility)
      window.clearTimeout(mountTimer)
    }
  }, [])

  const frameLoop = useMemo(() => {
    if (!pageVisible || modalOpen) return 'never'
    if (!sceneReady) return 'always'
    return reducedGraphics ? 'demand' : 'always'
  }, [modalOpen, pageVisible, reducedGraphics, sceneReady])

  const handleBubbleClick = useCallback((id) => {
    setActiveId(id)
    setModalOpen(true)
  }, [])

  const handleNameClick = useCallback(() => {
    clickCountRef.current += 1
    if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current)

    if (clickCountRef.current >= 5) {
      setShowAll((value) => !value)
      clickCountRef.current = 0
    }

    clickTimerRef.current = window.setTimeout(() => {
      clickCountRef.current = 0
    }, 2000)
  }, [])

  return (
    <div className={`app liquid-glass-app ${reducedGraphics ? 'reduced-mode' : ''}`}>
      <div className="neon-background" aria-hidden="true">
        <div className="neon-glow cyan" />
        <div className="neon-glow purple" />
        <div className="neon-glow pink" />
        <div className="neon-glow blue" />
        <div className="light-streak streak1" />
        <div className="light-streak streak2" />
        <div className="light-streak streak3" />
      </div>

      {webglAvailable && canvasMounted ? (
        <SceneErrorBoundary onError={() => setWebglAvailable(false)}>
          <Suspense fallback={null}>
            <LiquidSceneCanvas
              frameLoop={frameLoop}
              onBubbleClick={handleBubbleClick}
              isMobile={isMobile}
              reducedGraphics={reducedGraphics}
              onReady={() => setSceneReady(true)}
              onPerformanceDecline={requestReducedGraphics}
              onContextLost={() => setWebglAvailable(false)}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : !webglAvailable ? (
        <LiquidGlassFallback onBubbleClick={handleBubbleClick} />
      ) : null}

      <Loader sceneReady={sceneReady || !webglAvailable} />
      <SocialLinks />

      <div className={`hero-text ${sceneReady ? 'animate-in' : ''}`}>
        <h1 onClick={handleNameClick}>{profile.name}</h1>
        <p>Exploring tech with AI</p>
        {showAll && <span className="full-mode-indicator">Full archive unlocked</span>}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        activeId={activeId}
        showAll={showAll}
        isMobile={isMobile}
      />

      <StyleSwitcher />
    </div>
  )
}
