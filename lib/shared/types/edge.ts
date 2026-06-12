import type { LabelConfig } from './node'

export { LabelConfig }

export type EdgeEndpoint =
  | string
  | { cell: string, port?: string }
  | { x: number, y: number }

export interface EdgeData {
  /** 全局唯一 ID */
  id: string
  /** 边类型 */
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
  router?: string | { name: string, args?: Record<string, unknown> }
  /** 连接器 */
  connector?: string | { name: string, args?: Record<string, unknown> }
}

export interface EdgeStyle {
  /** 线条颜色 */
  stroke?: string
  /** 线条宽度 */
  strokeWidth?: number
  /** 线型 */
  strokeDasharray?: string
  /** 源箭头 */
  sourceMarker?: MarkerConfig
  /** 目标箭头 */
  targetMarker?: MarkerConfig
}

export interface MarkerConfig {
  /** 箭头类型 */
  name: 'block' | 'classic' | 'diamond' | 'cross' | 'circle' | 'none'
  /** 大小 */
  size?: number
  /** 颜色 */
  fill?: string
  /** 描边色 */
  stroke?: string
}
