import type { Graph, Edge } from '@antv/x6'
import type { EdgeData } from '@uni-draw/shared'
import { getEdgeLineConfig, getEdgeLineVertices, getEdgeShapeLineType } from '@uni-draw/shared'

const SKETCH_CONNECTOR_NAME = 'uni-draw-sketch-straight'
const SKETCH_ROUGHNESS = 1

/**
 * 边工厂
 * 根据 EdgeData 创建 X6 边实例
 */
export class EdgeFactory {
  private static isPointEndpoint(endpoint: EdgeData['source'] | EdgeData['target']): endpoint is { x: number; y: number } {
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
   * 创建 X6 边
   */
  static createEdge(graph: Graph, data: EdgeData): Edge {
    const rawData = data.data && typeof data.data === 'object' ? { ...data.data } : undefined
    const sketchSeed = data.shape === 'edge-sketch'
      ? Number(rawData?.seed ?? this.hashSeed(data.id))
      : undefined
    const inferredLineType = typeof rawData?.lineType === 'string'
      ? rawData.lineType
      : getEdgeShapeLineType(data.shape)
    const lineConfig = inferredLineType ? getEdgeLineConfig(inferredLineType) : { router: null, connector: null }
    const router = data.router === undefined
      ? (inferredLineType ? lineConfig.router : undefined)
      : data.router
    const connector = data.connector === undefined
      ? data.shape === 'edge-sketch'
        ? {
            name: SKETCH_CONNECTOR_NAME,
            args: {
              seed: sketchSeed,
              roughness: SKETCH_ROUGHNESS,
              strokeWidth: data.style?.strokeWidth ?? 2,
            },
          }
        : (inferredLineType ? lineConfig.connector : undefined)
      : data.connector
    const vertices = data.vertices !== undefined
      ? data.vertices
      : inferredLineType && this.isPointEndpoint(data.source) && this.isPointEndpoint(data.target)
        ? getEdgeLineVertices(inferredLineType, data.source, data.target)
        : undefined

    return graph.createEdge({
      id: data.id,
      shape: data.shape,
      source: data.source,
      target: data.target,
      attrs: data.style ? { line: { ...data.style } } : undefined,
      label: typeof data.label === 'string' ? data.label : data.label?.text,
      data: data.shape === 'edge-sketch'
        ? { ...(rawData ?? {}), ...(inferredLineType ? { lineType: inferredLineType } : {}), seed: sketchSeed }
        : inferredLineType
          ? { ...(rawData ?? {}), lineType: inferredLineType }
          : data.data,
      vertices,
      router,
      connector,
    })
  }

  /**
   * 从 X6 边提取 EdgeData
   */
  static toData(edge: Edge): EdgeData {
    return {
      id: edge.id,
      shape: edge.shape,
      source: edge.getSource() as EdgeData['source'],
      target: edge.getTarget() as EdgeData['target'],
      label: (edge as any).label ?? (edge.getLabels()?.[0]?.attrs as any)?.label?.text,
      data: edge.getData(),
      vertices: edge.getVertices(),
      router: edge.getRouter() as EdgeData['router'],
      connector: edge.getConnector() as EdgeData['connector'],
    }
  }
}
