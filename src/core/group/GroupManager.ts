import type { Graph, Node } from '@antv/x6'
import type { NodeData } from '@uni-draw/shared'
import { NodeFactory } from '../node/NodeFactory'

export const MAX_GROUP_DEPTH = 5
export const GROUP_PADDING = 16
export const GROUP_MIN_SIZE = 40

export interface GroupOptions {
  padding?: number
  fill?: string
  stroke?: string
  strokeDasharray?: string
}

/**
 * Group 组合管理器
 * 封装多节点组合的创建、编辑、解散等核心逻辑
 */
export class GroupManager {
  private graph: Graph
  private editingGroupId: string | null = null
  private originalZIndexMap = new Map<string, number>()

  constructor(graph: Graph) {
    this.graph = graph
  }

  /**
   * 创建组合
   */
  createGroup(nodes: Node[], options: GroupOptions = {}): Node | null {
    if (nodes.length < 2) return null

    const validNodes = nodes.filter((n) => {
      // 排除已经是 group 的节点（如果选中了 group 自身）
      if (n.shape === 'basic-group') return false
      // 排除已有父节点的节点（避免嵌套冲突，由调用方处理）
      const parent = (n as any).getParent?.()
      if (parent) return false
      return true
    })

    if (validNodes.length < 2) return null

    const padding = options.padding ?? GROUP_PADDING

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    validNodes.forEach((n) => {
      const pos = n.getPosition()
      const size = n.getSize()
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x + size.width)
      maxY = Math.max(maxY, pos.y + size.height)
    })

    const groupX = minX - padding
    const groupY = minY - padding
    const groupW = Math.max(maxX - minX + padding * 2, GROUP_MIN_SIZE)
    const groupH = Math.max(maxY - minY + padding * 2, GROUP_MIN_SIZE)

    const minZIndex = Math.min(...validNodes.map((n) => (n as any).getZIndex?.() ?? 0))

    const groupData: NodeData = {
      id: `group-${Date.now()}`,
      shape: 'basic-group',
      position: { x: groupX, y: groupY },
      size: { width: groupW, height: groupH },
      zIndex: Math.max(0, minZIndex - 1),
      data: { isGroup: true },
    }
    const group = NodeFactory.createNode(this.graph, groupData)
    this.graph.addNode(group)

    // 将子节点的位置转换为相对于 group 的坐标，然后 addChild
    validNodes.forEach((n) => {
      const pos = n.getPosition()
      n.setPosition({ x: pos.x - groupX, y: pos.y - groupY })
      group.addChild(n)
    })

    // 自动调整 group 大小以包裹子节点（X6 不会自动做，我们手动确保）
    this.fitGroupSize(group)

