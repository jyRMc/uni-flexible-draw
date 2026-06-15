import type { LabelConfig } from './node'

export { LabelConfig }

export type EdgeEndpoint =
  | string
  | { cell: string, port?: string }
  | { x: number, y: number }

// ─── Router 类型 ────────────────────────────────────────────────────────
export type RouterName = 'normal' | 'orth' | 'manhattan' | 'er' | 'metro' | 'oneSide'

export interface RouterConfig {
  name: RouterName
  args?: Record<string, unknown>
}

// ─── Connector 类型 ─────────────────────────────────────────────────────
export type ConnectorName = 'normal' | 'rounded' | 'smooth' | 'jumpover' | 'quadratic' | 'wobble'

export interface ConnectorConfig {
  name: ConnectorName
  args?: Record<string, unknown>
}

// ─── Marker 类型 ────────────────────────────────────────────────────────
export type MarkerName = 'block' | 'classic' | 'diamond' | 'cross' | 'circle' | 'circlePlus' | 'ellipse' | 'async' | 'path'

export interface MarkerConfig {
  /** 箭头类型 */
  name: MarkerName | 'none'
  /** 大小 */
  size?: number
  /** 填充色 */
  fill?: string
  /** 描边色 */
  stroke?: string
  /** 描边宽度 */
  strokeWidth?: number
  /** path 类型专用：自定义 SVG path d 属性 */
  d?: string
}

// ─── EdgeData ───────────────────────────────────────────────────────────
export interface EdgeData {
  /** 全局唯一 ID */
  id: string
  /** 边类型（'edge' | 'edge-sketch'） */
  shape: string
  /** 源节点/端口 */
  source: EdgeEndpoint
  /** 目标节点/端口 */
  target: EdgeEndpoint
  /** 边样式 */
  style?: EdgeStyle
  /** 标签 */
  label?: string | LabelConfig
  /** 业务数据 */
  data?: Record<string, unknown>
  /** 顶点（折线点） */
  vertices?: Array<{ x: number, y: number }>
  /** 路由方式 */
  router?: string | RouterConfig | null
  /** 连接器 */
  connector?: string | ConnectorConfig | null
}

// ─── EdgeStyle ──────────────────────────────────────────────────────────
export interface EdgeStyle {
  /** 线条颜色 */
  stroke?: string
  /** 线条宽度 */
  strokeWidth?: number
  /** 线型 */
  strokeDasharray?: string
  /** 源箭头 */
  sourceMarker?: MarkerConfig | null
  /** 目标箭头 */
  targetMarker?: MarkerConfig | null
  /** 线帽样式 */
  strokeLinecap?: 'butt' | 'round' | 'square'
  /** 线连接样式 */
  strokeLinejoin?: 'miter' | 'round' | 'bevel'
}
