import type { Edge, Graph } from '@antv/x6'
import type { ConnectorConfig, EdgeData, MarkerConfig, RouterConfig } from '@uni-draw/shared'
import {
  getConnectorConfig,
  getEdgeLineVertices,
  getMarkerConfig,
  getRouterConfig,
  getStrokeDasharray,
} from '@uni-draw/shared'
import { edgeDefaults } from '../../shapes/edge/line'

const SKETCH_CONNECTOR_NAME = 'uni-draw-sketch-straight'
const SKETCH_ROUGHNESS = 1

/**
 * 边工厂
 * 根据 EdgeData 创建 X6 边实例
 *
 * 新架构：边的视觉由 router + connector + marker + style 四个维度组合
 */
export class EdgeFactory {
  private static isPointEndpoint(endpoint: any): boolean {
    return typeof endpoint === 'object' && endpoint !== null && 'x' in endpoint && 'y' in endpoint
  }

  private static hashSeed(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }

  /**
   * 构建 marker 的 attrs 配置
   */
  private static buildMarkerAttr(marker: MarkerConfig | null | undefined): Record<string, unknown> | null {
    if (!marker) {
      return null
    }
    const config: Record<string, unknown> = { name: marker.name }
    if (marker.size !== undefined) {
      config.size = marker.size
    }
    if (marker.fill !== undefined) {
      config.fill = marker.fill
    }
    if (marker.stroke !== undefined) {
      config.stroke = marker.stroke
    }
    if (marker.strokeWidth !== undefined) {
      config.strokeWidth = marker.strokeWidth
    }
    if (marker.d !== undefined) {
      config.d = marker.d
    }
    return config
  }

  /**
   * 创建 X6 边
   */
  static createEdge(graph: Graph, data: EdgeData): Edge {
    const rawData = data.data && typeof data.data === 'object' ? { ...data.data } : undefined
    const isSketch = data.shape === 'edge-sketch'
    const sketchSeed = isSketch
      ? Number(rawData?.seed ?? this.hashSeed(data.id))
      : undefined

    // ── Router ───────────────────────────────────────────────────────
    let router: RouterConfig | null | undefined
    if (data.router !== undefined) {
      router = data.router as RouterConfig | null
    }
    else if (rawData?.routerName) {
      router = getRouterConfig(rawData.routerName as any, rawData.routerArgs as Record<string, unknown>)
    }

    // ── Connector ────────────────────────────────────────────────────
    let connector: ConnectorConfig | null | undefined
    if (isSketch) {
      connector = {
        name: SKETCH_CONNECTOR_NAME as any,
        args: {
          seed: sketchSeed,
          roughness: SKETCH_ROUGHNESS,
          strokeWidth: data.style?.strokeWidth ?? 2,
        },
      }
    }
    else if (data.connector !== undefined) {
      connector = data.connector as ConnectorConfig | null
    }
    else if (rawData?.connectorName) {
      connector = getConnectorConfig(rawData.connectorName as any, rawData.connectorArgs as Record<string, unknown>)
    }

    // ── Vertices ─────────────────────────────────────────────────────
    let vertices = data.vertices
    if (vertices === undefined && this.isPointEndpoint(data.source) && this.isPointEndpoint(data.target)) {
      const lineType = (rawData?.lineType as string) ?? undefined
      if (lineType) {
        vertices = getEdgeLineVertices(lineType, data.source as any, data.target as any)
      }
    }

    // ── Attrs ────────────────────────────────────────────────────────
    const lineAttrs: Record<string, unknown> = { ...edgeDefaults.attrs.line }
    if (data.style) {
      if (data.style.stroke !== undefined) {
        lineAttrs.stroke = data.style.stroke
      }
      if (data.style.strokeWidth !== undefined) {
        lineAttrs.strokeWidth = data.style.strokeWidth
      }
      if (data.style.strokeDasharray !== undefined) {
        lineAttrs.strokeDasharray = data.style.strokeDasharray || null
      }
      if (data.style.strokeLinecap !== undefined) {
        lineAttrs.strokeLinecap = data.style.strokeLinecap
      }
      if (data.style.strokeLinejoin !== undefined) {
        lineAttrs.strokeLinejoin = data.style.strokeLinejoin
      }
      if (data.style.sourceMarker !== undefined) {
        lineAttrs.sourceMarker = this.buildMarkerAttr(data.style.sourceMarker)
      }
      if (data.style.targetMarker !== undefined) {
        lineAttrs.targetMarker = this.buildMarkerAttr(data.style.targetMarker)
      }
    }

    // 兼容素材数据中的 sourceMarker / targetMarker / strokeStyle（字符串形式）
    if (typeof rawData?.sourceMarker === 'string' && data.style?.sourceMarker === undefined) {
      lineAttrs.sourceMarker = this.buildMarkerAttr(
        getMarkerConfig(rawData.sourceMarker as any),
      )
    }
    if (typeof rawData?.targetMarker === 'string' && data.style?.targetMarker === undefined) {
      lineAttrs.targetMarker = this.buildMarkerAttr(
        getMarkerConfig(rawData.targetMarker as any),
      )
    }
    if (typeof rawData?.strokeStyle === 'string' && data.style?.strokeDasharray === undefined) {
      lineAttrs.strokeDasharray = getStrokeDasharray(rawData.strokeStyle as any) || null
    }

    // ── 业务数据 ──────────────────────────────────────────────────────
    const edgeData = isSketch
      ? { ...(rawData ?? {}), seed: sketchSeed }
      : { ...(rawData ?? {}) }

    return graph.createEdge({
      id: data.id,
      shape: isSketch ? 'edge-sketch' : 'edge',
      source: data.source,
      target: data.target,
      attrs: { line: lineAttrs },
      label: typeof data.label === 'string' ? data.label : data.label?.text,
      data: edgeData,
      vertices,
      router,
      connector,
    })
  }

  /**
   * 从 X6 边提取 EdgeData
   */
  static toData(edge: Edge): EdgeData {
    const line = edge.getAttrs?.()?.line ?? {}
    const data = edge.getData() ?? {}

    return {
      id: edge.id,
      shape: edge.shape,
      source: edge.getSource() as EdgeData['source'],
      target: edge.getTarget() as EdgeData['target'],
      label: (edge as any).label ?? (edge.getLabels()?.[0]?.attrs as any)?.text?.text ?? (edge.getLabels()?.[0]?.attrs as any)?.label?.text,
      data,
      vertices: edge.getVertices(),
      router: edge.getRouter() as EdgeData['router'],
      connector: edge.getConnector() as EdgeData['connector'],
      style: {
        stroke: line.stroke as string | undefined,
        strokeWidth: line.strokeWidth as number | undefined,
        strokeDasharray: (line.strokeDasharray as string) || undefined,
        sourceMarker: (line.sourceMarker ?? undefined) as any,
        targetMarker: (line.targetMarker ?? undefined) as any,
        strokeLinecap: line.strokeLinecap as any,
        strokeLinejoin: line.strokeLinejoin as any,
      },
    }
  }
}
