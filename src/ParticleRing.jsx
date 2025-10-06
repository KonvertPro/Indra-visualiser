// src/components/ParticleRing.jsx
import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

function ParticleRing({ radius = 1.5, count = 400, color = "#ABFF73", analyser }) {
  const points = useMemo(() => {
    const positions = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      positions.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      )
    }
    return new Float32Array(positions)
  }, [count, radius])

  const ref = useRef()
  const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      let scaleBoost = 0

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        scaleBoost = avg / 512 // audio-driven
      }

      const baseScale = 1 + Math.sin(t * 0.5) * 0.02 // subtle breathing
      const scale = baseScale + scaleBoost * 0.3

      ref.current.scale.set(scale, scale, 1)
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default ParticleRing
