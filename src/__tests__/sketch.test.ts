import { describe, it, expect } from 'vitest'
import { SketchRenderer, getSketchRenderer, ROUGHNESS } from '../core/sketch/SketchRenderer'

describe('SketchRenderer', () => {
  it('should create an instance', () => {
    const renderer = new SketchRenderer()
    expect(renderer).toBeInstanceOf(SketchRenderer)
  })

  it('should return a singleton from getSketchRenderer', () => {
    const r1 = getSketchRenderer()
    const r2 = getSketchRenderer()
    expect(r1).toBe(r2)
  })

  it('should generate rect path', () => {
    const renderer = new SketchRenderer()
    const d = renderer.rect(100, 60, 0)
    expect(typeof d).toBe('string')
    expect(d.length).toBeGreaterThan(0)
  })

  it('should generate rounded rect path', () => {
    const renderer = new SketchRenderer()
    const d = renderer.rect(100, 60, 12)
    expect(typeof d).toBe('string')
    expect(d.length).toBeGreaterThan(0)
  })

  it('should generate ellipse path', () => {
    const renderer = new SketchRenderer()
    const d = renderer.ellipse(80, 80)
    expect(typeof d).toBe('string')
    expect(d.length).toBeGreaterThan(0)
  })

  it('should generate polygon path', () => {
    const renderer = new SketchRenderer()
    const d = renderer.polygon([[0, 50], [50, 0], [100, 50]], 100, 50)
    expect(typeof d).toBe('string')
    expect(d.length).toBeGreaterThan(0)
  })

  it('should generate linear path', () => {
    const renderer = new SketchRenderer()
    const d = renderer.linearPath([{ x: 0, y: 0 }, { x: 100, y: 100 }])
    expect(typeof d).toBe('string')
    expect(d.length).toBeGreaterThan(0)
  })

  it('should generate curve path', () => {
    const renderer = new SketchRenderer()
    const d = renderer.curve([{ x: 0, y: 0 }, { x: 50, y: 100 }, { x: 100, y: 0 }])
    expect(typeof d).toBe('string')
    expect(d.length).toBeGreaterThan(0)
  })

  it('should return empty string for curve with <2 points', () => {
    const renderer = new SketchRenderer()
    expect(renderer.curve([{ x: 0, y: 0 }])).toBe('')
  })

  it('ROUGHNESS constants should be defined', () => {
    expect(ROUGHNESS.architect).toBe(0)
    expect(ROUGHNESS.artist).toBe(1)
    expect(ROUGHNESS.cartoonist).toBe(2)
  })
})
