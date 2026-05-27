import type { Graph } from '@antv/x6'
import type { GraphData } from '@uni-draw/shared'
import { DataMigration } from './DataMigration'

export interface ExportImageOptions {
  backgroundColor?: string
  padding?: number
  quality?: number
  width?: number
  height?: number
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
   */
  async toPNG(options: ExportImageOptions = {}): Promise<string> {
    return this.graph.toPNG({
      backgroundColor: options.backgroundColor ?? '#ffffff',
      padding: options.padding ?? 10,
      quality: options.quality ?? 1,
      width: options.width,
      height: options.height,
    })
  }

  /**
   * 导出为 SVG 字符串
   */
  async toSVG(options: ExportImageOptions = {}): Promise<string> {
    return this.graph.toSVG({
      viewBox: options.padding
        ? {
            x: -options.padding,
            y: -options.padding,
            width: this.graph.options.width + options.padding * 2,
            height: this.graph.options.height + options.padding * 2,
          }
        : undefined,
    })
  }
}
