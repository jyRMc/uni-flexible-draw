import type { NodeStyle, PortsConfig } from './node'

export interface MaterialLibrary {
  /** 素材库 ID */
  id: string
  /** 显示名称 */
  name: string
  /** 分类 */
  category: string
  /** 图标 */
  icon?: string
  /** 图形模板列表 */
  items: MaterialItem[]
}

export interface MaterialItem {
  /** 模板 ID */
  id: string
  /** 显示名称 */
  name: string
  /** 预览图标（SVG 字符串或 base64） */
  icon?: string
  /** 图形类型 */
  shape: string
  /** 默认尺寸 */
  defaultSize: { width: number, height: number }
  /** 默认样式（合并到节点样式） */
  defaultStyle?: Partial<NodeStyle>
  /** 默认标签 */
  defaultLabel?: string
  /** 连接桩配置 */
  defaultPorts?: PortsConfig
  /** 附加数据 */
  data?: Record<string, unknown>
}
