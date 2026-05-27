import type { Graph, Node } from '@antv/x6'
import type { NodeData, PortsConfig } from '@uni-draw/shared'
import { PRIMARY_COLOR } from '@uni-draw/shared'

/**
 * 默认连接桩配置：上下左右四个方向，悬停时显示
 */
const DEFAULT_PORTS: PortsConfig = {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, strokeWidth: 1.5, fill: '#fff', style: { visibility: 'hidden' } },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, strokeWidth: 1.5, fill: '#fff', style: { visibility: 'hidden' } },
      },
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, strokeWidth: 1.5, fill: '#fff', style: { visibility: 'hidden' } },
      },
    },
    left: {
      position: 'left',
      attrs: {
        circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, strokeWidth: 1.5, fill: '#fff', style: { visibility: 'hidden' } },
      },
    },
  },
  items: [
    { id: 'port-top', group: 'top' },
    { id: 'port-right', group: 'right' },
    { id: 'port-bottom', group: 'bottom' },
    { id: 'port-left', group: 'left' },
  ],
}

/**
 * 节点工厂
 * 根据 NodeData 创建 X6 节点实例
 */
export class NodeFactory {
  /**
   * 创建 X6 节点
   */
  static createNode(graph: Graph, data: NodeData): Node {
    return graph.createNode({
      id: data.id,
      shape: data.shape,
      x: data.position.x,
      y: data.position.y,
      width: data.size.width,
      height: data.size.height,
      angle: data.angle,
      zIndex: data.zIndex,
      attrs: (() => {
        const isImageShape = data.shape === 'basic-image' || data.shape === 'basic-svg'
        const imageHref = data.data?.imageHref as string | undefined
        if (isImageShape && imageHref) {
          return {
            image: {
              'xlink:href': imageHref,
              refWidth: '100%',
              refHeight: '100%',
              x: 0,
              y: 0,
            },
          }
        }
        if (!data.style) return undefined
        if (data.shape === 'basic-cylinder') {
          const { fill = '#ffffff', stroke = PRIMARY_COLOR, strokeWidth = 2 } = data.style as any
          return {
            bodyFill:  { fill },
            topCap:    { fill, stroke, strokeWidth },
            bottomCap: { fill, stroke, strokeWidth },
            leftLine:  { fill: stroke },
            rightLine: { fill: stroke },
          } as any
        }
        return { body: { ...data.style } } as any
      })(),
      label: typeof data.label === 'string' ? data.label : data.label?.text,
      data: data.data,
      ports: ((data.ports?.items?.length ?? 0) > 0 ? data.ports : DEFAULT_PORTS) as any,
    })
  }

  /**
   * 从 X6 节点提取 NodeData
   */
  static toData(node: Node): NodeData {
    const position = node.getPosition()
    const size = node.getSize()

    // 从 attrs 提取样式（圆柱体从 topCap 读取，其他从 body 读取）
    const attrs = (node as any).getAttrs?.() ?? {}
    const style: Record<string, unknown> = {}
    if (node.shape === 'basic-cylinder') {
      const cap = attrs.topCap ?? {}
      if (cap.fill != null) style.fill = cap.fill
      if (cap.stroke != null) style.stroke = cap.stroke
      if (cap.strokeWidth != null) style.strokeWidth = cap.strokeWidth
    } else {
      const body = attrs.body ?? {}
      if (body.fill != null) style.fill = body.fill
      if (body.stroke != null) style.stroke = body.stroke
      if (body.strokeWidth != null) style.strokeWidth = body.strokeWidth
      if (body.strokeDasharray != null) style.strokeDasharray = body.strokeDasharray
      if (body.rx != null) style.rx = body.rx
      if (body.ry != null) style.ry = body.ry
    }

    return {
      id: node.id,
      shape: node.shape,
      position: { x: position.x, y: position.y },
      size: { width: size.width, height: size.height },
      angle: (node as any).angle,
      zIndex: (node as any).getZIndex?.() ?? undefined,
      label: (node as any).label ?? (node as any).getLabels?.()?.[0]?.attrs?.label?.text,
      style: Object.keys(style).length > 0 ? style : undefined,
      data: node.getData(),
      ports: (node as any).get?.('ports') as NodeData['ports'],
    }
  }
}
