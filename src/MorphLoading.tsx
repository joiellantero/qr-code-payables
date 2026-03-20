import React from 'react'
import styles from './styles.module.css'

interface MorphLoadingProps {
  size?: 'sm' | 'md' | 'lg'
}

const containerSizes = {
  sm: 64,
  md: 96,
  lg: 128,
}

export default function MorphLoading({ size = 'md' }: MorphLoadingProps) {
  const px = containerSizes[size]

  return (
    <div style={{ position: 'relative', width: px, height: px }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={styles[`morph${i}`]}
          />
        ))}
      </div>
    </div>
  )
}
