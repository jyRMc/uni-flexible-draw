import { describe, expect, it } from 'vitest'
import { deepClone, shortId, uuid } from '../shared/utils'

describe('shared utils', () => {
  describe('uuid', () => {
    it('should return a valid UUID v4 format', () => {
      const id = uuid()
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should return unique values', () => {
      const ids = new Set(Array.from({ length: 100 }, () => uuid()))
      expect(ids.size).toBe(100)
    })
  })

  describe('shortId', () => {
    it('should include prefix when provided', () => {
      const id = shortId('node')
      expect(id.startsWith('node-')).toBe(true)
    })

    it('should not be empty without prefix', () => {
      const id = shortId()
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('deepClone', () => {
    it('should clone plain objects', () => {
      const obj = { a: 1, b: { c: [1, 2, 3] } }
      const cloned = deepClone(obj)
      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
    })

    it('should clone arrays', () => {
      const arr = [{ a: 1 }, { b: 2 }]
      const cloned = deepClone(arr)
      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
      expect(cloned[0]).not.toBe(arr[0])
    })

    it('should clone Date instances', () => {
      const d = new Date('2024-01-01')
      const cloned = deepClone(d)
      expect(cloned.getTime()).toBe(d.getTime())
      expect(cloned).not.toBe(d)
    })

    it('should return primitives as-is', () => {
      expect(deepClone(null)).toBe(null)
      expect(deepClone(42)).toBe(42)
      expect(deepClone('hello')).toBe('hello')
    })
  })
})
