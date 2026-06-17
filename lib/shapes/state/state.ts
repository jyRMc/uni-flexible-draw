import type { Node } from '@antv/x6'
import { LABEL_FILL } from '../theme'

const FILL = '#f8fafc'
const STROKE = '#334155'
const SOLID = '#1a1a1a'
const TERMINATE = '#dc2626'

const portAttrs = {
  circle: {
    r: 4,
    magnet: true,
    stroke: STROKE,
    fill: '#fff',
    strokeWidth: 1.5,
    style: { visibility: 'hidden' },
  },
}

function ellipsePorts(count: number): any {
  const groups: any = {}
  const items: any[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2
    const gid = `p${i}`
    groups[gid] = {
      position(args: any) {
        const bbox = args.bbox
        const cx = bbox.width / 2
        const cy = bbox.height / 2
        return {
          x: cx + cx * Math.cos(angle),
          y: cy + cy * Math.sin(angle),
        }
      },
      attrs: portAttrs,
    }
    items.push({ id: gid, group: gid })
  }
  return { groups, items }
}

function polygonPorts(points: string): any {
  const normalized = points.trim().split(/\s+/).map((pair) => {
    const [x, y] = pair.split(',').map(v => Number(v))
    return { x, y }
  })
  const groups: any = {}
  const items: any[] = []
  normalized.forEach((p, i) => {
    const gid = `p${i}`
    groups[gid] = {
      position(args: any) {
        const bbox = args.bbox
        return {
          x: bbox.width * p.x,
          y: bbox.height * p.y,
        }
      },
      attrs: portAttrs,
    }
    items.push({ id: gid, group: gid })
  })
  return { groups, items }
}

const rectPorts: any = {
  groups: {
    top: { position: 'top', attrs: portAttrs },
    bottom: { position: 'bottom', attrs: portAttrs },
    left: { position: 'left', attrs: portAttrs },
    right: { position: 'right', attrs: portAttrs },
  },
  items: [
    { id: 'port-top', group: 'top' },
    { id: 'port-bottom', group: 'bottom' },
    { id: 'port-left', group: 'left' },
    { id: 'port-right', group: 'right' },
  ],
}

const forkPorts: any = {
  groups: {
    top: {
      position(args: any) {
        const bbox = args.bbox
        return { x: bbox.width * 0.5, y: bbox.height * 0.1667 }
      },
      attrs: portAttrs,
    },
    bottom1: {
      position(args: any) {
        const bbox = args.bbox
        return { x: bbox.width * 0.25, y: bbox.height * 0.8333 }
      },
      attrs: portAttrs,
    },
    bottom2: {
      position(args: any) {
        const bbox = args.bbox
        return { x: bbox.width * 0.5, y: bbox.height * 0.8333 }
      },
      attrs: portAttrs,
    },
    bottom3: {
      position(args: any) {
        const bbox = args.bbox
        return { x: bbox.width * 0.75, y: bbox.height * 0.8333 }
      },
      attrs: portAttrs,
    },
  },
  items: [
    { id: 'port-top', group: 'top' },
    { id: 'port-bottom-1', group: 'bottom1' },
    { id: 'port-bottom-2', group: 'bottom2' },
    { id: 'port-bottom-3', group: 'bottom3' },
  ],
}

const joinPorts: any = {
  groups: {
    top1: {
      position(args: any) {
        const bbox = args.bbox
        return { x: bbox.width * 0.25, y: bbox.height * 0.1667 }
      },
      attrs: portAttrs,
    },
    top2: {
      position(args: any) {
        const bbox = args.bbox
        return { x: bbox.width * 0.5, y: bbox.height * 0.1667 }
      },
      attrs: portAttrs,
    },
    top3: {
      position(args: any) {
        const bbox = args.bbox
        return { x: bbox.width * 0.75, y: bbox.height * 0.1667 }
      },
      attrs: portAttrs,
    },
    bottom: {
      position(args: any) {
        const bbox = args.bbox
        return { x: bbox.width * 0.5, y: bbox.height * 0.8333 }
      },
      attrs: portAttrs,
    },
  },
  items: [
    { id: 'port-top-1', group: 'top1' },
    { id: 'port-top-2', group: 'top2' },
    { id: 'port-top-3', group: 'top3' },
    { id: 'port-bottom', group: 'bottom' },
  ],
}

