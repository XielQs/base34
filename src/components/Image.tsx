import { useState, SyntheticEvent } from 'react'
import type { ImageProps } from 'next/image'
import NextImage from 'next/image'

export default function Image(props: ImageProps & { previewURL?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true)
    event.currentTarget.classList.remove('opacity-0')
  }

  return !('previewURL' in props) ? <NextImage {...props} /> : (
    <>
      {!isLoaded && (
        <NextImage
          {...props}
          src={props.previewURL!}
        />
      )}
      <NextImage
        {...props}
        src={props.src}
        className={props.className + (!isLoaded ? ' opacity-0 absolute' : '')}
        onLoad={onLoad}
      />
    </>
  )
};
