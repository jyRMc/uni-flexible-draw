import type { Graph, Cell } from '@antv/x6'
import { NodeFactory } from '../node/NodeFactory'
import { EdgeFactory } from '../edge/EdgeFactory'

export interface ClipboardCell {
  type: 'node' | 'edge'
  shape: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

/**
 * 剪贴板管理器
 * 管理复制/剪切/粘贴的单元格数据
 */
export class ClipboardManager {
  private cells: ClipboardCell[] = []
  private offsetCount = 0

  constructor(private graph: Graph) {}

  /**
   * 复制选中的单元格到剪贴板
   */
  copy(selectedCells: Cell[]): void {
    this.cells = selectedCells.map((cell) => {
      if (cell.isNode()) {
        return {
          type: 'node' as const,
          shape: cell.shape,
          data: NodeFactory.toData(cell),
        }
      }
      return {
        type: 'edge' as const,
        shape: cell.shape,
        data: EdgeFactory.toData(cell as any),
      }
    })
    this.offsetCount = 0
  }

  /**
   * 剪切（复制后删除原单元格）
   */
  cut(selectedCells: Cell[]): void {
    this.copy(selectedCells)
    this.graph.removeCells(selectedCells)
  }

  /**
   * 粘贴剪贴板中的单元格
   */
  paste(offsetX = 30, offsetY = 30): Cell[] {
    const added: Cell[] = []
    this.offsetCount++
    const totalOffset = this.offsetCount * Math.max(offsetX, offsetY)

    for (const item of this.cells) {
      if (item.type === 'node') {
        const nodeData = item.data as any
        const newNodeData = {
          ...nodeData,
          id: `${nodeData.shape}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          position: {
            x: (nodeData.position?.x ?? 0) + totalOffset,
            y: (nodeData.position?.y ?? 0) + totalOffset,
          },
          data: nodeData.data && typeof nodeData.data === 'object'
            ? { ...nodeData.data, locked: false }
            : nodeData.data,
        }
        const node = NodeFactory.createNode(this.graph, newNodeData)
        if (typeof (node as any).setProp === 'function') {
          ;(node as any).setProp('movable', true)
        }
        this.graph.addNode(node)
        added.push(node)
      }
    }

    // 边需要在新节点之后粘贴，因为要引用新的节点ID
    for (const item of this.cells) {
      if (item.type === 'edge') {
        const edgeData = item.data as any
        const newEdgeData = {
          ...edgeData,
          id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          source: this.remapSource(edgeData.source, this.cells, added),
          target: this.remapSource(edgeData.target, this.cells, added),
        }
        const edge = EdgeFactory.createEdge(this.graph, newEdgeData)
        this.graph.addEdge(edge)
        added.push(edge)
      }
    }

    return added
  }

  hasContent(): boolean {
    return this.cells.length > 0
  }

  clear(): void {
    this.cells = []
    this.offsetCount = 0
  }

  private remapSource(
    original: string | { cell: string; port?: string },
    originals: ClipboardCell[],
    pastedNodes: Cell[],
  ): string | { cell: string; port?: string } {
    if (typeof original === 'string') {
      const idx = originals.findIndex((c) => (c.data as any).id === original)
      if (idx >= 0 && idx < pastedNodes.length) {
        return pastedNodes[idx].id
      }
      return original
    }
    const idx = originals.findIndex((c) => (c.data as any).id === original.cell)
    if (idx >= 0 && idx < pastedNodes.length) {
      return { cell: pastedNodes[idx].id, port: original.port }
    }
    return original
  }
}
