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
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

export default function Deck() {
  // Wait for images to be loaded
  const [imgsLoaded, setImgsLoaded] = useState(false)

  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out

  // Don't create springs until images are loaded
  const [props, api] = useSprings(
    imgsLoaded ? images.length : 0,
    i => ({
      ...from(i),
      immediate: true,
    }),
  )

  // Load all images first
  useEffect(() => {
    const loadImage = (image) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.src = image.url
        img.onload = () => resolve(image.url)
        img.onerror = (err) => reject(err)
      })

    Promise.all(images.map(loadImage)).then(() => {
      setImgsLoaded(true)
    })
  }, [])

  // Once images are loaded, trigger the card animations
  useEffect(() => {
    if (!imgsLoaded) return
    api.start(i => ({
      ...to(i),
      from: from(i),
      delay: i * 100,
      immediate: false,
    }))
  }, [imgsLoaded, api])

  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(
    ({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      const trigger = vx > 0.2 // If you flick hard enough it should trigger the card to fly out
      if (!active && trigger) gone.add(index) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out

      api.start(i => {
        if (index !== i) return // We're only interested in changing spring-data for the current spring
        const isGone = gone.has(index)
        const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
        const rot = mx / 100 + (isGone ? xDir * 10 * vx : 0) // How much the card tilts, flicking it harder makes it rotate faster
        const scale = active ? 1.1 : 1 // Active cards lift up a bit
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

  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return (
    <>
      {props.length > 0 ? (
        props.map(({ x, y, rot, scale }, i) => (
          <animated.div className={styles.deck} key={i} style={{ x, y }}>
            {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
            <animated.div
              {...bind(i)}
              style={{
                transform: interpolate([rot, scale], trans),
                backgroundImage: `url(${images[i].url})`,
              }}
            />
          </animated.div>
        ))
      ) : (
        // Show this loading animation while waiting for the images to load
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
