import type { Ref } from 'vue'
import type { ConnectorName, MarkerName, RouterName, StrokeStyleName } from '@uni-draw/shared'
import {
  PRIMARY_COLOR,
  getConnectorConfig,
  getEdgeLabelPosition,
  getEdgeLineConfig,
  getEdgeLineType,
  getEdgeLineVertices,
  getMarkerConfig,
  getRouterConfig,
  getStrokeDasharray,
  inferConnectorName,
  inferEdgeLabelPosition,
  inferMarkerName,
  inferRouterName,
  inferStrokeStyleName,
} from '@uni-draw/shared'
import { buildTableAttrs, normalizeTableData } from '../shapes/basic/table'
import {
  BODY_STYLE_SHAPE_SELECTORS,
  getShapeFixedLabel,
  isShapeLabelSupported,
} from '../shared/constants/shapes'
import {
  getMultiRegionLabelBase,
  getMultiRegionLabelPath,
  getDefaultRegionData,
  isMultiRegionShape,
} from '../shapes/utils/regionNodes'

export interface EdgeViewData {
  id: string
  shape: string
  stroke: string
  strokeWidth: number
  strokeDasharray: string
  routerName: RouterName
  connectorName: ConnectorName
  sourceMarker: MarkerName | 'none'
  targetMarker: MarkerName | 'none'
  strokeStyle: StrokeStyleName
  labelPosition: string
  label: string
  /** 旧版兼容 */
  lineType: string
}

