/**
 * 节点对齐组合式函数
 * 提供多种对齐方式：左对齐、右对齐、顶部对齐、底部对齐、水平居中、垂直居中、水平等距、垂直等距
 *
 * @param getSelectedCells - 获取当前选中单元格的函数
 */
export function useAlignment(getSelectedCells: () => any[]) {
  /**
   * 对齐选中节点
   *
   * @param direction - 对齐方向，支持:
   *   - 'left': 左对齐（以最左节点为基准）
   *   - 'right': 右对齐（以最右节点为基准）
   *   - 'top': 顶部对齐（以最顶部节点为基准）
   *   - 'bottom': 底部对齐（以最底部节点为基准）
   *   - 'center': 水平居中（所有节点中心对齐到选中节点中心点的平均值）
   *   - 'middle': 垂直居中（所有节点中心对齐到选中节点中心点的平均值）
   *   - 'h-equal': 水平等距分布
   *   - 'v-equal': 垂直等距分布
   */
  function alignNodes(direction: string): void {
    const nodes = getSelectedCells().filter((c: any) => c.isNode?.())
    if (nodes.length < 2)
      return

    switch (direction) {
      case 'left': {
        const minX = Math.min(...nodes.map((n: any) => n.getPosition().x))
        nodes.forEach((n: any) => n.setPosition(minX, n.getPosition().y))
        break
      }
      case 'right': {
        const maxRight = Math.max(...nodes.map((n: any) => n.getPosition().x + n.getSize().width))
        nodes.forEach((n: any) => n.setPosition(maxRight - n.getSize().width, n.getPosition().y))
        break
      }
      case 'top': {
        const minY = Math.min(...nodes.map((n: any) => n.getPosition().y))
        nodes.forEach((n: any) => n.setPosition(n.getPosition().x, minY))
        break
      }
      case 'bottom': {
        const maxBottom = Math.max(...nodes.map((n: any) => n.getPosition().y + n.getSize().height))
        nodes.forEach((n: any) => n.setPosition(n.getPosition().x, maxBottom - n.getSize().height))
        break
      }
      case 'center': {
        const avgX = nodes.reduce((s: number, n: any) => s + n.getPosition().x + n.getSize().width / 2, 0) / nodes.length
        nodes.forEach((n: any) => n.setPosition(avgX - n.getSize().width / 2, n.getPosition().y))
        break
      }
      case 'middle': {
        const avgY = nodes.reduce((s: number, n: any) => s + n.getPosition().y + n.getSize().height / 2, 0) / nodes.length
        nodes.forEach((n: any) => n.setPosition(n.getPosition().x, avgY - n.getSize().height / 2))
        break
      }
      case 'h-equal': {
        const sorted = ([...nodes] as any[]).sort((a: any, b: any) => a.getPosition().x - b.getPosition().x)
        const first: any = sorted[0]
        const last: any = sorted[sorted.length - 1]
        const totalSpan = (last.getPosition().x + last.getSize().width) - first.getPosition().x
        const totalW = sorted.reduce((s: number, n: any) => s + n.getSize().width, 0)
        const gap = (totalSpan - totalW) / (sorted.length - 1)
        let curX = first.getPosition().x + first.getSize().width + gap
        for (let i = 1; i < sorted.length - 1; i++) {
          sorted[i].setPosition(curX, sorted[i].getPosition().y)
          curX += sorted[i].getSize().width + gap
        }
        break
      }
      case 'v-equal': {
        const sorted = ([...nodes] as any[]).sort((a: any, b: any) => a.getPosition().y - b.getPosition().y)
        const first: any = sorted[0]
        const last: any = sorted[sorted.length - 1]
        const totalSpan = (last.getPosition().y + last.getSize().height) - first.getPosition().y
        const totalH = sorted.reduce((s: number, n: any) => s + n.getSize().height, 0)
        const gap = (totalSpan - totalH) / (sorted.length - 1)
        let curY = first.getPosition().y + first.getSize().height + gap
        for (let i = 1; i < sorted.length - 1; i++) {
          sorted[i].setPosition(sorted[i].getPosition().x, curY)
          curY += sorted[i].getSize().height + gap
        }
        break
      }
    }
  }

  return { alignNodes }
}
