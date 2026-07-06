import type { Node } from '@antv/x6'

function calcInsetPoints(d: number, width: number, height: number) {
  const cx = width * 0.5
  const cy = height * 0.5
  if (!Number.isFinite(d) || d <= 0 || width <= 0 || height <= 0)
    return `${cx} ${cy} ${cx} ${cy} ${cx} ${cy} ${cx} ${cy}`
  const s = 0.5 - d * Math.sqrt(width * width + height * height) / (width * height)
  const safeS = Math.max(0, Math.min(s, 0.45))
  const right = width * (0.5 + safeS)
  const left = width * (0.5 - safeS)
  const top = height * (0.5 - safeS)
  const bottom = height * (0.5 + safeS)
  return `${Math.round(cx)} ${Math.round(top)} ${Math.round(right)} ${Math.round(cy)} ${Math.round(cx)} ${Math.round(bottom)} ${Math.round(left)} ${Math.round(cy)}`
}

const identifyingRelAttrHooks: Node.Config['attrHooks'] = {
  insetPoints: {
    set(val, { refBBox }) {
      return { points: calcInsetPoints(Number(val), refBBox.width, refBBox.height) }
    },
  },
}

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

export const erEntity: Node.Config = {
  inherit: 'rect',
  width: 120,
  height: 50,
  attrs: {
    body: { fill: '#e3f2fd', stroke: '#1565c0', strokeWidth: 1.5, rx: 0, ry: 0 },
    label: { fill: '#1565c0', fontSize: 13, fontWeight: 'bold' },
  },
  ports,
}

export const erWeakEntity: Node.Config = {
  inherit: 'rect',
  width: 120,
  height: 50,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'outer' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { refWidth: 1, refHeight: 1, fill: '#e3f2fd', stroke: '#1565c0', strokeWidth: 1.5, rx: 0, ry: 0 },
    outer: { refX: 0.05, refY: 0.1, refWidth: 0.9, refHeight: 0.8, fill: 'none', stroke: '#1565c0', strokeWidth: 1.5, rx: 0 },
    label: { fill: '#1565c0', fontSize: 13, fontWeight: 'bold' },
  },
  ports,
}

export const erRelationship: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 60,
  attrs: {
    body: { fill: '#fff3e0', stroke: '#e65100', strokeWidth: 1.5, refPoints: '0,0.5 0.5,0 1,0.5 0.5,1' },
    label: { fill: '#e65100', fontSize: 12 },
  },
  ports,
}

export const erIdentifyingRelationship: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 60,
  attrHooks: identifyingRelAttrHooks,
  markup: [
    { tagName: 'polygon', selector: 'outer' },
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    outer: { fill: 'none', stroke: '#e65100', strokeWidth: 1.5, refPoints: '0,0.5 0.5,0 1,0.5 0.5,1' },
    body: { fill: '#fff3e0', stroke: '#e65100', strokeWidth: 1.5, insetPoints: 8.48528137423857 },
    label: { fill: '#e65100', fontSize: 12 },
  },
  ports,
}

export const erAttribute: Node.Config = {
  inherit: 'ellipse',
  width: 80,
  height: 40,
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.2 },
    label: { fill: '#333', fontSize: 11 },
  },
  ports,
}

export const erKeyAttribute: Node.Config = {
  inherit: 'ellipse',
  width: 80,
  height: 40,
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.2 },
    label: { fill: '#333', fontSize: 11, textDecoration: 'underline' },
  },
  ports,
}

export const erMultivalued: Node.Config = {
  inherit: 'ellipse',
  width: 80,
  height: 40,
  markup: [
    { tagName: 'ellipse', selector: 'outer' },
    { tagName: 'ellipse', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    outer: { fill: 'none', stroke: '#333', strokeWidth: 1.2, refCx: 0.5, refCy: 0.5, refRx: 0.475, refRy: 0.45 },
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.2 },
    label: { fill: '#333', fontSize: 11 },
  },
  ports,
}

export const erDerived: Node.Config = {
  inherit: 'ellipse',
  width: 80,
  height: 40,
  attrs: {
    body: { fill: '#fff', stroke: '#333', strokeWidth: 1.2, strokeDasharray: '5 3' },
    label: { fill: '#333', fontSize: 11 },
  },
  ports,
}

export const erAssociative: Node.Config = {
  inherit: 'rect',
  width: 100,
  height: 50,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'polygon', selector: 'diamond' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#e3f2fd', stroke: '#1565c0', strokeWidth: 1.5, rx: 0, ry: 0 },
    diamond: { fill: '#fff3e0', stroke: '#e65100', strokeWidth: 1, refPoints: '0.3,0.5 0.5,0.3 0.7,0.5 0.5,0.7' },
    label: { fill: '#1565c0', fontSize: 11 },
  },
  ports,
}

export const erTotalParticipation: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 60,
  markup: [
    { tagName: 'polygon', selector: 'outer' },
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    outer: { fill: '#fff3e0', stroke: '#e65100', strokeWidth: 3, refPoints: '0,0.5 0.5,0 1,0.5 0.5,1' },
    body: { fill: '#fff3e0', stroke: '#e65100', strokeWidth: 1.5, refPoints: '0.04,0.5 0.5,0.05 0.96,0.5 0.5,0.95' },
    label: { fill: '#e65100', fontSize: 12 },
  },
  ports,
}
