import { useEffect, useRef, useMemo } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import GlassBubble from './GlassBubble'
import cityEnvironmentUrl from '../assets/potsdamer_platz_512.hdr?url'
import * as THREE from 'three'

// Portfolio data with dramatic size variation and depth
const desktopBubbleData = [
  {
    id: 'education',
    title: 'EDUCATION',
    subtitle: 'POSTECH CSE',
    position: [-2.8, 1.8, -1],
    scale: 1.0,
    seed: 0.3,
    noiseStrength: 0.16
  },
  {
    id: 'experience',
    title: 'EXPERIENCE',
    subtitle: '3 Positions',
    position: [2.8, 2.0, -1],
    scale: 1.15,
    seed: 2.7,
    noiseStrength: 0.22
  },
  {
    id: 'projects',
    title: 'PROJECTS',
    subtitle: '8 Projects',
    position: [-3.8, -0.2, -0.5],
    scale: 1.15,
    seed: 1.8,
    noiseStrength: 0.22
  },
  {
    id: 'awards',
    title: 'AWARDS',
    subtitle: '5 Awards',
    position: [3.5, 0.1, 0.8],
    scale: 1.05,
    seed: 4.2,
    noiseStrength: 0.22
  },
  {
    id: 'scholarships',
    title: 'SCHOLARSHIPS',
    subtitle: '4 Scholarships',
    position: [-2.0, -1.6, -1.2],
    scale: 0.75,
    seed: 5.8,
    noiseStrength: 0.22
  },
  {
    id: 'media',
    title: 'MEDIA',
    subtitle: '3 Features',
    position: [2.2, -2.0, 0.5],
    scale: 0.85,
    seed: 6.3,
    noiseStrength: 0.2
  },
  {
    id: 'activities',
    title: 'ACTIVITIES',
    subtitle: '5 Activities',
    position: [0.3, -1.8, -0.8],
    scale: 0.7,
    seed: 7.1,
    noiseStrength: 0.2
  }
]

// 모바일용 버블 위치 (Taeho Je 이름 피해서 배치, 더 작은 크기)
const mobileBubbleData = [
  {
    id: 'education',
    title: 'EDUCATION',
    subtitle: 'POSTECH CSE',
    position: [-1.55, 3.55, 0.8],
    scale: 0.68,
    seed: 0.3,
    noiseStrength: 0.16
  },
  {
    id: 'experience',
    title: 'EXPERIENCE',
    subtitle: '3 Positions',
    position: [1.45, 3.15, 0.2],
    scale: 0.74,
    seed: 2.7,
    noiseStrength: 0.22
  },
  {
    id: 'projects',
    title: 'PROJECTS',
    subtitle: '8 Projects',
    position: [-1.62, 1.28, 0.8],
    scale: 0.72,
    seed: 1.8,
    noiseStrength: 0.22
  },
  {
    id: 'awards',
    title: 'AWARDS',
    subtitle: '5 Awards',
    position: [1.55, 1.08, 0.5],
    scale: 0.68,
    seed: 4.2,
    noiseStrength: 0.22
  },
  {
    id: 'scholarships',
    title: 'SCHOLARSHIPS',
    subtitle: '4 Scholarships',
    position: [-1.5, -1.55, 0.3],
    scale: 0.58,
    seed: 5.8,
    noiseStrength: 0.22
  },
  {
    id: 'media',
    title: 'MEDIA',
    subtitle: '3 Features',
    position: [1.52, -1.68, 0.7],
    scale: 0.62,
    seed: 6.3,
    noiseStrength: 0.2
  },
  {
    id: 'activities',
    title: 'ACTIVITIES',
    subtitle: '5 Activities',
    position: [0, -3.42, 0.3],
    scale: 0.58,
    seed: 7.1,
    noiseStrength: 0.2
  }
]

