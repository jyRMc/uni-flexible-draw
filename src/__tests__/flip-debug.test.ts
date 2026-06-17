import { describe, expect, it } from 'vitest'
import { AntVRenderEngine, NodeFactory } from '@uni-draw/core'
import { registerAllShapes } from '@uni-draw/shapes'

function setupGraph() {
  registerAllShapes()
  const engine = new AntVRenderEngine()
  const container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  const graph = engine.init(container, {})
  return { container, graph }
}

describe('flip debug', () => {
  it('shows node.scale effect', () => {
    const { container, graph } = setupGraph()
    const node = NodeFactory.createNode(graph, {
      id: 'n1',
      shape: 'rect',
      position: { x: 100, y: 100 },
      size: { width: 50, height: 40 },
    })
    graph.addNode(node)
    const beforePos = { ...node.getPosition() }
    const beforeSize = { ...node.getSize() }
    const beforeCenter = node.getBBox().getCenter()
    ;(node as any).scale(-1, 1)
    const afterPos = { ...node.getPosition() }
    const afterSize = { ...node.getSize() }
    const afterCenter = node.getBBox().getCenter()
    console.log('scale(-1,1)', beforePos, beforeSize, beforeCenter)
    console.log('after', afterPos, afterSize, afterCenter)

    // test flip around top-left
    const node2 = NodeFactory.createNode(graph, {
      id: 'n2',
      shape: 'rect',
      position: { x: 200, y: 200 },
      size: { width: 50, height: 40 },
    })
    graph.addNode(node2)
    const p2 = node2.getPosition()
    ;(node2 as any).scale(-1, 1, p2)
    console.log('scale(-1,1, topLeft)', { before: { x: 200, y: 200 }, size: { w: 50, h: 40 } }, 'after', node2.getPosition(), node2.getSize())

    // test flip around center
    const node3 = NodeFactory.createNode(graph, {
      id: 'n3',
      shape: 'rect',
      position: { x: 300, y: 300 },
      size: { width: 50, height: 40 },
    })
    graph.addNode(node3)
    const c3 = node3.getBBox().getCenter()
    ;(node3 as any).scale(-1, 1, c3)
    console.log('scale(-1,1, center)', { before: { x: 300, y: 300 }, size: { w: 50, h: 40 }, center: c3 }, 'after', node3.getPosition(), node3.getSize(), node3.getBBox().getCenter())
    expect(true).toBe(true)
    document.body.removeChild(container)
  })
})
