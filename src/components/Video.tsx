import { useEffect, useRef } from 'react'
import fluidPlayer from 'fluid-player'

export default function Video({ src, width, height, poster, loop }: { src: string, width: number, height: number, poster: string, loop: boolean }) {

  const videoRef = useRef<HTMLVideoElement>(null)
  let player: FluidPlayerInstance | null = null

  useEffect(() => {
    if (!videoRef.current || player) return
    // eslint-disable-next-line react-hooks/exhaustive-deps
    player = fluidPlayer(videoRef.current, {
      layoutControls: {
        controlBar: {
          autoHideTimeout: 3,
          animated: true,
          autoHide: true
        },
        autoPlay: false,
        mute: false,
        allowTheatre: false,
        playPauseAnimation: false,
        playbackRateEnabled: true,
        allowDownload: true,
        playButtonShowing: true,
        fillToContainer: false,
        primaryColor: 'var(--color-secondary)',
      },
    })
  }, [videoRef])

  return (
    <video ref={videoRef} width={width} height={height} poster={poster} loop={loop}>
      <source src={src} data-fluid-hd type="video/mp4" />
    </video>
  )
}
