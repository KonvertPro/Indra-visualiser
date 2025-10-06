import { useEffect, useRef, useState } from "react"

export default function useAudio(initialTrack) {
  const audioRef = useRef(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [track, setTrackState] = useState(initialTrack)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const audioCtxRef = useRef(null)

  useEffect(() => {
    // Create audio element
    const audio = new Audio(initialTrack)
    audio.crossOrigin = "anonymous"
    audioRef.current = audio

    // Setup Web Audio API context + analyser
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioCtxRef.current.createMediaElementSource(audio)
    analyserRef.current = audioCtxRef.current.createAnalyser()
    analyserRef.current.fftSize = 256
    const bufferLength = analyserRef.current.frequencyBinCount
    dataArrayRef.current = new Uint8Array(bufferLength)

    source.connect(analyserRef.current)
    analyserRef.current.connect(audioCtxRef.current.destination)

    const onLoadedMetadata = () => {
      setDuration(isFinite(audio.duration) ? audio.duration : 0)
    }

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("timeupdate", onTimeUpdate)

    const tick = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        const avg = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length
        setAudioLevel(avg / 255)
      }
      requestAnimationFrame(tick)
    }
    tick()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audio.removeEventListener("loadedmetadata", onLoadedMetadata)
        audio.removeEventListener("timeupdate", onTimeUpdate)
        audioRef.current = null
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [initialTrack])

  const play = () => {
    if (!audioRef.current) return
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume()
    }
    audioRef.current.play()
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const setTrack = (url) => {
    if (!audioRef.current) return
    pause()
    audioRef.current.src = url
    setDuration(0)
    setCurrentTime(0)
    setTrackState(url)
  }

  const seekTo = (timeSeconds) => {
    if (!audioRef.current) return
    const clamped = Math.max(0, Math.min(timeSeconds, duration || audioRef.current.duration || 0))
    audioRef.current.currentTime = clamped
    setCurrentTime(clamped)
  }

  return { audioLevel, play, pause, setTrack, duration, currentTime, seekTo }
}
