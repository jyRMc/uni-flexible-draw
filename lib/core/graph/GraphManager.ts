import type { Graph, Node, Edge } from '@antv/x6'
import type { GraphData, NodeData, EdgeData } from '@uni-draw/shared'
import { NodeFactory } from '../node/NodeFactory'
import { EdgeFactory } from '../edge/EdgeFactory'
import { GraphEventBus } from '../event/GraphEventBus'

/**
 * 图生命周期与数据管理
 * 负责 GraphData 与 X6 Graph 实例之间的同步
 */
export class GraphManager {
  private graph: Graph
  private eventBus: GraphEventBus
  private isUpdating = false

  constructor(graph: Graph, eventBus: GraphEventBus) {
    this.graph = graph
    this.eventBus = eventBus
    this.bindEvents()
  }

  /**
   * 加载完整画布数据
   */
  loadData(data: GraphData): void {
    this.isUpdating = true
    // 暂停历史记录，防止批量加载操作进入 undo 栈
    ;(this.graph as any).disableHistory?.()
    try {
      this.graph.clearCells()

      for (const nodeData of data.nodes) {
        const node = NodeFactory.createNode(this.graph, nodeData)
        this.graph.addNode(node)
      }

      for (const edgeData of data.edges) {
        const edge = EdgeFactory.createEdge(this.graph, edgeData)
        this.graph.addEdge(edge)
      }
    } finally {
      ;(this.graph as any).enableHistory?.()
      // 清空由 disableHistory 前残留的历史，确保加载后 canUndo=false
      ;(this.graph as any).cleanHistory?.()
      this.isUpdating = false
      this.eventBus.emit('data:changed', data)
    }
  }

  /**
   * 导出当前画布数据
   */
  exportData(): GraphData {
    const nodes = this.graph.getNodes().map((node: Node) => NodeFactory.toData(node))
    const edges = this.graph.getEdges().map((edge: Edge) => EdgeFactory.toData(edge))

    return {
      canvas: {
        backgroundColor: this.graph.options.background?.color as string | undefined,
        grid: {
          size: this.graph.options.grid?.size ?? 10,
          visible: this.graph.options.grid?.visible ?? true,
          type: (this.graph.options.grid?.type as 'dot' | 'line') ?? 'dot',
        },
        zoom: this.graph.zoom(),
      },
      nodes,
      edges,
    }
  }

  /**
   * 添加节点
   */
  addNode(data: NodeData): void {
    const node = NodeFactory.createNode(this.graph, data)
    this.graph.addNode(node)
  }

  /**
   * 添加边
   */
  addEdge(data: EdgeData): void {
    const edge = EdgeFactory.createEdge(this.graph, data)
    this.graph.addEdge(edge)
  }

  /**
   * 删除节点
   */
  removeNode(id: string): void {
    const node = this.graph.getCellById(id)
    if (node) this.graph.removeCell(node)
  }

  /**
   * 删除边
   */
  removeEdge(id: string): void {
    const edge = this.graph.getCellById(id)
    if (edge) this.graph.removeCell(edge)
  }

  /**
   * 获取 Graph 实例
   */
  getGraph(): Graph {
    return this.graph
  }

  private bindEvents(): void {
    this.graph.on('node:added', () => this.notifyChange())
    this.graph.on('node:removed', () => this.notifyChange())
    this.graph.on('node:changed', () => this.notifyChange())
    this.graph.on('edge:added', () => this.notifyChange())
    this.graph.on('edge:removed', () => this.notifyChange())
    this.graph.on('edge:changed', () => this.notifyChange())
  }

  private notifyChange(): void {
    if (this.isUpdating) return
    this.eventBus.emit('data:changed', this.exportData())
  }
}
