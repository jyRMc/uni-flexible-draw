import { beforeEach, describe, expect, it } from 'vitest'
import { Graph } from '@antv/x6'
import { AntVRenderEngine } from '@uni-draw/core/engine/AntVRenderEngine'
import { EdgeFactory } from '@uni-draw/core/edge/EdgeFactory'
import { PanTool } from '@uni-draw/core/tool/PanTool'
import { registerAllShapes } from '@uni-draw/shapes/register'

function makeContainer(): HTMLDivElement {
  const div = document.createElement('div')
  div.style.width = '800px'
  div.style.height = '600px'
  document.body.appendChild(div)
  return div
}

describe('lib AntVRenderEngine', () => {
  beforeEach(() => {
    registerAllShapes()
  })

  it('should enable rubberband selection of edges', () => {
    const engine = new AntVRenderEngine()
    const graph = engine.init(makeContainer(), {})
    const plugin = (graph as any).getPlugin?.('selection')
    expect(plugin?.options?.rubberEdge).toBe(true)
    engine.dispose()
  })

  it('should disable selection plugin in readonly mode', () => {
    const engine = new AntVRenderEngine()
    const graph = engine.init(makeContainer(), { readonly: true })
    const plugin = (graph as any).getPlugin?.('selection')
    console.log('plugin', plugin, 'enabled', plugin?.options?.enabled)
    expect(plugin?.options?.enabled).toBe(false)
    engine.dispose()
  })

  it('should use right mouse panning by default', () => {
    const engine = new AntVRenderEngine()
    const graph = engine.init(makeContainer(), {})
    expect((graph as any).options.panning.eventTypes).toContain('rightMouseDown')
    expect((graph as any).options.panning.eventTypes).not.toContain('leftMouseDown')
    engine.dispose()
  })
})

describe('lib PanTool', () => {
  beforeEach(() => {
    registerAllShapes()
  })

  it('should enable pan tool without overriding readonly interacting', () => {
    const engine = new AntVRenderEngine()
    const graph = engine.init(makeContainer(), { readonly: true })
    const panTool = new PanTool(graph, { disableInteracting: false })
    panTool.enable()
    expect(panTool.isEnabled()).toBe(true)
    // readonly 模式下 PanTool 不应覆盖引擎原有的 interacting 限制
    expect((graph as any).options.interacting.nodeMovable).toBe(false)
    expect((graph as any).options.interacting.edgeMovable).toBe(false)
    panTool.disable()
    engine.dispose()
  })
})

describe('lib EdgeFactory sketch edge', () => {
  let graph: any
  let container: HTMLDivElement

  beforeEach(() => {
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
  })

  it('should create edge-sketch with custom connector', () => {
    const edge = EdgeFactory.createEdge(graph, {
      id: 'sketch-1',
      shape: 'edge-sketch',
      source: { x: 0, y: 0 },
      target: { x: 200, y: 200 },
    })
    expect(edge.shape).toBe('edge-sketch')
    expect(edge.getConnector()?.name).toBe('uni-draw-sketch-straight')
  })
})
