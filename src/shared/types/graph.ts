import type { NodeData } from './node'
import type { EdgeData } from './edge'

/**
 * 画布数据根结构
 */
export interface GraphData {
  /** 画布配置 */
  canvas: CanvasConfig
  /** 节点列表 */
  nodes: NodeData[]
  /** 边列表 */
  edges: EdgeData[]
  /** 元数据 */
  meta?: GraphMeta
}

export interface CanvasConfig {
  /** 画布背景色 */
  backgroundColor?: string
  /** 网格配置 */
  grid?: {
    size: number
    visible: boolean
    type: 'dot' | 'line'
    color?: string
  }
  /** 初始缩放 */
  zoom?: number
  /** 初始偏移 */
  offset?: { x: number, y: number }
}

export interface GraphMeta {
  /** 图表标题 */
  title?: string
  /** 图表类型 */
  type?: 'flowchart' | 'uml' | 'sequence' | 'er' | 'dfd' | 'custom'
  /** 创建时间 */
  createdAt?: string
  /** 版本 */
  version?: string
  /** AI 生成标记 */
  aiGenerated?: boolean
  /** 扩展字段（预留） */
  ext?: Record<string, unknown>
}

/** AI 生成数据扩展 */
export interface AIGraphData extends GraphData {
  meta: GraphMeta & {
    aiGenerated: true
    /** AI 模型信息 */
    aiModel?: string
    /** 原始提示词 */
    prompt?: string
    /** 置信度 */
    confidence?: number
  }
}
