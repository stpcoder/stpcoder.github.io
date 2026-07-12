import { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'

const noise3D = createNoise3D()

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
  canvas.width = 1024
  canvas.height = 256
  const context = canvas.getContext('2d')

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#ffffff'
  context.font = '700 72px Montserrat, Arial, sans-serif'
  context.fillText(title, canvas.width / 2, subtitle ? 102 : 128)

  if (subtitle) {
    context.fillStyle = '#aaddff'
    context.font = '600 34px Montserrat, Arial, sans-serif'
    context.fillText(subtitle, canvas.width / 2, 172)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

export default function GlassBubble({
  position = [0, 0, 0],
  scale = 1,
  title = '',
  subtitle = '',
  onClick,
  floatIntensity = 1,
  rotationIntensity = 0.3,
  seed = 0,
  noiseScale = 0.8,
  noiseStrength = 0.35,
  isMobile = false,
  reducedGraphics = false
}) {
  const meshRef = useRef()
  const groupRef = useRef()

  const blobGeometry = useMemo(() => {
    return createBlobGeometry(seed, noiseScale, noiseStrength, reducedGraphics ? 16 : 24)
  }, [seed, noiseScale, noiseStrength, reducedGraphics])

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

  // Smooth animation - unique per bubble (disabled on mobile)
  useFrame((state, delta) => {
    if (meshRef.current && !isMobile && !reducedGraphics) {
      // Each bubble rotates differently
      meshRef.current.rotation.y += delta * rotationConfig.speedY * rotationConfig.directionY
      meshRef.current.rotation.x += delta * rotationConfig.speedX * rotationConfig.directionX
      meshRef.current.rotation.z += delta * rotationConfig.speedZ
    }

    if (groupRef.current && !isMobile && !reducedGraphics) {
      const elapsed = state.clock.elapsedTime + seed * 0.7
      const speed = 0.72 + Math.sin(seed * 2) * 0.18
      const range = 0.12 + Math.cos(seed) * 0.05
      groupRef.current.position.y = position[1] + Math.sin(elapsed * speed) * range * floatIntensity
      groupRef.current.rotation.z = Math.sin(elapsed * 0.28) * rotationIntensity * 0.12
    }
  })

  return (
      <group ref={groupRef} position={position}>
        {/* Main glass blob */}
        <mesh
          ref={meshRef}
          geometry={blobGeometry}
          scale={scale}
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
        >
          {reducedGraphics ? (
            <meshPhysicalMaterial
              transmission={0.96}
              thickness={0.32}
              roughness={0.035}
              metalness={0}
              ior={1.42}
              color="#edf8ff"
              envMapIntensity={0.9}
              clearcoat={0.95}
              clearcoatRoughness={0.04}
              reflectivity={0.95}
              transparent
              opacity={1}
              side={THREE.FrontSide}
              depthWrite={false}
              toneMapped={false}
            />
          ) : (
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.5}
              roughness={0.02}
              metalness={0}
              ior={1.5}
              color="#e8f4f8"
              envMapIntensity={1.5}
              clearcoat={1}
              clearcoatRoughness={0}
              reflectivity={1}
              transparent
              opacity={1}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          )}
        </mesh>

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
