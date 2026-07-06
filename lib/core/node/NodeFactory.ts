import type { Graph, Node } from '@antv/x6'
import type { LabelConfig, NodeData } from '@uni-draw/shared'
import { PRIMARY_COLOR, getShapeFixedLabel } from '@uni-draw/shared'
import { NodeRegistry } from './NodeRegistry'
import { buildTableAttrs, buildTableMarkup, normalizeTableData } from '../../shapes/basic/table'
import { getShapePorts } from '../../shapes/ports'
import { shapeLineDefs } from '../../shapes/lineDefs'
import {
  buildMultiRegionAttrs,
  getDefaultRegionData,
  getMultiRegionLabelPath,
  getMultiRegionMarkup,
  isMultiRegionShape,
} from '../../shapes/utils/regionNodes'

// X6 内置基础图形，不需要在 NodeRegistry 中注册
const X6_BUILTIN_SHAPES = new Set([
  'rect',
  'circle',
  'ellipse',
  'polygon',
  'polyline',
  'path',
  'image',
  'text-block',
  'textBlock',
  'html',
  'edge',
])

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

const FLIP_SELECTOR = 'flip'

function isFlipWrapper(markup: any): boolean {
  return markup && markup.selector === FLIP_SELECTOR && markup.tagName === 'g'
}

function unwrapFlipMarkup(markup: any[]): any[] {
  if (markup.length === 1 && isFlipWrapper(markup[0])) {
    return markup[0].children ?? []
  }
  return markup
}

function wrapFlipMarkup(markup: any[]): any[] {
  if (markup.length === 1 && isFlipWrapper(markup[0])) {
    return markup
  }
  return [{ tagName: 'g', selector: FLIP_SELECTOR, children: markup }]
}

