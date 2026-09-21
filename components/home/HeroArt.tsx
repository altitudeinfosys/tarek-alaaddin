'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'

const RAMP = ' ..::-==++**##%%@@'
const CELL_W = 9
const CELL_H = 15
const FRAME_MS = 80 // ~12fps keeps the drift calm and cheap

const COLORS = {
  light: 'rgba(2, 132, 199, 0.6)',
  dark: 'rgba(56, 189, 248, 0.5)',
}

// Drifting ribbon of characters behind the hero photo. Purely decorative:
// drawn only on the client, paused offscreen, static under reduced motion.
export default function HeroArt({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Canvas can't resolve CSS variables, so read the resolved mono stack off the element
    const fontFamily = getComputedStyle(canvas).fontFamily
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let visible = true
    let last = 0
    let frame = 0

    const size = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(width / CELL_W)
      rows = Math.ceil(height / CELL_H)
    }

    const draw = (ms: number) => {
      const t = ms / 1000
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = COLORS[theme]
      ctx.font = `12px ${fontFamily}`
      ctx.textBaseline = 'top'

      for (let y = 0; y < rows; y++) {
        const ny = y / rows
        for (let x = 0; x < cols; x++) {
          const nx = x / cols
          // A ribbon that snakes across the field, with slower swells inside it
          const mid = 0.56 + 0.13 * Math.sin(nx * 5.2 + t * 0.45) + 0.05 * Math.sin(nx * 11 - t * 0.3)
          const band = 1 - Math.min(1, Math.abs(ny - mid) / 0.2)
          if (band <= 0) continue
          const v = band * (0.62 + 0.38 * Math.sin(nx * 9 - t * 0.8 + ny * 6) * Math.cos(ny * 7 + t * 0.35))
          const i = Math.max(0, Math.min(RAMP.length - 1, Math.floor(v * RAMP.length)))
          const ch = RAMP.charAt(i)
          if (ch === ' ') continue
          ctx.globalAlpha = 0.25 + 0.75 * band
          ctx.fillText(ch, x * CELL_W, y * CELL_H)
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = (ms: number) => {
      if (visible && ms - last > FRAME_MS) {
        last = ms
        draw(ms)
      }
      frame = requestAnimationFrame(loop)
    }

    const onResize = () => {
      size()
      draw(performance.now())
    }

    size()
    draw(4000)
    window.addEventListener('resize', onResize)

    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting
    })
    observer.observe(canvas)

    if (!reduceMotion) frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
    }
  }, [theme])

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none font-mono ${className}`} />
}
