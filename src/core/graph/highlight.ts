import { PRIMARY_COLOR } from '@uni-draw/shared'

/** 边高亮状态存储，用于保存原始样式以便恢复 */
const edgeHighlightStore = new WeakMap<any, { stroke: any, strokeWidth: any }>()

/**
 * 高亮指定边
 * 将边的颜色改为主题色，并增加线宽
 *
 * @param edge - X6 Edge 实例
 */
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

/**
 * 取消边的高亮状态
 * 恢复边的原始颜色和线宽
 *
 * @param edge - X6 Edge 实例
 */
export function unhighlightEdge(edge: any): void {
  const original = edgeHighlightStore.get(edge)
  if (!original)
    return
  edge.attr('line/stroke', original.stroke)
  edge.attr('line/strokeWidth', original.strokeWidth)
  edgeHighlightStore.delete(edge)
}
