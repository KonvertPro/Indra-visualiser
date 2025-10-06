import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js"

export default function Mandala({ audioLevel }) {
  const groupRef = useRef()
  const simplex = new SimplexNoise()

  // Precompute shells
  const shells = useMemo(() => {
    const arr = []
    const numShells = 4
    const pointsPerShell = 1000
    for (let s = 0; s < numShells; s++) {
      const radius = 1.8 + s * 0.4
      const positions = new Float32Array(pointsPerShell * 3)
      for (let i = 0; i < pointsPerShell; i++) {
        const theta = Math.acos(2 * Math.random() - 1)
        const phi = 2 * Math.PI * Math.random()
        const x = radius * Math.sin(theta) * Math.cos(phi)
        const y = radius * Math.sin(theta) * Math.sin(phi)
        const z = radius * Math.cos(theta)
        positions.set([x, y, z], i * 3)
      }
      arr.push({ radius, positions })
    }
    return arr
  }, [])

  const geometries = useMemo(() =>
    shells.map(s => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.BufferAttribute(s.positions, 3))
      return geo
    }),
    [shells]
  )

  const materials = useMemo(
    () =>
      shells.map((s, i) => {
        const colors = ["#ABFF73", "#A872C0", "#8ECCD9", "#755F9D"]
        return new THREE.PointsMaterial({
          size: 0.02 + i * 0.005,
          transparent: true,
          opacity: 0.7,
          color: colors[i % colors.length],
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      }),
    [shells]
  )

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    shells.forEach((s, i) => {
      const geo = geometries[i]
      const pos = geo.attributes.position.array
      const count = pos.length / 3

      for (let j = 0; j < count; j++) {
        const ix = j * 3
        const x = pos[ix]
        const y = pos[ix + 1]
        const z = pos[ix + 2]
        const r = Math.sqrt(x * x + y * y + z * z)

        const noise = simplex.noise4d(
          x * 0.2,
          y * 0.2,
          z * 0.2,
          t * (0.15 + i * 0.05)
        )

        const factor = 1 + noise * 0.25 + audioLevel * 0.5
        pos[ix] = (x / r) * (s.radius * factor)
        pos[ix + 1] = (y / r) * (s.radius * factor)
        pos[ix + 2] = (z / r) * (s.radius * factor)
      }
      geo.attributes.position.needsUpdate = true
    })

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {shells.map((s, i) => (
        <points
          key={i}
          geometry={geometries[i]}
          material={materials[i]}
        />
      ))}
    </group>
  )
}
