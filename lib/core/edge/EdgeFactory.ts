import type { Graph, Edge } from '@antv/x6'
import type { EdgeData } from '@uni-draw/shared'
import { getEdgeLineConfig, getEdgeLineVertices, getEdgeShapeLineType } from '@uni-draw/shared'

/**
 * 边工厂
 * 根据 EdgeData 创建 X6 边实例
 */
export class EdgeFactory {
  private static isPointEndpoint(endpoint: EdgeData['source'] | EdgeData['target']): endpoint is { x: number; y: number } {
    return typeof endpoint === 'object' && endpoint !== null && 'x' in endpoint && 'y' in endpoint
  }

  /**
   * 创建 X6 边
   */
  static createEdge(graph: Graph, data: EdgeData): Edge {
    const rawData = data.data && typeof data.data === 'object' ? { ...data.data } : undefined
    const inferredLineType = typeof rawData?.lineType === 'string'
      ? rawData.lineType
      : getEdgeShapeLineType(data.shape)
    const lineConfig = inferredLineType ? getEdgeLineConfig(inferredLineType) : { router: null, connector: null }
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
      data: inferredLineType ? { ...(rawData ?? {}), lineType: inferredLineType } : data.data,
      vertices,
      router: data.router === undefined ? lineConfig.router : data.router,
      connector: data.connector === undefined ? lineConfig.connector : data.connector,
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
