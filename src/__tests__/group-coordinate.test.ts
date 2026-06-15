import { describe, expect, it } from 'vitest'
import { AntVRenderEngine, GraphEventBus, GroupManager, NodeFactory } from '@uni-draw/core'
import { registerAllShapes } from '@uni-draw/shapes'
import { GraphManager } from '../core/graph/GraphManager'

function setupGraph() {
  registerAllShapes()
  const engine = new AntVRenderEngine()
  const container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  const graph = engine.init(container, {})
  const eventBus = new GraphEventBus()
  const groupManager = new GroupManager(graph)
  const graphManager = new GraphManager(graph, eventBus)
  return { engine, container, graph, eventBus, groupManager, graphManager }
}

describe('project group coordinate behavior', () => {
  it('should preserve child positions when grouping/ungrouping', () => {
    const { container, graph, groupManager } = setupGraph()

    const node1 = NodeFactory.createNode(graph, {
      id: 'n1',
      shape: 'rect',
      position: { x: 100, y: 100 },
      size: { width: 50, height: 50 },
    })
    const node2 = NodeFactory.createNode(graph, {
      id: 'n2',
      shape: 'rect',
      position: { x: 200, y: 200 },
      size: { width: 50, height: 50 },
    })
    graph.addNode(node1)
    graph.addNode(node2)

    const beforeGroup = {
      n1: { ...node1.getPosition() },
      n2: { ...node2.getPosition() },
    }

    const group = groupManager.createGroup([node1, node2])
    expect(group).not.toBeNull()

    // 组合后子节点世界坐标应保持不变
    expect(node1.getPosition()).toEqual(beforeGroup.n1)
    expect(node2.getPosition()).toEqual(beforeGroup.n2)
    expect(node1.getBBox()).toMatchObject({ x: 100, y: 100 })
    expect(node2.getBBox()).toMatchObject({ x: 200, y: 200 })

    // 解散组合
    groupManager.ungroup(group!.id)

    // 子节点应仍存在且世界坐标不变
    const afterUngroupN1 = graph.getCellById('n1')
    const afterUngroupN2 = graph.getCellById('n2')
    expect(afterUngroupN1).not.toBeUndefined()
    expect(afterUngroupN2).not.toBeUndefined()
    expect((afterUngroupN1 as any).getPosition()).toEqual(beforeGroup.n1)
    expect((afterUngroupN2 as any).getPosition()).toEqual(beforeGroup.n2)

    document.body.removeChild(container)
  })

  it('should round-trip grouped nodes through export/load', () => {
    const { container, graph, groupManager, graphManager } = setupGraph()

    const node1 = NodeFactory.createNode(graph, {
      id: 'n1',
      shape: 'rect',
      position: { x: 100, y: 100 },
      size: { width: 50, height: 50 },
    })
    const node2 = NodeFactory.createNode(graph, {
      id: 'n2',
      shape: 'rect',
      position: { x: 200, y: 200 },
      size: { width: 50, height: 50 },
    })
    graph.addNode(node1)
    graph.addNode(node2)

    const group = groupManager.createGroup([node1, node2])
    expect(group).not.toBeNull()

    const exported = graphManager.exportData()
    graphManager.loadData(exported)

    const loadedN1 = graph.getCellById('n1')
    const loadedN2 = graph.getCellById('n2')
    const loadedGroup = graph.getCellById(group!.id)

    expect(loadedN1).not.toBeUndefined()
    expect(loadedN2).not.toBeUndefined()
    expect(loadedGroup).not.toBeUndefined()
    expect((loadedN1 as any).getPosition()).toEqual({ x: 100, y: 100 })
    expect((loadedN2 as any).getPosition()).toEqual({ x: 200, y: 200 })
    expect((loadedGroup as any).getPosition()).toEqual(group!.getPosition())

    document.body.removeChild(container)
  })

  it('should handle group containing edges without throwing', () => {
    const { container, graph, groupManager } = setupGraph()

    const node1 = NodeFactory.createNode(graph, {
      id: 'n1',
      shape: 'rect',
      position: { x: 100, y: 100 },
      size: { width: 50, height: 50 },
    })
    const node2 = NodeFactory.createNode(graph, {
      id: 'n2',
      shape: 'rect',
      position: { x: 200, y: 200 },
      size: { width: 50, height: 50 },
    })
    graph.addNode(node1)
    graph.addNode(node2)
    graph.addEdge({
      id: 'e1',
      shape: 'edge-line',
      source: { cell: 'n1' },
      target: { cell: 'n2' },
    })

    const group = groupManager.createGroup([node1, node2])
    expect(group).not.toBeNull()

    // 手动把边也作为 group 的 child（模拟某些场景下 X6 可能产生的结构）
    const edge = graph.getCellById('e1')
    expect(edge).not.toBeUndefined()
    group!.addChild(edge as any)

    // fitGroupSize 不应因边没有 getPosition 而报错
    expect(() => groupManager['fitGroupSize'](group!)).not.toThrow()

    document.body.removeChild(container)
  })
})
