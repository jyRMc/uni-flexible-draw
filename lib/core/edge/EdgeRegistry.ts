import { Graph } from '@antv/x6'
import type { Edge } from '@antv/x6'

/**
 * 边注册表
 * 维护 edge shape 名称到 X6 边配置的映射
 */
export class EdgeRegistry {
  private static configs: Map<string, Edge.Config> = new Map()

  /**
   * 注册边图形
   */
  static register(name: string, config: Edge.Config): void {
    if (EdgeRegistry.configs.has(name)) return
    EdgeRegistry.configs.set(name, config)
    try {
      Graph.registerEdge(name, config)
    } catch (e: any) {
      if (e?.message?.includes('already registered')) return
      throw e
    }
  }

  /**
   * 取消注册
   */
  static unregister(name: string): void {
    EdgeRegistry.configs.delete(name)
    Graph.unregisterEdge(name)
  }

  /**
   * 获取配置
   */
  static get(name: string): Edge.Config | undefined {
    return EdgeRegistry.configs.get(name)
  }

  /**
   * 是否已注册
   */
  static has(name: string): boolean {
    return EdgeRegistry.configs.has(name)
  }

  /**
   * 获取所有已注册的 shape 名称
   */
  static getAllNames(): string[] {
    return Array.from(EdgeRegistry.configs.keys())
  }

  /**
   * 清空注册表
   */
  static clear(): void {
    for (const name of EdgeRegistry.configs.keys()) {
      Graph.unregisterEdge(name)
    }
    EdgeRegistry.configs.clear()
  }
}