// 精确归一化顶点坐标（160×70）
const diamondVertexPoints = '0.5,0.2 0.8,0.5 0.5,0.8 0.2,0.5'
const signalSendPoints = '0.03125,0.5 0.25,0.071428571 0.75,0.071428571 0.96875,0.5 0.75,0.928571429 0.25,0.928571429'
const signalReceivePoints = '0.25,0.071428571 0.75,0.071428571 0.96875,0.5 0.75,0.928571429 0.25,0.928571429 0.03125,0.5'
const terminatePoints = '0.3,0.3 0.7,0.7 0.7,0.3 0.3,0.7'

const diamondVertexPorts = polygonPorts(diamondVertexPoints)
const signalSendPorts = polygonPorts(signalSendPoints)
const signalReceivePorts = polygonPorts(signalReceivePoints)
const terminatePorts = polygonPorts(terminatePoints)

function relPort(x: number, y: number) {
  return (args: any) => ({ x: args.bbox.width * x, y: args.bbox.height * y })
}

export const stateSimple: Node.Config = {
  inherit: 'rect',
  width: 140,
  height: 70,
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, rx: 12, ry: 12 },
    label: { fill: LABEL_FILL, fontSize: 16, fontWeight: 500 },
  },
  ports: rectPorts,
}

export const stateComposite: Node.Config = {
  width: 200,
  height: 120,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'line', selector: 'divider' },
    { tagName: 'rect', selector: 'region' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'text', selector: 'regionLabel' },
  ],
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, rx: 12, ry: 12, refWidth: 1, refHeight: 1 },
    divider: { x1: '2.5%', y1: '33.333%', x2: '97.5%', y2: '33.333%', stroke: STROKE, strokeWidth: 2 },
    region: { refX: '12.5%', refY: '45.833%', refWidth: '75%', refHeight: '37.5%', rx: 6, ry: 6, fill: '#e2e8f0', stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 2' },
    label: { fill: LABEL_FILL, fontSize: 14, fontWeight: 600, textAnchor: 'middle', textVerticalAnchor: 'top', refX: 0.5, refY: '10%' },
    regionLabel: { fill: '#64748b', fontSize: 12, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.67 },
  },
  ports: rectPorts,
}

export const stateSubmachine: Node.Config = {
  width: 160,
  height: 70,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'path', selector: 'badgePath' },
    { tagName: 'text', selector: 'badge' },
  ],
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, rx: 12, ry: 12, refWidth: 1, refHeight: 1 },
    label: { fill: LABEL_FILL, fontSize: 16, fontWeight: 500, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
    badgePath: { refD: 'M 0.78125 0.71429 L 0.84375 0.71429 L 0.84375 0.85714 L 0.78125 0.85714 Z', fill: 'none', stroke: STROKE, strokeWidth: 1.5 },
    badge: { text: '::', fill: STROKE, fontSize: 10, fontFamily: 'monospace', textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.8125, refY: 0.7857 },
  },
  ports: rectPorts,
}

