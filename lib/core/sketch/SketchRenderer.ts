import rough from 'roughjs'
import type { Drawable, OpSet, Options as RoughOptions } from 'roughjs/bin/core'

/**
 * 草图粗糙度档位（参考 Excalidraw）
 */
export const ROUGHNESS = {
  architect: 0,
  artist: 1,
  cartoonist: 2,
} as const

export interface SketchRenderOptions {
  roughness?: number
  bowing?: number
  stroke?: string
  strokeWidth?: number
  fill?: string
  fillStyle?: 'hachure' | 'cross-hatch' | 'solid'
  fillWeight?: number
  hachureAngle?: number
  hachureGap?: number
  seed?: number
  strokeLineDash?: number[]
  preserveVertices?: boolean
  disableMultiStroke?: boolean
  curveFitting?: number
}

/** 自适应粗糙度（参考 Excalidraw adjustRoughness） */
function adjustRoughness(width: number, height: number, roughness: number): number {
  const maxSize = Math.max(width, height)
  const minSize = Math.min(width, height)
  if ((minSize >= 20 && maxSize >= 50) || minSize >= 15)
    return roughness
  return Math.min(roughness / (maxSize < 10 ? 3 : 2), 2.5)
}

/** 将 roughjs ops 转为 SVG path d 字符串 */
function opsToD(opSet: OpSet): string {
  const ops = opSet.ops
  if (!ops || ops.length === 0)
    return ''
  let d = ''
  for (const op of ops) {
    switch (op.op) {
      case 'move':
        d += `M${op.data[0]} ${op.data[1]}`
        break
      case 'bcurveTo':
        d += `C${op.data[0]} ${op.data[1]},${op.data[2]} ${op.data[3]},${op.data[4]} ${op.data[5]}`
        break
      case 'lineTo':
        d += `L${op.data[0]} ${op.data[1]}`
        break
    }
  }
  return d
}

/** 从 Drawable 提取所有 OpSet 合并为单条 SVG path d 字符串 */
function drawableToD(drawable: Drawable): string {
  const parts: string[] = []
  for (const opSet of drawable.sets || []) {
    const d = opsToD(opSet)
    if (d)
      parts.push(d)
  }
  return parts.join(' ')
}

function toRoughOptions(opts: SketchRenderOptions, width: number, height: number): RoughOptions {
  const roughness = adjustRoughness(width, height, opts.roughness ?? ROUGHNESS.artist)
  return {
    seed: opts.seed ?? 1,
    roughness,
    bowing: opts.bowing ?? 1,
    stroke: opts.stroke ?? '#333',
    strokeWidth: opts.strokeWidth ?? 2,
    fill: opts.fill,
    fillStyle: opts.fillStyle,
    fillWeight: opts.fillWeight ?? (opts.strokeWidth ? opts.strokeWidth / 2 : 1),
    hachureAngle: opts.hachureAngle ?? -41,
    hachureGap: opts.hachureGap ?? (opts.strokeWidth ? opts.strokeWidth * 4 : 8),
    strokeLineDash: opts.strokeLineDash,
    preserveVertices: opts.preserveVertices ?? roughness < ROUGHNESS.cartoonist,
    disableMultiStroke: opts.disableMultiStroke ?? false,
    curveFitting: opts.curveFitting,
  }
}

/**
 * SketchRenderer — 线条绘制策略扩展
 *
 * 职责单一：根据形状参数，返回手绘风格的 SVG path d 字符串
 * 不操作 DOM，不生成覆盖层，只提供绘制数据
 */
export class SketchRenderer {
  private generator: ReturnType<typeof rough.generator>

  constructor() {
    this.generator = rough.generator()
  }

  /**
   * 矩形 → 手绘路径 d
   */
  rect(width: number, height: number, rx: number = 0, opts: SketchRenderOptions = {}): string {
    const options = toRoughOptions(opts, width, height)
    let drawable: Drawable
    if (rx > 0) {
      const r = Math.min(rx, width / 2, height / 2)
      const d = `M ${r} 0 L ${width - r} 0 Q ${width} 0, ${width} ${r} L ${width} ${height - r} Q ${width} ${height}, ${width - r} ${height} L ${r} ${height} Q 0 ${height}, 0 ${height - r} L 0 ${r} Q 0 0, ${r} 0`
      drawable = this.generator.path(d, { ...options, preserveVertices: true })
    }
    else {
      drawable = this.generator.rectangle(0, 0, width, height, options)
    }
    return drawableToD(drawable)
  }

  /**
   * 椭圆 → 手绘路径 d
   */
  ellipse(width: number, height: number, opts: SketchRenderOptions = {}): string {
    const options = toRoughOptions(opts, width, height)
    const drawable = this.generator.ellipse(width / 2, height / 2, width, height, {
      ...options,
      curveFitting: options.curveFitting ?? 1,
    })
    return drawableToD(drawable)
  }

  /**
   * 多边形 → 手绘路径 d（通用：菱形、三角形、六边形、星形等）
   */
  polygon(points: [number, number][], width: number, height: number, opts: SketchRenderOptions = {}): string {
    const options = toRoughOptions(opts, width, height)
    const drawable = this.generator.polygon(points, { ...options, preserveVertices: true })
    return drawableToD(drawable)
  }

  /**
   * 折线 → 手绘路径 d（边/连接线）
   */
  linearPath(points: { x: number, y: number }[], opts: SketchRenderOptions = {}): string {
    if (points.length < 2)
      return ''
    const pts = points.map(p => [p.x, p.y] as [number, number])
    const xs = pts.map(p => p[0])
    const ys = pts.map(p => p[1])
    const w = Math.max(...xs) - Math.min(...xs) || 50
    const h = Math.max(...ys) - Math.min(...ys) || 50
    const options = toRoughOptions(opts, w, h)
    const drawable = this.generator.linearPath(pts, { ...options, preserveVertices: true })
    return drawableToD(drawable)
  }

  /**
   * 曲线 → 手绘路径 d
   */
  curve(points: { x: number, y: number }[], opts: SketchRenderOptions = {}): string {
    if (points.length < 2)
      return ''
    const pts = points.map(p => [p.x, p.y] as [number, number])
    const xs = pts.map(p => p[0])
    const ys = pts.map(p => p[1])
    const w = Math.max(...xs) - Math.min(...xs) || 50
    const h = Math.max(...ys) - Math.min(...ys) || 50
    const options = toRoughOptions(opts, w, h)
    const drawable = this.generator.curve(pts, options)
    return drawableToD(drawable)
  }
}

/** 全局单例 */
let _instance: SketchRenderer | null = null

export function getSketchRenderer(): SketchRenderer {
  if (!_instance) {
    _instance = new SketchRenderer()
  }
  return _instance
}