    return group
  }

  /**
   * 解散组合
   */
  ungroup(groupIds: string | string[]): void {
    const ids = Array.isArray(groupIds) ? groupIds : [groupIds]
    const toSelect: Node[] = []

    ids.forEach((id) => {
      const group = this.graph.getCellById(id)
      if (!group || !group.isNode?.()) return
      if ((group as Node).shape !== 'basic-group') return

      const children = (group as any).getChildren?.() ?? []
      const gPos = group.getPosition()

      // freeze 暂停渲染，避免中途更新；unfreeze 后子节点 SVG 会从 group 中移出
      this.graph.freeze()
      children.forEach((child: Node) => {
        const cPos = child.getPosition()
        child.setPosition({ x: cPos.x + gPos.x, y: cPos.y + gPos.y })
        group.removeChild(child)
        toSelect.push(child)
      })
      this.graph.unfreeze()

      group.remove({ deep: false } as any)
    })

    if (toSelect.length > 0) {
      if (typeof (this.graph as any).cleanSelection === 'function') {
        ;(this.graph as any).cleanSelection()
      }
      if (typeof (this.graph as any).select === 'function') {
        ;(this.graph as any).select(toSelect)
      }
    }
  }

  /**
   * 进入编辑模式
   */
  enterEditMode(groupId: string): boolean {
    const group = this.graph.getCellById(groupId)
    if (!group || !group.isNode?.() || (group as Node).shape !== 'basic-group') return false
    if (this.editingGroupId) this.exitEditMode()

    this.editingGroupId = groupId
    this.originalZIndexMap.set(groupId, (group as any).getZIndex?.() ?? 0)

    // 提升 group 到最高层级
    const allCells = [...this.graph.getNodes(), ...this.graph.getEdges()]
    const maxZ = allCells.reduce((z, c) => Math.max(z, (c as any).getZIndex?.() ?? 0), 0)
    group.setZIndex(maxZ + 1)

    // 编辑模式视觉：实线蓝色边框
    group.setAttrByPath('body/strokeDasharray', null)
    group.setAttrByPath('body/stroke', '#1890ff')
    group.setAttrByPath('body/strokeWidth', 2)

    return true
  }

  /**
   * 退出编辑模式
   */
  exitEditMode(): boolean {
    if (!this.editingGroupId) return false
    const group = this.graph.getCellById(this.editingGroupId)
    if (group) {
      // 恢复原始样式
      group.setAttrByPath('body/strokeDasharray', '4 4')
      group.setAttrByPath('body/stroke', '#d9d9d9')
      group.setAttrByPath('body/strokeWidth', 1)

      // 恢复 zIndex
      const originalZ = this.originalZIndexMap.get(this.editingGroupId)
      if (originalZ !== undefined) group.setZIndex(originalZ)

      // 重新计算包围盒
      this.fitGroupSize(group)
    }

    this.originalZIndexMap.delete(this.editingGroupId)
    this.editingGroupId = null
    return true
  }

  /**
   * 是否处于编辑模式
   */
  isEditing(): boolean {
    return this.editingGroupId !== null
  }

  /**
   * 获取当前编辑的 group ID
   */
  getEditingGroupId(): string | null {
    return this.editingGroupId
  }

  /**
   * 向组合中添加子节点
   */
  addChild(groupId: string, nodeId: string): boolean {
    const group = this.graph.getCellById(groupId)
    const node = this.graph.getCellById(nodeId)
    if (!group || !node || !group.isNode?.() || !node.isNode?.()) return false
    if ((group as Node).shape !== 'basic-group') return false

    // 检测循环引用
    if (this.isDescendant(nodeId, groupId)) return false

    const gPos = group.getPosition()
    const nPos = node.getPosition()

    // 转换子节点位置为相对坐标
    node.setPosition({ x: nPos.x - gPos.x, y: nPos.y - gPos.y })
    group.addChild(node)
    this.fitGroupSize(group)
    return true
  }

  /**
   * 从组合中移除子节点
   */
  removeChild(groupId: string, nodeId: string): boolean {
    const group = this.graph.getCellById(groupId)
    const node = this.graph.getCellById(nodeId)
    if (!group || !node || !group.isNode?.() || !node.isNode?.()) return false
    if ((group as Node).shape !== 'basic-group') return false

    const gPos = group.getPosition()
    const nPos = node.getPosition()

    group.removeChild(node)
    // 恢复世界坐标
    node.setPosition({ x: nPos.x + gPos.x, y: nPos.y + gPos.y })
    this.fitGroupSize(group)
    return true
  }

  /**
   * 检测循环引用：childId 是否为 parentId 的子孙
   */
  isDescendant(parentId: string, childId: string): boolean {
    let current = this.graph.getCellById(childId)
    if (!current) return false

    const visited = new Set<string>()
    while (current) {
      const parent = (current as any).getParent?.()
      if (!parent) return false
      if (parent.id === parentId) return true
      if (visited.has(parent.id)) return false // 防止死循环
      visited.add(parent.id)
      current = parent
    }
    return false
  }

  /**
   * 获取 group 的嵌套深度（从 0 开始）
   */
  getGroupDepth(groupId: string): number {
    const group = this.graph.getCellById(groupId)
    if (!group || !group.isNode?.() || (group as Node).shape !== 'basic-group') return -1

    let depth = 0
    let current = group as any
    while (current.getParent?.()) {
      depth++
      current = current.getParent()
    }
    return depth
  }

  /**
   * 获取指定 group 的所有子孙节点（递归）
   */
  getDescendants(groupId: string): Node[] {
    const group = this.graph.getCellById(groupId)
    if (!group || !group.isNode?.()) return []

    const result: Node[] = []
    const children = (group as any).getChildren?.() ?? []
    children.forEach((child: Node) => {
      result.push(child)
      if (child.shape === 'basic-group') {
        result.push(...this.getDescendants(child.id))
      }
    })
    return result
  }

  /**
   * 调整 group 大小以包裹所有子节点
   */
  fitGroupSize(group: Node): void {
    const children = (group as any).getChildren?.() ?? []
    if (children.length === 0) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    children.forEach((child: Node) => {
      const pos = child.getPosition()
      const size = child.getSize()
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x + size.width)
      maxY = Math.max(maxY, pos.y + size.height)
    })

    const padding = GROUP_PADDING
    const newW = Math.max(maxX - minX + padding * 2, GROUP_MIN_SIZE)
    const newH = Math.max(maxY - minY + padding * 2, GROUP_MIN_SIZE)

    group.resize(newW, newH)
  }

  /**
   * 判断节点是否已在某个 group 中
   */
  hasParent(nodeId: string): boolean {
    const node = this.graph.getCellById(nodeId)
    if (!node) return false
    return !!(node as any).getParent?.()
  }

  /**
   * 获取节点所属的直接 group
   */
  getParentGroup(nodeId: string): Node | null {
    const node = this.graph.getCellById(nodeId)
    if (!node) return null
    const parent = (node as any).getParent?.()
    return parent && parent.isNode?.() ? parent : null
  }
}
