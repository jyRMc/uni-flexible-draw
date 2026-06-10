import type { Graph } from '@antv/x6'
import { MiniMap } from '@antv/x6-plugin-minimap'

export interface MiniMapOptions {
  width?: number
  height?: number
  padding?: number
  scalable?: boolean
  minScale?: number
  maxScale?: number
}

const DEFAULT_OPTIONS: Required<Pick<MiniMapOptions, 'width' | 'height' | 'padding' | 'scalable'>> = {
  width: 200,
  height: 150,
  padding: 10,
  scalable: true,
}

/**
 * Minimap 工具
 * 封装 @antv/x6-plugin-minimap，提供启用/禁用能力
 */
export class MiniMapTool {
  private graph: Graph
  private minimapContainer: HTMLElement | null = null
  private plugin: MiniMap | null = null

  constructor(graph: Graph) {
    this.graph = graph
  }

  /**
   * 启用 minimap
   */
  enable(container: HTMLElement, options: MiniMapOptions = {}): void {
    if (this.plugin) {
      this.disable()
    }

    this.minimapContainer = container
    container.innerHTML = ''

    const opts = {
      container,
      width: options.width ?? DEFAULT_OPTIONS.width,
      height: options.height ?? DEFAULT_OPTIONS.height,
      padding: options.padding ?? DEFAULT_OPTIONS.padding,
      scalable: options.scalable ?? DEFAULT_OPTIONS.scalable,
      minScale: options.minScale,
      maxScale: options.maxScale,
    }

    this.plugin = new MiniMap(opts)
    this.graph.use(this.plugin)
  }

  /**
   * 禁用 minimap
   */
  disable(): void {
    if (this.plugin) {
      try {
        this.graph.disposePlugins(['minimap'])
      }
      catch {
        // 插件可能已被清理或不存在，忽略
      }
      this.plugin = null
    }
    if (this.minimapContainer) {
      this.minimapContainer.innerHTML = ''
      this.minimapContainer = null
    }
  }

  /**
   * 判断是否已启用
   */
  isEnabled(): boolean {
    return this.plugin !== null
  }
}
