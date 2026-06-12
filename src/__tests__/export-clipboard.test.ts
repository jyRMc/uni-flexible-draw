import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Graph } from '@antv/x6'
import { ExportService } from '../core/export/ExportService'
import { DataMigration } from '../core/export/DataMigration'
import { ClipboardManager } from '../core/clipboard/ClipboardManager'
import { EdgeRegistry, NodeRegistry } from '../core'
import { registerAllShapes } from '../shapes/register'

function makeContainer(): HTMLDivElement {
  const div = document.createElement('div')
  div.style.width = '800px'
  div.style.height = '600px'
  document.body.appendChild(div)
  return div
}

describe('dataMigration', () => {
  it('should keep current version data unchanged', () => {
    const data = {
      canvas: { backgroundColor: '#fff', grid: { size: 10, visible: true, type: 'dot' as const } },
      nodes: [],
      edges: [],
      meta: { version: '0.0.1' },
    }
    const migrated = DataMigration.migrate(data)
    expect(migrated.meta?.version).toBe('0.0.1')
  })

  it('should migrate old version to 0.0.1', () => {
    const data = {
      canvas: { backgroundColor: '#fff', grid: { size: 10, visible: true, type: 'dot' as const } },
      nodes: [],
      edges: [],
      meta: { version: '0.0.0' },
    }
    const migrated = DataMigration.migrate(data)
    expect(migrated.meta?.version).toBe('0.0.1')
  })

  it('should add meta.version when missing', () => {
    const data = {
      canvas: { backgroundColor: '#fff', grid: { size: 10, visible: true, type: 'dot' as const } },
      nodes: [],
      edges: [],
    }
    const migrated = DataMigration.migrate(data)
    expect(migrated.meta?.version).toBe('0.0.1')
  })
})

describe('exportService', () => {
  let graph: Graph
  let service: ExportService
  let container: HTMLDivElement

  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
    service = new ExportService(graph)
  })

  it('should export valid JSON', () => {
    const json = service.toJSON({
      canvas: { backgroundColor: '#fff', grid: { size: 10, visible: true, type: 'dot' } },
      nodes: [{ id: 'n1', shape: 'basic-rect', position: { x: 0, y: 0 }, size: { width: 80, height: 40 } }],
      edges: [],
    })
    const parsed = JSON.parse(json)
    expect(parsed.nodes).toHaveLength(1)
  })

  it('should import valid JSON', () => {
    const data = {
      canvas: { backgroundColor: '#fafafa', grid: { size: 20, visible: false, type: 'line' as const } },
      nodes: [{ id: 'a', shape: 'basic-circle', position: { x: 10, y: 10 }, size: { width: 40, height: 40 } }],
      edges: [],
    }
    const json = JSON.stringify(data)
    const imported = service.fromJSON(json)
    expect(imported.nodes[0].id).toBe('a')
  })
})

describe('clipboardManager', () => {
  let graph: Graph
  let clipboard: ClipboardManager
  let container: HTMLDivElement

  beforeEach(() => {
    NodeRegistry.clear()
    EdgeRegistry.clear()
    registerAllShapes()
    container = makeContainer()
    graph = new Graph({ container, width: 800, height: 600 })
    clipboard = new ClipboardManager(graph)
  })

  it('should return false for empty clipboard', () => {
    expect(clipboard.hasContent()).toBe(false)
  })

  it('should copy a node and allow paste', () => {
    const node = graph.addNode({ shape: 'basic-rect', x: 10, y: 10, width: 80, height: 40 })
    clipboard.copy([node])
    expect(clipboard.hasContent()).toBe(true)
    const pasted = clipboard.paste()
    expect(pasted.length).toBe(1)
    expect(pasted[0].id).not.toBe(node.id)
    expect(graph.getNodes()).toHaveLength(2)
  })

  it('should offset pasted nodes', () => {
    const node = graph.addNode({ shape: 'basic-rect', x: 10, y: 10, width: 80, height: 40 })
    clipboard.copy([node])
    const p1 = clipboard.paste()
    const p2 = clipboard.paste()
    const pos1 = (p1[0] as any).getPosition()
    const pos2 = (p2[0] as any).getPosition()
    expect(pos2.x).toBeGreaterThan(pos1.x)
    expect(pos2.y).toBeGreaterThan(pos1.y)
  })

  it('should cut nodes (remove original)', () => {
    const node = graph.addNode({ shape: 'basic-rect', x: 10, y: 10, width: 80, height: 40 })
    clipboard.cut([node])
    expect(graph.getNodes()).toHaveLength(0)
    const pasted = clipboard.paste()
    expect(pasted.length).toBe(1)
  })
})
