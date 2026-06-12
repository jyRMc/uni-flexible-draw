import { describe, expect, it, vi } from 'vitest'
import { GraphEventBus } from '../core/event/GraphEventBus'

describe('graphEventBus', () => {
  it('should subscribe and emit events', () => {
    const bus = new GraphEventBus()
    const cb = vi.fn()
    bus.on('test', cb)
    bus.emit('test', 1, 2)
    expect(cb).toHaveBeenCalledWith(1, 2)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('should support multiple listeners', () => {
    const bus = new GraphEventBus()
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    bus.on('test', cb1)
    bus.on('test', cb2)
    bus.emit('test', 'payload')
    expect(cb1).toHaveBeenCalledWith('payload')
    expect(cb2).toHaveBeenCalledWith('payload')
  })

  it('should remove listener via off', () => {
    const bus = new GraphEventBus()
    const cb = vi.fn()
    bus.on('test', cb)
    bus.off('test', cb)
    bus.emit('test')
    expect(cb).not.toHaveBeenCalled()
  })

  it('should remove listener via unsubscribe returned by on', () => {
    const bus = new GraphEventBus()
    const cb = vi.fn()
    const unsub = bus.on('test', cb)
    unsub()
    bus.emit('test')
    expect(cb).not.toHaveBeenCalled()
  })

  it('should clear all listeners', () => {
    const bus = new GraphEventBus()
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    bus.on('a', cb1)
    bus.on('b', cb2)
    bus.clear()
    bus.emit('a')
    bus.emit('b')
    expect(cb1).not.toHaveBeenCalled()
    expect(cb2).not.toHaveBeenCalled()
  })

  it('should do nothing when emitting event without listeners', () => {
    const bus = new GraphEventBus()
    expect(() => bus.emit('nonexistent')).not.toThrow()
  })
})
