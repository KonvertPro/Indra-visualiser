import { Canvas } from "@react-three/fiber"
import { useState } from "react"
import Kaleidoscope from "./Kaleidoscope"
import Starfield from "./Starfield"
import useAudio from "./useAudio"
import Narration1 from "./assets/Narration1.wav"
import Narration2 from "./assets/Narration2.wav"
import Narration3 from "./assets/Narration3.wav"

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState("Track 1")
  const { audioLevel, play, pause, setTrack, duration, currentTime, seekTo } = useAudio(Narration1)

  const formatTime = (secs) => {
    if (!secs || !isFinite(secs)) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const togglePlay = () => {
    if (isPlaying) {
      pause()
      setIsPlaying(false)
    } else {
      play()
      setIsPlaying(true)
    }
  }

  const handleTrackChange = (url, label) => {
    setTrack(url)
    setIsPlaying(false)
    setCurrentTrack(label)
  }

  return (
    <div
      className="w-screen h-screen relative"
      style={{ background: "#2B1B38" }}
    >
      {/* Ambient overlays */}
      <div className="aurora"></div>
      <div className="grain"></div>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 4] }}
        gl={{ alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
        }}
      >
        <ambientLight intensity={0.6} />

        {/* Starfield far background */}
        <group position={[0, 0, -10]}>
          <Starfield count={2500} depth={120} size={0.012} />
        </group>


        <Kaleidoscope audioLevel={audioLevel} phase={0.0} scale={3.5} />
        <Kaleidoscope audioLevel={audioLevel} phase={1.5} scale={3.7} />
        <Kaleidoscope audioLevel={audioLevel} phase={3.0} scale={3.3} />
      </Canvas>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
        <div className="backdrop-blur-xl bg-white/10 border border-white/15 rounded-2xl shadow-2xl px-6 py-4 flex flex-col items-center gap-3">
          <p className="text-white/90 text-sm">{currentTrack}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="px-5 py-2 rounded-xl font-semibold text-indraPurpleMain bg-indraGreen hover:brightness-110 active:brightness-95 transition"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleTrackChange(Narration1, "Track 1")}
                className="px-3 py-2 rounded-lg text-white bg-indraPurpleTer/50 hover:bg-indraPurpleTer/70 transition"
              >
                1
              </button>
              <button
                onClick={() => handleTrackChange(Narration2, "Track 2")}
                className="px-3 py-2 rounded-lg text-white bg-indraPurpleTer/50 hover:bg-indraPurpleTer/70 transition"
              >
                2
              </button>
              <button
                onClick={() => handleTrackChange(Narration3, "Track 3")}
                className="px-3 py-2 rounded-lg text-white bg-indraPurpleTer/50 hover:bg-indraPurpleTer/70 transition"
              >
                3
              </button>
            </div>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-white/70 text-xs tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, duration || 0)}
              step={0.01}
              value={Math.min(currentTime || 0, duration || 0)}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-80 accent-indraGreen"
            />
            <span className="text-white/70 text-xs tabular-nums w-10">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}


