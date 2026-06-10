import { describe, it, expect, beforeEach } from 'vitest'
import { Graph } from '@antv/x6'
import { NodeFactory } from '../core/node/NodeFactory'
import { EdgeFactory } from '../core/edge/EdgeFactory'
import { GraphManager } from '../core/graph/GraphManager'
import { GraphEventBus } from '../core/event/GraphEventBus'
import { registerAllShapes } from '../shapes/register'
import { NodeRegistry, EdgeRegistry } from '../core'

function makeContainer(): HTMLDivElement {
  const div = document.createElement('div')
  div.style.width = '800px'
  div.style.height = '600px'
  document.body.appendChild(div)
  return div
}

describe('NodeFactory', () => {
  let graph: Graph
  let container: HTMLDivElement

  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
  })

  it('should create a basic rect node', () => {
    const node = NodeFactory.createNode(graph, {
      id: 'n1',
      shape: 'basic-rect',
      position: { x: 10, y: 20 },
      size: { width: 100, height: 60 },
      label: 'Hello',
      style: { fill: '#fff', stroke: '#333', strokeWidth: 2 },
    })
    expect(node.id).toBe('n1')
    expect(node.shape).toBe('basic-rect')
    expect(node.getPosition()).toEqual({ x: 10, y: 20 })
  })

  it('should create an image node with xlink:href', () => {
    const node = NodeFactory.createNode(graph, {
      id: 'n2',
      shape: 'basic-image',
      position: { x: 0, y: 0 },
      size: { width: 80, height: 80 },
      data: { imageHref: 'data:image/png;base64,abc' },
    })
    const attrs = (node as any).getAttrs() as any
    expect(attrs.image?.['xlink:href']).toBe('data:image/png;base64,abc')
  })

  it('should create a table node with markup and attrs', () => {
    const node = NodeFactory.createNode(graph, {
      id: 'n3',
      shape: 'basic-table',
      position: { x: 0, y: 0 },
      size: { width: 240, height: 120 },
      data: { table: { rows: 2, cols: 2, cells: [['A', 'B'], ['C', 'D']] } },
    })
    const markup = node.getMarkup() as any[]
    expect(markup.some(m => m.selector === 'cell-0-0')).toBe(true)
    const attrs = (node as any).getAttrs() as any
    expect(attrs['cell-0-0']?.text).toBe('A')
  })

  it('should round-trip NodeData through toData', () => {
    const input = {
      id: 'n4',
      shape: 'basic-rect',
      position: { x: 5, y: 6 },
      size: { width: 50, height: 30 },
      label: 'RoundTrip',
      style: { fill: '#eee', stroke: '#111', strokeWidth: 1 },
      data: { custom: true },
    }
    const node = NodeFactory.createNode(graph, input)
    const output = NodeFactory.toData(node)
    expect(output.id).toBe(input.id)
    expect(output.shape).toBe(input.shape)
    expect(output.position).toEqual(input.position)
    expect(output.size).toEqual(input.size)
    expect(output.label).toBe(input.label)
    expect(output.style).toMatchObject(input.style)
    expect(output.data).toEqual(input.data)
  })
})

describe('EdgeFactory', () => {
  let graph: Graph
  let container: HTMLDivElement

  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
  })

  it('should create a basic line edge', () => {
    const edge = EdgeFactory.createEdge(graph, {
      id: 'e1',
      shape: 'edge-line',
      source: { x: 0, y: 0 },
      target: { x: 100, y: 100 },
      style: { stroke: '#333', strokeWidth: 2 },
    })
    expect(edge.id).toBe('e1')
    expect(edge.shape).toBe('edge-line')
  })

  it('should create a sketch edge with custom connector', () => {
    const edge = EdgeFactory.createEdge(graph, {
      id: 'e2',
      shape: 'edge-sketch',
      source: { x: 0, y: 0 },
      target: { x: 100, y: 100 },
    })
    const connector = edge.getConnector() as any
    expect(connector?.name).toBe('uni-draw-sketch-straight')
    expect(connector?.args?.roughness).toBe(1)
  })

  it('should round-trip EdgeData through toData', () => {
    const input = {
      id: 'e3',
      shape: 'edge-arrow',
      source: { x: 0, y: 0 },
      target: { x: 100, y: 100 },
      label: 'EdgeLabel',
      style: { stroke: '#000', strokeWidth: 3 },
      vertices: [{ x: 50, y: 0 }],
    }
    const edge = EdgeFactory.createEdge(graph, input)
    const output = EdgeFactory.toData(edge)
    expect(output.id).toBe(input.id)
    expect(output.shape).toBe(input.shape)
    expect(output.label).toBe(input.label)
    expect(output.vertices).toEqual(input.vertices)
  })
})

describe('GraphManager', () => {
  let graph: Graph
  let eventBus: GraphEventBus
  let manager: GraphManager
  let container: HTMLDivElement

  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
    eventBus = new GraphEventBus()
    manager = new GraphManager(graph, eventBus)
  })

  it('should load empty data', () => {
    manager.loadData({
      canvas: { backgroundColor: '#fff', grid: { size: 10, visible: true, type: 'dot' } },
      nodes: [],
      edges: [],
    })
    expect(graph.getNodes()).toHaveLength(0)
    expect(graph.getEdges()).toHaveLength(0)
  })

  it('should load nodes and edges', () => {
    manager.loadData({
      canvas: { backgroundColor: '#fff', grid: { size: 10, visible: true, type: 'dot' } },
      nodes: [
        { id: 'a', shape: 'basic-rect', position: { x: 0, y: 0 }, size: { width: 80, height: 40 } },
        { id: 'b', shape: 'basic-rect', position: { x: 200, y: 0 }, size: { width: 80, height: 40 } },
      ],
      edges: [
        { id: 'ab', shape: 'edge-line', source: { cell: 'a' }, target: { cell: 'b' } },
      ],
    })
    expect(graph.getNodes()).toHaveLength(2)
    expect(graph.getEdges()).toHaveLength(1)
  })

  it('should export loaded data back with correct structure', () => {
    manager.loadData({
      canvas: { backgroundColor: '#fafafa', grid: { size: 20, visible: false, type: 'line' } },
      nodes: [
        { id: 'x', shape: 'basic-circle', position: { x: 50, y: 50 }, size: { width: 40, height: 40 } },
      ],
      edges: [],
    })
    const exported = manager.exportData()
    expect(exported.nodes).toHaveLength(1)
    expect(exported.nodes[0].id).toBe('x')
    expect(exported.canvas.grid.size).toBe(20)
  })

  it('should emit data:changed after loading', () => {
    const cb = vi.fn()
    eventBus.on('data:changed', cb)
    manager.loadData({
      canvas: { backgroundColor: '#fff', grid: { size: 10, visible: true, type: 'dot' } },
      nodes: [{ id: 'n', shape: 'basic-rect', position: { x: 0, y: 0 }, size: { width: 80, height: 40 } }],
      edges: [],
    })
    expect(cb).toHaveBeenCalled()
  })

  it('should add and remove a node', () => {
    manager.loadData({
      canvas: { backgroundColor: '#fff', grid: { size: 10, visible: true, type: 'dot' } },
      nodes: [], edges: [],
    })
    manager.addNode({ id: 'n1', shape: 'basic-rect', position: { x: 0, y: 0 }, size: { width: 80, height: 40 } })
    expect(graph.getNodes()).toHaveLength(1)
    manager.removeNode('n1')
    expect(graph.getNodes()).toHaveLength(0)
  })
})
