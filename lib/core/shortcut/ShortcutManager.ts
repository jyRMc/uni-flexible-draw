import type { Graph } from '@antv/x6'

export type ShortcutAction =
  | 'cut' | 'copy' | 'paste' | 'duplicate'
  | 'copyAsPng'
  | 'toBack' | 'toFront' | 'moveDown' | 'moveUp'
  | 'flipH' | 'flipV'
  | 'addLink' | 'toggleLock'

/**
 * 快捷键管理器
 * X6 2.x 中 bindKey 不存在，使用 graph 键盘事件 + DOM 降级
 */
export class ShortcutManager {
  private bound = false
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null
  private actions: Map<ShortcutAction, () => void> = new Map()

  constructor(private graph: Graph) {}

  /** 注册动作回调，供画布层注入具体实现 */
  registerAction(action: ShortcutAction, handler: () => void): void {
    this.actions.set(action, handler)
  }

  private dispatch(action: ShortcutAction): void {
    this.actions.get(action)?.();
  }

  /** 当前活动元素是否为文本输入区域（此时不拦截键盘事件） */
  private isEditingText(): boolean {
    const el = document.activeElement as HTMLElement | null
    if (!el) return false
    const tag = el.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
  }

  bind(): void {
    if (this.bound) return
    this.bound = true

    this.keydownHandler = (e: KeyboardEvent) => {
      // 正在输入文字时，所有快捷键均不拦截
      if (this.isEditingText()) return

      const ctrlOrCmd = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const key = e.key.toLowerCase()

      // Ctrl+Z / Cmd+Z → Undo
      if (ctrlOrCmd && !shift && key === 'z') {
        e.preventDefault()
        ;(this.graph as any).undo?.()
        return
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y / Cmd+Y → Redo
      if (ctrlOrCmd && (key === 'y' || (shift && key === 'z'))) {
        e.preventDefault()
        ;(this.graph as any).redo?.()
        return
      }

      // Ctrl+X → 剪切
      if (ctrlOrCmd && !shift && key === 'x') {
        e.preventDefault(); this.dispatch('cut'); return
      }
      // Ctrl+C → 拷贝
      if (ctrlOrCmd && !shift && key === 'c') {
        e.preventDefault(); this.dispatch('copy'); return
      }
      // Ctrl+V → 粘贴
      if (ctrlOrCmd && !shift && key === 'v') {
        e.preventDefault(); this.dispatch('paste'); return
      }
      // Ctrl+D → 复制
      if (ctrlOrCmd && !shift && key === 'd') {
        e.preventDefault(); this.dispatch('duplicate'); return
      }
      // Shift+Alt+C → 复制为PNG
      if (shift && e.altKey && key === 'c') {
        e.preventDefault(); this.dispatch('copyAsPng'); return
      }
      // Ctrl+Shift+[ → 置于底层
      if (ctrlOrCmd && shift && key === '[') {
        e.preventDefault(); this.dispatch('toBack'); return
      }
      // Ctrl+Shift+] → 置于顶层
      if (ctrlOrCmd && shift && key === ']') {
        e.preventDefault(); this.dispatch('toFront'); return
      }
      // Ctrl+[ → 下移一层
      if (ctrlOrCmd && !shift && key === '[') {
        e.preventDefault(); this.dispatch('moveDown'); return
      }
      // Ctrl+] → 上移一层
      if (ctrlOrCmd && !shift && key === ']') {
        e.preventDefault(); this.dispatch('moveUp'); return
      }
      // Shift+H → 水平翻转
      if (shift && !ctrlOrCmd && key === 'h') {
        e.preventDefault(); this.dispatch('flipH'); return
      }
      // Shift+V → 垂直翻转
      if (shift && !ctrlOrCmd && key === 'v') {
        e.preventDefault(); this.dispatch('flipV'); return
      }
      // Ctrl+K → 添加链接
      if (ctrlOrCmd && !shift && key === 'k') {
        e.preventDefault(); this.dispatch('addLink'); return
      }
      // Ctrl+Shift+L → 锁定
      if (ctrlOrCmd && shift && key === 'l') {
        e.preventDefault(); this.dispatch('toggleLock'); return
      }

      // Ctrl+0 / Cmd+0 → 实际大小
      if (ctrlOrCmd && !shift && key === '0') {
        e.preventDefault()
        this.graph.zoomTo(1)
        return
      }

      // Ctrl+1 / Cmd+1 → 适应画布
      if (ctrlOrCmd && !shift && key === '1') {
        e.preventDefault()
        this.graph.zoomToFit()
        return
      }

      // Delete / Backspace → 删除选中
      if (key === 'delete' || key === 'backspace') {
        const cells = typeof this.graph.getSelectedCells === 'function'
          ? this.graph.getSelectedCells()
          : []
        if (cells.length > 0) {
          e.preventDefault()
          this.graph.removeCells(cells)
        }
        return
      }

      // Ctrl+A / Cmd+A → 全选
      if (ctrlOrCmd && !shift && key === 'a') {
        e.preventDefault()
        const allCells = [...this.graph.getNodes(), ...this.graph.getEdges()]
        if (allCells.length > 0 && typeof (this.graph as any).select === 'function') {
          ;(this.graph as any).select(allCells)
        }
        return
      }

      // Escape → 取消选中
      if (key === 'escape') {
        if (typeof (this.graph as any).cleanSelection === 'function') {
          ;(this.graph as any).cleanSelection()
        }
        return
      }

      // Arrow keys → 微移选中节点（Shift × 10px，否则 1px）
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)) {
        const nodes = (typeof this.graph.getSelectedCells === 'function'
          ? this.graph.getSelectedCells()
          : []
        ).filter((c: any) => c.isNode?.())
        if (nodes.length === 0) return
        e.preventDefault()
        const step = shift ? 10 : 1
        const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0
        const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0
        nodes.forEach((n: any) => {
          const { x, y } = n.getPosition()
          n.setPosition(x + dx, y + dy)
        })
        return
      }
    }

    document.addEventListener('keydown', this.keydownHandler)
  }

  unbind(): void {
    if (!this.bound) return
    this.bound = false

    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler)
      this.keydownHandler = null
    }
  }
}
