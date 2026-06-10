import type { Graph, Node } from '@antv/x6'
import type { NodeData, PortsConfig, LabelConfig } from '@uni-draw/shared'
import { PRIMARY_COLOR } from '@uni-draw/shared'
import { buildTableAttrs, buildTableMarkup, normalizeTableData } from '../../shapes/basic/table'

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

function buildLabelAttrs(label: NodeData['label']): Record<string, unknown> | undefined {
  if (typeof label !== 'object' || label === null) return undefined
  const attrs: Record<string, unknown> = {}
  if (label.style) {
    if (label.style.fill != null) attrs.fill = label.style.fill
    if (label.style.fontSize != null) attrs.fontSize = label.style.fontSize
    if (label.style.fontFamily != null) attrs.fontFamily = label.style.fontFamily
    if (label.style.fontWeight != null) attrs.fontWeight = label.style.fontWeight
  }
  if (label.position) {
    const pos = label.position
    attrs.textAnchor = pos === 'left' ? 'end' : pos === 'right' ? 'start' : 'middle'
    attrs.textVerticalAnchor = pos === 'top' ? 'top' : pos === 'bottom' ? 'bottom' : 'middle'
    attrs.refY = pos === 'top' ? '0.2' : pos === 'bottom' ? '0.8' : '0.5'
  }
  return Object.keys(attrs).length > 0 ? attrs : undefined
}

