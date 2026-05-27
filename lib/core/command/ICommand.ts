/**
 * 命令接口（命令模式）
 */
export interface ICommand {
  /** 执行命令 */
  execute(): void
  /** 撤销命令 */
  undo(): void
  /** 命令名称（用于调试） */
  name?: string
}
