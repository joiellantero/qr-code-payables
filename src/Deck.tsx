import { useState, useEffect } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { RiseLoader } from 'react-spinners'

import styles from './styles.module.css'
import { images } from './Images'

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
})
const from = (_i: number) => ({
  x: 0,
  rot: 0,
  scale: 1.5,
  y: -1000,
})
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

export default function Deck() {
  const [imgsLoaded, setImgsLoaded] = useState(false)
  const [gone] = useState(() => new Set())

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
        img.onerror = (err) => reject(err)
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
      if (!active && trigger) gone.add(index)

      api.start(i => {
        if (index !== i) return
        const isGone = gone.has(index)
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

      if (!active && gone.size === images.length)
        setTimeout(() => {
          gone.clear()
          api.start(i => to(i))
        }, 500)
    },
  )

  return (
    <>
      {props.length > 0 ? (
        props.map(({ x, y, rot, scale }, i) => (
          <animated.div className={styles.deck} key={i} style={{ x, y }}>
            <animated.div
              {...bind(i)}
              style={{
                transform: interpolate([rot, scale], trans),
                backgroundImage: `url(${images[i].url})`,
                position: 'relative',
              }}
            >
              <button
                className={styles.downloadButton}
                onClick={(e) => {
                  e.stopPropagation()
                  const link = document.createElement('a')
                  link.href = images[i].url!
                  link.download = `image-${i + 1}.jpg`
                  link.click()
                }}
              >
                ⬇
              </button>
            </animated.div>
          </animated.div>
        ))
      ) : (
        <div className={styles.loader}>
          <RiseLoader
            color="#ffffff"
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
    </>
  )
}
