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

export const umlEnum: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 100,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'stereotype' },
    { tagName: 'rect', selector: 'divider' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#ffffff', stroke: '#333333', strokeWidth: 1.5 },
    stereotype: { text: '«enumeration»', fill: '#666', fontSize: 10, refX: 0.5, refY: 0.12, textAnchor: 'middle', textVerticalAnchor: 'middle' },
    divider: { refX: 0, refY: 0.25, refWidth: 1, refHeight: 0.01, fill: '#333333', stroke: 'none' },
    label: { fill: '#333333', fontSize: 13, refX: 0.5, refY: 0.4, textAnchor: 'middle', textVerticalAnchor: 'middle' },
  },
  ports,
}

export const umlObject: Node.Config = {
  inherit: 'rect',
  width: 140,
  height: 60,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#ffffff', stroke: '#333333', strokeWidth: 1.5, rx: 0, ry: 0 },
    label: { fill: '#333333', fontSize: 13, refX: 0.5, refY: 0.5, textAnchor: 'middle', textVerticalAnchor: 'middle', textDecoration: 'underline' },
  },
  ports,
}

export const umlCollaboration: Node.Config = {
  inherit: 'ellipse',
  width: 140,
  height: 70,
  markup: [
    { tagName: 'ellipse', selector: 'body' },
    { tagName: 'line', selector: 'dashLine' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#f5f5f5', stroke: '#333333', strokeWidth: 1.5, strokeDasharray: '5 3' },
    label: { fill: '#333333', fontSize: 13 },
  },
  ports,
}

export const umlComposite: Node.Config = {
  inherit: 'rect',
  width: 140,
  height: 80,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'innerBox' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { refWidth: 1, refHeight: 1, fill: '#ffffff', stroke: '#333333', strokeWidth: 1.5, rx: 0, ry: 0 },
    innerBox: { refX: 0.1, refY: 0.55, refWidth: 0.8, refHeight: 0.35, fill: 'none', stroke: '#333333', strokeWidth: 1, strokeDasharray: '3 2' },
    label: { fill: '#333333', fontSize: 13, refX: 0.5, refY: 0.28, textAnchor: 'middle', textVerticalAnchor: 'middle' },
  },
  ports,
}

export const umlNode: Node.Config = {
  inherit: 'rect',
  width: 140,
  height: 80,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'topBar' },
    { tagName: 'rect', selector: 'rightBar' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { refWidth: 1, refHeight: 1, fill: '#ffffff', stroke: '#333333', strokeWidth: 1.5, rx: 0, ry: 0 },
    topBar: { refX: 0, refY: 0, refWidth: 1, refHeight: 0.2, fill: '#e8e8e8', stroke: '#333333', strokeWidth: 1 },
    rightBar: { refX: 0.8, refY: 0, refWidth: 0.2, refHeight: 1, fill: '#d8d8d8', stroke: '#333333', strokeWidth: 1 },
    label: { fill: '#333333', fontSize: 13, refX: 0.4, refY: 0.6, textAnchor: 'middle', textVerticalAnchor: 'middle' },
  },
  ports,
}

export const umlArtifact: Node.Config = {
  inherit: 'path',
  width: 120,
  height: 60,
  markup: [
    { tagName: 'path', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { refD: 'M0,0 L0.8,0 L1,0.25 L1,1 L0,1 Z', fill: '#ffffff', stroke: '#333333', strokeWidth: 1.5 },
    label: { fill: '#333333', fontSize: 12, refX: 0.4, refY: 0.6, textAnchor: 'middle', textVerticalAnchor: 'middle' },
  },
  ports,
}
