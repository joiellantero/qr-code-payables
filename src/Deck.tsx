import { useState, useEffect, useRef, useCallback } from 'react'
import { useSprings, animated, to as interpolate, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import MorphLoading from './MorphLoading'

import styles from './styles.module.css'
import { images } from './Images'

const to = (i: number) => ({
  x: 0,
  y: 0,
  scale: 1,
  rot: -10 + Math.random() * 20,
  zoom: 0,
  delay: i * 100,
})
const from = (_i: number) => ({
  x: 0,
  rot: 0,
  scale: 1.5,
  y: -1000,
  zoom: 0,
})
const trans = (r: number, s: number, z: number) => {
  const rotX = 30 * (1 - z)
  const rotY = (r / 10) * (1 - z)
  const rotZ = r * (1 - z)
  return `perspective(1500px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${s})`
}

export default function Deck() {
  const [imgsLoaded, setImgsLoaded] = useState(false)
  const gone = useRef(new Set<number>())
  const [goneCount, setGoneCount] = useState(0)
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null)
  const dragOccurred = useRef(false)

  const [props, api] = useSprings(
    imgsLoaded ? images.length : 0,
    i => ({
      ...from(i),
      immediate: true,
    }),
  )

  const [overlaySpring, overlayApi] = useSpring(() => ({
    opacity: 0,
    config: { tension: 300, friction: 26 },
  }))

  const openZoom = useCallback((index: number) => {
    setZoomedIndex(index)
    overlayApi.start({ opacity: 1 })
    api.start(i => {
      if (i !== index) return
      return {
        rot: 0,
        scale: 1.4,
        zoom: 1,
        x: 0,
        y: 0,
        delay: undefined,
        config: { tension: 300, friction: 26 },
      }
    })
  }, [api, overlayApi])

  const closeZoom = useCallback(() => {
    if (zoomedIndex === null) return
    const index = zoomedIndex
    overlayApi.start({
      opacity: 0,
      onRest: () => setZoomedIndex(null),
    })
    api.start(i => {
      if (i !== index) return
      return {
        ...to(index),
        delay: undefined,
        config: { tension: 300, friction: 26 },
      }
    })
  }, [zoomedIndex, api, overlayApi])

  useEffect(() => {
    const loadImage = (image) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.src = image.url!
        img.onload = () => resolve(image.url)
        img.onerror = reject
      })

    Promise.all(images.map(loadImage)).then(() => {
      setImgsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!imgsLoaded) return
    api.start(i => ({
      ...to(i),
      from: from(i),
      delay: i * 100,
      immediate: false,
    }))
  }, [imgsLoaded, api])

  const bind = useDrag(
    ({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      if (zoomedIndex !== null) return
      if (active && Math.abs(mx) > 4) dragOccurred.current = true

      const trigger = vx > 0.2
      if (!active && trigger) {
        gone.current.add(index)
        setGoneCount(gone.current.size)
      }

      api.start(i => {
        if (index !== i) return
        const isGone = gone.current.has(index)
        const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0
        const rot = mx / 100 + (isGone ? xDir * 10 * vx : 0)
        const scale = active ? 1.1 : 1
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
        }
      })

      if (!active && gone.current.size === images.length) {
        setTimeout(() => {
          gone.current.clear()
          setGoneCount(0)
          api.start(i => to(i))
        }, 500)
      }
    },
  )

  const topIndex = images.length - goneCount - 1

  return (
    <div className="flex center fill">
      {imgsLoaded ? (
        <>
          {props.map(({ x, y, rot, scale, zoom }, i) => (
            <animated.div
              className={styles.deck}
              key={i}
              style={{ x, y, zIndex: i === zoomedIndex ? 1001 : undefined }}
            >
              <animated.div
                {...bind(i)}
                className={styles.card}
                style={{
                  transform: interpolate([rot, scale, zoom], trans),
                  backgroundImage: `url(${images[i].url})`,
                  cursor: i === zoomedIndex ? 'zoom-out' : 'pointer',
                }}
                onPointerUp={() => {
                  if (!dragOccurred.current) {
                    if (zoomedIndex === i) closeZoom()
                    else if (i === topIndex) openZoom(i)
                  }
                  dragOccurred.current = false
                }}
              />
            </animated.div>
          ))}

          <div className={styles.hint}>
            Tap card to zoom &middot; Swipe to browse
          </div>

          {zoomedIndex !== null && (
            <animated.div
              className={styles.overlay}
              style={{ opacity: overlaySpring.opacity }}
              onClick={closeZoom}
            />
          )}
        </>
      ) : (
        <div className={styles.loader}>
          <MorphLoading size="lg" />
        </div>
      )}
    </div>
  )
}
