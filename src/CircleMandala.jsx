import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// Simple overlapping circles mandala:
// - 1 central circle (steady)
// - 5 outer circles arranged evenly around, scaling smoothly with audio

export default function CircleMandala({ audioLevel = 0 }) {
  const groupRef = useRef()
  const outerScaleRef = useRef(1)
  const circleRefs = useRef([])
  const centerRef = useRef()
  const { size } = useThree()
  const isMobile = size.width < 640

  // Shared circle geometry
  const circleGeom = useMemo(() => new THREE.CircleGeometry(1, 128), [])

  const outerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.20, // softer outer petals
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    []
  )

  // Layout: 5 outer positions (72° apart)
  const outerPositions = useMemo(() => {
    const pts = []
    const ringRadius = isMobile ? 0.85 : 1.0 // distance from center (in circle radii)
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2
      pts.push([Math.cos(a) * ringRadius, Math.sin(a) * ringRadius, 0])
    }
    return pts
  }, [isMobile])

  useFrame((state, delta) => {
    // Clockwise rotation and smooth size cycling from 0.5 → 1 → 0.5
    const t = state.clock.getElapsedTime()
    const freq = 0.6
    const cycle = 0.5 - 0.5 * Math.cos(t * freq) // 0..1
    const targetScale = 0.5 + 0.5 * cycle // 0.5..1
    const radial = cycle // 0..1 radius factor (start/end centered)

    outerScaleRef.current = THREE.MathUtils.damp(outerScaleRef.current, targetScale, 3.2, delta)

    // Center (index 0)
    const centerMesh = circleRefs.current[0]
    if (centerMesh) {
      centerMesh.position.set(0, 0, 0)
      centerMesh.scale.setScalar(outerScaleRef.current)
    }

    // Orbiters: scale and radial motion 0→1→0
    for (let i = 0; i < outerPositions.length; i++) {
      const m = circleRefs.current[i + 1]
      if (!m) continue
      m.scale.setScalar(outerScaleRef.current)
      const base = outerPositions[i]
      m.position.set(base[0] * radial, base[1] * radial, 0)
    }

    // Clockwise rotation
    if (groupRef.current) groupRef.current.rotation.z -= 0.25 * delta
  })

  return (
    <group ref={groupRef} frustumCulled={false}>
      {/* Base circle at center; scales same as others */}
      <mesh ref={(el) => { centerRef.current = el; circleRefs.current[0] = el }} geometry={circleGeom}>
        <primitive object={outerMat} attach="material" />
      </mesh>

      {/* Seven orbiting circles: rotate around center; each scales 0.5..1 and blooms in/out */}
      {outerPositions.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => (circleRefs.current[i + 1] = el)}
          geometry={circleGeom}
          position={p}
        >
          <primitive object={outerMat} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

