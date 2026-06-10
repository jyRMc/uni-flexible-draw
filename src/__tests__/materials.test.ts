import { describe, it, expect } from 'vitest'
import { getAllLibraries, getLibraryById } from '../materials'
import type { MaterialLibrary } from '../shared'

describe('materials', () => {
  it('should return all libraries', () => {
    const libs = getAllLibraries()
    expect(libs.length).toBeGreaterThan(0)
  })

  it('should have basic library with items', () => {
    const libs = getAllLibraries()
    const basic = libs.find(l => l.id === 'basic')
    expect(basic).toBeDefined()
    expect((basic as MaterialLibrary).items.length).toBeGreaterThan(0)
  })

  it('should have edge library with items', () => {
    const libs = getAllLibraries()
    const edge = libs.find(l => l.id === 'edge')
    expect(edge).toBeDefined()
    expect((edge as MaterialLibrary).items.length).toBeGreaterThan(0)
  })

  it('should get library by id', () => {
    const lib = getLibraryById('flowchart')
    expect(lib).toBeDefined()
    expect(lib?.id).toBe('flowchart')
  })

  it('should return undefined for unknown library', () => {
    const lib = getLibraryById('nonexistent')
    expect(lib).toBeUndefined()
  })

  it('every item should have required fields', () => {
    const libs = getAllLibraries()
    for (const lib of libs) {
      for (const item of lib.items) {
        expect(item.id).toBeDefined()
        expect(item.name).toBeDefined()
        expect(item.shape).toBeDefined()
        expect(item.defaultSize).toBeDefined()
        expect(item.defaultSize.width).toBeGreaterThan(0)
        expect(item.defaultSize.height).toBeGreaterThan(0)
      }
    }
  })
})
