import type { Node } from '@antv/x6'

const ports = {
  groups: {
    top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
    bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
    left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
    right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
  },
  items: [
    { id: 'top', group: 'top' },
    { id: 'bottom', group: 'bottom' },
    { id: 'left', group: 'left' },
    { id: 'right', group: 'right' },
  ],
}

export const stateSimple: Node.Config = {
  inherit: 'rect',
  width: 120,
  height: 50,
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.5, rx: 12, ry: 12 },
    label: { fill: '#333', fontSize: 13 },
  },
  ports,
}

export const stateInitial: Node.Config = {
  inherit: 'circle',
  width: 24,
  height: 24,
  attrs: { body: { fill: '#333', stroke: '#333', strokeWidth: 1 } },
  ports,
}

export const stateFinal: Node.Config = {
  inherit: 'circle',
  width: 28,
  height: 28,
  markup: [
    { tagName: 'circle', selector: 'outer' },
    { tagName: 'circle', selector: 'inner' },
  ],
  attrs: {
    outer: { r: 13, cx: 14, cy: 14, fill: '#fff', stroke: '#333', strokeWidth: 2 },
    inner: { r: 7, cx: 14, cy: 14, fill: '#333', stroke: 'none' },
  },
  ports,
}

export const stateShallowHistory: Node.Config = {
  inherit: 'circle',
  width: 32,
  height: 32,
  markup: [
    { tagName: 'circle', selector: 'body' },
    { tagName: 'text', selector: 'hLabel' },
  ],
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.5, cx: 16, cy: 16, r: 15 },
    hLabel: { text: 'H', fill: '#333', fontSize: 13, fontWeight: 'bold', x: 16, y: 16, textAnchor: 'middle', textVerticalAnchor: 'middle' },
  },
  ports,
}

export const stateDeepHistory: Node.Config = {
  inherit: 'circle',
  width: 32,
  height: 32,
  markup: [
    { tagName: 'circle', selector: 'body' },
    { tagName: 'text', selector: 'hLabel' },
  ],
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.5, cx: 16, cy: 16, r: 15 },
    hLabel: { text: 'H*', fill: '#333', fontSize: 11, fontWeight: 'bold', x: 16, y: 16, textAnchor: 'middle', textVerticalAnchor: 'middle' },
  },
  ports,
}

export const stateJunction: Node.Config = {
  inherit: 'circle',
  width: 16,
  height: 16,
  attrs: { body: { fill: '#333', stroke: '#333', strokeWidth: 1 } },
  ports,
}

export const stateChoice: Node.Config = {
  inherit: 'polygon',
  width: 36,
  height: 36,
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.5, refPoints: '0,18 18,0 36,18 18,36' },
  },
  ports,
}

export const stateFork: Node.Config = {
  inherit: 'rect',
  width: 80,
  height: 6,
  attrs: { body: { fill: '#333', stroke: '#333', strokeWidth: 1, rx: 0, ry: 0 } },
  ports,
}

export const stateJoin: Node.Config = {
  inherit: 'rect',
  width: 80,
  height: 6,
  attrs: { body: { fill: '#333', stroke: '#333', strokeWidth: 1, rx: 0, ry: 0 } },
  ports,
}

export const stateEntryPoint: Node.Config = {
  inherit: 'circle',
  width: 18,
  height: 18,
  attrs: { body: { fill: '#fff', stroke: '#333', strokeWidth: 1.5 } },
  ports,
}

export const stateExitPoint: Node.Config = {
  inherit: 'circle',
  width: 18,
  height: 18,
  markup: [
    { tagName: 'circle', selector: 'body' },
    { tagName: 'line', selector: 'cross1' },
    { tagName: 'line', selector: 'cross2' },
  ],
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.5, cx: 9, cy: 9, r: 8 },
    cross1: { x1: 4, y1: 4, x2: 14, y2: 14, stroke: '#333', strokeWidth: 1.5 },
    cross2: { x1: 14, y1: 4, x2: 4, y2: 14, stroke: '#333', strokeWidth: 1.5 },
  },
  ports,
}

export const stateTerminate: Node.Config = {
  inherit: 'circle',
  width: 24,
  height: 24,
  markup: [
    { tagName: 'circle', selector: 'body' },
    { tagName: 'line', selector: 'cross1' },
    { tagName: 'line', selector: 'cross2' },
  ],
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.5, cx: 12, cy: 12, r: 11 },
    cross1: { x1: 5, y1: 5, x2: 19, y2: 19, stroke: '#333', strokeWidth: 2 },
    cross2: { x1: 19, y1: 5, x2: 5, y2: 19, stroke: '#333', strokeWidth: 2 },
  },
  ports,
}

export const stateSignalSend: Node.Config = {
  inherit: 'polygon',
  width: 40,
  height: 28,
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.5, refPoints: '0,0 28,0 40,14 28,28 0,28' },
    label: { fill: '#333', fontSize: 10 },
  },
  ports,
}

export const stateSignalReceive: Node.Config = {
  inherit: 'polygon',
  width: 40,
  height: 28,
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.5, refPoints: '0,0 40,0 40,28 0,28 12,14' },
    label: { fill: '#333', fontSize: 10 },
  },
  ports,
}
