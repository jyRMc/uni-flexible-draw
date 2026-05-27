import type { Graph } from '@antv/x6'

export interface MiniMapOptions {
  width?: number
  height?: number
  padding?: number
  scalable?: boolean
}

/**
 * Minimap 工具
 * 基于 X6 内置 Scroller 的 minimap 能力
 */
export class MiniMapTool {
  private minimapContainer: HTMLElement | null = null

  constructor(private graph: Graph) {}

  /**
   * 启用 minimap
   */
  enable(container: HTMLElement, options: MiniMapOptions = {}): void {
    this.minimapContainer = container
    // X6 2.x 的 minimap 通过 scroller 插件实现
    // 这里先预留接口，后续根据实际 X6 版本调整
    container.style.width = `${options.width ?? 200}px`
    container.style.height = `${options.height ?? 150}px`
    container.style.border = '1px solid #e0e0e0'
    container.style.background = '#fafafa'
  }

  /**
   * 禁用 minimap
   */
  disable(): void {
    if (this.minimapContainer) {
      this.minimapContainer.innerHTML = ''
      this.minimapContainer = null
    }
  }
}
