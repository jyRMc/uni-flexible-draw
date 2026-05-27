import type { Ref } from 'vue'
import { PRIMARY_COLOR, getEdgeLineConfig, getEdgeLineType, getEdgeLineVertices } from '@uni-draw/shared'

export interface EdgeViewData {
  id: string
  stroke: string
  strokeWidth: number
  strokeDasharray: string
  lineType: string
  label: string
  sourceMarker: string
  targetMarker: string
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
    const sourceMarker = line.sourceMarker?.name ?? 'none'
    const targetMarker = line.targetMarker?.name ?? 'none'
    return {
      id: edge.id,
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
    if (!graph) return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isNode()) return
    const node = cell as any

    const bodyKeys = ['fill', 'stroke', 'strokeWidth', 'strokeDasharray', 'rx', 'ry', 'opacity']
    const bodyAttrs: Record<string, any> = {}
    for (const k of bodyKeys) {
      if (k in style) bodyAttrs[k] = style[k]
    }
    if (Object.keys(bodyAttrs).length > 0) {
      if (node.shape === 'basic-cylinder') {
        const { fill, stroke, strokeWidth } = bodyAttrs as any
        const cylAttrs: Record<string, any> = {}
        if (fill !== undefined) {
          cylAttrs.bodyFill  = { fill }
          cylAttrs.topCap    = { fill }
          cylAttrs.bottomCap = { fill }
        }
        if (stroke !== undefined || strokeWidth !== undefined) {
          const sv: any = {}
          if (stroke !== undefined)      sv.stroke = stroke
          if (strokeWidth !== undefined) sv.strokeWidth = strokeWidth
          cylAttrs.topCap    = { ...(cylAttrs.topCap    ?? {}), ...sv }
          cylAttrs.bottomCap = { ...(cylAttrs.bottomCap ?? {}), ...sv }
          cylAttrs.leftWall  = sv
          cylAttrs.rightWall = sv
        }
        if (Object.keys(cylAttrs).length > 0) node.setAttrs(cylAttrs)
      } else {
        node.setAttrs({ body: bodyAttrs })
      }
    }

    if ('label' in style && typeof style.label === 'string') {
      node.setLabel(style.label as string)
    }

    if ('fontSize' in style) {
      node.setAttrByPath('label/fontSize', style.fontSize)
    }

    if ('labelPosition' in style) {
      const pos = style.labelPosition as string
      const textAnchor = pos === 'left' ? 'end' : pos === 'right' ? 'start' : 'middle'
      const yAttr = pos === 'top' ? '0.2' : pos === 'bottom' ? '0.8' : '0.5'
      node.setAttrs({
        label: {
          textAnchor,
          textVerticalAnchor: pos === 'top' ? 'top' : pos === 'bottom' ? 'bottom' : 'middle',
          refY: yAttr,
        },
      })
    }
  }

  function updateEdgeStyle(id: string, style: Record<string, unknown>): void {
    const graph = getGraph()
    if (!graph) return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isEdge?.()) return
    const edge = cell as any
    const lineAttrs: Record<string, any> = {}
    if ('stroke' in style) lineAttrs.stroke = style.stroke
    if ('strokeWidth' in style) lineAttrs.strokeWidth = style.strokeWidth
    if ('strokeDasharray' in style) lineAttrs.strokeDasharray = style.strokeDasharray
    if ('sourceMarker' in style) {
      lineAttrs.sourceMarker = style.sourceMarker === 'none' ? null : { name: style.sourceMarker }
    }
    if ('targetMarker' in style) {
      lineAttrs.targetMarker = style.targetMarker === 'none' ? null : { name: style.targetMarker }
    }
    if (Object.keys(lineAttrs).length > 0) {
      edge.setAttrs({ line: lineAttrs })
    }
    if ('label' in style) {
      const txt = style.label as string
      if (txt) {
        edge.setLabels([{ attrs: { label: { text: txt } } }])
      } else {
        edge.setLabels([])
      }
    }
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  function changeEdgeType(id: string, lineType: string): void {
    const graph = getGraph()
    if (!graph) return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isEdge?.()) return
    const edge = cell as any
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
