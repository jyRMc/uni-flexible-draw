import { PRIMARY_COLOR } from '@uni-draw/shared'

const edgeHighlightStore = new WeakMap<any, { stroke: any; strokeWidth: any }>()

export function highlightEdge(edge: any): void {
  if (!edgeHighlightStore.has(edge)) {
    const line = edge.getAttrs?.()?.line ?? {}
    edgeHighlightStore.set(edge, {
      stroke: line.stroke,
      strokeWidth: line.strokeWidth,
    })
  }
  const original = edgeHighlightStore.get(edge)!
  const width = typeof original.strokeWidth === 'number' ? original.strokeWidth : 2
  edge.attr('line/stroke', PRIMARY_COLOR)
  edge.attr('line/strokeWidth', Math.max(width + 1, 2.5))
}

export function unhighlightEdge(edge: any): void {
  const original = edgeHighlightStore.get(edge)
  if (!original) return
  edge.attr('line/stroke', original.stroke)
  edge.attr('line/strokeWidth', original.strokeWidth)
  edgeHighlightStore.delete(edge)
}
