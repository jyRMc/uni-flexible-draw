/**
 * X6 连接线组合配置系统
 *
 * X6 的边由四个正交维度组合：
 * 1. Router  —— 路径如何绕行（正交、曼哈顿、ER 等）
 * 2. Connector —— 路径如何绘制（直线、圆角、平滑曲线等）
 * 3. Marker —— 端点箭头（block, classic, diamond 等）
 * 4. Style —— 线型/颜色/宽度等视觉样式
 *
 * 每个维度独立配置、自由组合。
 */
import type {
  ConnectorConfig,
  ConnectorName,
  MarkerConfig,
  MarkerName,
  RouterConfig,
  RouterName,
} from '../types/edge'

// ─── Router 配置 ──────────────────────────────────────────────────────

export const ROUTER_NAMES: RouterName[] = ['normal', 'orth', 'manhattan', 'er', 'metro', 'oneSide']

export const ROUTER_LABELS: Record<RouterName, string> = {
  normal: '默认路由',
  orth: '正交路由',
  manhattan: '曼哈顿路由',
  er: 'ER 关系路由',
  metro: '地铁路由',
  oneSide: '单侧路由',
}

export function getRouterConfig(name: RouterName, args?: Record<string, unknown>): RouterConfig | null {
  if (name === 'normal') {
    return null
  }
  switch (name) {
    case 'orth':
      return { name: 'orth', args: { padding: 20, ...args } }
    case 'manhattan':
      return { name: 'manhattan', args: { padding: 20, ...args } }
    case 'er':
      return { name: 'er', args: { offset: 32, direction: 'H', ...args } }
    case 'metro':
      return { name: 'metro', args: { padding: 20, ...args } }
    case 'oneSide':
      return { name: 'oneSide', args: { side: 'bottom', padding: 20, ...args } }
    default:
      return null
  }
}

export function inferRouterName(router: RouterConfig | null | undefined): RouterName {
  if (!router) {
    return 'normal'
  }
  const name = typeof router === 'string' ? router : router.name
  if (ROUTER_NAMES.includes(name as RouterName)) {
    return name as RouterName
  }
  return 'normal'
}

// ─── Connector 配置 ───────────────────────────────────────────────────

export const CONNECTOR_NAMES: ConnectorName[] = ['normal', 'rounded', 'smooth', 'jumpover', 'quadratic', 'wobble']

export const CONNECTOR_LABELS: Record<ConnectorName, string> = {
  normal: '直线连接器',
  rounded: '圆角连接器',
  smooth: '平滑曲线',
  jumpover: '跳线连接器',
  quadratic: '二次贝塞尔',
  wobble: '随机摇摆线',
}

export function getConnectorConfig(name: ConnectorName, args?: Record<string, unknown>): ConnectorConfig | null {
  if (name === 'normal') {
    return null
  }
  switch (name) {
    case 'rounded':
      return { name: 'rounded', args: { radius: 8, ...args } }
    case 'smooth':
      return { name: 'smooth', args }
    case 'jumpover':
      return { name: 'jumpover', args: { type: 'arc', size: 10, radius: 0, ...args } }
    case 'quadratic':
      return { name: 'quadratic', args }
    case 'wobble':
      return { name: 'wobble', args: { spread: 8, ...args } }
    default:
      return null
  }
}

export function inferConnectorName(connector: ConnectorConfig | null | undefined): ConnectorName {
  if (!connector) {
    return 'normal'
  }
  const name = typeof connector === 'string' ? connector : connector.name
  if (CONNECTOR_NAMES.includes(name as ConnectorName)) {
    return name as ConnectorName
  }
  return 'normal'
}

// ─── Marker 配置 ──────────────────────────────────────────────────────

export const MARKER_NAMES: MarkerName[] = ['block', 'classic', 'diamond', 'cross', 'circle', 'circlePlus', 'ellipse', 'async', 'path']

export const MARKER_LABELS: Record<MarkerName, string> = {
  block: '实心三角',
  classic: '经典箭头',
  diamond: '菱形',
  cross: '十字',
  circle: '圆点',
  circlePlus: '圆加',
  ellipse: '椭圆',
  async: '异步箭头',
  path: '自定义路径',
}

export function getMarkerConfig(name: MarkerName | 'none', opts?: Omit<MarkerConfig, 'name'>): MarkerConfig | null {
  if (name === 'none') {
    return null
  }
  return { name, ...opts }
}

export function inferMarkerName(marker: MarkerConfig | null | undefined): MarkerName | 'none' {
  if (!marker) {
    return 'none'
  }
  const name = marker.name
  if (name === 'none') {
    return 'none'
  }
  if (MARKER_NAMES.includes(name as MarkerName)) {
    return name as MarkerName
  }
  return 'none'
}

// ─── StrokeStyle 配置 ──────────────────────────────────────────────────

