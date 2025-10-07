import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

export default function CameraRig({ audioLevel = 0 }) {
  const { camera } = useThree()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const beat = Math.min(Math.max(audioLevel, 0), 1)

    // Gentle dolly in/out on audio, plus micro rotation drift
    const targetZ = 4 - beat * 0.7
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.5, state.clock.getDelta())

    const rot = 0.02 * Math.sin(t * 0.1)
    camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, rot, 2.5, state.clock.getDelta())
  })

  return null
}

