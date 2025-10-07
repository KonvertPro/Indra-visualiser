import { useCallback, useEffect, useRef, useState } from "react"

export default function useAudio(initialUrl) {
  const audioRef = useRef(null)          // <audio> element (one per app)
  const ctxRef = useRef(null)            // AudioContext (created on first play)
  const srcNodeRef = useRef(null)        // MediaElementSourceNode (created once)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const rafIdRef = useRef(null)

  const [audioLevel, setAudioLevel] = useState(0) // 0..1
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // Create the <audio> element once
  useEffect(() => {
    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audio.preload = "auto"
    audio.src = initialUrl
    audioRef.current = audio

    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)

    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("loadedmetadata", onMeta)

    return () => {
      cancelAnimationFrame(rafIdRef.current)
      audio.pause()
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("loadedmetadata", onMeta)
      // Close the context if we made one
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close().catch(() => {})
      }
      audioRef.current = null
      ctxRef.current = null
      srcNodeRef.current = null
      analyserRef.current = null
      dataArrayRef.current = null
    }
  }, [initialUrl])

  // Create AudioContext + graph ONCE (lazy: first play click)
  const ensureAudioGraph = useCallback(() => {
    if (ctxRef.current) return
    const audio = audioRef.current
    if (!audio) return

    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    ctxRef.current = ctx

    // Important: createMediaElementSource only ONCE for a given element
    const src = ctx.createMediaElementSource(audio)
    srcNodeRef.current = src

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyserRef.current = analyser

    src.connect(analyser)
    src.connect(ctx.destination)

    const bufferLen = analyser.frequencyBinCount
    const data = new Uint8Array(bufferLen)
    dataArrayRef.current = data

    const tick = () => {
      if (!analyserRef.current) return
      analyserRef.current.getByteFrequencyData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) sum += data[i]
      const avg = sum / data.length // 0..255
      setAudioLevel(avg / 255)
      setCurrentTime(audio.currentTime || 0)
      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)
  }, [])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    ensureAudioGraph()
    try {
      // Resume context if needed (Safari/Chrome after user gesture)
      if (ctxRef.current?.state === "suspended") {
        await ctxRef.current.resume()
      }
      await audio.play()
    } catch (e) {
      // Swallow AbortError if src changed mid-play
      if (e?.name !== "AbortError") console.warn(e)
    }
  }, [ensureAudioGraph])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const setTrack = useCallback((url) => {
    const audio = audioRef.current
    if (!audio) return
    const wasPlaying = !audio.paused

    // Stop current, reset, and set new src — DO NOT recreate the graph
    audio.pause()
    audio.currentTime = 0
    audio.src = url
    audio.load()

    // Don’t auto-play to avoid AbortError; let the user press Play
    // If you want to resume automatically after the new track is ready:
    // audio.oncanplay = () => { if (wasPlaying) play() }
  }, [])

  const seekTo = useCallback((t) => {
    if (audioRef.current && Number.isFinite(t)) {
      audioRef.current.currentTime = t
    }
  }, [])

  return {
    audioLevel,
    duration,
    currentTime,
    play,
    pause,
    setTrack,
    seekTo,
  }
}
