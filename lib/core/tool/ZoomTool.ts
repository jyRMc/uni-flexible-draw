import type { Graph } from '@antv/x6'

/**
 * 缩放工具
 */
export class ZoomTool {
  constructor(private graph: Graph) {}

  zoomIn(factor = 0.1): void {
    this.graph.zoom(factor)
  }

  zoomOut(factor = 0.1): void {
    this.graph.zoom(-factor)
  }

  zoomTo(factor: number): void {
    this.graph.zoomTo(factor)
  }

  zoomToFit(options?: { padding?: number, maxScale?: number }): void {
    // 默认保留 40px 内边距，避免图形完全贴边铺满画布
    this.graph.zoomToFit({ padding: 40, ...options })
  }

  getZoom(): number {
    return this.graph.zoom()
  }
}
