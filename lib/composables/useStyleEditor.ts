import type { Ref } from 'vue'
import { PRIMARY_COLOR, getEdgeLineConfig, getEdgeLineType, getEdgeLineVertices } from '@uni-draw/shared'
import { buildTableAttrs, normalizeTableData } from '../shapes/basic/table'

export interface EdgeViewData {
  id: string
  shape: string
  stroke: string
  strokeWidth: number
  strokeDasharray: string
  lineType: string
  label: string
  sourceMarker: string
  targetMarker: string
}

function getMarkerDisplayName(marker: any): string {
  if (!marker || marker === null)
    return 'none'
  const name = marker.name
  if (!name)
    return 'none'
  // 'open' 在 X6 中通过 classic/block 等 marker 的 open: true 选项实现
  if (marker.open === true && (name === 'classic' || name === 'block'))
    return 'open'
  return name
}

function buildMarkerConfig(value: string): any {
  if (value === 'none')
    return null
  if (value === 'open')
    return { name: 'classic', open: true }
  return { name: value }
}

export function useStyleEditor(
  getGraph: () => any,
  selectedEdgeData: Ref<EdgeViewData | null>,
) {
  function extractEdgeData(edge: any): EdgeViewData {
    const line = edge.getAttrs?.()?.line ?? {}
    const router = edge.getRouter?.()
    const connector = edge.getConnector?.()
    const lineType = getEdgeLineType(router, connector, edge.getData?.())
    const labels = edge.getLabels?.() ?? []
    const label = labels[0]?.attrs?.label?.text ?? ''
    const sourceMarker = getMarkerDisplayName(line.sourceMarker)
    const targetMarker = getMarkerDisplayName(line.targetMarker)
    return {
      id: edge.id,
      shape: edge.shape,
      stroke: line.stroke ?? PRIMARY_COLOR,
      strokeWidth: line.strokeWidth ?? 2,
      strokeDasharray: line.strokeDasharray ?? '',
      lineType,
      label,
      sourceMarker,
      targetMarker,
    }
  }

  function updateNodeStyle(id: string, style: Record<string, unknown>): void {
    const graph = getGraph()
    if (!graph)
      return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isNode())
      return
    const node = cell as any

    const bodyKeys = ['fill', 'stroke', 'strokeWidth', 'strokeDasharray', 'rx', 'ry', 'opacity']
    const bodyAttrs: Record<string, any> = {}
    for (const k of bodyKeys) {
      if (k in style)
        bodyAttrs[k] = style[k]
    }
    if (Object.keys(bodyAttrs).length > 0) {
      if (node.shape === 'basic-cylinder') {
        const { fill, stroke, strokeWidth } = bodyAttrs as any
        const cylAttrs: Record<string, any> = {}
        if (fill !== undefined) {
          cylAttrs.bodyFill = { fill }
          cylAttrs.topCap = { fill }
          cylAttrs.bottomCap = { fill }
        }
        if (stroke !== undefined || strokeWidth !== undefined) {
          const sv: any = {}
          if (stroke !== undefined)
            sv.stroke = stroke
          if (strokeWidth !== undefined)
            sv.strokeWidth = strokeWidth
          cylAttrs.topCap = { ...(cylAttrs.topCap ?? {}), ...sv }
          cylAttrs.bottomCap = { ...(cylAttrs.bottomCap ?? {}), ...sv }
          cylAttrs.leftLine = sv
          cylAttrs.rightLine = sv
        }
        if (Object.keys(cylAttrs).length > 0)
          node.setAttrs(cylAttrs)
      }
      else if (node.shape === 'basic-table') {
        const table = normalizeTableData((node.getData?.() ?? {}).table)
        const currentBody = node.getAttrs?.()?.body ?? {}
        node.setAttrs(buildTableAttrs(table, {
          fill: bodyAttrs.fill ?? currentBody.fill,
          stroke: bodyAttrs.stroke ?? currentBody.stroke,
          strokeWidth: bodyAttrs.strokeWidth ?? currentBody.strokeWidth,
          strokeDasharray: bodyAttrs.strokeDasharray ?? currentBody.strokeDasharray,
          opacity: bodyAttrs.opacity ?? currentBody.opacity,
        }) as any, { overwrite: true })
      }
      else {
        if ('opacity' in bodyAttrs && (node.shape === 'basic-image' || node.shape === 'basic-svg')) {
          node.attr('image/opacity', bodyAttrs.opacity)
          delete bodyAttrs.opacity
        }
        if (Object.keys(bodyAttrs).length > 0) {
          node.setAttrs({ body: bodyAttrs })
        }
      }
    }

    if ('label' in style && typeof style.label === 'string') {
      node.setLabel(style.label as string)
    }

    if ('fontSize' in style) {
      node.setAttrByPath('label/fontSize', style.fontSize)
    }

    if ('fontFamily' in style) {
      node.setAttrByPath('label/fontFamily', style.fontFamily)
    }

    if ('fontWeight' in style) {
      node.setAttrByPath('label/fontWeight', style.fontWeight)
    }

    if ('lineHeight' in style) {
      node.setAttrByPath('label/lineHeight', style.lineHeight)
    }

    if ('labelFill' in style) {
      node.setAttrByPath('label/fill', style.labelFill)
    }

    if ('textAlign' in style) {
      const align = style.textAlign as string
      node.setAttrByPath('label/textAnchor', align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle')
    }

    if ('labelPosition' in style) {
      const pos = style.labelPosition as string
      const labelAttrs: Record<string, any> = {
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        refX: 0.5,
        refY: 0.5,
      }
      if (pos === 'top') {
        labelAttrs.textVerticalAnchor = 'top'
        labelAttrs.refY = 0
      }
      else if (pos === 'bottom') {
        labelAttrs.textVerticalAnchor = 'bottom'
        labelAttrs.refY = 1
      }
      else if (pos === 'left') {
        labelAttrs.textAnchor = 'start'
        labelAttrs.refX = 0
      }
      else if (pos === 'right') {
        labelAttrs.textAnchor = 'end'
        labelAttrs.refX = 1
      }
      node.setAttrs({ label: labelAttrs })
    }

    if ('imageHref' in style) {
      node.attr('image/xlink:href', style.imageHref)
      const data = node.getData() ?? {}
      node.setData({ ...data, imageHref: style.imageHref })
    }

    if ('imageFit' in style) {
      const map: Record<string, string> = {
        contain: 'xMidYMid meet',
        cover: 'xMidYMid slice',
        fill: 'none',
      }
      node.attr('image/preserveAspectRatio', map[style.imageFit as string] ?? 'xMidYMid meet')
    }
  }

  function updateEdgeStyle(id: string, style: Record<string, unknown>): void {
    const graph = getGraph()
    if (!graph)
      return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isEdge?.())
      return
    const edge = cell as any
    // 使用 attr(path, value) 精确设置，避免 setAttrs 的深合并把 null/Object 合并坏掉
    if ('stroke' in style)
      edge.attr('line/stroke', style.stroke)
    if ('strokeWidth' in style)
      edge.attr('line/strokeWidth', style.strokeWidth)
    if ('strokeDasharray' in style)
      edge.attr('line/strokeDasharray', style.strokeDasharray)
    if ('sourceMarker' in style) {
      edge.attr('line/sourceMarker', buildMarkerConfig(style.sourceMarker as string))
    }
    if ('targetMarker' in style) {
      edge.attr('line/targetMarker', buildMarkerConfig(style.targetMarker as string))
    }
    if ('label' in style) {
      const txt = style.label as string
      if (txt) {
        edge.setLabels([{ attrs: { label: { text: txt } } }])
      }
      else {
        edge.setLabels([])
      }
    }
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  function changeEdgeType(id: string, lineType: string): void {
    const graph = getGraph()
    if (!graph)
      return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isEdge?.())
      return
    const edge = cell as any
    if (edge.shape === 'edge-sketch')
      return
    const { router, connector } = getEdgeLineConfig(lineType)
    const vertices = getEdgeLineVertices(lineType, edge.getSourcePoint?.(), edge.getTargetPoint?.())
    edge.setData?.({ ...(edge.getData?.() ?? {}), lineType })
    edge.setRouter(router)
    edge.setConnector(connector)
    edge.setVertices(vertices)
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  return { extractEdgeData, updateNodeStyle, updateEdgeStyle, changeEdgeType }
}