export const stateInitial: Node.Config = {
  width: 40,
  height: 40,
  markup: [
    { tagName: 'circle', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: SOLID, stroke: SOLID, strokeWidth: 1, refCx: 0.5, refCy: 0.5, refR: 0.3 },
    label: { fill: '#fff', fontSize: 10, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
  },
  ports: ellipsePorts(8, { stroke: SOLID }, 0.3, 0.3),
}

export const stateFinal: Node.Config = {
  width: 40,
  height: 40,
  markup: [
    { tagName: 'circle', selector: 'outer' },
    { tagName: 'circle', selector: 'inner' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    outer: { refR: 0.35, refCx: 0.5, refCy: 0.5, fill: FILL, stroke: SOLID, strokeWidth: 2 },
    inner: { refR: 0.2, refCx: 0.5, refCy: 0.5, fill: SOLID, stroke: 'none' },
    label: { fill: LABEL_FILL, fontSize: 10, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
  },
  ports: ellipsePorts(8, { stroke: SOLID }, 0.35, 0.35),
}

export const stateShallowHistory: Node.Config = {
  width: 60,
  height: 50,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, refWidth: 1, refHeight: 1, rx: 8, ry: 8 },
    label: { text: 'H', fill: LABEL_FILL, fontSize: 20, fontWeight: 600, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
  },
  ports: rectPorts,
}

export const stateDeepHistory: Node.Config = {
  width: 60,
  height: 50,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, refWidth: 1, refHeight: 1, rx: 8, ry: 8 },
    label: { text: 'H*', fill: LABEL_FILL, fontSize: 20, fontWeight: 600, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
  },
  ports: rectPorts,
}

export const stateJunction: Node.Config = {
  inherit: 'polygon',
  width: 40,
  height: 40,
  markup: [
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: STROKE, stroke: STROKE, strokeWidth: 2, refPoints: diamondVertexPoints },
    label: { fill: '#fff', fontSize: 10, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
  },
  ports: diamondVertexPorts,
}

export const stateChoice: Node.Config = {
  width: 50,
  height: 50,
  markup: [
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, refPoints: diamondVertexPoints },
    label: { text: '?', fill: LABEL_FILL, fontSize: 16, fontWeight: 600, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
  },
  ports: diamondVertexPorts,
}

export const stateFork: Node.Config = {
  width: 120,
  height: 60,
  markup: [
    { tagName: 'line', selector: 'stem' },
    { tagName: 'line', selector: 'bar' },
    { tagName: 'line', selector: 'branch1' },
    { tagName: 'line', selector: 'branch2' },
    { tagName: 'line', selector: 'branch3' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    stem: { x1: 0.5, y1: 0.1667, x2: 0.5, y2: 0.5, stroke: STROKE, strokeWidth: 2 },
    bar: { x1: 0.1667, y1: 0.5, x2: 0.8333, y2: 0.5, stroke: STROKE, strokeWidth: 5, strokeLinecap: 'round' },
    branch1: { x1: 0.25, y1: 0.5, x2: 0.25, y2: 0.8333, stroke: STROKE, strokeWidth: 2 },
    branch2: { x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.8333, stroke: STROKE, strokeWidth: 2 },
    branch3: { x1: 0.75, y1: 0.5, x2: 0.75, y2: 0.8333, stroke: STROKE, strokeWidth: 2 },
    label: { fill: LABEL_FILL, fontSize: 12, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
  },
  ports: forkPorts,
}

export const stateJoin: Node.Config = {
  width: 120,
  height: 60,
  markup: [
    { tagName: 'line', selector: 'branch1' },
    { tagName: 'line', selector: 'branch2' },
    { tagName: 'line', selector: 'branch3' },
    { tagName: 'line', selector: 'bar' },
    { tagName: 'line', selector: 'stem' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    branch1: { x1: 0.25, y1: 0.1667, x2: 0.25, y2: 0.5, stroke: STROKE, strokeWidth: 2 },
    branch2: { x1: 0.5, y1: 0.1667, x2: 0.5, y2: 0.5, stroke: STROKE, strokeWidth: 2 },
    branch3: { x1: 0.75, y1: 0.1667, x2: 0.75, y2: 0.5, stroke: STROKE, strokeWidth: 2 },
    bar: { x1: 0.1667, y1: 0.5, x2: 0.8333, y2: 0.5, stroke: STROKE, strokeWidth: 5, strokeLinecap: 'round' },
    stem: { x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.8333, stroke: STROKE, strokeWidth: 2 },
    label: { fill: LABEL_FILL, fontSize: 12, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
  },
  ports: joinPorts,
}

export const stateEntryPoint: Node.Config = {
  width: 140,
  height: 70,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'circle', selector: 'point' },
    { tagName: 'line', selector: 'arrowLine' },
    { tagName: 'path', selector: 'arrowHead' },
  ],
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, rx: 12, ry: 12, refX: '21.429%', refY: '7.143%', refWidth: '71.429%', refHeight: '85.714%' },
    label: { fill: LABEL_FILL, fontSize: 14, fontWeight: 500, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5714, refY: 0.5429 },
    point: { fill: FILL, stroke: STROKE, strokeWidth: 2, refCx: 0.2143, refCy: 0.5, refR: 0.0857 },
    arrowLine: { x1: 0.0357, y1: 0.5, x2: 0.1714, y2: 0.5, stroke: STROKE, strokeWidth: 2 },
    arrowHead: { d: 'M 0 0 L -6 -4 L -6 4 Z', fill: STROKE, refX: 0.1714, refY: 0.5 },
  },
  ports: {
    groups: {
      top: { position: relPort(0.5714, 0.0714), attrs: portAttrs },
      bottom: { position: relPort(0.5714, 0.9286), attrs: portAttrs },
      left: { position: relPort(0.2143, 0.5), attrs: portAttrs },
      right: { position: relPort(0.9286, 0.5), attrs: portAttrs },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-bottom', group: 'bottom' },
      { id: 'port-left', group: 'left' },
      { id: 'port-right', group: 'right' },
    ],
  },
}

export const stateExitPoint: Node.Config = {
  width: 140,
  height: 70,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'circle', selector: 'point' },
    { tagName: 'line', selector: 'cross1' },
    { tagName: 'line', selector: 'cross2' },
    { tagName: 'line', selector: 'arrowLine' },
    { tagName: 'path', selector: 'arrowHead' },
  ],
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, rx: 12, ry: 12, refX: '3.571%', refY: '7.143%', refWidth: '71.429%', refHeight: '85.714%' },
    label: { fill: LABEL_FILL, fontSize: 14, fontWeight: 500, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.3929, refY: 0.5429 },
    point: { fill: FILL, stroke: STROKE, strokeWidth: 2, refCx: 0.75, refCy: 0.5, refR: 0.0857 },
    cross1: { x1: 0.7286, y1: 0.4571, x2: 0.7714, y2: 0.5429, stroke: STROKE, strokeWidth: 1.5 },
    cross2: { x1: 0.7714, y1: 0.4571, x2: 0.7286, y2: 0.5429, stroke: STROKE, strokeWidth: 1.5 },
    arrowLine: { x1: 0.7929, y1: 0.5, x2: 0.9286, y2: 0.5, stroke: STROKE, strokeWidth: 2 },
    arrowHead: { d: 'M 0 0 L 6 -4 L 6 4 Z', fill: STROKE, refX: 0.9286, refY: 0.5 },
  },
  ports: {
    groups: {
      top: { position: relPort(0.3929, 0.0714), attrs: portAttrs },
      bottom: { position: relPort(0.3929, 0.9286), attrs: portAttrs },
      left: { position: relPort(0.0357, 0.5), attrs: portAttrs },
      right: { position: relPort(0.75, 0.5), attrs: portAttrs },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-bottom', group: 'bottom' },
      { id: 'port-left', group: 'left' },
      { id: 'port-right', group: 'right' },
    ],
  },
}

