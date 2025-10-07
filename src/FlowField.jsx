import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js"

export default function FlowField({
  count = 4000,
  area = 6,
  baseSpeed = 0.05,     // keep very slow for ambient feel
  particleSize = 0.015,
  noiseShift = 0,
  audioLevel = 0,
}) {
  const geometryRef = useRef()
  const simplex = useMemo(() => new SimplexNoise(), [])

  // Initial positions
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = (Math.random() * 2 - 1) * area
      const y = (Math.random() * 2 - 1) * area
      const z = (Math.random() * 2 - 1) * 0.05
      arr.set([x, y, z], i * 3)
    }
    return arr
  }, [count, area])

  // Color palette (Indra brand)
  const colors = useMemo(() => {
    const palette = [
      new THREE.Color("#8ECCD9"), // blue
      new THREE.Color("#A872C0"), // purple
      new THREE.Color("#ABFF73"), // green
    ]
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const c = palette[i % palette.length]
      arr[i * 3 + 0] = c.r
      arr[i * 3 + 1] = c.g
      arr[i * 3 + 2] = c.b
    }
    return arr
  }, [count])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: particleSize,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
      }),
    [particleSize]
  )

  // Animation loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const geo = geometryRef.current
    if (!geo) return

    const pos = geo.attributes.position.array
    // Subtle audio reactivity: speed, size and tint respond to audioLevel
    const beat = Math.min(Math.max(audioLevel, 0), 1)
    const speed = baseSpeed * (0.6 + beat * 1.2)
    const noiseScale = 0.35
    const timeScale = 0.1
    const maxExtent = area

    // Material pulse on audio
    if (material) {
      material.size = particleSize * (1 + beat * 0.9)
      material.opacity = 0.35 + beat * 0.5
      // slight hue shift to add life while preserving brand colors
      const hueShift = (0.62 + beat * 0.08 + (t * 0.01) % 1) % 1
      material.color.setHSL(hueShift, 0.35, 0.75)
      material.needsUpdate = true
    }

    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i]
      const y = pos[i + 1]
      const z = pos[i + 2]

      // Smooth flow using simplex noise
      const nx = simplex.noise4d(x * noiseScale, y * noiseScale, noiseShift, t * timeScale)
      const ny = simplex.noise4d((x + 100 + noiseShift) * noiseScale, (y - 50) * noiseScale, noiseShift, t * timeScale)

      const len = Math.hypot(nx, ny) || 1
      const dx = (nx / len) * (speed * 0.01)
      const dy = (ny / len) * (speed * 0.01)

      let nxp = x + dx
      let nyp = y + dy
      // z jitter subtly increases with audio
      let nzp = THREE.MathUtils.clamp(z + (nx + ny) * (0.001 + beat * 0.0015), -0.08, 0.08)

      // Wrap-around bounds
      if (nxp > maxExtent) nxp = -maxExtent
      if (nxp < -maxExtent) nxp = maxExtent
      if (nyp > maxExtent) nyp = -maxExtent
      if (nyp < -maxExtent) nyp = maxExtent

      pos[i] = nxp
      pos[i + 1] = nyp
      pos[i + 2] = nzp
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points material={material} frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
    </points>
  )
}
