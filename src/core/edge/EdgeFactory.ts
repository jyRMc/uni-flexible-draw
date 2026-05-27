import type { Graph, Edge } from '@antv/x6'
import type { EdgeData } from '@uni-draw/shared'

/**
 * 边工厂
 * 根据 EdgeData 创建 X6 边实例
 */
export class EdgeFactory {
  /**
   * 创建 X6 边
   */
  static createEdge(graph: Graph, data: EdgeData): Edge {
    return graph.createEdge({
      id: data.id,
      shape: data.shape,
      source: data.source,
      target: data.target,
      attrs: data.style ? { line: { ...data.style } } : undefined,
      label: typeof data.label === 'string' ? data.label : data.label?.text,
      data: data.data,
      vertices: data.vertices,
      router: data.router,
      connector: data.connector,
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