export const stateTerminate: Node.Config = {
  width: 40,
  height: 40,
  markup: [
    { tagName: 'line', selector: 'cross1' },
    { tagName: 'line', selector: 'cross2' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    cross1: { x1: 0.3, y1: 0.3, x2: 0.7, y2: 0.7, stroke: TERMINATE, strokeWidth: 3, strokeLinecap: 'round' },
    cross2: { x1: 0.7, y1: 0.3, x2: 0.3, y2: 0.7, stroke: TERMINATE, strokeWidth: 3, strokeLinecap: 'round' },
    label: { fill: TERMINATE, fontSize: 10, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
  },
  ports: terminatePorts,
}

export const stateSignalSend: Node.Config = {
  width: 160,
  height: 70,
  markup: [
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'line', selector: 'flap1' },
    { tagName: 'line', selector: 'flap2' },
  ],
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, refPoints: signalSendPoints },
    label: { fill: LABEL_FILL, fontSize: 14, fontWeight: 500, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
    flap1: { x1: 0.75, y1: 0.0714, x2: 0.96875, y2: 0.5, stroke: STROKE, strokeWidth: 1.5 },
    flap2: { x1: 0.75, y1: 0.9286, x2: 0.96875, y2: 0.5, stroke: STROKE, strokeWidth: 1.5 },
  },
  ports: signalSendPorts,
}

export const stateSignalReceive: Node.Config = {
  width: 160,
  height: 70,
  markup: [
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'line', selector: 'flap1' },
    { tagName: 'line', selector: 'flap2' },
  ],
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, refPoints: signalReceivePoints },
    label: { fill: LABEL_FILL, fontSize: 14, fontWeight: 500, textAnchor: 'middle', textVerticalAnchor: 'middle', refX: 0.5, refY: 0.5 },
    flap1: { x1: 0.25, y1: 0.0714, x2: 0.03125, y2: 0.5, stroke: STROKE, strokeWidth: 1.5 },
    flap2: { x1: 0.25, y1: 0.9286, x2: 0.03125, y2: 0.5, stroke: STROKE, strokeWidth: 1.5 },
  },
  ports: signalReceivePorts,
}
