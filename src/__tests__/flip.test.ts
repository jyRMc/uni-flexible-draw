import { beforeEach, describe, expect, it } from 'vitest'
import { Graph } from '@antv/x6'
import { registerAllShapes } from '@uni-draw/shapes/register'
import { NodeFactory } from '@uni-draw/core'

function buildFlipTransform(size: { width: number, height: number }, flipH: boolean, flipV: boolean): string {
  const cx = size.width / 2
  const cy = size.height / 2
  const sx = flipH ? -1 : 1
  const sy = flipV ? -1 : 1
  return `translate(${cx}, ${cy}) scale(${sx}, ${sy}) translate(${-cx}, ${-cy})`
}

describe('node flip', () => {
  beforeEach(() => {
    registerAllShapes()
  })

  function createGraph() {
    const container = document.createElement('div')
    return new Graph({ container, width: 800, height: 600 })
  }

  it('should wrap node markup with flip group', () => {
    const graph = createGraph()
    const node = NodeFactory.createNode(graph, {
      id: 'rect-1',
      shape: 'basic-rect',
      position: { x: 100, y: 80 },
      size: { width: 120, height: 90 },
    })
    graph.addNode(node)
    const markup = node.getMarkup() as any[]
    expect(markup).toHaveLength(1)
    expect(markup[0].selector).toBe('flip')
    expect(markup[0].tagName).toBe('g')
    expect(Array.isArray(markup[0].children)).toBe(true)
    expect(markup[0].children.some((m: any) => m.selector === 'body')).toBe(true)
  })

  it('should apply horizontal flip transform when data.flipH is true', () => {
    const graph = createGraph()
    const node = NodeFactory.createNode(graph, {
      id: 'rect-1',
      shape: 'basic-rect',
      position: { x: 100, y: 80 },
      size: { width: 120, height: 90 },
      data: { flipH: true },
    })
    graph.addNode(node)
    expect(node.attr('flip/transform')).toBe(buildFlipTransform({ width: 120, height: 90 }, true, false))
    const data = NodeFactory.toData(node)
    expect((data.data as any)?.flipH).toBe(true)
    expect((data.data as any)?.flipV).toBeUndefined()
  })

  it('should apply vertical flip transform when data.flipV is true', () => {
    const graph = createGraph()
    const node = NodeFactory.createNode(graph, {
      id: 'rect-1',
      shape: 'basic-rect',
      position: { x: 100, y: 80 },
      size: { width: 120, height: 90 },
      data: { flipV: true },
    })
    graph.addNode(node)
    expect(node.attr('flip/transform')).toBe(buildFlipTransform({ width: 120, height: 90 }, false, true))
  })

  it('should keep positive size and position after horizontal flip', () => {
    const graph = createGraph()
    const node = NodeFactory.createNode(graph, {
      id: 'rect-1',
      shape: 'basic-rect',
      position: { x: 100, y: 80 },
      size: { width: 120, height: 90 },
      data: { flipH: true },
    })
    graph.addNode(node)
    const bbox = node.getBBox()
    expect(bbox.width).toBe(120)
    expect(bbox.height).toBe(90)
    expect(bbox.x).toBe(100)
    expect(bbox.y).toBe(80)
  })

  it('should preserve flip state through toData / createNode round-trip', () => {
    const graph = createGraph()
    const node = NodeFactory.createNode(graph, {
      id: 'rect-1',
      shape: 'basic-rect',
      position: { x: 100, y: 80 },
      size: { width: 120, height: 90 },
      data: { flipH: true, flipV: true },
    })
    graph.addNode(node)
    const data = NodeFactory.toData(node)
    expect((data.data as any)?.flipH).toBe(true)
    expect((data.data as any)?.flipV).toBe(true)

    const node2 = NodeFactory.createNode(graph, data)
    graph.addNode(node2)
    expect(node2.attr('flip/transform')).toBe(buildFlipTransform({ width: 120, height: 90 }, true, true))
  })

  const polygonShapes = ['basic-star', 'basic-triangle', 'flowchart-decision', 'basic-hexagon']
  polygonShapes.forEach((shape) => {
    it(`should wrap polygon shape ${shape} with flip group`, () => {
      const graph = createGraph()
      const node = NodeFactory.createNode(graph, {
        id: `${shape}-1`,
        shape,
        position: { x: 100, y: 80 },
        size: { width: 120, height: 90 },
      })
      graph.addNode(node)
      const markup = node.getMarkup() as any[]
      expect(markup).toHaveLength(1)
      expect(markup[0].selector).toBe('flip')
      expect(markup[0].tagName).toBe('g')
      expect(markup[0].children.some((m: any) => m.selector === 'body')).toBe(true)
    })

    it(`should keep positive size after horizontal flip for ${shape}`, () => {
      const graph = createGraph()
      const node = NodeFactory.createNode(graph, {
        id: `${shape}-1`,
        shape,
        position: { x: 100, y: 80 },
        size: { width: 120, height: 90 },
        data: { flipH: true },
      })
      graph.addNode(node)
      expect(node.attr('flip/transform')).toBe(buildFlipTransform({ width: 120, height: 90 }, true, false))
      const bbox = node.getBBox()
      expect(bbox.width).toBe(120)
      expect(bbox.height).toBe(90)
      expect(bbox.x).toBe(100)
      expect(bbox.y).toBe(80)
    })
  })

  const customMarkupShapes = ['swimlane-horizontal', 'uml-class', 'sequence-actor', 'basic-cylinder', 'basic-cloud']
  customMarkupShapes.forEach((shape) => {
    it(`should wrap custom markup shape ${shape} with flip group`, () => {
      const graph = createGraph()
      const node = NodeFactory.createNode(graph, {
        id: `${shape}-1`,
        shape,
        position: { x: 100, y: 80 },
        size: { width: 160, height: 120 },
      })
      graph.addNode(node)
      const markup = node.getMarkup() as any[]
      expect(markup).toHaveLength(1)
      expect(markup[0].selector).toBe('flip')
      expect(markup[0].tagName).toBe('g')
      expect(Array.isArray(markup[0].children)).toBe(true)
      expect(markup[0].children.length).toBeGreaterThan(0)
    })

    it(`should preserve vertical flip through round-trip for ${shape}`, () => {
      const graph = createGraph()
      const node = NodeFactory.createNode(graph, {
        id: `${shape}-1`,
        shape,
        position: { x: 100, y: 80 },
        size: { width: 160, height: 120 },
        data: { flipV: true },
      })
      graph.addNode(node)
      const data = NodeFactory.toData(node)
      expect((data.data as any)?.flipV).toBe(true)

      const node2 = NodeFactory.createNode(graph, data)
      graph.addNode(node2)
      expect(node2.attr('flip/transform')).toBe(buildFlipTransform({ width: 160, height: 120 }, false, true))
    })
  })
})
