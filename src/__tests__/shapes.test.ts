import { beforeEach, describe, expect, it } from 'vitest'
import { Graph } from '@antv/x6'
import { registerAllShapes } from '../shapes/register'
import { EdgeRegistry, NodeRegistry } from '../core'
import {
  BASIC_SHAPES,
  DFD_SHAPES,
  EDGE_SHAPES,
  ER_SHAPES,
  FLOWCHART_SHAPES,
  RX_SUPPORTED_SHAPES,
  RX_UNSUPPORTED_SHAPES,
  SEQUENCE_SHAPES,
  STATE_SHAPES,
  SWIMLANE_SHAPES,
  UML_SHAPES,
  isShapeRxSupported,
} from '../shared/constants/shapes'

describe('shape registration', () => {
  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
  })

  it('should register all built-in shapes without error', () => {
    expect(() => registerAllShapes()).not.toThrow()
  })

  it('should register all basic shapes', () => {
    registerAllShapes()
    for (const name of Object.values(BASIC_SHAPES)) {
      expect(NodeRegistry.has(name)).toBe(true)
    }
  })

  it('should register all flowchart shapes', () => {
    registerAllShapes()
    for (const name of Object.values(FLOWCHART_SHAPES)) {
      expect(NodeRegistry.has(name)).toBe(true)
    }
  })

  it('should register all UML shapes', () => {
    registerAllShapes()
    for (const name of Object.values(UML_SHAPES)) {
      expect(NodeRegistry.has(name)).toBe(true)
    }
  })

  it('should register all edge shapes', () => {
    registerAllShapes()
    for (const name of Object.values(EDGE_SHAPES)) {
      expect(EdgeRegistry.has(name)).toBe(true)
    }
  })

  it('should not have rx support conflicts', () => {
    registerAllShapes()
    for (const name of Object.values(ALL_SHAPES)) {
      const supported = isShapeRxSupported(name)
      const unsupported = RX_UNSUPPORTED_SHAPES.has(name)
      // A shape should not be in both sets
      expect(!(supported && unsupported)).toBe(true)
    }
  })

  it('should allow Graph to create registered nodes', () => {
    registerAllShapes()
    const container = document.createElement('div')
    const graph = new Graph({ container, width: 800, height: 600 })
    const node = graph.addNode({
      shape: BASIC_SHAPES.RECT,
      x: 10,
      y: 10,
      width: 100,
      height: 60,
    })
    expect(node).toBeDefined()
    expect(node.shape).toBe(BASIC_SHAPES.RECT)
  })
})

// Re-export for test (ALL_SHAPES is not exported directly, reconstruct)
const ALL_SHAPES = {
  ...BASIC_SHAPES,
  ...FLOWCHART_SHAPES,
  ...UML_SHAPES,
  ...SEQUENCE_SHAPES,
  ...ER_SHAPES,
  ...DFD_SHAPES,
  ...SWIMLANE_SHAPES,
  ...STATE_SHAPES,
}
