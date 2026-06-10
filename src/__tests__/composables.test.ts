import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useAlignment } from '../composables/useAlignment'
import { useStyleEditor, type EdgeViewData } from '../composables/useStyleEditor'

function makeMockNode(x: number, y: number, w: number, h: number) {
  let pos = { x, y }
  let size = { width: w, height: h }
  return {
    isNode: () => true,
    getPosition: () => pos,
    setPosition: (nx: number, ny: number) => { pos = { x: nx, y: ny } },
    getSize: () => size,
    resize: (nw: number, nh: number) => { size = { width: nw, height: nh } },
  }
}

describe('useAlignment', () => {
  it('should align nodes to left', () => {
    const nodes = [
      makeMockNode(10, 0, 50, 50),
      makeMockNode(100, 0, 50, 50),
      makeMockNode(50, 0, 50, 50),
    ]
    const { alignNodes } = useAlignment(() => nodes as any)
    alignNodes('left')
    expect(nodes[0].getPosition().x).toBe(10)
    expect(nodes[1].getPosition().x).toBe(10)
    expect(nodes[2].getPosition().x).toBe(10)
  })

  it('should align nodes to top', () => {
    const nodes = [
      makeMockNode(0, 30, 50, 50),
      makeMockNode(0, 10, 50, 50),
      makeMockNode(0, 50, 50, 50),
    ]
    const { alignNodes } = useAlignment(() => nodes as any)
    alignNodes('top')
    expect(nodes[0].getPosition().y).toBe(10)
    expect(nodes[1].getPosition().y).toBe(10)
    expect(nodes[2].getPosition().y).toBe(10)
  })

  it('should horizontally center nodes', () => {
    const nodes = [
      makeMockNode(0, 0, 50, 50),
      makeMockNode(100, 0, 50, 50),
    ]
    const { alignNodes } = useAlignment(() => nodes as any)
    alignNodes('center')
    // avg center = (25 + 125) / 2 = 75
    // node0 x = 75 - 25 = 50
    expect(nodes[0].getPosition().x).toBe(50)
    expect(nodes[1].getPosition().x).toBe(50)
  })

  it('should do nothing with < 2 nodes', () => {
    const nodes = [makeMockNode(10, 10, 50, 50)]
    const { alignNodes } = useAlignment(() => nodes as any)
    expect(() => alignNodes('left')).not.toThrow()
  })

  it('should filter out non-node cells', () => {
    const cells = [
      makeMockNode(10, 0, 50, 50),
      { isNode: () => false },
    ]
    const { alignNodes } = useAlignment(() => cells as any)
    alignNodes('left')
    // Only one node, no change
    expect(cells[0].getPosition().x).toBe(10)
  })
})

describe('useStyleEditor', () => {
  function makeMockGraph(nodeMap: Record<string, any>, edgeMap: Record<string, any>) {
    return {
      getCellById: (id: string) => nodeMap[id] || edgeMap[id] || null,
    }
  }

  function makeMockNode(id: string) {
    const attrs = { body: { fill: '#fff', stroke: '#333', strokeWidth: 2 } }
    return {
      id,
      shape: 'basic-rect',
      isNode: () => true,
      getAttrs: () => attrs,
      setAttrs: (a: any) => Object.assign(attrs, a),
      setLabel: (l: string) => { /* no-op */ },
      setAttrByPath: () => { /* no-op */ },
    }
  }

  function makeMockEdge(id: string) {
    const attrs = { line: { stroke: '#333', strokeWidth: 2 } }
    const labels: any[] = []
    return {
      id,
      shape: 'edge-line',
      isEdge: () => true,
      getAttrs: () => attrs,
      setAttrs: (a: any) => Object.assign(attrs, a),
      getLabels: () => labels,
      setLabels: (l: any[]) => { labels.length = 0; labels.push(...l) },
      getRouter: () => null,
      getConnector: () => null,
      getData: () => ({}),
    }
  }

  it('should update node body style', () => {
    const node = makeMockNode('n1')
    const graph = makeMockGraph({ n1: node }, {})
    const selectedEdge = ref<EdgeViewData | null>(null)
    const { updateNodeStyle } = useStyleEditor(() => graph as any, selectedEdge as any)

    updateNodeStyle('n1', { fill: '#f00', strokeWidth: 4 })
    expect(node.getAttrs().body.fill).toBe('#f00')
    expect(node.getAttrs().body.strokeWidth).toBe(4)
  })

  it('should update edge line style', () => {
    const edge = makeMockEdge('e1')
    const graph = makeMockGraph({}, { e1: edge })
    const selectedEdge = ref<EdgeViewData | null>(null)
    const { updateEdgeStyle } = useStyleEditor(() => graph as any, selectedEdge as any)

    updateEdgeStyle('e1', { stroke: '#00f', strokeDasharray: '5 5' })
    expect(edge.getAttrs().line.stroke).toBe('#00f')
    expect(edge.getAttrs().line.strokeDasharray).toBe('5 5')
  })

  it('should set edge labels', () => {
    const edge = makeMockEdge('e1')
    const graph = makeMockGraph({}, { e1: edge })
    const selectedEdge = ref<EdgeViewData | null>(null)
    const { updateEdgeStyle } = useStyleEditor(() => graph as any, selectedEdge as any)

    updateEdgeStyle('e1', { label: 'New Label' })
    expect(edge.getLabels()).toHaveLength(1)
    expect(edge.getLabels()[0].attrs.label.text).toBe('New Label')
  })

  it('should clear edge labels when label is empty', () => {
    const edge = makeMockEdge('e1')
    edge.setLabels([{ attrs: { label: { text: 'Old' } } }])
    const graph = makeMockGraph({}, { e1: edge })
    const selectedEdge = ref<EdgeViewData | null>(null)
    const { updateEdgeStyle } = useStyleEditor(() => graph as any, selectedEdge as any)

    updateEdgeStyle('e1', { label: '' })
    expect(edge.getLabels()).toHaveLength(0)
  })

  it('should extract edge data with correct lineType', () => {
    const edge = {
      id: 'e1',
      shape: 'edge-line',
      getAttrs: () => ({ line: { stroke: '#000', strokeWidth: 3, sourceMarker: { name: 'classic' } } }),
      getLabels: () => [{ attrs: { label: { text: 'Label' } } }],
      getRouter: () => ({ name: 'orth' }),
      getConnector: () => null,
    }
    const graph = makeMockGraph({}, {})
    const selectedEdge = ref<EdgeViewData | null>(null)
    const { extractEdgeData } = useStyleEditor(() => graph as any, selectedEdge as any)

    const data = extractEdgeData(edge as any)
    expect(data.lineType).toBe('orthogonal')
    expect(data.sourceMarker).toBe('classic')
  })
})
