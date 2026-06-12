import { type Edge, Graph } from '@antv/x6'
import rough from 'roughjs'
import type { OpSet, Options as RoughOptions } from 'roughjs/bin/core'
import { PRIMARY_COLOR } from '../theme'
import { ROUGHNESS } from '../../core'

const SKETCH_CONNECTOR_NAME = 'uni-draw-sketch-straight'
let sketchConnectorRegistered = false
const generator = rough.generator()

function hashSeed(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash) || 1
}

function toPoint(value: any): { x: number, y: number } {
  return { x: Number(value?.x ?? 0), y: Number(value?.y ?? 0) }
}

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

function adjustRoughness(points: Array<{ x: number, y: number }>, roughness: number): number {
  const xs = points.map(point => point.x)
  const ys = points.map(point => point.y)
  const width = Math.max(...xs) - Math.min(...xs)
  const height = Math.max(...ys) - Math.min(...ys)
  const maxSize = Math.max(width, height)

  if (maxSize >= 50)
    return roughness

  return Math.min(roughness / (maxSize < 10 ? 3 : 2), 2.5)
}

function getLinearPathD(points: Array<{ x: number, y: number }>, args?: Record<string, any>): string {
  const roughness = Number(args?.roughness ?? ROUGHNESS.artist)
  const strokeWidth = Math.max(Number(args?.strokeWidth ?? 2), 1)
  const options: RoughOptions = {
    seed: typeof args?.seed === 'string' ? hashSeed(args.seed) : Number(args?.seed ?? 1),
    strokeWidth,
    fillWeight: strokeWidth / 2,
    hachureGap: strokeWidth * 4,
    roughness: adjustRoughness(points, roughness),
    stroke: args?.stroke ?? '#000',
    disableMultiStroke: false,
    preserveVertices: roughness < ROUGHNESS.cartoonist,
  }
  const drawable = generator.linearPath(points.map(point => [point.x, point.y] as [number, number]), options)
  return (drawable.sets || []).map(opsToD).filter(Boolean).join(' ')
}

function registerSketchConnector() {
  if (sketchConnectorRegistered)
    return
  Graph.registerConnector(SKETCH_CONNECTOR_NAME, (sourcePoint: any, targetPoint: any, routePoints: any[] = [], args?: Record<string, any>) => {
    const points = [toPoint(sourcePoint), ...routePoints.map(toPoint), toPoint(targetPoint)]
    return getLinearPathD(points, args)
  }, true)
  sketchConnectorRegistered = true
}

registerSketchConnector()

export const edgeSketch: Edge.Config = {
  inherit: 'edge',
  connector: {
    name: SKETCH_CONNECTOR_NAME,
    args: {
      roughness: ROUGHNESS.artist,
      strokeWidth: 2,
    },
  },
  attrs: {
    line: {
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      sourceMarker: null,
      targetMarker: null,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
  },
}
