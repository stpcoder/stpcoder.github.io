import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'

const noise3D = createNoise3D()

// Create amorphous blob geometry
function createBlobGeometry(seed = 0, noiseScale = 0.8, noiseStrength = 0.3) {
  const geometry = new THREE.SphereGeometry(1, 32, 32) // Lower poly for performance
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
  noiseStrength = 0.35
}) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  const blobGeometry = useMemo(() => {
    return createBlobGeometry(seed, noiseScale, noiseStrength)
  }, [seed, noiseScale, noiseStrength])

  // Each bubble gets unique rotation direction & speed based on seed
  const rotationConfig = useMemo(() => ({
    speedY: (Math.sin(seed * 1.5) * 0.15) + 0.1,  // -0.05 to 0.25
    speedX: (Math.cos(seed * 2.1) * 0.08),         // -0.08 to 0.08
    speedZ: (Math.sin(seed * 3.7) * 0.05),         // -0.05 to 0.05
    directionY: Math.sin(seed) > 0 ? 1 : -1,       // Random direction
    directionX: Math.cos(seed * 1.3) > 0 ? 1 : -1,
  }), [seed])

  // Smooth animation - unique per bubble
  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetScale = hovered ? scale * 1.08 : scale
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
      // Each bubble rotates differently
      meshRef.current.rotation.y += delta * rotationConfig.speedY * rotationConfig.directionY
      meshRef.current.rotation.x += delta * rotationConfig.speedX * rotationConfig.directionX
      meshRef.current.rotation.z += delta * rotationConfig.speedZ
    }
  })

  // Float settings also unique per bubble
  const floatSpeed = 1.5 + Math.sin(seed * 2) * 0.8  // 0.7 to 2.3
  const floatRange = 0.15 + Math.cos(seed) * 0.1     // 0.05 to 0.25

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={rotationIntensity * (1 + Math.sin(seed) * 0.5)}
      floatIntensity={floatIntensity * (1 + Math.cos(seed * 1.5) * 0.4)}
      floatingRange={[-floatRange, floatRange]}
    >
      <group position={position}>
        {/* Main glass blob */}
        <mesh
          ref={meshRef}
          geometry={blobGeometry}
          scale={scale}
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = 'auto'
          }}
        >
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
            transparent={true}
            opacity={1}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* Clean text with Montserrat font */}
        {title && (
          <Text
            position={[0, 0, 0.6]}
            font="/SpaceGrotesk-Bold.woff"
            fontSize={0.14}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.04}
            outlineWidth={0}
            fillOpacity={1}
            strokeOpacity={0}
          >
            {title}
            <meshBasicMaterial
              color="#ffffff"
              toneMapped={false}
            />
          </Text>
        )}

        {subtitle && (
          <Text
            position={[0, -0.22, 0.6]}
            font="/SpaceGrotesk-Bold.woff"
            fontSize={0.055}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.01}
            outlineWidth={0}
            fillOpacity={1}
            strokeOpacity={0}
          >
            {subtitle}
            <meshBasicMaterial
              color="#aaddff"
              toneMapped={false}
            />
          </Text>
        )}

      </group>
    </Float>
  )
}
