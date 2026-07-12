import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import Scene from './Scene'

function DemandPulse({ active, framesPerSecond }) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!active) return undefined
    const timer = window.setInterval(invalidate, 1000 / framesPerSecond)
    return () => window.clearInterval(timer)
  }, [active, framesPerSecond, invalidate])

  return null
}

export default function LiquidSceneCanvas({
  frameLoop,
  isMobile,
  reducedGraphics,
  onBubbleClick,
  onReady,
  onPerformanceDecline,
  onContextLost
}) {
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
        antialias: true,
        alpha: false,
        powerPreference: isMobile ? 'default' : 'high-performance',
        precision: reducedGraphics ? 'mediump' : 'highp',
        stencil: false,
        depth: true
      }}
      dpr={reducedGraphics || isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)}
      performance={{ min: 0.65, max: 1, debounce: 250 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          onContextLost?.()
        }, { once: true })
      }}
    >
      <color attach="background" args={['#090b12']} />
      <Suspense fallback={null}>
        <DemandPulse active={frameLoop === 'demand'} framesPerSecond={isMobile ? 12 : 8} />
        <Scene
          onBubbleClick={onBubbleClick}
          isMobile={isMobile}
          reducedGraphics={reducedGraphics}
          onReady={onReady}
          onPerformanceDecline={onPerformanceDecline}
        />
      </Suspense>
    </Canvas>
  )
}
