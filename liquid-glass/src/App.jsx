import { useState, Suspense, useMemo, useRef, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, useProgress } from '@react-three/drei'
import Scene from './components/Scene'
import Modal from './components/Modal'
import './App.css'

// Loading screen component
function Loader() {
  const { progress, active, loaded, total } = useProgress()
  const [show, setShow] = useState(true)

  // Hide loader when: (1) loading complete OR (2) nothing to load OR (3) timeout
  useEffect(() => {
    const isComplete = !active && (progress === 100 || total === 0)

    if (isComplete) {
      const timer = setTimeout(() => setShow(false), 500)
      return () => clearTimeout(timer)
    }

    // Fallback timeout - hide after 5 seconds regardless
    const fallbackTimer = setTimeout(() => setShow(false), 5000)
    return () => clearTimeout(fallbackTimer)
  }, [active, progress, total])

  if (!show) return null

  const displayProgress = total === 0 ? 100 : Math.round(progress)

  return (
    <div className={`loader-overlay ${!active ? 'fade-out' : ''}`}>
      <div className="loader-content">
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading</div>
        <div className="loader-progress">{displayProgress}%</div>
      </div>
    </div>
  )
}

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  // 이스터에그: Taeho Je 5번 클릭
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)

  // 모바일 감지
  const isMobile = useMemo(() => {
    return window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  }, [])

  const handleBubbleClick = (id) => {
    setActiveId(id)
    setModalOpen(true)
  }

  const handleNameClick = useCallback(() => {
    clickCountRef.current += 1

    // 타이머 리셋
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
    }

    // 2초 안에 5번 클릭하면 full mode 토글
    if (clickCountRef.current >= 5) {
      setShowAll(prev => !prev)
      clickCountRef.current = 0
    }

    // 2초 후 카운트 리셋
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0
    }, 2000)
  }, [])

  return (
    <div className="app">
      {/* Dreamy neon background */}
      <div className="neon-background">
        <div className="neon-glow cyan"></div>
        <div className="neon-glow purple"></div>
        <div className="neon-glow pink"></div>
        <div className="neon-glow blue"></div>
        <div className="light-streak streak1"></div>
        <div className="light-streak streak2"></div>
        <div className="light-streak streak3"></div>
      </div>

      {/* 3D Canvas - pause rendering when modal is open */}
      <Canvas
        frameloop={modalOpen ? 'never' : 'always'}
        camera={{
          position: [0, 0, isMobile ? 10 : 8],
          fov: isMobile ? 55 : 45,
          near: 0.1,
          far: 100
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        dpr={isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2)}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#0a0a12']} />

        <Suspense fallback={null}>
          <Scene onBubbleClick={handleBubbleClick} isMobile={isMobile} />
          <Preload all />
        </Suspense>
      </Canvas>

      {/* Loading screen */}
      <Loader />

      {/* 소셜 링크 */}
      <div className="social-links">
        <a href="https://github.com/stpcoder" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <a href="https://linkedin.com/in/taehoje" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </a>
        <a href="mailto:thbrian@postech.ac.kr">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </a>
      </div>

      {/* Hero text overlay */}
      <div className="hero-text">
        <h1 onClick={handleNameClick} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
          Taeho Je
        </h1>
        <p>EXPLORING TECH WITH AI</p>
        {showAll && <span className="full-mode-indicator">FULL MODE</span>}
      </div>

      {/* 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        activeId={activeId}
        showAll={showAll}
        isMobile={isMobile}
      />
    </div>
  )
}

export default App