// Neon tube component for background - clean single glow
function NeonTube({ points, color, radius = 0.03, intensity = 1, reducedGraphics = false }) {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(...p))
    )
  }, [points])

  const coreGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, reducedGraphics ? 40 : 64, radius, reducedGraphics ? 6 : 8, false),
    [curve, radius, reducedGraphics]
  )
  const glowGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, reducedGraphics ? 40 : 64, radius * 3, reducedGraphics ? 6 : 8, false),
    [curve, radius, reducedGraphics]
  )

  useEffect(() => () => {
    coreGeometry.dispose()
    glowGeometry.dispose()
  }, [coreGeometry, glowGeometry])

  return (
    <group>
      <mesh geometry={coreGeometry}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh geometry={glowGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2 * intensity}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function CityEnvironment() {
  const loadedTexture = useLoader(RGBELoader, cityEnvironmentUrl)
  const environmentTexture = useMemo(() => {
    const texture = loadedTexture.clone()
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.colorSpace = THREE.LinearSRGBColorSpace
    texture.needsUpdate = true
    return texture
  }, [loadedTexture])

  useEffect(() => () => environmentTexture.dispose(), [environmentTexture])

  return <primitive attach="environment" object={environmentTexture} />
}


function FrameRateGuard({ active, onDecline }) {
  const elapsedRef = useRef(0)
  const samplesRef = useRef([])
  const reportedRef = useRef(false)

  useFrame((_, delta) => {
    if (!active || reportedRef.current || delta > 0.25) return

    elapsedRef.current += delta
    if (elapsedRef.current < 1.25) return

    samplesRef.current.push(delta)
    if (samplesRef.current.length < 90) return

    const sorted = [...samplesRef.current].sort((a, b) => a - b)
    const average = samplesRef.current.reduce((sum, sample) => sum + sample, 0) / samplesRef.current.length
    const p90 = sorted[Math.floor(sorted.length * 0.9)]

    if (average > 1 / 43 || p90 > 1 / 30) {
      reportedRef.current = true
      onDecline?.('measured-fps')
    } else {
      samplesRef.current = []
      elapsedRef.current = 0
    }
  })

  return null
}

export default function Scene({
  onBubbleClick,
  isMobile = false,
  reducedGraphics = false,
  onReady,
  onPerformanceDecline
}) {
  const groupRef = useRef()
  const readyCalledRef = useRef(false)
  const animationProgressRef = useRef(0)
  const { mouse } = useThree()

  // 모바일/데스크톱에 따라 버블 데이터 선택
  const bubbleData = isMobile ? mobileBubbleData : desktopBubbleData

  useFrame((state, delta) => {
    // 첫 프레임 렌더링 시 onReady 호출
    if (!readyCalledRef.current && onReady) {
      readyCalledRef.current = true
      onReady()
    }

    // 초기 등장 애니메이션 (0 → 1, 약 1초)
    if (groupRef.current && reducedGraphics) {
      groupRef.current.scale.setScalar(1)
    } else if (groupRef.current && animationProgressRef.current < 1) {
      animationProgressRef.current = Math.min(1, animationProgressRef.current + delta * 1.2)
      const progress = animationProgressRef.current
      // easeOutBack 효과
      const eased = 1 + 2.7 * Math.pow(progress - 1, 3) + 1.7 * Math.pow(progress - 1, 2)
      groupRef.current.scale.setScalar(Math.max(0, eased))
    }

    if (groupRef.current && !isMobile && !reducedGraphics) {
      // 데스크톱에서만 마우스 회전 적용 (마우스 방향으로 해당 쪽이 앞으로 나오도록)
      const targetY = -mouse.x * 0.3
      const targetX = mouse.y * 0.15

      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetY,
        0.025
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetX,
        0.025
      )
    } else if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -mouse.x * 0.08, 0.08)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.04, 0.08)
    }
  })

  return (
    <>
      {/* Environment map for reflections */}
      <CityEnvironment />

      <FrameRateGuard active={!reducedGraphics} onDecline={onPerformanceDecline} />

      {/* === NEON TUBES IN BACKGROUND (extended length) === */}
      <group position={[0, 0, -4]}>
        {/* Cyan curved tube - extended */}
        <NeonTube
          points={[
            [-15, 2, 0],
            [-8, 4, 1],
            [0, 2.5, 0],
            [8, 4, -1],
            [15, 2, 0]
          ]}
          color="#00e5ff"
          radius={0.035}
          intensity={1}
          reducedGraphics={reducedGraphics}
        />
        {/* Purple curved tube - extended */}
        <NeonTube
          points={[
            [15, -1, 0],
            [8, 0.5, 1],
            [0, -1.5, 0],
            [-8, 0, -1],
            [-15, -2, 0]
          ]}
          color="#a855f7"
          radius={0.03}
          intensity={0.9}
          reducedGraphics={reducedGraphics}
        />
        {/* Pink diagonal tube - extended */}
        <NeonTube
          points={[
            [-12, -6, 1],
            [-4, -2, 0],
            [4, 2, -1],
            [12, 6, 0]
          ]}
          color="#ec4899"
          radius={0.03}
          intensity={0.8}
          reducedGraphics={reducedGraphics}
        />
      </group>

      {/* === LIGHTING === */}
      <ambientLight intensity={reducedGraphics ? 0.3 : isMobile ? 0.8 : 0.3} />

      {/* Main fill light */}
      <directionalLight position={[5, 8, 5]} intensity={reducedGraphics ? 0.55 : isMobile ? 1.2 : 0.6} color="#ffffff" />

      {/* RIM LIGHTS - PC only */}
      {!isMobile && (
        <>
          <directionalLight position={[-3, 2, -5]} intensity={reducedGraphics ? 0.38 : 1.2} color="#00e5ff" />
          {!reducedGraphics && <directionalLight position={[3, -1, -5]} intensity={1.0} color="#a855f7" />}
          {!reducedGraphics && <directionalLight position={[0, 4, -6]} intensity={0.8} color="#ec4899" />}
          <pointLight position={[-4, 3, 3]} intensity={reducedGraphics ? 0.14 : 0.4} color="#00e5ff" distance={12} />
          {!reducedGraphics && <pointLight position={[4, -2, 3]} intensity={0.35} color="#a855f7" distance={12} />}
          <pointLight position={[0, 5, 2]} intensity={reducedGraphics ? 0.12 : 0.3} color="#ffffff" distance={10} />
        </>
      )}

      <group ref={groupRef}>
        {/* Organic glass blobs with varied depth */}
        {bubbleData.map((bubble, index) => (
          <GlassBubble
            key={bubble.id}
            position={bubble.position}
            scale={bubble.scale}
            title={bubble.title}
            seed={bubble.seed}
            noiseStrength={bubble.noiseStrength}
            floatIntensity={0.6 + index * 0.08}
            rotationIntensity={0.15 + index * 0.03}
            onClick={() => onBubbleClick?.(bubble.id)}
            isMobile={isMobile}
            reducedGraphics={reducedGraphics}
          />
        ))}
      </group>

    </>
  )
}
