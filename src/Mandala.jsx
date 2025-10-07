import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

const SEGMENTS = 120

// Petal/rose curve: r = R * (1 + warp * cos(petals * θ + phase))
function writePetalPositions(out, radius, petals, warp, phase) {
  for (let i = 0; i <= SEGMENTS; i++) {
    const theta = (i / SEGMENTS) * Math.PI * 2
    const r = radius * (1 + warp * Math.cos(petals * theta + phase))
    const x = Math.cos(theta) * r
    const y = Math.sin(theta) * r
    out[i * 3 + 0] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = 0
  }
}

export default function Mandala({ audioLevel = 0 }) {
  const groupRef = useRef()
  const geoRefs = useRef([])
  const scaleRef = useRef(1)
  const { size } = useThree()
  const isMobile = size.width < 640

  // Build rings of overlapping petal lines
  const rings = useMemo(() => {
    const out = []
    const ringCount = 9 // 8–10
    const base = isMobile ? 0.3 : 0.36
    const step = isMobile ? 0.18 : 0.22
    for (let i = 0; i < ringCount; i++) {
      const radius = base + i * step
      const petals = 6 + (i % 5) // 6..10 petals
      const warp = 0.16 + (i % 3) * 0.03
      const phaseOffset = (i * Math.PI) / 9
      const positions = new Float32Array((SEGMENTS + 1) * 3)
      writePetalPositions(positions, radius, petals, warp, phaseOffset)
      out.push({ radius, petals, warp, phaseOffset, positions })
    }
    return out
  }, [isMobile])

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return
    const beat = Math.min(Math.max(audioLevel, 0), 1)

    // Calm rotation
    const baseSpeed = 0.08
    g.rotation.z += baseSpeed * delta

    // Smooth breathing with damping
    const t = state.clock.getElapsedTime()
    // Keep base size steady; increase audio-driven amplitude
    const slowBreath = 0.012 * Math.sin(t * 0.45)
    const beatBreath = beat * 0.12
    const baseGroup = isMobile ? 0.75 : 0.9
    const target = baseGroup * (1 + slowBreath + beatBreath)
    scaleRef.current = THREE.MathUtils.damp(scaleRef.current, target, 3.2, delta)
    g.scale.setScalar(scaleRef.current)

    // Animate petal phase; slight audio-reactive warp
    const phaseSpeed = 0.22
    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i]
      const geo = geoRefs.current[i]
      if (!geo) continue
      const phase = ring.phaseOffset + t * phaseSpeed
      const warp = ring.warp * (0.9 + beat * 0.3)
      writePetalPositions(ring.positions, ring.radius, ring.petals, warp, phase)
      const attr = geo.getAttribute("position")
      if (attr) attr.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef} frustumCulled={false}>
      {rings.map((r, idx) => (
        <group key={idx} position-z={-0.002 * idx}>
          {/* Core luminous line */}
          <line frustumCulled={false}>
            <bufferGeometry ref={(el) => (geoRefs.current[idx] = el)}>
              <bufferAttribute
                attach="attributes-position"
                array={r.positions}
                count={r.positions.length / 3}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#ffffff"
              transparent
              opacity={Math.max(0.18, 0.6 - idx * 0.04)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </line>
          {/* Glow layers */}
          <line scale={[1.02, 1.02, 1.02]} frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={r.positions}
                count={r.positions.length / 3}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#ffffff"
              transparent
              opacity={Math.max(0.12, 0.28 - idx * 0.02)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </line>
          <line scale={[1.05, 1.05, 1.05]} frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={r.positions}
                count={r.positions.length / 3}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#ffffff"
              transparent
              opacity={Math.max(0.06, 0.16 - idx * 0.015)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </line>
        </group>
      ))}
    </group>
  )
}
