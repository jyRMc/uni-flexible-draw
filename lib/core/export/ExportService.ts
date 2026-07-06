import type { Graph } from '@antv/x6'
import type { GraphData } from '@uni-draw/shared'
import { content as x6CssContent } from '@antv/x6/es/style/raw'
import { DataMigration } from './DataMigration'

export interface ExportImageOptions {
  backgroundColor?: string
  padding?: number
  quality?: number
  width?: number
  height?: number
  viewBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

function getExportPlugin(graph: Graph): any {
  return (graph as any).getPlugin?.('export')
}

/**
 * 导出服务
 * 支持 JSON / PNG / SVG 导出与导入
 */
export class ExportService {
  constructor(private graph: Graph) {}

  /**
   * 导出为 JSON 字符串
   */
  toJSON(data: GraphData): string {
    return JSON.stringify(data, null, 2)
  }

  /**
   * 从 JSON 字符串导入
   */
  fromJSON(json: string): GraphData {
    const parsed = JSON.parse(json) as GraphData
    return DataMigration.migrate(parsed)
  }

  /**
   * 导出为 PNG 图片（base64）
   *
   * 说明：使用 copyStyles: false 避免导出过程中禁用/启用页面样式表，
   * 从而防止页面元素在导出瞬间出现黑色边框等样式闪烁问题。
   * 通过内置 X6 核心样式表保证导出图片的渲染正确性。
   */
  async toPNG(options: ExportImageOptions = {}): Promise<string> {
    const exportPlugin = getExportPlugin(this.graph)
    if (!exportPlugin || !exportPlugin.toPNG) {
      throw new Error('Export plugin not registered. Please ensure @antv/x6-plugin-export is installed and registered.')
    }
    return new Promise((resolve, reject) => {
      try {
        exportPlugin.toPNG((dataUri: string) => {
          resolve(dataUri)
        }, {
          backgroundColor: options.backgroundColor ?? '#ffffff',
          padding: options.padding ?? 10,
          quality: options.quality ?? 1,
          width: options.width,
          height: options.height,
          viewBox: options.viewBox,
          copyStyles: false,
          serializeImages: true,
          stylesheet: x6CssContent,
        })
      }
      catch (e) {
        reject(e)
      }
    })
  }

  /**
   * 导出为 SVG 字符串
   */
  async toSVG(options: ExportImageOptions = {}): Promise<string> {
    const exportPlugin = getExportPlugin(this.graph)
    if (!exportPlugin || !exportPlugin.toSVG) {
      throw new Error('Export plugin not registered. Please ensure @antv/x6-plugin-export is installed and registered.')
    }

    // 1. 获取内容实际边界（画布坐标系），而非容器尺寸
    const contentBBox = this.graph.getContentBBox()
    const padding = options.padding ?? 20

     // 2. 基于内容边界计算 viewBox，增加 padding 防止边缘元素被截断
    const viewBox = options.viewBox ?? {
      x: contentBBox.x - padding,
      y: contentBBox.y - padding,
      width: contentBBox.width + padding * 2,
      height: contentBBox.height + padding * 2,
    }
    return new Promise((resolve, reject) => {
      try {
        exportPlugin.toSVG((svg: string) => {
          resolve(svg)
        }, {
          viewBox,
          // 3. 保持实际尺寸，避免默认 100% 导致的缩放问题
          preserveDimensions: true,
          copyStyles: false,
          serializeImages: true,
          stylesheet: x6CssContent,
        })
      }
      catch (e) {
        reject(e)
      }
    })
  }
}
