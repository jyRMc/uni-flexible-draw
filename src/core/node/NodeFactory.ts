import type { Graph, Node } from '@antv/x6'
import type { LabelConfig, NodeData } from '@uni-draw/shared'
import { PRIMARY_COLOR } from '@uni-draw/shared'
import { buildTableAttrs, buildTableMarkup, normalizeTableData } from '../../shapes/basic/table'
import { getShapePorts } from '../../shapes/ports'
import { buildMultiRegionAttrs, getDefaultRegionData, getMultiRegionMarkup, isMultiRegionShape } from '../../shapes/utils/regionNodes'

function buildLabelAttrs(label: NodeData['label']): Record<string, unknown> | undefined {
  if (typeof label !== 'object' || label === null)
    return undefined
  const attrs: Record<string, unknown> = {}
  if (label.style) {
    if (label.style.fill != null)
      attrs.fill = label.style.fill
    if (label.style.fontSize != null)
      attrs.fontSize = label.style.fontSize
    if (label.style.fontFamily != null)
      attrs.fontFamily = label.style.fontFamily
    if (label.style.fontWeight != null)
      attrs.fontWeight = label.style.fontWeight
  }
  if (label.position) {
    const pos = label.position
    attrs.textAnchor = pos === 'left' ? 'start' : pos === 'right' ? 'end' : 'middle'
    attrs.textVerticalAnchor = pos === 'top' ? 'top' : pos === 'bottom' ? 'bottom' : 'middle'
    attrs.refX = pos === 'left' ? 0 : pos === 'right' ? 1 : 0.5
    attrs.refY = pos === 'top' ? 0 : pos === 'bottom' ? 1 : 0.5
  }
  return Object.keys(attrs).length > 0 ? attrs : undefined
}

function inferLabelPosition(
  textVerticalAnchor?: string,
  refY?: string | number,
  textAnchor?: string,
  refX?: string | number,
): LabelConfig['position'] {
  if (textVerticalAnchor === 'top' || refY === 0 || refY === '0') {
    return 'top'
  }
  if (textVerticalAnchor === 'bottom' || refY === 1 || refY === '1') {
    return 'bottom'
  }
  if (textAnchor === 'start' && (refX === 0 || refX === '0')) {
    return 'left'
  }
  if (textAnchor === 'end' && (refX === 1 || refX === '1')) {
    return 'right'
  }
  return 'center'
}

interface PortPositionContext {
  bbox: { width: number, height: number }
  portId?: string
  groupId?: string
  node?: Node
}

function recomputePortItems(defaultPorts: any, bbox: { width: number, height: number }, node: Node): any[] {
  return (defaultPorts.items ?? []).map((item: any) => {
    const gcfg = defaultPorts.groups?.[item.group]
    if (gcfg && typeof gcfg.position === 'function') {
      const pos = gcfg.position({ bbox, portId: item.id, groupId: item.group, node } as PortPositionContext)
      return { ...item, args: { ...item.args, x: pos.x, y: pos.y } }
    }
    return { ...item }
  })
}

function isDefaultPortSet(current: any, defaultPorts: any): boolean {
  const currentItems = current?.items
  const defaultItems = defaultPorts?.items
  if (!Array.isArray(currentItems) || !Array.isArray(defaultItems))
    return false
  if (currentItems.length !== defaultItems.length)
    return false
  return currentItems.every((item: any, index: number) =>
    item.id === defaultItems[index].id && item.group === defaultItems[index].group,
  )
}

