import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import Scene from './Scene'
import {
  getLiquidRenderBudget,
  getLiquidTransmissionScale,
  lowerLiquidDpr,
  raiseLiquidDpr
} from '../lib/liquidRenderBudget'

const ADAPTIVE_DPR_KEY = 'portfolio-liquid-adaptive-dpr-v3'
const CALIBRATION_TTL = 30 * 60 * 1000

function getViewportMetrics() {
  return {
    width: Math.max(1, window.innerWidth),
    height: Math.max(1, window.innerHeight),
    dpr: window.devicePixelRatio || 1
  }
}

function readAdaptiveDpr(key, fallback, min, max) {
  try {
    const raw = sessionStorage.getItem(`${ADAPTIVE_DPR_KEY}:${key}`)
    if (!raw) return fallback
    const saved = JSON.parse(raw)
    if (!Number.isFinite(saved.dpr) || Date.now() - saved.updatedAt > CALIBRATION_TTL) return fallback
    return Math.min(max, Math.max(min, saved.dpr))
  } catch {
    return fallback
  }
}

function saveAdaptiveDpr(key, value) {
  try {
    sessionStorage.setItem(`${ADAPTIVE_DPR_KEY}:${key}`, JSON.stringify({
      dpr: value,
      updatedAt: Date.now()
    }))
  } catch {
    // Calibration remains in memory when session storage is unavailable.
  }
}

function DemandPulse({ active, framesPerSecond }) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!active) return undefined

    const interval = 1000 / framesPerSecond
    let frameId = 0
    let previous = performance.now()

    const tick = (now) => {
      const elapsed = now - previous
      if (elapsed >= interval - 1) {
        previous = now - (elapsed % interval)
        invalidate()
      }
      frameId = window.requestAnimationFrame(tick)
    }

    invalidate()
    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [active, framesPerSecond, invalidate])

  return null
}

function FrameBudgetGuard({ active, framesPerSecond, sampleKey, onPressure, onHealthy }) {
  const samplesRef = useRef([])
  const warmupRef = useRef(0)
  const pressureWindowsRef = useRef(0)
  const healthyWindowsRef = useRef(0)

  useEffect(() => {
    samplesRef.current = []
    warmupRef.current = 0
    pressureWindowsRef.current = 0
    healthyWindowsRef.current = 0
  }, [active, framesPerSecond, sampleKey])

  useFrame((_, delta) => {
    if (!active) return
    if (delta > 0.2) {
      samplesRef.current = []
      warmupRef.current = 0
      return
    }

    warmupRef.current += delta
    if (warmupRef.current < 1.2) return

    const samples = samplesRef.current
    samples.push(delta)
    const sampleTarget = Math.max(30, framesPerSecond * 2)
    if (samples.length < sampleTarget) return

    const expected = 1 / framesPerSecond
    const average = samples.reduce((sum, sample) => sum + sample, 0) / samples.length
    const sorted = [...samples].sort((a, b) => a - b)
    const p80 = sorted[Math.floor(sorted.length * 0.8)]
    const underPressure = average > expected * 1.18 || p80 > expected * 1.45
    const comfortablyHealthy = average < expected * 1.1 && p80 < expected * 1.35

    if (underPressure) {
      pressureWindowsRef.current += 1
      healthyWindowsRef.current = 0
      if (pressureWindowsRef.current >= 2) {
        pressureWindowsRef.current = 0
        onPressure()
      }
    } else if (comfortablyHealthy) {
      healthyWindowsRef.current += 1
      pressureWindowsRef.current = 0
      if (healthyWindowsRef.current >= 5) {
        healthyWindowsRef.current = 0
        onHealthy()
      }
    } else {
      pressureWindowsRef.current = 0
      healthyWindowsRef.current = 0
    }

    samplesRef.current = []
  })

  return null
}

