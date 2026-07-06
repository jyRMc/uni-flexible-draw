import { beforeEach, describe, expect, it } from 'vitest'
import { Graph } from '@antv/x6'
import { ref } from 'vue'
import { registerAllShapes } from '@uni-draw/shapes/register'
import { NodeFactory } from '@uni-draw/core'
import { useStyleEditor } from '@uni-draw/draw/composables/useStyleEditor'
import {
  ER_SHAPES,
  SEQUENCE_SHAPES,
  STATE_SHAPES,
  SWIMLANE_SHAPES,
  UML_SHAPES,
  isShapeLabelSupported,
} from '@uni-draw/shared'

describe('shape label and style updates', () => {
  beforeEach(() => {
    registerAllShapes()
  })

  function getLabelText(label: unknown) {
    return typeof label === 'string' ? label : (label as any)?.text ?? ''
  }

  function createNode(shape: string, label?: string) {
    const container = document.createElement('div')
    const graph = new Graph({ container, width: 800, height: 600 })
    const node = NodeFactory.createNode(graph, {
      id: `${shape}-1`,
      shape,
      position: { x: 100, y: 100 },
      size: { width: 160, height: 100 },
      label,
    })
    graph.addNode(node)
    return { graph, node }
  }

  describe('label support detection', () => {
    it('should support labels for most shapes', () => {
      expect(isShapeLabelSupported(UML_SHAPES.CLASS)).toBe(true)
      expect(isShapeLabelSupported(SEQUENCE_SHAPES.ACTOR)).toBe(true)
      expect(isShapeLabelSupported(ER_SHAPES.KEY_ATTRIBUTE)).toBe(true)
      expect(isShapeLabelSupported(STATE_SHAPES.STATE)).toBe(true)
      expect(isShapeLabelSupported(SWIMLANE_SHAPES.HORIZONTAL)).toBe(true)
    })

    it('should not support labels for table/image/svg/group', () => {
      expect(isShapeLabelSupported('basic-table')).toBe(false)
      expect(isShapeLabelSupported('basic-image')).toBe(false)
      expect(isShapeLabelSupported('basic-svg')).toBe(false)
      expect(isShapeLabelSupported('basic-group')).toBe(false)
    })
  })

  describe('label extraction via NodeFactory.toData', () => {
    it('should extract uml-class label from nameLabel', () => {
      const { node } = createNode(UML_SHAPES.CLASS, 'ClassName')
      const data = NodeFactory.toData(node)
      expect(getLabelText(data.label)).toBe('ClassName')
    })

    it('should extract sequence-fragment-alt label from topLabel', () => {
      const { node } = createNode(SEQUENCE_SHAPES.FRAGMENT_ALT, 'guard')
      const data = NodeFactory.toData(node)
      expect(getLabelText(data.label)).toBe('guard')
    })

    it('should extract swimlane label from label selector', () => {
      const { node } = createNode(SWIMLANE_SHAPES.HORIZONTAL, 'Lane')
      const data = NodeFactory.toData(node)
      expect(getLabelText(data.label)).toBe('Lane')
    })

    it('should extract er-key-attribute label', () => {
      const { node } = createNode(ER_SHAPES.KEY_ATTRIBUTE, 'key')
      const data = NodeFactory.toData(node)
      expect(getLabelText(data.label)).toBe('key')
    })

    it('should extract er-associative label', () => {
      const { node } = createNode(ER_SHAPES.ASSOCIATIVE, 'Assoc')
      const data = NodeFactory.toData(node)
      expect(getLabelText(data.label)).toBe('Assoc')
    })

    it('should extract state-simple label', () => {
      const { node } = createNode(STATE_SHAPES.STATE, 'State')
      const data = NodeFactory.toData(node)
      expect(getLabelText(data.label)).toBe('State')
    })
  })

  describe('label updates via useStyleEditor', () => {
    function createStyleEditor(graph: Graph) {
      return useStyleEditor(() => graph, ref(null))
    }

    it('should update uml-class label and persist in toData', () => {
      const { graph, node } = createNode(UML_SHAPES.CLASS, 'ClassName')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { label: 'NewClass' })
      expect(node.attr('nameLabel/text')).toBe('NewClass')
      const data = NodeFactory.toData(node)
      expect(getLabelText(data.label)).toBe('NewClass')
      expect((data.data as any)?.regionData?.regions[0].label).toBe('NewClass')
    })

    it('should update uml-interface label', () => {
      const { graph, node } = createNode(UML_SHAPES.INTERFACE, 'Interface')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { label: 'NewInterface' })
      expect(node.attr('nameLabel/text')).toBe('NewInterface')
    })

    it('should update uml-abstract label', () => {
      const { graph, node } = createNode(UML_SHAPES.ABSTRACT, 'Abstract')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { label: 'NewAbstract' })
      expect(node.attr('nameLabel/text')).toBe('NewAbstract')
    })

    it('should update sequence-fragment-alt label', () => {
      const { graph, node } = createNode(SEQUENCE_SHAPES.FRAGMENT_ALT, '')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { label: 'alt condition' })
      expect(node.attr('topLabel/text')).toBe('alt condition')
    })

    it('should update er-key-attribute label', () => {
      const { graph, node } = createNode(ER_SHAPES.KEY_ATTRIBUTE, 'key')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { label: 'id' })
      expect(node.attr('label/text')).toBe('id')
    })

    it('should update er-associative label', () => {
      const { graph, node } = createNode(ER_SHAPES.ASSOCIATIVE, 'Assoc')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { label: 'Order' })
      expect(node.attr('label/text')).toBe('Order')
    })

    it('should update state-simple label', () => {
      const { graph, node } = createNode(STATE_SHAPES.STATE, 'State')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { label: 'NewState' })
      expect(node.attr('label/text')).toBe('NewState')
    })

    it('should update swimlane-horizontal label', () => {
      const { graph, node } = createNode(SWIMLANE_SHAPES.HORIZONTAL, 'Lane')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { label: 'NewLane' })
      expect(node.attr('label/text')).toBe('NewLane')
    })
  })

  describe('body style updates for shapes without body selector', () => {
    function createStyleEditor(graph: Graph) {
      return useStyleEditor(() => graph, ref(null))
    }

    it('should apply stroke/fill/opacity to sequence-actor parts', () => {
      const { graph, node } = createNode(SEQUENCE_SHAPES.ACTOR, 'Actor')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { fill: '#ff0000', stroke: '#00ff00', strokeWidth: 3, opacity: 0.5 })
      expect(node.attr('actorHead/fill')).toBe('#ff0000')
      expect(node.attr('actorHead/stroke')).toBe('#00ff00')
      expect(node.attr('actorBody/stroke')).toBe('#00ff00')
      expect(node.attr('actorBody/opacity')).toBe(0.5)
      // actorLine 默认虚线样式应保留
      expect(node.attr('actorLine/strokeDasharray')).toBe('4 2')
    })

    it('should apply stroke/fill/opacity to sequence-lifeline header and lifeline', () => {
      const { graph, node } = createNode(SEQUENCE_SHAPES.LIFELINE, 'Object')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { fill: '#ff0000', stroke: '#00ff00', strokeWidth: 3, opacity: 0.5 })
      expect(node.attr('header/fill')).toBe('#ff0000')
      expect(node.attr('header/stroke')).toBe('#00ff00')
      expect(node.attr('lifeline/stroke')).toBe('#00ff00')
      expect(node.attr('lifeline/opacity')).toBe(0.5)
    })

    it('should apply stroke/fill/opacity to state-fork lines', () => {
      const { graph, node } = createNode(STATE_SHAPES.FORK, '')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { stroke: '#00ff00', strokeWidth: 4, opacity: 0.5 })
      expect(node.attr('stem/stroke')).toBe('#00ff00')
      expect(node.attr('bar/strokeWidth')).toBe(4)
      expect(node.attr('branch1/opacity')).toBe(0.5)
    })

    it('should apply stroke/fill/opacity to uml-actor parts', () => {
      const { graph, node } = createNode(UML_SHAPES.ACTOR, 'Actor')
      const { updateNodeStyle } = createStyleEditor(graph)
      updateNodeStyle(node.id, { fill: '#ff0000', stroke: '#00ff00', strokeWidth: 3, opacity: 0.5 })
      expect(node.attr('actorHead/fill')).toBe('#ff0000')
      expect(node.attr('actorHead/stroke')).toBe('#00ff00')
      expect(node.attr('actorBody/stroke')).toBe('#00ff00')
    })
  })
})