function attachPortResizeHandler(node: Node, defaultPorts: any): void {
  const hasFunctionPosition = Object.values(defaultPorts.groups ?? {}).some(
    (g: any) => typeof g.position === 'function',
  )
  if (!hasFunctionPosition)
    return

  node.on('change:size', () => {
    const currentPorts = node.prop('ports') as any
    if (!isDefaultPortSet(currentPorts, defaultPorts))
      return
    const bbox = node.getBBox()
    node.prop('ports/items', recomputePortItems(defaultPorts, bbox, node))
  })
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
            'refWidth': '100%',
            'refHeight': '100%',
            'x': 0,
            'y': 0,
            preserveAspectRatio,
          },
        }
        const bodyKeys = ['fill', 'stroke', 'strokeWidth', 'strokeDasharray', 'opacity']
        const bodyAttrs: Record<string, any> = {}
        for (const k of bodyKeys) {
          if (data.style && k in data.style)
            bodyAttrs[k] = (data.style as any)[k]
        }
        if (Object.keys(bodyAttrs).length > 0) {
          result.body = bodyAttrs
        }
        return result
      }
      if (data.shape === 'basic-table' && tableData) {
        return buildTableAttrs(tableData, (data.style ?? {}) as any) as any
      }
      if (data.shape === 'basic-group') {
        const { fill = 'rgba(0,0,0,0.02)', stroke = '#d9d9d9', strokeWidth = 1, strokeDasharray = '4 4' } = (data.style ?? {}) as any
        return { body: { fill, stroke, strokeWidth, strokeDasharray } } as any
      }
      if (!data.style)
        return {}
      if (data.shape === 'basic-cylinder') {
        const { fill = '#ffffff', stroke = PRIMARY_COLOR, strokeWidth = 2 } = data.style as any
        return {
          bodyFill: { fill },
          topCap: { fill, stroke, strokeWidth },
          bottomCap: { fill, stroke, strokeWidth },
          leftLine: { stroke, strokeWidth },
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

    // 多区域节点：动态构建 markup 和 attrs
    let markup = tableData ? buildTableMarkup(tableData) : undefined
    let nodeData = data.data
    if (isMultiRegionShape(data.shape)) {
      const regionData = (data.data?.regionData as any) ?? getDefaultRegionData(data.shape)
      if (regionData) {
        markup = getMultiRegionMarkup(data.shape) as any
        const regionAttrs = buildMultiRegionAttrs(data.shape, regionData)
        if (regionAttrs) {
          Object.assign(baseAttrs, regionAttrs)
        }
        nodeData = { ...(data.data ?? {}), regionData }
      }
    }

    const shapePorts = getShapePorts(data.shape)
    const node = graph.createNode({
      id: data.id,
      shape: data.shape,
      x: data.position.x,
      y: data.position.y,
      width: data.size.width,
      height: data.size.height,
      angle: data.angle,
      zIndex: data.zIndex,
      markup,
      attrs: Object.keys(baseAttrs).length > 0 ? baseAttrs : undefined,
      label: labelText,
      data: nodeData,
      ports: ((data.ports?.items?.length ?? 0) > 0 ? data.ports : shapePorts) as any,
    })
    // 强制覆盖 shape 定义中的默认 ports，确保动态端口策略生效
    if ((data.ports?.items?.length ?? 0) === 0) {
      const bbox = node.getBBox()
      const computedItems = shapePorts.items?.map((item: any) => {
        const gcfg = shapePorts.groups?.[item.group]
        if (gcfg && typeof gcfg.position === 'function') {
          const pos = gcfg.position({ bbox, portId: item.id, groupId: item.group, node })
          return { ...item, args: { ...item.args, x: pos.x, y: pos.y } }
        }
        return item
      }) ?? []
      const computedGroups: any = {}
      Object.entries(shapePorts.groups ?? {}).forEach(([gid, gcfg]: [string, any]) => {
        if (typeof gcfg.position === 'function') {
          computedGroups[gid] = { ...gcfg, position: 'absolute' }
        }
        else {
          computedGroups[gid] = gcfg
        }
      })
      node.prop('ports', { ...shapePorts, groups: computedGroups, items: computedItems })
    }

    // 当节点尺寸变化时，自动重新计算基于 bbox 函数计算的连接点位置，
    // 保证 resize 后端口号仍落在正确的几何位置上
    attachPortResizeHandler(node, shapePorts)

    return node
  }

  /**
   * 从 X6 节点提取 NodeData
   */
  static toData(node: Node): NodeData {
    let position = node.getPosition()
    const size = node.getSize()

    // 如果节点有 parent，将相对坐标转换为世界坐标，以便序列化后正确恢复
    const parentNode = (node as any).getParent?.()
    if (parentNode) {
      const pPos = parentNode.getPosition()
      position = { x: position.x + pPos.x, y: position.y + pPos.y }
    }

    // 从 attrs 提取样式（圆柱体从 topCap 读取，其他从 body 读取）
    const attrs = (node as any).getAttrs?.() ?? {}
    const style: Record<string, unknown> = {}
    if (node.shape === 'basic-cylinder') {
      const cap = attrs.topCap ?? {}
      if (cap.fill != null)
        style.fill = cap.fill
      if (cap.stroke != null)
        style.stroke = cap.stroke
      if (cap.strokeWidth != null)
        style.strokeWidth = cap.strokeWidth
    }
    else if (node.shape === 'basic-table') {
      const body = attrs.body ?? {}
      if (body.fill != null)
        style.fill = body.fill
      if (body.stroke != null)
        style.stroke = body.stroke
      if (body.strokeWidth != null)
        style.strokeWidth = body.strokeWidth
      if (body.strokeDasharray != null)
        style.strokeDasharray = body.strokeDasharray
      if (body.opacity != null)
        style.opacity = body.opacity
    }
    else {
      const body = attrs.body ?? {}
      if (body.fill != null)
        style.fill = body.fill
      if (body.stroke != null)
        style.stroke = body.stroke
      if (body.strokeWidth != null)
        style.strokeWidth = body.strokeWidth
      if (body.strokeDasharray != null)
        style.strokeDasharray = body.strokeDasharray
      if (body.rx != null)
        style.rx = body.rx
      if (body.ry != null)
        style.ry = body.ry
      if (body.opacity != null)
        style.opacity = body.opacity
    }

    // 图片/SVG 节点的透明度存储在 image 属性上
    if ((node.shape === 'basic-image' || node.shape === 'basic-svg') && attrs.image?.opacity != null) {
      style.opacity = attrs.image.opacity
    }

    // 提取 label 文本与样式
    const labelText = (node as any).label ?? (node as any).getLabels?.()?.[0]?.attrs?.label?.text ?? ''
    const labelAttrs = attrs.label ?? {}
    const hasLabelStyle = labelAttrs.fontSize != null
      || labelAttrs.fontFamily != null
      || labelAttrs.fontWeight != null
      || labelAttrs.fill != null
    const hasLabelPosition = labelAttrs.textVerticalAnchor != null || labelAttrs.refY != null || labelAttrs.refX != null

    let label: NodeData['label'] = labelText
    if (hasLabelStyle || hasLabelPosition) {
      const labelCfg: any = { text: labelText }
      if (hasLabelStyle) {
        labelCfg.style = {}
        if (labelAttrs.fill != null)
          labelCfg.style.fill = labelAttrs.fill
        if (labelAttrs.fontSize != null)
          labelCfg.style.fontSize = labelAttrs.fontSize
        if (labelAttrs.fontFamily != null)
          labelCfg.style.fontFamily = labelAttrs.fontFamily
        if (labelAttrs.fontWeight != null)
          labelCfg.style.fontWeight = labelAttrs.fontWeight
      }
      if (hasLabelPosition) {
        labelCfg.position = inferLabelPosition(
          labelAttrs.textVerticalAnchor,
          labelAttrs.refY,
          labelAttrs.textAnchor,
          labelAttrs.refX,
        )
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

    const parent = (node as any).getParent?.() ?? undefined
    const children = (node as any).getChildren?.() ?? undefined

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
      parent: parent?.id ?? undefined,
      children: children && children.length > 0 ? children.map((c: any) => c.id) : undefined,
    }
  }
}
