import { EDGE_SHAPES } from '../constants/shapes'

export type EdgeLineType = 'straight' | 'curve' | 'rounded' | 'orthogonal' | 'manhattan' | 'jumpover'

export interface EdgeVertexPoint {
  x: number
  y: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getOrthogonalVertices(source: EdgeVertexPoint, target: EdgeVertexPoint): EdgeVertexPoint[] {
  const dx = target.x - source.x
  const dy = target.y - source.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  const horizontalFirst = absDx >= absDy
  const detour = clamp(Math.max((horizontalFirst ? absDy : absDx) * 0.5, 28), 28, 72)

  if (horizontalFirst) {
    if (absDy <= 4) {
      const offsetY = (source.y >= target.y ? -1 : 1) * detour
      const pivotX = source.x + dx / 3
      return [
        { x: pivotX, y: source.y },
        { x: pivotX, y: source.y + offsetY },
        { x: target.x, y: source.y + offsetY },
      ]
    }

    const midX = source.x + dx / 2
    return [
      { x: midX, y: source.y },
      { x: midX, y: target.y },
    ]
  }

  if (absDx <= 4) {
    const offsetX = (source.x <= target.x ? 1 : -1) * detour
    const pivotY = source.y + dy / 3
    return [
      { x: source.x, y: pivotY },
      { x: source.x + offsetX, y: pivotY },
      { x: source.x + offsetX, y: target.y },
    ]
  }

  const midY = source.y + dy / 2
  return [
    { x: source.x, y: midY },
    { x: target.x, y: midY },
  ]
}

function getMidpointVertex(source: EdgeVertexPoint, target: EdgeVertexPoint): EdgeVertexPoint[] {
  return [
    {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2,
    },
  ]
}

export function getEdgeShapeLineType(shape: string): EdgeLineType | null {
  if (shape === EDGE_SHAPES.CURVE)
    return 'curve'
  if (shape === EDGE_SHAPES.ORTHOGONAL)
    return 'orthogonal'
  return null
}

export function getEdgeLineType(
  router: { name?: string } | null | undefined,
  connector: { name?: string } | null | undefined,
  data?: Record<string, unknown> | null,
): EdgeLineType {
  const stored = data?.lineType
  if (typeof stored === 'string') {
    return stored as EdgeLineType
  }
  if (connector?.name === 'smooth')
    return 'curve'
  if (connector?.name === 'rounded')
    return 'rounded'
  if (connector?.name === 'jumpover')
    return 'jumpover'
  if (router?.name === 'orth')
    return 'orthogonal'
  if (router?.name === 'manhattan')
    return 'manhattan'
  return 'straight'
}

export function getEdgeLineConfig(lineType: string): {
  router: { name: string, args?: Record<string, unknown> } | null
  connector: { name: string, args?: Record<string, unknown> } | null
} {
  switch (lineType) {
    case 'rounded':
      return {
        router: null,
        connector: { name: 'rounded', args: { radius: 16 } },
      }
    case 'curve':
      return {
        router: null,
        connector: { name: 'smooth' },
      }
    case 'orthogonal':
      return {
        router: null,
        connector: null,
      }
    case 'manhattan':
      return {
        router: { name: 'manhattan' },
        connector: null,
      }
    case 'jumpover':
      return {
        router: { name: 'manhattan' },
        connector: { name: 'jumpover', args: { type: 'arc', size: 10 } },
      }
    case 'straight':
    default:
      return {
        router: null,
        connector: null,
      }
  }
}

export function getEdgeLineVertices(
  lineType: string,
  source?: EdgeVertexPoint | null,
  target?: EdgeVertexPoint | null,
): EdgeVertexPoint[] {
  if (!source || !target)
    return []

  const dx = target.x - source.x
  const dy = target.y - source.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  switch (lineType) {
    case 'curve': {
      if (absDx < 1 && absDy < 1)
        return []

      if (absDx >= absDy) {
        const offset = clamp(Math.max(absDx * 0.12, absDy * 0.6, 36), 36, 96)
        const sign = dy === 0 ? -1 : (dy > 0 ? -1 : 1)
        return [
          { x: source.x + dx / 3, y: source.y + offset * sign },
          { x: source.x + (dx * 2) / 3, y: target.y - offset * sign },
        ]
      }

      const offset = clamp(Math.max(absDy * 0.12, absDx * 0.6, 36), 36, 96)
      const sign = dx === 0 ? 1 : (dx > 0 ? -1 : 1)
      return [
        { x: source.x + offset * sign, y: source.y + dy / 3 },
        { x: target.x - offset * sign, y: source.y + (dy * 2) / 3 },
      ]
    }
    case 'rounded':
    case 'orthogonal':
      return getOrthogonalVertices(source, target)
    case 'straight':
    case 'manhattan':
    case 'jumpover':
      return getMidpointVertex(source, target)
    default:
      return []
  }
}

export function isSameEdgeVertices(
  current: EdgeVertexPoint[],
  expected: EdgeVertexPoint[],
  tolerance = 4,
): boolean {
  if (current.length !== expected.length)
    return false
  return current.every((point, index) => {
    const target = expected[index]
    return Math.abs(point.x - target.x) <= tolerance && Math.abs(point.y - target.y) <= tolerance
  })
}
