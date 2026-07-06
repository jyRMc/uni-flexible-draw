import { Graph } from '@antv/x6'
import type { Node } from '@antv/x6'

const FLIP_SELECTOR = 'flip'

// X6 内置基础图形的默认 markup（与 @antv/x6/src/shape 保持一致）
const X6_BUILTIN_MARKUP: Record<string, Node.Config['markup']> = {
  rect: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  circle: [
    { tagName: 'circle', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  ellipse: [
    { tagName: 'ellipse', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  polygon: [
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  polyline: [
    { tagName: 'polyline', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  path: [
    { tagName: 'rect', selector: 'bg' },
    { tagName: 'path', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  image: [
    { tagName: 'image', selector: 'image' },
    { tagName: 'text', selector: 'label' },
  ],
  'text-block': [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  textBlock: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  html: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'foreignObject', selector: 'fo' },
    { tagName: 'text', selector: 'label' },
  ],
}

function resolveMarkup(config: Node.Config): Node.Config['markup'] {
  if (config.markup)
    return config.markup
  if (config.inherit) {
    const builtin = X6_BUILTIN_MARKUP[config.inherit]
    if (builtin)
      return builtin
    const parent = NodeRegistry.configs.get(config.inherit)
    if (parent)
      return resolveMarkup(parent)
  }
  return undefined
}

function unwrapFlipMarkup(markup: any[]): any[] {
  if (markup.length === 1 && markup[0].selector === FLIP_SELECTOR && markup[0].tagName === 'g') {
    return markup[0].children ?? []
  }
  return markup
}

function wrapFlipMarkup(markup: any[]): any[] {
  return [{ tagName: 'g', selector: FLIP_SELECTOR, children: markup }]
}

function withFlipWrapper(config: Node.Config): Node.Config {
  const markup = resolveMarkup(config)
  if (!markup || !Array.isArray(markup))
    return config
  return {
    ...config,
    markup: wrapFlipMarkup(unwrapFlipMarkup(markup as any[])),
  }
}

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
    const wrapped = withFlipWrapper(config)
    NodeRegistry.configs.set(name, wrapped)
    try {
      Graph.registerNode(name, wrapped)
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
