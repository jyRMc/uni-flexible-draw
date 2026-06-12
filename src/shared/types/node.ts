export interface NodeData {
  /** 全局唯一 ID */
  id: string
  /** 图形类型标识 */
  shape: string
  /** 位置 */
  position: { x: number, y: number }
  /** 尺寸 */
  size: { width: number, height: number }
  /** 角度（旋转） */
  angle?: number
  /** Z 层级 */
  zIndex?: number
  /** 节点样式 */
  style?: NodeStyle
  /** 文本/标签 */
  label?: string | LabelConfig
  /** 业务数据（用户自定义） */
  data?: Record<string, unknown>
  /** 连接桩（锚点）配置 */
  ports?: PortsConfig
  /** 是否锁定 */
  locked?: boolean
  /** 所属父 Group ID */
  parent?: string
  /** 子节点 ID 列表 */
  children?: string[]
}

export interface NodeStyle {
  /** 填充色 */
  fill?: string
  /** 边框色 */
  stroke?: string
  /** 边框宽度 */
  strokeWidth?: number
  /** 边框线条样式：实线/虚线/点线 */
  strokeDasharray?: string
  /** 圆角 */
  rx?: number
  ry?: number
  /** 透明度 */
  opacity?: number
  /** 阴影 */
  shadow?: {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
  /** 扩展样式（各 shape 自定义） */
  [key: string]: unknown
}

export interface LabelConfig {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  style?: {
    fill?: string
    fontSize?: number
    fontFamily?: string
    fontWeight?: 'normal' | 'bold'
  }
}

export interface PortsConfig {
  groups?: Record<string, PortGroup>
  items?: PortItem[]
}

export interface PortGroup {
  position: string | { name: string, args?: Record<string, unknown> }
  attrs?: Record<string, unknown>
}

export interface PortItem {
  id: string
  group: string
  attrs?: Record<string, unknown>
}
