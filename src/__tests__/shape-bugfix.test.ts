import { beforeEach, describe, expect, it } from 'vitest'
import { Graph } from '@antv/x6'
import { registerAllShapes } from '../shapes/register'
import { ER_SHAPES, SEQUENCE_SHAPES } from '../shared/constants/shapes'
import { NodeRegistry } from '../core'

describe('shape bugfixes', () => {
  beforeEach(() => {
    registerAllShapes()
  })

  it('sequence lifeline should adapt line to node size', () => {
    const container = document.createElement('div')
    const graph = new Graph({ container, width: 800, height: 600 })

    const small = graph.addNode({
      shape: SEQUENCE_SHAPES.LIFELINE,
      x: 10,
      y: 10,
      width: 120,
      height: 200,
    })
    const smallView = graph.findViewByCell(small) as any
    smallView.render()
    const smallLine = smallView.findOne('lifeline') as SVGLineElement
    expect(smallLine).toBeDefined()
    expect(smallLine.getAttribute('x1')).toBe('60')
    expect(smallLine.getAttribute('y1')).toBe('30')
    expect(smallLine.getAttribute('x2')).toBe('60')
    expect(smallLine.getAttribute('y2')).toBe('200')

    const large = graph.addNode({
      shape: SEQUENCE_SHAPES.LIFELINE,
      x: 200,
      y: 10,
      width: 240,
      height: 400,
    })
    const largeView = graph.findViewByCell(large) as any
    largeView.render()
    const largeLine = largeView.findOne('lifeline') as SVGLineElement
    expect(largeLine).toBeDefined()
    expect(largeLine.getAttribute('x1')).toBe('120')
    expect(largeLine.getAttribute('y1')).toBe('30')
    expect(largeLine.getAttribute('x2')).toBe('120')
    expect(largeLine.getAttribute('y2')).toBe('400')
  })

  it('er identifying relationship should have non-overlapping outer and body', () => {
    const config = NodeRegistry.get(ER_SHAPES.IDENTIFYING_REL)
    expect(config).toBeDefined()

    const container = document.createElement('div')
    const graph = new Graph({ container, width: 800, height: 600 })
    const node = graph.addNode({
      shape: ER_SHAPES.IDENTIFYING_REL,
      x: 10,
      y: 10,
      width: 120,
      height: 120,
    })

    const view = graph.findViewByCell(node) as any
    view.render()
    const outer = view.findOne('outer') as SVGPolygonElement
    const body = view.findOne('body') as SVGPolygonElement
    expect(outer).toBeDefined()
    expect(body).toBeDefined()

    const outerPoints = outer.getAttribute('points')
    const bodyPoints = body.getAttribute('points')
    expect(outerPoints).not.toBe(bodyPoints)

    // outer 顶点贴边，body 顶点内收（与 outer 保持间隙）
    expect(outerPoints).toMatch(/\b60\s+0\b/)
    expect(bodyPoints).toMatch(/\b60\s+12\b/)
    expect(bodyPoints).toMatch(/\b108\s+60\b/)
  })
})
