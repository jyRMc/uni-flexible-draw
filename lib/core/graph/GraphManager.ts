import type { Edge, Graph, Node } from '@antv/x6'
import type { CanvasConfig, EdgeData, GraphData, NodeData } from '@uni-draw/shared'
import { NodeFactory } from '../node/NodeFactory'
import { EdgeFactory } from '../edge/EdgeFactory'
import type { GraphEventBus } from '../event/GraphEventBus'

/**
 * 图生命周期与数据管理
 * 负责 GraphData 与 X6 Graph 实例之间的同步
 */
export class GraphManager {
  private graph: Graph
  private eventBus: GraphEventBus
  private isUpdating = false
  /** 最近一次通过 loadData / setData 传入的 canvas 配置，用于 exportData 回读 */
  private lastCanvasConfig: CanvasConfig = {
    backgroundColor: '#ffffff',
    grid: { size: 10, visible: true, type: 'dot' },
    zoom: 1,
  }

  constructor(graph: Graph, eventBus: GraphEventBus) {
    this.graph = graph
    this.eventBus = eventBus
    this.bindEvents()
  }

  /**
   * 加载完整画布数据
   * @param data 画布数据
   * @param options 选项
   * @param options.recordHistory 是否将本次加载记录为一次可撤销操作（默认 false）
   */
  loadData(data: GraphData, options: { recordHistory?: boolean } = {}): void {
    const recordHistory = options.recordHistory ?? false
    this.isUpdating = true
    // 非记录模式时暂停历史记录，防止批量加载操作进入 undo 栈
    if (!recordHistory) {
      ;(this.graph as any).disableHistory?.()
    }
    // 使用 batch 将加载过程中的所有变更合并为单一历史步骤
    this.graph.startBatch('load-data')
    try {
      this.applyCanvasConfig(data.canvas)
      this.graph.clearCells()


      // 第一步：创建所有节点（先不处理 parent 关系）
      const nodeMap = new Map<string, any>()
      for (const nodeData of data.nodes) {
        const node = NodeFactory.createNode(this.graph, nodeData)
        this.graph.addNode(node)
        nodeMap.set(nodeData.id, node)
      }

      // 第二步：建立 parent-child 关系（先创建子节点再绑定 parent）
      for (const nodeData of data.nodes) {
        if (nodeData.parent) {
          const parent = nodeMap.get(nodeData.parent)
          const child = nodeMap.get(nodeData.id)
          if (parent && child && parent.id !== child.id) {
            // X6 中节点位置存储为世界坐标，建立父子关系时无需转换坐标
            parent.addChild(child)
          }
        }
      }

      for (const edgeData of data.edges) {
        const edge = EdgeFactory.createEdge(this.graph, edgeData)
        this.graph.addEdge(edge)
      }
      setTimeout(() => {
        this.graph.centerContent()
      }, 200)
    }
    finally {
      this.graph.stopBatch('load-data')
      if (!recordHistory) {
        ;(this.graph as any).enableHistory?.()
        // 清空由 disableHistory 前残留的历史，确保加载后 canUndo=false
        ;(this.graph as any).cleanHistory?.()
      }
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
        backgroundColor: this.lastCanvasConfig.backgroundColor,
        grid: {
          size: this.lastCanvasConfig.grid?.size ?? 10,
          visible: this.lastCanvasConfig.grid?.visible ?? true,
          type: this.lastCanvasConfig.grid?.type ?? 'dot',
          ...(this.lastCanvasConfig.grid?.color ? { color: this.lastCanvasConfig.grid.color } : {}),
        },
        zoom: this.graph.zoom(),
        ...(this.lastCanvasConfig.offset ? { offset: this.lastCanvasConfig.offset } : {}),
      },
      nodes,
      edges,
    }
  }

  /**
   * 添加节点
   * 使用 batch 将节点创建过程中的内部变更合并为单一撤销步骤
   */
  addNode(data: NodeData): void {
    this.graph.startBatch('add-node')
    try {
      const node = NodeFactory.createNode(this.graph, data)
      this.graph.addNode(node)
    }
    finally {
      this.graph.stopBatch('add-node')
    }
  }

  /**
   * 添加边
   * 使用 batch 将边创建过程中的内部变更合并为单一撤销步骤
   */
  addEdge(data: EdgeData): void {
    this.graph.startBatch('add-edge')
    try {
      const edge = EdgeFactory.createEdge(this.graph, data)
      this.graph.addEdge(edge)
    }
    finally {
      this.graph.stopBatch('add-edge')
    }
  }

  /**
   * 删除节点
   */
  removeNode(id: string): void {
    const node = this.graph.getCellById(id)
    if (node)
      this.graph.removeCell(node)
  }

  /**
   * 删除边
   */
  removeEdge(id: string): void {
    const edge = this.graph.getCellById(id)
    if (edge)
      this.graph.removeCell(edge)
  }

  /**
   * 获取 Graph 实例
   */
  getGraph(): Graph {
    return this.graph
  }

  /**
   * 应用画布级配置到 X6 Graph
   */
  private applyCanvasConfig(canvas: CanvasConfig): void {
    this.lastCanvasConfig = canvas

    // 背景色
    if (canvas.backgroundColor) {
      (this.graph as any).drawBackground?.({ color: canvas.backgroundColor })
    }
    else {
      (this.graph as any).clearBackground?.()
    }

    // 网格
    if (canvas.grid && canvas.grid.visible !== false) {
      const gridCfg: any = {
        size: canvas.grid.size ?? 10,
        visible: true,
        type: canvas.grid.type ?? 'dot',
      }
      if (canvas.grid.color) {
        gridCfg.args = { color: canvas.grid.color }
      }
      ;(this.graph as any).drawGrid?.(gridCfg)
    }
    else {
      ;(this.graph as any).clearGrid?.()
    }

    // 缩放
    if (typeof canvas.zoom === 'number') {
      this.graph.zoomTo(canvas.zoom)
    }

    // 偏移
    if (canvas.offset) {
      this.graph.translate(canvas.offset.x, canvas.offset.y)
    }
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
    if (this.isUpdating)
      return
    this.eventBus.emit('data:changed', this.exportData())
  }
}
