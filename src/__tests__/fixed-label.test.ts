import { beforeEach, describe, expect, it } from 'vitest'
import { Graph } from '@antv/x6'
import { ref } from 'vue'
import { registerAllShapes } from '@uni-draw/shapes/register'
import { NodeFactory } from '@uni-draw/core'
import { useStyleEditor } from '@uni-draw/draw/composables/useStyleEditor'
import { isShapeLabelSupported, getShapeFixedLabel } from '@uni-draw/shared'

describe('fixed label shapes (state history)', () => {
  beforeEach(() => {
    registerAllShapes()
  })

  function createNode(shape: string, label?: string) {
    const container = document.createElement('div')
    const graph = new Graph({ container, width: 800, height: 600 })
    const node = NodeFactory.createNode(graph, {
      id: `${shape}-1`,
      shape,
      position: { x: 100, y: 100 },
      size: { width: 60, height: 50 },
      label,
    })
    graph.addNode(node)
    return { graph, node }
  }

  it('should report shallow/deep history as not supporting labels', () => {
    expect(isShapeLabelSupported('state-shallow-history')).toBe(false)
    expect(isShapeLabelSupported('state-deep-history')).toBe(false)
    expect(getShapeFixedLabel('state-shallow-history')).toBe('H')
    expect(getShapeFixedLabel('state-deep-history')).toBe('H*')
  })

  it('should use default H label for shallow-history regardless of input label', () => {
    const { node } = createNode('state-shallow-history', 'Custom')
    expect(node.attr('label/text')).toBe('H')
    const data = NodeFactory.toData(node)
    expect(data.label).toBe('H')
  })

  it('should use default H* label for deep-history regardless of input label', () => {
    const { node } = createNode('state-deep-history', 'Custom')
    expect(node.attr('label/text')).toBe('H*')
    const data = NodeFactory.toData(node)
    expect(data.label).toBe('H*')
  })

  it('should ignore style editor label updates for fixed-label shapes', () => {
    const { graph, node } = createNode('state-shallow-history')
    const { updateNodeStyle } = useStyleEditor(() => graph, ref(null))
    updateNodeStyle(node.id, { label: 'Changed', fontSize: 8, labelFill: '#ff0000', labelPosition: 'top' })
    expect(node.attr('label/text')).toBe('H')
    expect(node.attr('label/fontSize')).not.toBe(8)
    expect(node.attr('label/fill')).not.toBe('#ff0000')
  })
})
