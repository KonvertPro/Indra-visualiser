// src/components/Visualiser.jsx
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import ParticleRing from "./ParticleRing"

export default function Visualiser({ analyser }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 5]} intensity={1.5} />

        {/* Particle Energy Rings */}
        <ParticleRing radius={1.2} color="#ABFF73" analyser={analyser} /> {/* green */}
        <ParticleRing radius={1.8} color="#8ECCD9" analyser={analyser} /> {/* blue */}
        <ParticleRing radius={2.4} color="#A872C0" analyser={analyser} /> {/* purple */}

        {/* Controls */}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}