export function useStyleEditor(
  getGraph: () => any,
  selectedEdgeData: Ref<EdgeViewData | null>,
) {
  function extractEdgeData(edge: any): EdgeViewData {
    const line = edge.getAttrs?.()?.line ?? {}
    const router = edge.getRouter?.()
    const connector = edge.getConnector?.()
    const data = edge.getData?.()

    const routerName = inferRouterName(router)
    const connectorName = inferConnectorName(connector)
    const sourceMarker = inferMarkerName(line.sourceMarker)
    const targetMarker = inferMarkerName(line.targetMarker)
    const strokeStyle = inferStrokeStyleName(line.strokeDasharray as string | undefined)
    const lineType = getEdgeLineType(router, connector, data)

    const labels = edge.getLabels?.() ?? []
    const label = labels[0]?.attrs?.text?.text ?? labels[0]?.attrs?.label?.text ?? ''
    const labelPosition = labels[0]?.position
      ? (typeof labels[0].position === 'number'
          ? 'center'
          : inferEdgeLabelPosition(labels[0].position as Record<string, any>))
      : 'center'

    return {
      id: edge.id,
      shape: edge.shape,
      stroke: line.stroke ?? PRIMARY_COLOR,
      strokeWidth: line.strokeWidth ?? 2,
      strokeDasharray: line.strokeDasharray ?? '',
      routerName,
      connectorName,
      sourceMarker,
      targetMarker,
      strokeStyle,
      labelPosition,
      label,
      lineType,
    }
  }

  function getNodeLabelPath(shape: string): string | undefined {
    if (!isMultiRegionShape(shape))
      return 'label/text'
    return getMultiRegionLabelPath(shape)
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
      const customSelectors = BODY_STYLE_SHAPE_SELECTORS[node.shape]
      if (customSelectors) {
        const mappedAttrs: Record<string, any> = {}
        for (const selector of customSelectors) {
          const isLine = selector === 'actorBody' || selector === 'actorArms' || selector === 'actorLegL'
            || selector === 'actorLegR' || selector === 'actorLine' || selector === 'lifeline'
            || selector === 'stem' || selector === 'bar' || selector === 'branch1'
            || selector === 'branch2' || selector === 'branch3' || selector === 'cross1'
            || selector === 'cross2'
          const selectorAttrs: Record<string, any> = {}
          if ('stroke' in bodyAttrs)
            selectorAttrs.stroke = bodyAttrs.stroke
          if ('strokeWidth' in bodyAttrs)
            selectorAttrs.strokeWidth = bodyAttrs.strokeWidth
          if ('strokeDasharray' in bodyAttrs && selector !== 'actorLine')
            selectorAttrs.strokeDasharray = bodyAttrs.strokeDasharray
          if ('opacity' in bodyAttrs)
            selectorAttrs.opacity = bodyAttrs.opacity
          if ('fill' in bodyAttrs && !isLine)
            selectorAttrs.fill = bodyAttrs.fill
          if (Object.keys(selectorAttrs).length > 0)
            mappedAttrs[selector] = selectorAttrs
        }
        if (Object.keys(mappedAttrs).length > 0)
          node.setAttrs(mappedAttrs)
      }
      else if (node.shape === 'basic-cylinder') {
        const { fill, stroke, strokeWidth, strokeDasharray, rx, ry, opacity } = bodyAttrs as any
        const cylAttrs: Record<string, any> = {}
        if (fill !== undefined) {
          cylAttrs.bodyFill = { fill }
          cylAttrs.topCap = { fill }
          cylAttrs.bottomCap = { fill }
        }
        if (stroke !== undefined || strokeWidth !== undefined || strokeDasharray !== undefined) {
          const sv: any = {}
          if (stroke !== undefined)
            sv.stroke = stroke
          if (strokeWidth !== undefined)
            sv.strokeWidth = strokeWidth
          if (strokeDasharray !== undefined)
            sv.strokeDasharray = strokeDasharray
          cylAttrs.topCap = { ...(cylAttrs.topCap ?? {}), ...sv }
          cylAttrs.bottomCap = { ...(cylAttrs.bottomCap ?? {}), ...sv }
          cylAttrs.leftLine = { ...(cylAttrs.leftLine ?? {}), ...sv }
          cylAttrs.rightLine = { ...(cylAttrs.rightLine ?? {}), ...sv }
        }
        if (rx !== undefined || ry !== undefined) {
          const rr: any = {}
          if (rx !== undefined)
            rr.rx = rx
          if (ry !== undefined)
            rr.ry = ry
          cylAttrs.bodyFill = { ...(cylAttrs.bodyFill ?? {}), ...rr }
        }
        if (opacity !== undefined) {
          cylAttrs.bodyFill = { ...(cylAttrs.bodyFill ?? {}), opacity }
          cylAttrs.topCap = { ...(cylAttrs.topCap ?? {}), opacity }
          cylAttrs.bottomCap = { ...(cylAttrs.bottomCap ?? {}), opacity }
          cylAttrs.leftLine = { ...(cylAttrs.leftLine ?? {}), opacity }
          cylAttrs.rightLine = { ...(cylAttrs.rightLine ?? {}), opacity }
        }
        if (Object.keys(cylAttrs).length > 0)
          node.setAttrs(cylAttrs)
      }
      else if (node.shape === 'flowchart-database') {
        const { fill, stroke, strokeWidth, strokeDasharray, rx, ry, opacity } = bodyAttrs as any
        const dbAttrs: Record<string, any> = {}
        if (fill !== undefined) {
          dbAttrs.bodyFill = { fill }
          dbAttrs.topCap = { fill }
          dbAttrs.bottomCap = { fill }
        }
        if (stroke !== undefined || strokeWidth !== undefined || strokeDasharray !== undefined) {
          const sv: any = {}
          if (stroke !== undefined)
            sv.stroke = stroke
          if (strokeWidth !== undefined)
            sv.strokeWidth = strokeWidth
          if (strokeDasharray !== undefined)
            sv.strokeDasharray = strokeDasharray
          dbAttrs.bottomCap = { ...(dbAttrs.bottomCap ?? {}), ...sv }
          dbAttrs.leftLine = { ...(dbAttrs.leftLine ?? {}), ...sv }
          dbAttrs.rightLine = { ...(dbAttrs.rightLine ?? {}), ...sv }
          dbAttrs.topCap = { ...(dbAttrs.topCap ?? {}), ...sv }
        }
        if (rx !== undefined || ry !== undefined) {
          const rr: any = {}
          if (rx !== undefined)
            rr.rx = rx
          if (ry !== undefined)
            rr.ry = ry
          dbAttrs.bodyFill = { ...(dbAttrs.bodyFill ?? {}), ...rr }
        }
        if (opacity !== undefined) {
          dbAttrs.bottomCap = { ...(dbAttrs.bottomCap ?? {}), opacity }
          dbAttrs.bodyFill = { ...(dbAttrs.bodyFill ?? {}), opacity }
          dbAttrs.leftLine = { ...(dbAttrs.leftLine ?? {}), opacity }
          dbAttrs.rightLine = { ...(dbAttrs.rightLine ?? {}), opacity }
          dbAttrs.topCap = { ...(dbAttrs.topCap ?? {}), opacity }
        }
        if (Object.keys(dbAttrs).length > 0)
          node.setAttrs(dbAttrs)
      }
      else if (node.shape === 'flowchart-multi-document') {
        const { fill, stroke, strokeWidth, strokeDasharray, opacity } = bodyAttrs as any
        const mdAttrs: Record<string, any> = {}
        if (fill !== undefined) {
          mdAttrs.back = { fill }
          mdAttrs.front = { fill }
        }
        if (stroke !== undefined || strokeWidth !== undefined || strokeDasharray !== undefined) {
          const sv: any = {}
          if (stroke !== undefined)
            sv.stroke = stroke
          if (strokeWidth !== undefined)
            sv.strokeWidth = strokeWidth
          if (strokeDasharray !== undefined)
            sv.strokeDasharray = strokeDasharray
          mdAttrs.back = { ...(mdAttrs.back ?? {}), ...sv }
          mdAttrs.foldBack = { ...(mdAttrs.foldBack ?? {}), ...sv }
          mdAttrs.front = { ...(mdAttrs.front ?? {}), ...sv }
          mdAttrs.foldFront = { ...(mdAttrs.foldFront ?? {}), ...sv }
        }
        if (opacity !== undefined) {
          mdAttrs.back = { ...(mdAttrs.back ?? {}), opacity }
          mdAttrs.foldBack = { ...(mdAttrs.foldBack ?? {}), opacity }
          mdAttrs.front = { ...(mdAttrs.front ?? {}), opacity }
          mdAttrs.foldFront = { ...(mdAttrs.foldFront ?? {}), opacity }
        }
        if (Object.keys(mdAttrs).length > 0)
          node.setAttrs(mdAttrs)
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

    const labelPath = getNodeLabelPath(node.shape)
    const labelBase = isMultiRegionShape(node.shape) ? getMultiRegionLabelBase(node.shape) : 'label'
    const fixedLabel = getShapeFixedLabel(node.shape)

    // 固定标签图形（如状态图浅/深历史）不允许通过样式编辑器修改标签相关属性
    if (fixedLabel === undefined) {
      if ('label' in style && typeof style.label === 'string' && labelPath) {
        node.setAttrByPath(labelPath, style.label as string)
        // 多区域节点需要同步 regionData，保证导出/重建时标签不丢失
        if (isMultiRegionShape(node.shape)) {
          const data = node.getData?.() ?? {}
          const regionData = data.regionData ? { ...data.regionData } : getDefaultRegionData(node.shape)
          if (regionData && Array.isArray(regionData.regions) && regionData.regions.length > 0) {
            regionData.regions = regionData.regions.map((r: any, i: number) =>
              i === 0 ? { ...r, label: style.label as string } : r,
            )
            node.setData({ ...data, regionData }, { overwrite: false })
          }
        }
      }
      if ('fontSize' in style && labelBase)
        node.setAttrByPath(`${labelBase}/fontSize`, style.fontSize)
      if ('fontFamily' in style && labelBase)
        node.setAttrByPath(`${labelBase}/fontFamily`, style.fontFamily)
      if ('fontWeight' in style && labelBase)
        node.setAttrByPath(`${labelBase}/fontWeight`, style.fontWeight)
      if ('lineHeight' in style && labelBase)
        node.setAttrByPath(`${labelBase}/lineHeight`, style.lineHeight)
      if ('labelFill' in style && labelBase)
        node.setAttrByPath(`${labelBase}/fill`, style.labelFill)
      if ('textAlign' in style && labelBase) {
        const align = style.textAlign as string
        node.setAttrByPath(`${labelBase}/textAnchor`, align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle')
      }
      if ('labelPosition' in style) {
        const pos = style.labelPosition as string
        const textAnchor = pos === 'left' ? 'end' : pos === 'right' ? 'start' : 'middle'
        const yAttr = pos === 'top' ? '0.2' : pos === 'bottom' ? '0.8' : '0.5'
        node.setAttrs({ label: { textAnchor, textVerticalAnchor: pos === 'top' ? 'top' : pos === 'bottom' ? 'bottom' : 'middle', refY: yAttr } })
      }
    }
    if ('imageHref' in style) {
      node.attr('image/xlink:href', style.imageHref)
      const data = node.getData() ?? {}
      node.setData({ ...data, imageHref: style.imageHref })
    }
    if ('imageFit' in style) {
      const map: Record<string, string> = { contain: 'xMidYMid meet', cover: 'xMidYMid slice', fill: 'none' }
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
    const lineAttrs: Record<string, any> = {}
    if ('stroke' in style)
      lineAttrs.stroke = style.stroke
    if ('strokeWidth' in style)
      lineAttrs.strokeWidth = style.strokeWidth
    if ('strokeDasharray' in style)
      lineAttrs.strokeDasharray = style.strokeDasharray
    if ('strokeLinecap' in style)
      lineAttrs.strokeLinecap = style.strokeLinecap
    if ('strokeLinejoin' in style)
      lineAttrs.strokeLinejoin = style.strokeLinejoin
    if ('sourceMarker' in style) {
      lineAttrs.sourceMarker = getMarkerConfig(style.sourceMarker as MarkerName | 'none')
    }
    if ('targetMarker' in style) {
      lineAttrs.targetMarker = getMarkerConfig(style.targetMarker as MarkerName | 'none')
    }
    if (Object.keys(lineAttrs).length > 0) {
      edge.setAttrs({ line: lineAttrs })
    }
    if ('label' in style) {
      const txt = style.label as string
      if (txt) {
        edge.setLabels([{ attrs: { text: { text: txt } } }])
      }
      else {
        edge.setLabels([])
      }
    }
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  function changeEdgeRouter(id: string, routerName: RouterName): void {
    const graph = getGraph()
    if (!graph)
      return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isEdge?.())
      return
    const edge = cell as any
    if (edge.shape === 'edge-sketch')
      return
    const router = getRouterConfig(routerName)
    edge.setRouter(router)
    edge.setData?.({ ...(edge.getData?.() ?? {}), routerName })
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  function changeEdgeConnector(id: string, connectorName: ConnectorName): void {
    const graph = getGraph()
    if (!graph)
      return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isEdge?.())
      return
    const edge = cell as any
    if (edge.shape === 'edge-sketch')
      return
    const connector = getConnectorConfig(connectorName)
    edge.setConnector(connector)
    edge.setData?.({ ...(edge.getData?.() ?? {}), connectorName })
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  function changeEdgeMarker(id: string, side: 'source' | 'target', markerName: MarkerName | 'none'): void {
    const graph = getGraph()
    if (!graph)
      return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isEdge?.())
      return
    const edge = cell as any
    const marker = getMarkerConfig(markerName)
    edge.setAttrs({ line: { [`${side}Marker`]: marker } })
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  function changeEdgeStrokeStyle(id: string, strokeStyle: StrokeStyleName): void {
    const graph = getGraph()
    if (!graph)
      return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isEdge?.())
      return
    const edge = cell as any
    const dasharray = getStrokeDasharray(strokeStyle)
    edge.setAttrs({ line: { strokeDasharray: dasharray || null } })
    edge.setData?.({ ...(edge.getData?.() ?? {}), strokeStyle })
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  function changeEdgeLabelPosition(id: string, position: string): void {
    const graph = getGraph()
    if (!graph)
      return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isEdge?.())
      return
    const edge = cell as any
    const labels = edge.getLabels?.() ?? []
    const existingLabel = labels[0]?.attrs?.text?.text ?? ''
    const pos = getEdgeLabelPosition(position)
    edge.setLabels([{ attrs: { text: { text: existingLabel } }, position: pos }])
    if (selectedEdgeData.value && selectedEdgeData.value.id === id) {
      selectedEdgeData.value = extractEdgeData(edge)
    }
  }

  /**
   * 旧版兼容：通过 lineType 切换边的路由+连接器组合
   */
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

  return {
    extractEdgeData,
    updateNodeStyle,
    updateEdgeStyle,
    changeEdgeType,
    changeEdgeRouter,
    changeEdgeConnector,
    changeEdgeMarker,
    changeEdgeStrokeStyle,
    changeEdgeLabelPosition,
  }
}
