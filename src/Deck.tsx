import { useState, useEffect, useRef } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { RiseLoader } from 'react-spinners'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

import styles from './styles.module.css'
import { images } from './Images'

const to = (i: number) => ({
  x: 0,
  y: 0,
  scale: 1,
  rot: -10 + Math.random() * 20,
  opacity: 1,
  delay: i * 100,
})
const from = (_i: number) => ({
  x: 0,
  rot: 0,
  scale: 1.5,
  y: -1000,
  opacity: 0,
})
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

export default function Deck() {
  const [imgsLoaded, setImgsLoaded] = useState(false)
  const gone = useRef(new Set<number>())
  const [goneCount, setGoneCount] = useState(0)

  const [props, api] = useSprings(
    imgsLoaded ? images.length : 0,
    i => ({
      ...from(i),
      immediate: true,
    }),
  )

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
        const opacity = isGone ? 0 : 1
        return {
          x,
          rot,
          scale,
          opacity,
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
        props.map(({ x, y, rot, scale, opacity }, i) => {
          const isTop = i === topIndex

          return (
            <animated.div className={styles.deck} key={i} style={{ x, y }}>
              <animated.div
                {...bind(i)}
                className={styles.card}
                style={{
                  transform: interpolate([rot, scale], trans),
                  backgroundImage: `url(${images[i].url})`,
                  opacity,
                }}
              />
              {isTop && (
                <animated.button
                  className={styles.downloadButton}
                  style={{
                    opacity,
                    transform: opacity.to(o => `translateY(${(1 - o) * 20}px)`),
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    const link = document.createElement('a')
                    link.href = images[i].url!
                    link.download = `image-${i + 1}.jpg`
                    link.click()
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} /> Download
                </animated.button>
              )}
            </animated.div>
          )
        })
      ) : (
        <div className={styles.loader}>
          <RiseLoader color="#ffffff" size={15} />
        </div>
      )}
    </div>
  )
}