function inferLabelPosition(textVerticalAnchor?: string, refY?: string | number): LabelConfig['position'] {
  if (textVerticalAnchor === 'top' || refY === '0.2') return 'top'
  if (textVerticalAnchor === 'bottom' || refY === '0.8') return 'bottom'
  return 'center'
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
    const tableData = data.shape === 'basic-table'
      ? normalizeTableData((data.data as Record<string, unknown> | undefined)?.table)
      : null

    const labelAttrs = buildLabelAttrs(data.label)
    const labelText = typeof data.label === 'string' ? data.label : data.label?.text

    const baseAttrs: Record<string, any> = (() => {
      const isImageShape = data.shape === 'basic-image' || data.shape === 'basic-svg'
      const imageHref = data.data?.imageHref as string | undefined
      if (isImageShape && imageHref) {
        const imageFit = data.data?.imageFit as string | undefined
        const preserveAspectRatio = imageFit === 'cover' ? 'xMidYMid slice' : imageFit === 'fill' ? 'none' : 'xMidYMid meet'
        const result: Record<string, any> = {
          image: {
            'xlink:href': imageHref,
            refWidth: '100%',
            refHeight: '100%',
            x: 0,
            y: 0,
            preserveAspectRatio,
          },
        }
        const bodyKeys = ['fill', 'stroke', 'strokeWidth', 'strokeDasharray', 'opacity']
        const bodyAttrs: Record<string, any> = {}
        for (const k of bodyKeys) {
          if (data.style && k in data.style) bodyAttrs[k] = (data.style as any)[k]
        }
        if (Object.keys(bodyAttrs).length > 0) {
          result.body = bodyAttrs
        }
        return result
      }
      if (data.shape === 'basic-table' && tableData) {
        return buildTableAttrs(tableData, (data.style ?? {}) as any) as any
      }
      if (!data.style) return {}
      if (data.shape === 'basic-cylinder') {
        const { fill = '#ffffff', stroke = PRIMARY_COLOR, strokeWidth = 2 } = data.style as any
        return {
          bodyFill:  { fill },
          topCap:    { fill, stroke, strokeWidth },
          bottomCap: { fill, stroke, strokeWidth },
          leftLine:  { stroke, strokeWidth },
          rightLine: { stroke, strokeWidth },
        } as any
      }
      return { body: { ...data.style } } as any
    })()

    if (labelAttrs) {
      baseAttrs.label = { ...(baseAttrs.label ?? {}), ...labelAttrs }
    }

    // basic-text 特有：textAlign 保存在 data 中，映射到 label textAnchor
    if (data.shape === 'basic-text' && data.data?.textAlign) {
      const align = data.data.textAlign as string
      baseAttrs.label = {
        ...(baseAttrs.label ?? {}),
        textAnchor: align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle',
      }
    }

    return graph.createNode({
      id: data.id,
      shape: data.shape,
      x: data.position.x,
      y: data.position.y,
      width: data.size.width,
      height: data.size.height,
      angle: data.angle,
      zIndex: data.zIndex,
      markup: tableData ? buildTableMarkup(tableData) : undefined,
      attrs: Object.keys(baseAttrs).length > 0 ? baseAttrs : undefined,
      label: labelText,
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
    } else if (node.shape === 'basic-table') {
      const body = attrs.body ?? {}
      if (body.fill != null) style.fill = body.fill
      if (body.stroke != null) style.stroke = body.stroke
      if (body.strokeWidth != null) style.strokeWidth = body.strokeWidth
      if (body.strokeDasharray != null) style.strokeDasharray = body.strokeDasharray
      if (body.opacity != null) style.opacity = body.opacity
    } else {
      const body = attrs.body ?? {}
      if (body.fill != null) style.fill = body.fill
      if (body.stroke != null) style.stroke = body.stroke
      if (body.strokeWidth != null) style.strokeWidth = body.strokeWidth
      if (body.strokeDasharray != null) style.strokeDasharray = body.strokeDasharray
      if (body.rx != null) style.rx = body.rx
      if (body.ry != null) style.ry = body.ry
    }

    // 提取 label 文本与样式
    const labelText = (node as any).label ?? (node as any).getLabels?.()?.[0]?.attrs?.label?.text ?? ''
    const labelAttrs = attrs.label ?? {}
    const hasLabelStyle = labelAttrs.fontSize != null
      || labelAttrs.fontFamily != null
      || labelAttrs.fontWeight != null
      || labelAttrs.fill != null
    const hasLabelPosition = labelAttrs.textVerticalAnchor != null || labelAttrs.refY != null

    let label: NodeData['label'] = labelText
    if (hasLabelStyle || hasLabelPosition) {
      const labelCfg: any = { text: labelText }
      if (hasLabelStyle) {
        labelCfg.style = {}
        if (labelAttrs.fill != null) labelCfg.style.fill = labelAttrs.fill
        if (labelAttrs.fontSize != null) labelCfg.style.fontSize = labelAttrs.fontSize
        if (labelAttrs.fontFamily != null) labelCfg.style.fontFamily = labelAttrs.fontFamily
        if (labelAttrs.fontWeight != null) labelCfg.style.fontWeight = labelAttrs.fontWeight
      }
      if (hasLabelPosition) {
        labelCfg.position = inferLabelPosition(labelAttrs.textVerticalAnchor, labelAttrs.refY)
      }
      label = labelCfg
    }

    // 提取 data（basic-text 需要把 textAnchor 回写为 data.textAlign；图片节点回写 imageFit）
    let nodeData = node.getData()
    if (node.shape === 'basic-text' && labelAttrs.textAnchor != null) {
      nodeData = {
        ...(nodeData ?? {}),
        textAlign: labelAttrs.textAnchor === 'start' ? 'left' : labelAttrs.textAnchor === 'end' ? 'right' : 'center',
      }
    }
    if ((node.shape === 'basic-image' || node.shape === 'basic-svg') && attrs.image?.preserveAspectRatio != null) {
      const map: Record<string, string> = {
        'xMidYMid meet': 'contain',
        'xMidYMid slice': 'cover',
        'none': 'fill',
      }
      nodeData = {
        ...(nodeData ?? {}),
        imageFit: map[attrs.image.preserveAspectRatio as string] ?? 'contain',
      }
    }

    return {
      id: node.id,
      shape: node.shape,
      position: { x: position.x, y: position.y },
      size: { width: size.width, height: size.height },
      angle: typeof (node as any).getAngle === 'function'
        ? (node as any).getAngle()
        : ((node as any).angle ?? 0),
      zIndex: (node as any).getZIndex?.() ?? undefined,
      label,
      style: Object.keys(style).length > 0 ? style : undefined,
      data: nodeData,
      ports: (node as any).get?.('ports') as NodeData['ports'],
    }
  }
}
