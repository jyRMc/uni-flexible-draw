import type { ICommand } from './ICommand'

/**
 * 批量命令（事务）
 */
export class BatchCommand implements ICommand {
  name = 'BatchCommand'

  constructor(private commands: ICommand[]) {}

  execute(): void {
    for (const cmd of this.commands) {
      cmd.execute()
    }
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo()
    }
  }
}
