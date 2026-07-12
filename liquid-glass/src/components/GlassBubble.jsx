import { memo, useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'

function createSeededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ value >>> 15, value | 1)
    value ^= value + Math.imul(value ^ value >>> 7, value | 61)
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
}

const noise3D = createNoise3D(createSeededRandom(0x54414548))

// Create amorphous blob geometry
function createBlobGeometry(seed = 0, noiseScale = 0.8, noiseStrength = 0.3, segments = 32) {
  const geometry = new THREE.SphereGeometry(1, segments, segments)
  const positions = geometry.attributes.position.array

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]

    const noiseValue = noise3D(
      x * noiseScale + seed,
      y * noiseScale + seed * 0.5,
      z * noiseScale + seed * 0.3
    )

    const displacement = 1 + noiseValue * noiseStrength

    positions[i] *= displacement
    positions[i + 1] *= displacement
    positions[i + 2] *= displacement
  }

  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()

  return geometry
}

function createLabelTexture(title, subtitle = '') {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const context = canvas.getContext('2d')

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#ffffff'
  context.font = '700 36px Montserrat, Arial, sans-serif'
  context.fillText(title, canvas.width / 2, subtitle ? 51 : 64)

  if (subtitle) {
    context.fillStyle = '#aaddff'
    context.font = '600 17px Montserrat, Arial, sans-serif'
    context.fillText(subtitle, canvas.width / 2, 86)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

function GlassBubble({
  id,
  position = [0, 0, 0],
  scale = 1,
  title = '',
  subtitle = '',
  onSelect,
  floatIntensity = 1,
  rotationIntensity = 0.3,
  seed = 0,
  noiseScale = 0.8,
  noiseStrength = 0.35,
  isMobile = false,
  motionEnabled = true,
  material
}) {
  const meshRef = useRef()
  const groupRef = useRef()
  const elapsedRef = useRef(0)

  const blobGeometry = useMemo(() => {
    return createBlobGeometry(seed, noiseScale, noiseStrength, 24)
  }, [seed, noiseScale, noiseStrength])

  useEffect(() => () => blobGeometry.dispose(), [blobGeometry])

  const labelTexture = useMemo(() => createLabelTexture(title, subtitle), [subtitle, title])
  useEffect(() => () => labelTexture.dispose(), [labelTexture])

  // Each bubble gets unique rotation direction & speed based on seed
  const rotationConfig = useMemo(() => ({
    speedY: (Math.sin(seed * 1.5) * 0.15) + 0.1,  // -0.05 to 0.25
    speedX: (Math.cos(seed * 2.1) * 0.08),         // -0.08 to 0.08
    speedZ: (Math.sin(seed * 3.7) * 0.05),         // -0.05 to 0.05
    directionY: Math.sin(seed) > 0 ? 1 : -1,       // Random direction
    directionX: Math.cos(seed * 1.3) > 0 ? 1 : -1,
  }), [seed])

  // Smooth animation - unique per bubble with a smaller mobile travel range.
  useFrame((_, delta) => {
    if (!motionEnabled) return

    const frameDelta = Math.min(delta, 1 / 20)
    elapsedRef.current += frameDelta

    if (meshRef.current && !isMobile) {
      // Each bubble rotates differently
      meshRef.current.rotation.y += frameDelta * rotationConfig.speedY * rotationConfig.directionY
      meshRef.current.rotation.x += frameDelta * rotationConfig.speedX * rotationConfig.directionX
      meshRef.current.rotation.z += frameDelta * rotationConfig.speedZ
    }

    if (groupRef.current && !isMobile) {
      const elapsed = elapsedRef.current + seed * 0.7
      const speed = 0.72 + Math.sin(seed * 2) * 0.18
      const range = 0.12 + Math.cos(seed) * 0.05
      groupRef.current.position.y = position[1] + Math.sin(elapsed * speed) * range * floatIntensity
      groupRef.current.rotation.z = Math.sin(elapsed * 0.28) * rotationIntensity * 0.12
    } else if (groupRef.current) {
      const elapsed = elapsedRef.current + seed * 0.9
      groupRef.current.position.x = position[0] + Math.sin(elapsed * 0.46) * 0.06
      groupRef.current.position.y = position[1] + Math.cos(elapsed * 0.54) * 0.1
      groupRef.current.rotation.z = Math.sin(elapsed * 0.32) * 0.024
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Main glass blob */}
      <mesh
        ref={meshRef}
        geometry={blobGeometry}
        scale={scale}
        onClick={(event) => {
          event.stopPropagation()
          onSelect?.(id)
        }}
        material={material}
      />

      {title && (
        <sprite
          position={[0, 0, 0.72]}
          scale={[isMobile ? 1.62 : 1.48, isMobile ? 0.405 : 0.37, 1]}
        >
          <spriteMaterial
            map={labelTexture}
            transparent
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      )}
    </group>
  )
}

export default memo(GlassBubble)
