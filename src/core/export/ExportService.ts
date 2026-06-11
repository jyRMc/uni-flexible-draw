import type { Graph } from '@antv/x6'
import type { GraphData } from '@uni-draw/shared'
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
        })
      } catch (e) {
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
    return new Promise((resolve, reject) => {
      try {
        exportPlugin.toSVG((svg: string) => {
          resolve(svg)
        }, {
          viewBox: options.viewBox ?? (options.padding
            ? {
                x: -options.padding,
                y: -options.padding,
                width: this.graph.options.width + options.padding * 2,
                height: this.graph.options.height + options.padding * 2,
              }
            : undefined),
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}
