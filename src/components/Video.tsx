import { useEffect, useRef, useState } from 'react'
import { formatVideoTime } from '@/utils/helpers'
import { FaPause, FaPlay } from 'react-icons/fa'
import { VscLoading } from 'react-icons/vsc'

const SKIP_TIME = 5

export default function Video({ src, width, height, poster, loop }: { src: string, width: number, height: number, poster: string, loop: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [displayVideo, setDisplayVideo] = useState(false)
  const [intentHideOverlay, setIntentHideOverlay] = useState(false)

  const updateCurrentTime = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value
    }
  }

  const skipBackward = () => updateCurrentTime(Math.max(0, currentTime - SKIP_TIME))
  const skipForward = () => updateCurrentTime(Math.min(duration, currentTime + SKIP_TIME))

  const skip = (event: React.MouseEvent<HTMLVideoElement>) => {
    if (event.nativeEvent.offsetX < (event.target as HTMLVideoElement).clientWidth / 2) skipBackward()
    else skipForward()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === ' ' || event.key === 'k') {
      event.preventDefault()
      event.stopPropagation()
      setPlaying(!playing)
    } else if (event.key === 'ArrowLeft' || event.key === 'j') {
      event.preventDefault()
      event.stopPropagation()
      skipBackward()
    } else if (event.key === 'ArrowRight' || event.key === 'l') {
      event.preventDefault()
      event.stopPropagation()
      skipForward()
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setDisplayVideo(true)
          else {
            if (videoRef.current) {
              setPlaying(false)
              setLoading(false)
              videoRef.current.addEventListener('error', () => setDisplayVideo(false), { once: true })
              videoRef.current.src = ''
            }
          }
        }
      },
      { rootMargin: '0px' }
    )
    const container = containerRef.current
    if (container) observer.observe(container)
    return () => {
      if (container) observer.unobserve(container)
    }
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [playing])

  const togglePlaying = () => {
    setPlaying(!playing)
    setLoading(true)
    setIntentHideOverlay(playing)
  }

  const toggleOverlay = () => setIntentHideOverlay(!intentHideOverlay)

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="rounded-t-xl h-full relative grid grid-cols-1fr-auto-1fr grid-rows-1fr-auto-1fr w-full"
      style={{ aspectRatio: `${width}/${height}` }}
      tabIndex={0}
    >
      {displayVideo && (
        <>
          <video
            ref={videoRef}
            src={`/api/proxy?query=${encodeURIComponent(src)}`}
            poster={poster}
            loop={loop}
            className="rounded-t-xl w-full col-span-3 row-span-3 object-contain"
            onWaiting={() => setLoading(true)}
            onPlaying={() => setLoading(false)}
            onPause={() => setLoading(false)}
            onEnded={() => {
              if (!loop) {
                setLoading(false)
                setPlaying(false)
              }
            }}
            onClick={toggleOverlay}
            onDoubleClick={skip}
            preload="metadata"
            onLoadedMetadata={event => {
              const video = event.currentTarget
              setDuration(video.duration)
            }}
            onTimeUpdate={event => {
              setCurrentTime(event.currentTarget.currentTime)
            }}
            style={{ aspectRatio: `${width}/${height}` }}
          >
            Your browser does not support the video tag.
          </video>
          <span className={`absolute bottom-6 right-3 text-white bg-black/75 bg-opacity-50 rounded p-1 text-xs ${intentHideOverlay ? 'hidden' : ''}`}>
            {formatVideoTime(duration - currentTime)}
          </span>
          <input
            type="range"
            title="Video progress"
            min={0}
            max={duration}
            step={0.0166666}
            value={currentTime}
            onChange={e => updateCurrentTime(parseFloat(e.target.value))}
            className={`absolute bottom-0 left-2 right-2 h-6 py-2.5 px-2 z-10 bg-clip-content appearance-none bg-transparent transition-all duration-500 ${intentHideOverlay ? 'hidden' : ''}`}
            style={{ backgroundImage: `linear-gradient(90deg, var(--color-secondary) ${(currentTime / duration) * 98 + 1}%, var(--color-primary-tone) ${(currentTime / duration) * 98 + 1}%)` }}
          />
          <div
            className={`absolute inset-0 m-auto flex items-center justify-center ${intentHideOverlay ? 'hidden' : ''}`}
            onClick={togglePlaying}
          >
            <div className={`bg-white bg-opacity-50 w-12 h-12 rounded-full flex items-center justify-center ${loading ? 'p-3' : 'p-4'}`}>
              {loading ? <VscLoading className="text-black text-6xl font-bold animate-spin" /> : playing ? <FaPause className="text-black text-4xl" /> : <FaPlay className="text-black text-4xl" />}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
