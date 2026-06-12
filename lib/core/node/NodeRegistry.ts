import { Graph } from '@antv/x6'
import type { Node } from '@antv/x6'

/**
 * 节点注册表
 * 维护 shape 名称到 X6 节点配置的映射
 */
export class NodeRegistry {
  private static configs: Map<string, Node.Config> = new Map()

  /**
   * 注册节点图形
   */
  static register(name: string, config: Node.Config): void {
    if (NodeRegistry.configs.has(name))
      return
    NodeRegistry.configs.set(name, config)
    try {
      Graph.registerNode(name, config)
    }
    catch (e: any) {
      if (e?.message?.includes('already registered'))
        return
      throw e
    }
  }

  /**
   * 取消注册
   */
  static unregister(name: string): void {
    NodeRegistry.configs.delete(name)
    Graph.unregisterNode(name)
  }

  /**
   * 获取配置
   */
  static get(name: string): Node.Config | undefined {
    return NodeRegistry.configs.get(name)
  }

  /**
   * 是否已注册
   */
  static has(name: string): boolean {
    return NodeRegistry.configs.has(name)
  }

  /**
   * 获取所有已注册的 shape 名称
   */
  static getAllNames(): string[] {
    return Array.from(NodeRegistry.configs.keys())
  }

  /**
   * 清空注册表
   */
  static clear(): void {
    for (const name of NodeRegistry.configs.keys()) {
      Graph.unregisterNode(name)
    }
    NodeRegistry.configs.clear()
  }
}