export default function LiquidSceneCanvas({
  frameLoop,
  isMobile,
  reducedGraphics,
  adaptive,
  motionEnabled,
  onBubbleClick,
  onReady,
  onContextLost
}) {
  const [viewport, setViewport] = useState(getViewportMetrics)
  const budget = useMemo(() => getLiquidRenderBudget({
    reducedGraphics,
    isMobile,
    devicePixelRatio: viewport.dpr,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height
  }), [isMobile, reducedGraphics, viewport])
  const storedDpr = useMemo(() => readAdaptiveDpr(
    budget.calibrationKey,
    budget.initialDpr,
    budget.emergencyDpr,
    budget.initialDpr
  ), [budget])
  const [calibration, setCalibration] = useState(() => ({
    key: budget.calibrationKey,
    dpr: storedDpr
  }))
  const [emergencyCadence, setEmergencyCadence] = useState(() => ({
    key: budget.calibrationKey,
    active: false
  }))
  const rendererRef = useRef(null)
  const calibratedDpr = calibration.key === budget.calibrationKey ? calibration.dpr : storedDpr
  const renderDpr = adaptive
    ? Math.min(budget.initialDpr, Math.max(budget.emergencyDpr, calibratedDpr))
    : budget.initialDpr
  const emergencyActive = adaptive
    && emergencyCadence.key === budget.calibrationKey
    && emergencyCadence.active
  const targetFps = emergencyActive ? 20 : budget.targetFps
  const transmissionScale = useMemo(
    () => getLiquidTransmissionScale(budget, renderDpr),
    [budget, renderDpr]
  )

  useEffect(() => {
    let resizeFrame = 0
    const updateViewport = () => {
      window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(() => {
        const next = getViewportMetrics()
        setViewport((current) => current.width === next.width
          && current.height === next.height
          && current.dpr === next.dpr
          ? current
          : next)
      })
    }

    window.addEventListener('resize', updateViewport, { passive: true })
    return () => {
      window.removeEventListener('resize', updateViewport)
      window.cancelAnimationFrame(resizeFrame)
    }
  }, [])

  const handleFramePressure = useCallback(() => {
    if (renderDpr > budget.emergencyDpr + 0.01) {
      const step = renderDpr > budget.minDpr + 0.13 ? 0.25 : 0.125
      const next = lowerLiquidDpr(renderDpr, budget.emergencyDpr, step)
      setCalibration({ key: budget.calibrationKey, dpr: next })
      saveAdaptiveDpr(budget.calibrationKey, next)
      return
    }

    setEmergencyCadence({ key: budget.calibrationKey, active: true })
  }, [budget.calibrationKey, budget.emergencyDpr, budget.minDpr, renderDpr])

  const handleFrameHealthy = useCallback(() => {
    if (emergencyActive) {
      setEmergencyCadence({ key: budget.calibrationKey, active: false })
      return
    }
    if (renderDpr >= budget.initialDpr - 0.01) return

    const next = raiseLiquidDpr(renderDpr, budget.initialDpr)
    setCalibration({ key: budget.calibrationKey, dpr: next })
    saveAdaptiveDpr(budget.calibrationKey, next)
  }, [budget.calibrationKey, budget.initialDpr, emergencyActive, renderDpr])

  useEffect(() => {
    if (rendererRef.current) rendererRef.current.transmissionResolutionScale = transmissionScale
  }, [transmissionScale])

  return (
    <Canvas
      frameloop={frameLoop}
      camera={{
        position: [0, 0, isMobile ? 10.8 : 8],
        fov: isMobile ? 55 : 45,
        near: 0.1,
        far: 100
      }}
      gl={{
        antialias: budget.antialias,
        alpha: false,
        powerPreference: isMobile ? 'default' : 'high-performance',
        precision: budget.mode === 'efficient' ? 'mediump' : 'highp',
        stencil: false,
        depth: true
      }}
      dpr={renderDpr}
      resize={{ debounce: { scroll: 100, resize: 180 } }}
      onCreated={({ gl }) => {
        rendererRef.current = gl
        gl.transmissionResolutionScale = transmissionScale
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          onContextLost?.()
        }, { once: true })
      }}
    >
      <color attach="background" args={['#090b12']} />
      <Suspense fallback={null}>
        <DemandPulse active={frameLoop === 'demand' && motionEnabled} framesPerSecond={targetFps} />
        <FrameBudgetGuard
          active={frameLoop === 'demand' && adaptive && motionEnabled}
          framesPerSecond={targetFps}
          sampleKey={`${budget.calibrationKey}:${renderDpr}:${emergencyActive}`}
          onPressure={handleFramePressure}
          onHealthy={handleFrameHealthy}
        />
        <Scene
          onBubbleClick={onBubbleClick}
          isMobile={isMobile}
          motionEnabled={motionEnabled}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  )
}
