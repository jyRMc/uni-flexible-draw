/**
 * 观察者模式事件总线
 */
export class GraphEventBus {
  private listeners: Map<string, Array<(...args: unknown[]) => void>> = new Map()

  on(event: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
    return () => this.off(event, callback)
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    const cbs = this.listeners.get(event)
    if (!cbs) return
    const index = cbs.indexOf(callback)
    if (index > -1) cbs.splice(index, 1)
  }

  emit(event: string, ...args: unknown[]): void {
    const cbs = this.listeners.get(event)
    if (!cbs) return
    for (const cb of cbs) {
      cb(...args)
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}
