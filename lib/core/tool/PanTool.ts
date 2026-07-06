import type { Graph } from '@antv/x6'

/**
 * 平移（小手）工具
 * 激活后：左键拖动画布平移，禁用节点选中/移动
 * 关闭后：恢复右键拖动平移，启用节点选中/移动
 *
 * 不使用 graph.enablePanning()/disablePanning()，
 * 因为这些方法内部会调用 updateClassName() 不传事件参数，
 * 导致 ModifierKey.isMatch 读取 e.ctrlKey 时报错。
 */
export interface PanToolOptions {
  /** 是否通过修改 interacting 禁止节点拖动（默认 true） */
  disableInteracting?: boolean
}

export class PanTool {
  private enabled = false
  private panningState = false
  private startX = 0
  private startY = 0
  /** 保存 enable() 之前的 interacting 配置，disable() 时恢复 */
  private _savedInteracting: any = undefined

  constructor(private graph: Graph, private options: PanToolOptions = {}) {
    this._savedInteracting = (this.graph.options as any).interacting
  }

  enable(): void {
    if (this.enabled)
      return

    // 保存原始配置以便 disable 时恢复
    this._savedInteracting = (this.graph.options as any).interacting
    // 默认通过 interacting 禁止节点拖动；只读模式可关闭此行为以保留原有交互限制
    if (this.options.disableInteracting !== false) {
      ;(this.graph.options as any).interacting = { nodeMovable: false }
    }

    // 绑定平移事件（使用 X6 图事件，避免 DOM stopPropagation 导致丢失）
    this.bindPanEvents()

    this.enabled = true
  }

  disable(): void {
    if (!this.enabled)
      return

    // 解绑平移事件
    this.unbindPanEvents()

    // 恢复节点拖动
    ;(this.graph.options as any).interacting = this._savedInteracting

    this.enabled = false
  }

  private bindPanEvents(): void {
    this._onMouseDown = this.onMouseDown.bind(this)
    this._onMouseMove = this.onMouseMove.bind(this)
    this._onMouseUp = this.onMouseUp.bind(this)

    // capture: true — 在捕获阶段触发，早于 X6 内部的所有冒泡阶段处理器，
    // 任何 stopPropagation 均无法阻断
    document.addEventListener('mousedown', this._onMouseDown, true)
    document.addEventListener('mousemove', this._onMouseMove)
    document.addEventListener('mouseup', this._onMouseUp)

    this.graph.container.style.cursor = 'grab'
  }

  private unbindPanEvents(): void {
    if (this._onMouseDown)
      document.removeEventListener('mousedown', this._onMouseDown, true)
    if (this._onMouseMove)
      document.removeEventListener('mousemove', this._onMouseMove)
    if (this._onMouseUp)
      document.removeEventListener('mouseup', this._onMouseUp)

    this.graph.container.style.cursor = ''
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button !== 0)
      return
    // 仅响应画布容器内的点击
    if (!this.graph.container.contains(e.target as Node))
      return
    this.panningState = true
    this.startX = e.clientX
    this.startY = e.clientY
    e.preventDefault()
    e.stopPropagation()
    this.graph.container.style.cursor = 'grabbing'
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.panningState)
      return
    const dx = e.clientX - this.startX
    const dy = e.clientY - this.startY
    this.startX = e.clientX
    this.startY = e.clientY
    const { tx, ty } = this.graph.translate()
    this.graph.translate(tx + dx, ty + dy)
  }

  private onMouseUp(): void {
    if (!this.panningState)
      return
    this.panningState = false
    this.graph.container.style.cursor = 'grab'
  }

  private _onMouseDown: ((e: MouseEvent) => void) | null = null
  private _onMouseMove: ((e: MouseEvent) => void) | null = null
  private _onMouseUp: (() => void) | null = null

  toggle(): boolean {
    if (this.enabled) {
      this.disable()
    }
    else {
      this.enable()
    }
    return this.enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }
}
