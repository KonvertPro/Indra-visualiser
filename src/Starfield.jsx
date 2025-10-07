import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function Starfield({ count = 2000, depth = 80, colors = ["#ABFF73", "#8ECCD9", "#A872C0"], size = 0.01, audioLevel = 0 }) {
  const pointsRef = useRef()
  const materialRef = useRef()

  const { positions, colorsArray } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colorsArray = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < count; i++) {
      const r = Math.random() * depth + 20
      const theta = Math.acos(2 * Math.random() - 1)
      const phi = 2 * Math.PI * Math.random()
      const x = Math.sin(theta) * Math.cos(phi) * r
      const y = Math.sin(theta) * Math.sin(phi) * r
      const z = Math.cos(theta) * r
      positions.set([x, y, z], i * 3)

      color.set(colors[i % colors.length])
      colorsArray.set([color.r, color.g, color.b], i * 3)
    }
    return { positions, colorsArray }
  }, [count, depth, colors])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (pointsRef.current) {
      const beat = Math.min(Math.max(audioLevel, 0), 1)
      const base = 0.0015
      const speed = base * (1 + beat * 2.5)
      pointsRef.current.rotation.y += speed
    }
    if (materialRef.current) {
      const beat = Math.min(Math.max(audioLevel, 0), 1)
      const baseSize = size
      materialRef.current.size = baseSize * (1 + beat * 0.6)
      materialRef.current.opacity = 0.45 + beat * 0.35
      materialRef.current.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colorsArray.length / 3}
          array={colorsArray}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={size}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

