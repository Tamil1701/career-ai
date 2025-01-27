"use client"

import { useEffect, useRef } from "react"

interface SemiCircleProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
}

export function SemiCircleProgress({ percentage, size = 200, strokeWidth = 15 }: SemiCircleProgressProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw background arc
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, (size - strokeWidth) / 2, Math.PI, 0)
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = strokeWidth
    ctx.stroke()

    // Draw progress arc
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, (size - strokeWidth) / 2, Math.PI, Math.PI + (percentage / 100) * Math.PI)
    ctx.strokeStyle = `hsl(${percentage > 66 ? "142" : percentage > 33 ? "48" : "0"}, 76%, 36%)`
    ctx.lineWidth = strokeWidth
    ctx.stroke()

    // Draw percentage text
    ctx.fillStyle = "#1e293b"
    ctx.font = "bold 24px Inter"
    ctx.textAlign = "center"
    ctx.fillText(`${Math.round(percentage)}%`, size / 2, size / 2 + 10)
  }, [percentage, size, strokeWidth])

  return <canvas ref={canvasRef} width={size} height={size / 2 + strokeWidth} className="mx-auto" />
}

