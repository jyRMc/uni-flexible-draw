import { beforeEach, describe, expect, it } from 'vitest'
import { Graph } from '@antv/x6'
import { ZoomTool } from '../core/tool/ZoomTool'
import { PanTool } from '../core/tool/PanTool'
import { MiniMapTool } from '../core/tool/MiniMapTool'
import { ShortcutManager } from '../core/shortcut/ShortcutManager'
import { EdgeRegistry, NodeRegistry } from '../core'
import { registerAllShapes } from '../shapes/register'

function makeContainer(): HTMLDivElement {
  const div = document.createElement('div')
  div.style.width = '800px'
  div.style.height = '600px'
  document.body.appendChild(div)
  return div
}

describe('zoomTool', () => {
  let graph: Graph
  let tool: ZoomTool
  let container: HTMLDivElement

  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
    tool = new ZoomTool(graph)
  })

  it('should zoom in', () => {
    const before = graph.zoom()
    tool.zoomIn()
    expect(graph.zoom()).toBeGreaterThan(before)
  })

  it('should zoom out', () => {
    tool.zoomIn(); tool.zoomIn()
    const before = graph.zoom()
    tool.zoomOut()
    expect(graph.zoom()).toBeLessThan(before)
  })

  it('should zoom to specific factor', () => {
    tool.zoomTo(1.5)
    expect(graph.zoom()).toBeCloseTo(1.5, 5)
  })

  it('should report current zoom', () => {
    tool.zoomTo(2)
    expect(tool.getZoom()).toBe(graph.zoom())
  })
})

describe('panTool', () => {
  let graph: Graph
  let tool: PanTool
  let container: HTMLDivElement

  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
    tool = new PanTool(graph)
  })

  it('should toggle on/off', () => {
    expect(tool.isEnabled()).toBe(false)
    const state1 = tool.toggle()
    expect(state1).toBe(true)
    expect(tool.isEnabled()).toBe(true)
    const state2 = tool.toggle()
    expect(state2).toBe(false)
    expect(tool.isEnabled()).toBe(false)
  })

  it('should disable node moving when enabled', () => {
    tool.enable()
    expect((graph.options as any).interacting.nodeMovable).toBe(false)
  })

  it('should restore interacting when disabled', () => {
    const before = (graph.options as any).interacting
    tool.enable()
    tool.disable()
    expect((graph.options as any).interacting).toBe(before)
  })
})

describe('miniMapTool', () => {
  let graph: Graph
  let tool: MiniMapTool
  let container: HTMLDivElement

  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
    tool = new MiniMapTool(graph)
  })

  it('should register minimap plugin when enabled', () => {
    const mini = document.createElement('div')
    tool.enable(mini, { width: 120, height: 90 })
    expect(tool.isEnabled()).toBe(true)
    expect(mini.children.length).toBeGreaterThan(0)
  })

  it('should clear container when disabled', () => {
    const mini = document.createElement('div')
    mini.innerHTML = '<span>child</span>'
    tool.enable(mini)
    tool.disable()
    expect(mini.innerHTML).toBe('')
    expect(tool.isEnabled()).toBe(false)
  })
})

describe('shortcutManager', () => {
  let graph: Graph
  let shortcuts: ShortcutManager
  let container: HTMLDivElement

  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
    shortcuts = new ShortcutManager(graph)
  })

  it('should register and dispatch custom action', () => {
    const copyHandler = vi.fn()
    shortcuts.registerAction('copy', copyHandler)
    shortcuts.bind()

    const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true })
    document.dispatchEvent(event)

    expect(copyHandler).toHaveBeenCalled()
    shortcuts.unbind()
  })

  it('should not dispatch when editing text', () => {
    const copyHandler = vi.fn()
    shortcuts.registerAction('copy', copyHandler)
    shortcuts.bind()

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true })
    document.dispatchEvent(event)

    expect(copyHandler).not.toHaveBeenCalled()
    shortcuts.unbind()
    input.remove()
  })
})
