"use client"

import React, { useEffect, useMemo, useState } from "react"

import { cn } from "@/shared/lib/utils"

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "").trim()
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized
  if (full.length !== 6) return null
  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  if ([r, g, b].some((v) => Number.isNaN(v))) return null
  return { r, g, b }
}

function shade(hex: string, amount: number) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const r = clamp(Math.round(rgb.r + amount), 0, 255)
  const g = clamp(Math.round(rgb.g + amount), 0, 255)
  const b = clamp(Math.round(rgb.b + amount), 0, 255)
  return `rgb(${r} ${g} ${b})`
}

/**
 * InteractiveGridPattern is a component that renders a grid pattern with interactive squares.
 *
 * @param width - The width of each square.
 * @param height - The height of each square.
 * @param squares - The number of squares in the grid. The first element is the number of horizontal squares, and the second element is the number of vertical squares.
 * @param className - The class name of the grid.
 * @param squaresClassName - The class name of the squares.
 */
interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  squares?: [number, number] // [horizontal, vertical]
  className?: string
  squaresClassName?: string
  /**
   * Expands the grid by adding extra cells around the original grid.
   * Example: { bottom: 6 } adds 6 extra rows below.
   */
  expandGrid?: Partial<{ top: number; right: number; bottom: number; left: number }>
  /**
   * Render a "3D pop" cube on hover (rest stays flat).
   * Default: true.
   */
  isometric?: boolean
  /**
   * Hover trail duration in ms for the cube "drawing" effect.
   * Set to 0 to disable trail.
   * Default: 900.
   */
  trailMs?: number
  /**
   * Base cube color for hovered cell.
   * Default: "#3b82f6" (tailwind blue-500).
   */
  hoverColor?: string
}

function IsoCube({
  x,
  y,
  w,
  h,
  intensity,
  className,
  stroke = "rgb(156 163 175 / 0.30)", // gray-400/30
  base = "#3b82f6",
}: {
  x: number
  y: number
  w: number
  h: number
  intensity: number // 0..1
  className?: string
  stroke?: string
  base?: string
}) {
  const t = clamp(intensity, 0, 1)
  if (t <= 0) return null

  // Cube stays fully inside the cell (no overflow).
  const s = Math.min(w, h)
  // Make the cube tightly fit the cell (no inner gap).
  const strokeW = Math.max(1, Math.round(s * 0.035))
  const pad = 0
  const maxInner = Math.max(1, Math.min(w, h) - pad * 2)
  const depth = clamp(Math.round(maxInner * 0.28), 2, Math.floor(maxInner * 0.45))

  const x0 = x + pad
  const y0 = y + pad
  const x1 = x + w - pad
  const y1 = y + h - pad

  // Pop scales with intensity so the trail feels like it "settles back".
  const popX = Math.round(-depth * 0.08 * t)
  const popY = Math.round(-depth * 0.12 * t)

  // Faces are constructed to fit within [x0..x1]x[y0..y1].
  // Front is slightly "cut" to make room for top/right faces.
  const front = `${x0},${y0 + depth} ${x1 - depth},${y0 + depth} ${
    x1 - depth
  },${y1} ${x0},${y1}`
  const top = `${x0},${y0 + depth} ${x1 - depth},${y0 + depth} ${x1},${y0} ${
    x0 + depth
  },${y0}`
  const right = `${x1 - depth},${y0 + depth} ${x1 - depth},${y1} ${x1},${
    y1 - depth
  } ${x1},${y0}`

  const fillFront = shade(base, 0)
  const fillTop = shade(base, 36)
  const fillRight = shade(base, -22)

  return (
    <g
      className={className}
      transform={`translate(${popX} ${popY})`}
      opacity={t}
    >
      <polygon
        points={top}
        fill={fillTop}
        stroke={stroke}
        strokeWidth={strokeW}
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={right}
        fill={fillRight}
        stroke={stroke}
        strokeWidth={strokeW}
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={front}
        fill={fillFront}
        stroke={stroke}
        strokeWidth={strokeW}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  )
}

/**
 * The InteractiveGridPattern component.
 *
 * @see InteractiveGridPatternProps for the props interface.
 * @returns A React component.
 */
