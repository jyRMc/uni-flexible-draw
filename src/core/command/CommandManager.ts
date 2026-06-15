import type { ICommand } from './ICommand'
import { BatchCommand } from './BatchCommand'

interface CommandManagerOptions {
  maxHistorySize?: number
}

/**
 * 命令管理器（撤销/重做栈）
 */
export class CommandManager {
  private undoStack: ICommand[] = []
  private redoStack: ICommand[] = []
  private maxHistorySize: number
  private batchCommands: ICommand[] | null = null
  private changeListeners: Array<(canUndo: boolean, canRedo: boolean) => void> = []

  constructor(options: CommandManagerOptions = {}) {
    this.maxHistorySize = options.maxHistorySize ?? 50
  }

  /** 执行命令 */
  execute(command: ICommand): void {
    if (this.batchCommands) {
      this.batchCommands.push(command)
      command.execute()
    }
    else {
      command.execute()
      this.undoStack.push(command)
      this.redoStack = []
      this.trimHistory()
      this.notifyChange()
    }
  }

  /** 撤销 */
  undo(): void {
    if (!this.canUndo())
      return
    const command = this.undoStack.pop()!
    command.undo()
    this.redoStack.push(command)
    this.notifyChange()
  }

  /** 重做 */
  redo(): void {
    if (!this.canRedo())
      return
    const command = this.redoStack.pop()!
    command.execute()
    this.undoStack.push(command)
    this.notifyChange()
  }

  /** 是否可以撤销 */
  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  /** 是否可以重做 */
  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /** 开始批量命令 */
  beginBatch(): void {
    this.batchCommands = []
  }

  /** 结束批量命令 */
  endBatch(): void {
    if (!this.batchCommands || this.batchCommands.length === 0) {
      this.batchCommands = null
      return
    }
    const batch = new BatchCommand(this.batchCommands)
    this.batchCommands = null
    this.undoStack.push(batch)
    this.redoStack = []
    this.trimHistory()
    this.notifyChange()
  }

  /** 清空历史 */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
    this.batchCommands = null
    this.notifyChange()
  }

  /** 监听状态变化 */
  onChange(listener: (canUndo: boolean, canRedo: boolean) => void): () => void {
    this.changeListeners.push(listener)
    return () => {
      const index = this.changeListeners.indexOf(listener)
      if (index > -1)
        this.changeListeners.splice(index, 1)
    }
  }

  private trimHistory(): void {
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack = this.undoStack.slice(-this.maxHistorySize)
    }
  }

  private notifyChange(): void {
    const canUndo = this.canUndo()
    const canRedo = this.canRedo()
    for (const listener of this.changeListeners) {
      listener(canUndo, canRedo)
    }
  }
}