function buildFlipTransform(size: { width: number, height: number }, flipH: boolean, flipV: boolean): string {
  const cx = size.width / 2
  const cy = size.height / 2
  const sx = flipH ? -1 : 1
  const sy = flipV ? -1 : 1
  return `translate(${cx}, ${cy}) scale(${sx}, ${sy}) translate(${-cx}, ${-cy})`
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

function applyLineAttrs(node: Node): void {
  const defs = shapeLineDefs[(node as any).shape]
  if (!defs)
    return

  const size = node.getSize()
  const attrs: Record<string, any> = {}
  Object.entries(defs).forEach(([selector, def]) => {
    attrs[selector] = {
      x1: size.width * def.x1,
      y1: size.height * def.y1,
      x2: size.width * def.x2,
      y2: size.height * def.y2,
    }
  })
  node.setAttrs(attrs)
}

function attachLineResizeHandler(node: Node): void {
  if (!shapeLineDefs[(node as any).shape])
    return

  applyLineAttrs(node)
  node.on('change:size', () => applyLineAttrs(node))
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

    let labelAttrs = buildLabelAttrs(data.label)
    let labelText = typeof data.label === 'string' ? data.label : data.label?.text

    // 固定标签图形（如状态图浅/深历史）始终使用默认文本，忽略外部传入的标签
    const fixedLabel = getShapeFixedLabel(data.shape)
    if (fixedLabel !== undefined) {
      labelText = fixedLabel
      labelAttrs = undefined
    }

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
        const {
          fill = '#ffffff',
          stroke = PRIMARY_COLOR,
          strokeWidth = 2,
          strokeDasharray,
          rx,
          ry,
          opacity,
        } = data.style as any
        const capLineAttrs: any = { stroke, strokeWidth }
        if (strokeDasharray !== undefined)
          capLineAttrs.strokeDasharray = strokeDasharray
        const bodyFillAttrs: any = { fill }
        if (rx !== undefined)
          bodyFillAttrs.rx = rx
        if (ry !== undefined)
          bodyFillAttrs.ry = ry
        if (opacity !== undefined) {
          bodyFillAttrs.opacity = opacity
          capLineAttrs.opacity = opacity
        }
        return {
          bodyFill: bodyFillAttrs,
          topCap: { fill, ...capLineAttrs },
          bottomCap: { fill, ...capLineAttrs },
          leftLine: { ...capLineAttrs },
          rightLine: { ...capLineAttrs },
        } as any
      }
      if (data.shape === 'flowchart-database') {
        const {
          fill = '#f8fafc',
          stroke = '#334155',
          strokeWidth = 2,
          strokeDasharray,
          rx,
          ry,
          opacity,
        } = data.style as any
        const capLineAttrs: any = { stroke, strokeWidth }
        if (strokeDasharray !== undefined)
          capLineAttrs.strokeDasharray = strokeDasharray
        const bodyFillAttrs: any = { fill }
        if (rx !== undefined)
          bodyFillAttrs.rx = rx
        if (ry !== undefined)
          bodyFillAttrs.ry = ry
        if (opacity !== undefined) {
          bodyFillAttrs.opacity = opacity
          capLineAttrs.opacity = opacity
        }
        return {
          bodyFill: bodyFillAttrs,
          topCap: { fill, ...capLineAttrs },
          bottomCap: { fill, ...capLineAttrs },
          leftLine: { ...capLineAttrs },
          rightLine: { ...capLineAttrs },
        } as any
      }
      if (data.shape === 'flowchart-multi-document') {
        const {
          fill = '#f8fafc',
          stroke = '#334155',
          strokeWidth = 2,
          strokeDasharray,
          opacity,
        } = data.style as any
        const shapeAttrs: any = { fill, stroke, strokeWidth }
        if (strokeDasharray !== undefined)
          shapeAttrs.strokeDasharray = strokeDasharray
        if (opacity !== undefined)
          shapeAttrs.opacity = opacity
        const foldAttrs: any = { stroke, strokeWidth, fill: 'none' }
        if (strokeDasharray !== undefined)
          foldAttrs.strokeDasharray = strokeDasharray
        if (opacity !== undefined)
          foldAttrs.opacity = opacity
        return {
          back: { ...shapeAttrs },
          foldBack: { ...foldAttrs },
          front: { ...shapeAttrs },
          foldFront: { ...foldAttrs },
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
      let regionData = (data.data?.regionData as any) ?? getDefaultRegionData(data.shape)
      if (regionData) {
        // 外部传入的 label 应覆盖默认区域标签（如从素材创建时）
        if (labelText != null && Array.isArray(regionData.regions) && regionData.regions.length > 0) {
          regionData = {
            ...regionData,
            regions: regionData.regions.map((r: any, i: number) =>
              i === 0 ? { ...r, label: labelText } : r,
            ),
          }
        }
        markup = getMultiRegionMarkup(data.shape) as any
        const regionAttrs = buildMultiRegionAttrs(data.shape, regionData)
        if (regionAttrs) {
          Object.assign(baseAttrs, regionAttrs)
        }
        nodeData = { ...(data.data ?? {}), regionData }
      }
    }

    // 统一包裹翻转层，确保水平/垂直翻转时内容可见且选择框正确。
    // 自定义 markup（表格、多区域节点）需要在创建前手动包裹；
    // 其他 shape 的 markup 已在 NodeRegistry 中统一包裹。
    if (markup && !isFlipWrapper((markup as any[])[0])) {
      markup = wrapFlipMarkup(markup as any[])
    }

    // 应用初始翻转状态
    const flipH = !!data.data?.flipH
    const flipV = !!data.data?.flipV
    if (flipH || flipV) {
      baseAttrs.flip = {
        transform: buildFlipTransform(data.size, flipH, flipV),
      }
    }

    // 验证节点 shape 是否已注册（X6 内置基础图形除外），未注册时抛出明确错误，
    // 避免 X6 创建出不可控节点
    if (!NodeRegistry.has(data.shape) && !X6_BUILTIN_SHAPES.has(data.shape)) {
      throw new Error(
        `[NodeFactory] 节点 shape "${data.shape}" 未注册，请先调用 NodeRegistry.register() 注册后再创建节点 (id: ${data.id})`,
      )
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

    // SVG <line> 不支持百分比坐标，根据节点实际尺寸换算为具体像素值，
    // 并在 resize 时重新计算
    attachLineResizeHandler(node)

    // 对未继承标准 rect / 自定义 markup 的 shape，X6 不会自动将 label 写入 attrs.label.text，
    // 手动同步以确保 toData() 能正确提取标签文本
    if (labelText != null && !isMultiRegionShape(data.shape)) {
      node.setAttrByPath('label/text', labelText)
    }
    return node
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
      const line = attrs.leftLine ?? {}
      const bodyFill = attrs.bodyFill ?? {}
      if (cap.fill != null)
        style.fill = cap.fill
      if (cap.stroke != null)
        style.stroke = cap.stroke
      if (cap.strokeWidth != null)
        style.strokeWidth = cap.strokeWidth
      if (line.strokeDasharray != null)
        style.strokeDasharray = line.strokeDasharray
      if (bodyFill.rx != null)
        style.rx = bodyFill.rx
      if (bodyFill.ry != null)
        style.ry = bodyFill.ry
      if (bodyFill.opacity != null)
        style.opacity = bodyFill.opacity
    }
    else if (node.shape === 'flowchart-database') {
      const cap = attrs.topCap ?? {}
      const line = attrs.leftLine ?? {}
      const bodyFill = attrs.bodyFill ?? {}
      if (bodyFill.fill != null)
        style.fill = bodyFill.fill
      if (cap.stroke != null)
        style.stroke = cap.stroke
      if (cap.strokeWidth != null)
        style.strokeWidth = cap.strokeWidth
      if (line.strokeDasharray != null)
        style.strokeDasharray = line.strokeDasharray
      if (bodyFill.rx != null)
        style.rx = bodyFill.rx
      if (bodyFill.ry != null)
        style.ry = bodyFill.ry
      if (bodyFill.opacity != null)
        style.opacity = bodyFill.opacity
    }
    else if (node.shape === 'flowchart-multi-document') {
      const front = attrs.front ?? {}
      if (front.fill != null)
        style.fill = front.fill
      if (front.stroke != null)
        style.stroke = front.stroke
      if (front.strokeWidth != null)
        style.strokeWidth = front.strokeWidth
      if (front.strokeDasharray != null)
        style.strokeDasharray = front.strokeDasharray
      if (front.opacity != null)
        style.opacity = front.opacity
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
    // 多区域节点的标签渲染在自定义选择器（nameLabel/topLabel 等）上
    let labelText = ''
    let labelAttrs: Record<string, unknown> = {}
    if (isMultiRegionShape(node.shape)) {
      const labelPath = getMultiRegionLabelPath(node.shape)
      if (labelPath) {
        const labelBase = labelPath.replace(/\/text$/, '')
        labelAttrs = (attrs[labelBase] as Record<string, unknown>) ?? {}
        labelText = (labelAttrs.text as string) ?? ''
      }
    }
    else {
      labelText = attrs.label?.text ?? attrs.text?.text ?? (node as any).label ?? ''
      labelAttrs = attrs.label ?? {}
    }
    const hasLabelStyle = labelAttrs.fontSize != null
      || labelAttrs.fontFamily != null
      || labelAttrs.fontWeight != null
      || labelAttrs.fill != null
    const hasLabelPosition = labelAttrs.textVerticalAnchor != null || labelAttrs.refY != null || labelAttrs.refX != null

    // 固定标签图形始终导出为默认文本，防止外部非法修改被序列化
    const fixedLabel = getShapeFixedLabel(node.shape)
    if (fixedLabel !== undefined) {
      labelText = fixedLabel
    }

    let label: NodeData['label'] = labelText
    if (fixedLabel !== undefined) {
      label = fixedLabel
    }
    else if (hasLabelStyle || hasLabelPosition) {
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
