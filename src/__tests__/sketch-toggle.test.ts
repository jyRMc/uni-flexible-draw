import { beforeEach, describe, expect, it } from 'vitest'
import { Graph } from '@antv/x6'
import { registerAllShapes } from '@uni-draw/shapes/register'
import { useSketch } from '@uni-draw/draw/composables/useSketch'

describe('sketch mode toggle', () => {
  beforeEach(() => {
    registerAllShapes()
  })

  function createGraph() {
    const container = document.createElement('div')
    const graph = new Graph({ container, width: 800, height: 600 })
    return { graph }
  }

  it('should restore node shape after toggling sketch on and off', () => {
    const { graph } = createGraph()
    const node = graph.addNode({
      shape: 'basic-rect',
      x: 100,
      y: 100,
      width: 100,
      height: 60,
      attrs: {
        body: { fill: '#ffffff', stroke: '#333333', strokeWidth: 2 },
        label: { text: 'Rect' },
      },
    })

    const originalMarkup = node.getMarkup()
    const originalAttrs = JSON.parse(JSON.stringify(node.getAttrs()))

    const {
      toggleSketchMode,
      onSketchNodeAdded,
      onSketchEdgeAdded,
      onSketchNodeChange,
      onSketchNodeAttrsChange,
      onSketchEdgeChange,
    } = useSketch(() => graph)

    graph.on('node:added', onSketchNodeAdded)
    graph.on('edge:added', onSketchEdgeAdded)
    graph.on('node:change:size', onSketchNodeChange)
    graph.on('node:change:attrs', onSketchNodeAttrsChange)
    graph.on('edge:change:vertices', onSketchEdgeChange)
    graph.on('edge:change:source', onSketchEdgeChange)
    graph.on('edge:change:target', onSketchEdgeChange)

    toggleSketchMode()
    expect(node.attr('body/d')).toBeTruthy()
    expect(node.shape).toBe('basic-rect')

    toggleSketchMode()
    const restoredMarkup = node.getMarkup()
    const restoredAttrs = node.getAttrs()

    expect(restoredMarkup).toEqual(originalMarkup)
    expect(restoredAttrs.body).toEqual(originalAttrs.body)
    expect(restoredAttrs.label?.text).toBe('Rect')
    expect(node.attr('body/d')).toBeFalsy()
  })

  it('should preserve flip wrapper and transform after sketch toggle for polygon shape', () => {
    const { graph } = createGraph()
    const node = graph.addNode({
      shape: 'basic-star',
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      data: { flipH: true },
      attrs: {
        body: { fill: '#ffffff', stroke: '#333333', strokeWidth: 2 },
        label: { text: 'Star' },
        flip: { transform: 'translate(50,40) scale(-1,1) translate(-50,-40)' },
      },
    })

    const originalMarkup = node.getMarkup()
    expect((originalMarkup as any[]).length).toBe(1)
    expect((originalMarkup as any[])[0].selector).toBe('flip')

    const {
      toggleSketchMode,
      onSketchNodeAdded,
      onSketchEdgeAdded,
      onSketchNodeChange,
      onSketchNodeAttrsChange,
      onSketchEdgeChange,
    } = useSketch(() => graph)

    graph.on('node:added', onSketchNodeAdded)
    graph.on('edge:added', onSketchEdgeAdded)
    graph.on('node:change:size', onSketchNodeChange)
    graph.on('node:change:attrs', onSketchNodeAttrsChange)
    graph.on('edge:change:vertices', onSketchEdgeChange)
    graph.on('edge:change:source', onSketchEdgeChange)
    graph.on('edge:change:target', onSketchEdgeChange)

    toggleSketchMode()
    expect(node.attr('body/d')).toBeTruthy()
    expect(node.shape).toBe('basic-star')

    toggleSketchMode()
    const restoredMarkup = node.getMarkup()
    expect(restoredMarkup).toEqual(originalMarkup)
    expect((restoredMarkup as any[])[0].selector).toBe('flip')
    expect(node.attr('flip/transform')).toBe('translate(50,40) scale(-1,1) translate(-50,-40)')
  })

  it('should restore edge shape after toggling sketch on and off', () => {
    const { graph } = createGraph()
    const source = graph.addNode({ shape: 'basic-rect', x: 0, y: 0, width: 40, height: 40 })
    const target = graph.addNode({ shape: 'basic-rect', x: 200, y: 0, width: 40, height: 40 })
    const edge = graph.addEdge({
      source: source.id,
      target: target.id,
      attrs: {
        line: { stroke: '#333333', strokeWidth: 2 },
      },
    })

    const originalAttrs = JSON.parse(JSON.stringify(edge.getAttrs()))

    const {
      toggleSketchMode,
      onSketchNodeAdded,
      onSketchEdgeAdded,
      onSketchNodeChange,
      onSketchNodeAttrsChange,
      onSketchEdgeChange,
    } = useSketch(() => graph)

    graph.on('node:added', onSketchNodeAdded)
    graph.on('edge:added', onSketchEdgeAdded)
    graph.on('node:change:size', onSketchNodeChange)
    graph.on('node:change:attrs', onSketchNodeAttrsChange)
    graph.on('edge:change:vertices', onSketchEdgeChange)
    graph.on('edge:change:source', onSketchEdgeChange)
    graph.on('edge:change:target', onSketchEdgeChange)

    toggleSketchMode()
    expect(edge.attr('line/d')).toBeTruthy()

    toggleSketchMode()
    const restoredAttrs = edge.getAttrs()

    expect(restoredAttrs.line).toEqual(originalAttrs.line)
    expect(edge.attr('line/d')).toBeFalsy()
  })
})
