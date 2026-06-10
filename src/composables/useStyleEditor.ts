import type { Ref } from 'vue'
import { PRIMARY_COLOR } from '../shared'
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

export function useStyleEditor(
  getGraph: () => any,
  selectedEdgeData: Ref<EdgeViewData | null>,
) {
  function extractEdgeData(edge: any): EdgeViewData {
    const line = edge.getAttrs?.()?.line ?? {}
    const router = edge.getRouter?.()
    const connector = edge.getConnector?.()
    let lineType = 'straight'
    if (connector?.name === 'smooth') lineType = 'curve'
    else if (connector?.name === 'rounded') lineType = 'rounded'
    else if (connector?.name === 'jumpover') lineType = 'jumpover'
    else if (router?.name === 'orth') lineType = 'orthogonal'
    else if (router?.name === 'manhattan') lineType = 'manhattan'
    const labels = edge.getLabels?.() ?? []
    const label = labels[0]?.attrs?.label?.text ?? ''
    const sourceMarker = line.sourceMarker?.name ?? 'none'
    const targetMarker = line.targetMarker?.name ?? 'none'
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
          cylAttrs.leftLine  = sv
          cylAttrs.rightLine = sv
        }
        if (Object.keys(cylAttrs).length > 0) node.setAttrs(cylAttrs)
      } else if (node.shape === 'basic-table') {
        const table = normalizeTableData((node.getData?.() ?? {}).table)
        const currentBody = node.getAttrs?.()?.body ?? {}
        node.setAttrs(buildTableAttrs(table, {
          fill: bodyAttrs.fill ?? currentBody.fill,
          stroke: bodyAttrs.stroke ?? currentBody.stroke,
          strokeWidth: bodyAttrs.strokeWidth ?? currentBody.strokeWidth,
          strokeDasharray: bodyAttrs.strokeDasharray ?? currentBody.strokeDasharray,
          opacity: bodyAttrs.opacity ?? currentBody.opacity,
        }) as any, { overwrite: true })
      } else {
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
    if (edge.shape === 'edge-sketch') return
    switch (lineType) {
      case 'rounded':
        edge.setRouter({ name: 'orth' })
        edge.setConnector({ name: 'rounded', args: { radius: 8 } })
        break
      case 'curve':
        edge.setRouter(null)
        edge.setConnector({ name: 'smooth' })
        break
      case 'orthogonal':
        edge.setRouter({ name: 'orth' })
        edge.setConnector(null)
        break
      case 'manhattan':
        edge.setRouter({ name: 'manhattan' })
        edge.setConnector(null)
        break
      case 'jumpover':
        edge.setRouter({ name: 'manhattan' })
        edge.setConnector({ name: 'jumpover', args: { type: 'arc', size: 10 } })
        break
      case 'straight':
      default:
        edge.setRouter(null)
        edge.setConnector(null)
        break
    }
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  return { extractEdgeData, updateNodeStyle, updateEdgeStyle, changeEdgeType }
}
