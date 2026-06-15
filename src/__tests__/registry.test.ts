import { beforeEach, describe, expect, it } from 'vitest'
import { Graph } from '@antv/x6'
import { NodeRegistry } from '../core/node/NodeRegistry'
import { EdgeRegistry } from '../core/edge/EdgeRegistry'

const testNodeConfig = {
  width: 100,
  height: 60,
  markup: [{ tagName: 'rect', selector: 'body' }],
  attrs: { body: { fill: '#fff', stroke: '#333' } },
}

const testEdgeConfig = {
  attrs: { line: { stroke: '#333', strokeWidth: 2 } },
}

describe('nodeRegistry', () => {
  beforeEach(() => {
    NodeRegistry.clear()
  })

  it('should register a node shape', () => {
    NodeRegistry.register('test-rect', testNodeConfig)
    expect(NodeRegistry.has('test-rect')).toBe(true)
    expect(NodeRegistry.get('test-rect')).toBeDefined()
  })

  it('should not duplicate register the same shape', () => {
    NodeRegistry.register('test-rect', testNodeConfig)
    NodeRegistry.register('test-rect', testNodeConfig)
    expect(NodeRegistry.getAllNames().filter(n => n === 'test-rect').length).toBe(1)
  })

  it('should unregister a node shape', () => {
    NodeRegistry.register('test-rect', testNodeConfig)
    NodeRegistry.unregister('test-rect')
    expect(NodeRegistry.has('test-rect')).toBe(false)
  })

  it('should clear all registrations', () => {
    NodeRegistry.register('a', testNodeConfig)
    NodeRegistry.register('b', testNodeConfig)
    NodeRegistry.clear()
    expect(NodeRegistry.getAllNames()).toHaveLength(0)
  })
})

describe('edgeRegistry', () => {
  beforeEach(() => {
    EdgeRegistry.clear()
  })

  it('should register an edge shape', () => {
    EdgeRegistry.register('test-line', testEdgeConfig)
    expect(EdgeRegistry.has('test-line')).toBe(true)
  })

  it('should not duplicate register the same shape', () => {
    EdgeRegistry.register('test-line', testEdgeConfig)
    EdgeRegistry.register('test-line', testEdgeConfig)
    expect(EdgeRegistry.getAllNames().filter(n => n === 'test-line').length).toBe(1)
  })

  it('should unregister an edge shape', () => {
    EdgeRegistry.register('test-line', testEdgeConfig)
    EdgeRegistry.unregister('test-line')
    expect(EdgeRegistry.has('test-line')).toBe(false)
  })
})
