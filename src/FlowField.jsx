import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// --- Simple Perlin Noise ---
function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}
function lerp(a, b, t) {
  return a + t * (b - a)
}
function grad(hash, x, y, z) {
  const h = hash & 15
  const u = h < 8 ? x : y
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}
class Perlin {
  constructor() {
    this.p = new Uint8Array(512)
    for (let i = 0; i < 256; i++) this.p[i] = i
    for (let i = 255; i > 0; i--) {
      const n = Math.floor((i + 1) * Math.random())
      const q = this.p[i]
      this.p[i] = this.p[n]
      this.p[n] = q
    }
    for (let i = 0; i < 256; i++) this.p[i + 256] = this.p[i]
  }
  noise(x, y, z) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const Z = Math.floor(z) & 255
    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)
    const u = fade(x)
    const v = fade(y)
    const w = fade(z)
    const A = this.p[X] + Y
    const AA = this.p[A] + Z
    const AB = this.p[A + 1] + Z
    const B = this.p[X + 1] + Y
    const BA = this.p[B] + Z
    const BB = this.p[B + 1] + Z

    return lerp(
      lerp(
        lerp(grad(this.p[AA], x, y, z), grad(this.p[BA], x - 1, y, z), u),
        lerp(grad(this.p[AB], x, y - 1, z), grad(this.p[BB], x - 1, y - 1, z), u),
        v
      ),
      lerp(
        lerp(grad(this.p[AA + 1], x, y, z - 1), grad(this.p[BA + 1], x - 1, y, z - 1), u),
        lerp(grad(this.p[AB + 1], x, y - 1, z - 1), grad(this.p[BB + 1], x - 1, y - 1, z - 1), u),
        v
      ),
      w
    )
  }
}

export default function FlowField({
  count = 5000,
  area = 6,
  baseSpeed = 0.0008, // much slower baseline
  audioLevel = 0,
  particleSize = 0.015,
}) {
  const geometryRef = useRef()
  const perlin = useMemo(() => new Perlin(), [])

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

  // Random per–particle noise offsets so they don’t sync
  const offsets = useMemo(() => {
    const arr = new Float32Array(count * 2)
    for (let i = 0; i < count; i++) {
      arr[i * 2 + 0] = Math.random() * 1000
      arr[i * 2 + 1] = Math.random() * 1000
    }
    return arr
  }, [count])

  const colors = useMemo(() => {
    const palette = [
      new THREE.Color("#ABFF73"),
      new THREE.Color("#A872C0"),
      new THREE.Color("#8ECCD9"),
      new THREE.Color("#755F9D"),
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
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
      }),
    [particleSize]
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const geo = geometryRef.current
    if (!geo) return
    const pos = geo.attributes.position.array

    for (let i = 0; i < count; i++) {
      let x = pos[i * 3 + 0]
      let y = pos[i * 3 + 1]
      let z = pos[i * 3 + 2]

      // Each particle gets unique offset
      const ox = offsets[i * 2 + 0]
      const oy = offsets[i * 2 + 1]

      // Multi-layered perlin with per-particle offsets
      const n = perlin.noise(x * 0.15 + ox, y * 0.15 + oy, t * 0.05)
      const angle = n * Math.PI * 2

      // Default = very slow drift, audio gives gentle boost
      const speed = baseSpeed + audioLevel * 0.004

      x += Math.cos(angle) * speed
      y += Math.sin(angle) * speed

      // Wrap
      if (x > area) x = -area
      if (x < -area) x = area
      if (y > area) y = -area
      if (y < -area) y = area

      pos[i * 3 + 0] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
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
