import type { ImageProps } from 'next/image'
import NextImage from 'next/image'
import { useState } from 'react'

export default function Image(props: ImageProps & { previewURL?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = () => {
    setIsLoaded(true)
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
        className={props.className + (!isLoaded ? ' opacity-0 absolute -left-96' : '')}
        onLoad={onLoad}
      />
    </>
  )
};
