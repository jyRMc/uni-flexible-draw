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
    this.graph.zoomToFit(options)
  }

  getZoom(): number {
    return this.graph.zoom()
  }
}
