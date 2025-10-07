import { Canvas } from "@react-three/fiber"
import { useEffect, useState } from "react"
import FlowField from "./FlowField"
import Starfield from "./Starfield"
import CameraRig from "./CameraRig"
import Mandala from "./Mandala"
import CircleMandala from "./CircleMandala"
import useAudio from "./useAudio"
import Narration1 from "./assets/Narration1.wav"
import Narration2 from "./assets/Narration2.wav"
import Narration3 from "./assets/Narration3.wav"

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState("Track 1")
  const [mandalaMode, setMandalaMode] = useState("petal") // 'petal' | 'circle'
  const { audioLevel, play, pause, setTrack, duration, currentTime, seekTo } =
    useAudio(Narration1)

  // Responsive: detect small screens and adjust load
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

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
      style={{ background: "#2B1B38", height: "100dvh" }}
    >
      {/* Ambient overlays */}
      <div className="aurora" style={{ "--audio": audioLevel }}></div>
      <div className="halo" style={{ "--audio": audioLevel }}></div>
      <div className="grain"></div>
      <div className="vignette"></div>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 4] }}
        gl={{ alpha: true }}
        dpr={[1, isMobile ? 1.25 : 2]}
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
          <Starfield
            count={isMobile ? 1200 : 2500}
            depth={120}
            size={isMobile ? 0.01 : 0.012}
            audioLevel={audioLevel}
          />
        </group>

        {/* Mandala centerpiece (toggleable) */}
        {mandalaMode === "petal" ? (
          <Mandala audioLevel={audioLevel} />
        ) : (
          <CircleMandala audioLevel={audioLevel} />
        )}

        {/* Layered FlowFields */}
        <FlowField count={isMobile ? 2200 : 4000} area={5.5} baseSpeed={0.02} particleSize={0.015} audioLevel={audioLevel} />
        <FlowField count={isMobile ? 1800 : 3000} area={6.0} baseSpeed={0.04} particleSize={0.01} audioLevel={audioLevel} />
        <FlowField count={isMobile ? 2500 : 5000} area={4.5} baseSpeed={0.015} particleSize={0.008} audioLevel={audioLevel} />

        {/* Subtle camera motion tied to audio */}
        <CameraRig audioLevel={audioLevel} />
      </Canvas>

      {/* Controls */}
      <div className="absolute left-0 right-0 flex justify-center z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] bottom-0">
        <div className="backdrop-blur-xl bg-white/10 border border-white/15 rounded-2xl shadow-2xl px-4 py-3 sm:px-6 sm:py-4 flex flex-col items-center gap-2 sm:gap-3 w-[min(92vw,34rem)]">
          <p className="text-white/90 text-sm sm:text-base">{currentTrack}</p>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <button
              onClick={togglePlay}
              className="px-4 py-2 sm:px-5 sm:py-2 rounded-xl font-semibold text-indraPurpleMain bg-indraGreen hover:brightness-110 active:brightness-95 transition text-sm sm:text-base"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            {/* Mandala toggle */}
            <div className="flex rounded-lg overflow-hidden border border-white/15">
              <button
                onClick={() => setMandalaMode("petal")}
                className={`px-3 py-2 text-xs sm:text-sm transition ${mandalaMode === "petal" ? "bg-white/20 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
              >
                Petals
              </button>
              <button
                onClick={() => setMandalaMode("circle")}
                className={`px-3 py-2 text-xs sm:text-sm transition ${mandalaMode === "circle" ? "bg-white/20 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
              >
                Circles
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTrackChange(Narration1, "Track 1")}
                className="px-3 py-2 rounded-lg text-white bg-indraPurpleTer/50 hover:bg-indraPurpleTer/70 transition text-sm"
              >
                1
              </button>
              <button
                onClick={() => handleTrackChange(Narration2, "Track 2")}
                className="px-3 py-2 rounded-lg text-white bg-indraPurpleTer/50 hover:bg-indraPurpleTer/70 transition text-sm"
              >
                2
              </button>
              <button
                onClick={() => handleTrackChange(Narration3, "Track 3")}
                className="px-3 py-2 rounded-lg text-white bg-indraPurpleTer/50 hover:bg-indraPurpleTer/70 transition text-sm"
              >
                3
              </button>
            </div>
          </div>
          <div className="w-full flex items-center gap-2 sm:gap-3">
            <span className="text-white/70 text-xs tabular-nums w-10 text-right hidden sm:block">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(1, duration || 0)}
              step={0.01}
              value={Math.min(currentTime || 0, duration || 0)}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-[min(80vw,20rem)] sm:w-80 accent-indraGreen"
            />
            <span className="text-white/70 text-xs tabular-nums w-10 hidden sm:block">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