export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  expandGrid,
  isometric = true,
  trailMs = 900,
  hoverColor = "#3b82f6",
  ...props
}: InteractiveGridPatternProps) {
  const [baseHorizontal, baseVertical] = squares
  const gridExtraTop = Math.max(0, expandGrid?.top ?? 0)
  const gridExtraRight = Math.max(0, expandGrid?.right ?? 0)
  const gridExtraBottom = Math.max(0, expandGrid?.bottom ?? 0)
  const gridExtraLeft = Math.max(0, expandGrid?.left ?? 0)

  const horizontal = baseHorizontal + gridExtraLeft + gridExtraRight
  const vertical = baseVertical + gridExtraTop + gridExtraBottom
  const gridOffsetX = gridExtraLeft * width
  const gridOffsetY = gridExtraTop * height
  const [activeSquare, setActiveSquare] = useState<number | null>(null)
  const [trail, setTrail] = useState<Record<number, number>>({})
  const [now, setNow] = useState(() => Date.now())

  const effectiveTrailMs = Math.max(0, trailMs)

  useEffect(() => {
    if (effectiveTrailMs <= 0) return
    const id = window.setInterval(() => setNow(Date.now()), 50)
    return () => window.clearInterval(id)
  }, [effectiveTrailMs])

  useEffect(() => {
    if (effectiveTrailMs <= 0) return
    // prune occasionally
    setTrail((prev) => {
      const t = Date.now()
      let changed = false
      const next: Record<number, number> = {}
      for (const [k, exp] of Object.entries(prev)) {
        const idx = Number(k)
        if (Number.isNaN(idx)) {
          changed = true
          continue
        }
        if (exp > t) next[idx] = exp
        else changed = true
      }
      return changed ? next : prev
    })
  }, [now, effectiveTrailMs])

  const cubeIntensityByIndex = useMemo(() => {
    if (effectiveTrailMs <= 0) return null
    const res: Record<number, number> = {}
    for (const [k, exp] of Object.entries(trail)) {
      const idx = Number(k)
      if (Number.isNaN(idx)) continue
      const left = exp - now
      res[idx] = clamp(left / effectiveTrailMs, 0, 1)
    }
    return res
  }, [trail, now, effectiveTrailMs])

  return (
    <svg
      width={width * horizontal}
      height={height * vertical}
      className={cn(
        "absolute inset-0 h-full w-full border border-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <filter id="igp-cube-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="rgb(0 0 0 / 0.25)"
          />
        </filter>
      </defs>
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width - gridOffsetX
        const y = Math.floor(index / horizontal) * height - gridOffsetY
        const intensity =
          activeSquare === index
            ? 1
            : cubeIntensityByIndex?.[index] ?? 0
        const clipId = `igp-cell-clip-${index}`
        return (
          <g
            key={index}
            className={cn(
              "transition-all duration-100 ease-in-out [&:not(:hover)]:duration-1000",
              squaresClassName
            )}
            onMouseEnter={() => {
              setActiveSquare(index)
              if (effectiveTrailMs > 0) {
                const exp = Date.now() + effectiveTrailMs
                setTrail((prev) => ({ ...prev, [index]: exp }))
              }
            }}
            onMouseLeave={() => setActiveSquare(null)}
          >
            <defs>
              <clipPath id={clipId}>
                <rect x={x} y={y} width={width} height={height} />
              </clipPath>
            </defs>
            {/* Keep a full-cell hit area so hover feels solid */}
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="transparent"
            />

            {/* Calm base cell (always flat) */}
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              className="stroke-gray-400/30 fill-transparent"
            />

            {/* Hover effect: cube pops forward + changes color */}
            {isometric ? (
              <g filter="url(#igp-cube-shadow)" clipPath={`url(#${clipId})`}>
                <IsoCube
                  x={x}
                  y={y}
                  w={width}
                  h={height}
                  intensity={intensity}
                  base={hoverColor}
                />
              </g>
            ) : (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                className={cn(
                  "stroke-gray-400/30 transition-colors duration-100",
                  activeSquare === index ? "fill-blue-500" : "fill-transparent"
                )}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