export type StrokeStyleName = 'solid' | 'dashed' | 'dotted' | 'dashdot'

export const STROKE_STYLE_NAMES: StrokeStyleName[] = ['solid', 'dashed', 'dotted', 'dashdot']

export const STROKE_STYLE_LABELS: Record<StrokeStyleName, string> = {
  solid: '实线',
  dashed: '虚线',
  dotted: '点线',
  dashdot: '点划线',
}

export function getStrokeDasharray(name: StrokeStyleName): string {
  switch (name) {
    case 'dashed':
      return '6 4'
    case 'dotted':
      return '2 4'
    case 'dashdot':
      return '8 3 2 3'
    case 'solid':
    default:
      return ''
  }
}

export function inferStrokeStyleName(dasharray: string | undefined | null): StrokeStyleName {
  if (!dasharray) {
    return 'solid'
  }
  const normalized = dasharray.replace(/\s+/g, ' ').trim()
  if (normalized === '6 4' || normalized === '5 5') {
    return 'dashed'
  }
  if (normalized === '2 4' || normalized === '2 3') {
    return 'dotted'
  }
  if (normalized.includes('8') && normalized.includes('2')) {
    return 'dashdot'
  }
  return 'solid'
}

// ─── EdgeLine 兼容类型 ──────────────────────────────────────────────────

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
  return [{ x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 }]
}

/**
 * 从 router + connector 推断旧版 lineType（向后兼容）
 */
export function getEdgeLineType(
  router: { name?: string } | null | undefined,
  connector: { name?: string } | null | undefined,
  data?: Record<string, unknown> | null,
): EdgeLineType {
  const stored = data?.lineType
  if (typeof stored === 'string') {
    return stored as EdgeLineType
  }
  if (connector?.name === 'smooth') {
    return 'curve'
  }
  if (connector?.name === 'rounded') {
    return 'rounded'
  }
  if (connector?.name === 'jumpover') {
    return 'jumpover'
  }
  if (router?.name === 'orth') {
    return 'orthogonal'
  }
  if (router?.name === 'manhattan') {
    return 'manhattan'
  }
  return 'straight'
}

/**
 * 旧版 lineType → router + connector（向后兼容）
 */
export function getEdgeLineConfig(lineType: string): {
  router: RouterConfig | null
  connector: ConnectorConfig | null
} {
  switch (lineType) {
    case 'rounded':
      return { router: getRouterConfig('orth'), connector: getConnectorConfig('rounded') }
    case 'curve':
      return { router: null, connector: getConnectorConfig('smooth') }
    case 'orthogonal':
      return { router: getRouterConfig('orth'), connector: null }
    case 'manhattan':
      return { router: getRouterConfig('manhattan'), connector: null }
    case 'jumpover':
      return { router: getRouterConfig('manhattan'), connector: getConnectorConfig('jumpover') }
    case 'straight':
    default:
      return { router: null, connector: null }
  }
}

export function getEdgeLineVertices(
  lineType: string,
  source?: EdgeVertexPoint | null,
  target?: EdgeVertexPoint | null,
): EdgeVertexPoint[] {
  if (!source || !target) {
    return []
  }
  const dx = target.x - source.x
  const dy = target.y - source.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  switch (lineType) {
    case 'curve': {
      if (absDx < 1 && absDy < 1) {
        return []
      }
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
  if (current.length !== expected.length) {
    return false
  }
  return current.every((point, index) => {
    const target = expected[index]
    return Math.abs(point.x - target.x) <= tolerance && Math.abs(point.y - target.y) <= tolerance
  })
}

/** 边标签位置类型 */
export type EdgeLabelPosition = 'center' | 'top' | 'bottom' | 'near-source' | 'near-target'

/** 从标签 position 配置推断位置名称 */
export function inferEdgeLabelPosition(position: Record<string, any>): EdgeLabelPosition {
  const distance = position.distance ?? 0.5
  const offset = position.offset ?? 0
  if (distance < 0.3)
    return 'near-source'
  if (distance > 0.7)
    return 'near-target'
  if (typeof offset === 'object' && (offset.y < -5 || (typeof offset === 'number' && offset < -5)))
    return 'top'
  if (typeof offset === 'object' && (offset.y > 5 || (typeof offset === 'number' && offset > 5)))
    return 'bottom'
  if (typeof offset === 'number' && offset < -5)
    return 'top'
  if (typeof offset === 'number' && offset > 5)
    return 'bottom'
  return 'center'
}

/** 将位置名称转换为 X6 标签 position 配置 */
export function getEdgeLabelPosition(position: string): any {
  switch (position) {
    case 'top':
      return { distance: 0.5, offset: -20 }
    case 'bottom':
      return { distance: 0.5, offset: 20 }
    case 'near-source':
      return { distance: 0.25 }
    case 'near-target':
      return { distance: 0.75 }
    case 'center':
    default:
      return 0.5
  }
}
