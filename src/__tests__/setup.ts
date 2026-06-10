import { vi } from 'vitest'

// jsdom 中 ResizeObserver 不存在，需要 mock
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
})

// 为 X6 提供 SVG 相关 mock
if (!globalThis.SVGPathElement) {
  Object.defineProperty(globalThis, 'SVGPathElement', {
    writable: true,
    configurable: true,
    value: class SVGPathElement {},
  })
}

// jsdom 缺少 SVGMatrix 支持，X6 2.x 会调用 createSVGMatrix
const mockMatrix = {
  a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
  multiply() { return this },
  inverse() { return this },
  translate() { return this },
  scale() { return this },
  rotate() { return this },
  rotateFromVector() { return this },
  flipX() { return this },
  flipY() { return this },
  skewX() { return this },
  skewY() { return this },
}

if (!globalThis.SVGMatrix) {
  Object.defineProperty(globalThis, 'SVGMatrix', {
    writable: true,
    configurable: true,
    value: class SVGMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
      multiply() { return this }
      inverse() { return this }
      translate() { return this }
      scale() { return this }
      rotate() { return this }
    },
  })
}

if (!globalThis.SVGPoint) {
  Object.defineProperty(globalThis, 'SVGPoint', {
    writable: true,
    configurable: true,
    value: class SVGPoint {
      x = 0
      y = 0
      matrixTransform() { return this }
    },
  })
}

const originalCreateElementNS = document.createElementNS.bind(document)
document.createElementNS = (ns: string | null, qualifiedName: string) => {
  const el = originalCreateElementNS(ns, qualifiedName)
  if (qualifiedName === 'svg') {
    if (!(el as any).createSVGMatrix) {
      ;(el as any).createSVGMatrix = () => ({ ...mockMatrix })
    }
    if (!(el as any).createSVGPoint) {
      ;(el as any).createSVGPoint = () => ({ x: 0, y: 0, matrixTransform: () => ({ x: 0, y: 0 }) })
    }
  }
  // X6 的 viewport 是 <g> 元素，会调用 getCTM
  if ((qualifiedName === 'g' || qualifiedName === 'svg') && !(el as any).getCTM) {
    ;(el as any).getCTM = () => ({ ...mockMatrix })
  }
  return el
}

// 为 roughjs 提供 Canvas mock
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as any

// 模拟 fetch（server 测试需要）
if (!globalThis.fetch) {
  Object.defineProperty(globalThis, 'fetch', {
    writable: true,
    configurable: true,
    value: vi.fn(),
  })
}
