import { useEffect, useRef } from 'react'

export function Island({ growthLevel }: { growthLevel: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 400
    const height = 300
    canvas.width = width
    canvas.height = height

    // 1. Draw the sky (background)
    ctx.fillStyle = '#dff3ef'
    ctx.fillRect(0, 0, width, height)

    // 2. Draw the ocean
    ctx.fillStyle = '#b7e5df'
    ctx.beginPath()
    ctx.arc(width / 2, height + 50, 250, Math.PI, 0)
    ctx.fill()

    // 3. Draw the base island (dirt/rock)
    ctx.fillStyle = '#8b7664'
    ctx.beginPath()
    ctx.ellipse(width / 2, height - 50, 120, 40, 0, 0, Math.PI * 2)
    ctx.fill()

    if (growthLevel >= 1) {
      ctx.fillStyle = '#56bd78'
      ctx.beginPath()
      ctx.ellipse(width / 2, height - 55, 110, 35, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    if (growthLevel >= 2) {
      ctx.fillStyle = '#79533b'
      ctx.fillRect(width / 2 - 5, height - 100, 10, 40)
      ctx.fillStyle = '#277453'
      ctx.beginPath()
      ctx.arc(width / 2, height - 110, 30, 0, Math.PI * 2)
      ctx.fill()
    }

    if (growthLevel >= 3) {
      ctx.fillStyle = '#79533b'
      ctx.fillRect(width / 2 - 60, height - 80, 8, 25)
      ctx.fillStyle = '#348b59'
      ctx.beginPath()
      ctx.arc(width / 2 - 56, height - 85, 20, 0, Math.PI * 2)
      ctx.fill()

      // Little flowers
      ctx.fillStyle = '#f29b79'
      ctx.beginPath()
      ctx.arc(width / 2 + 40, height - 70, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(width / 2 + 60, height - 60, 4, 0, Math.PI * 2)
      ctx.fill()
    }

  }, [growthLevel])

  return (
    <div className="island-visual">
      <canvas
        ref={canvasRef}
        className="island-canvas"
        aria-label={`Island landscape at growth level ${growthLevel}`}
        role="img"
      />
      <p className="growth-pill">Growth level {growthLevel}</p>
    </div>
  )
}