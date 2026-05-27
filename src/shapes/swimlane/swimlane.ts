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

export const swimlaneHorizontal: Node.Config = {
  inherit: 'rect',
  width: 300,
  height: 80,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'header' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#fafafa', stroke: '#999', strokeWidth: 1, rx: 0, ry: 0 },
    header: { refX: 0, refY: 0, refWidth: 0.2, refHeight: 1, fill: '#f0f0f0', stroke: '#999', strokeWidth: 1 },
    label: { fill: '#333', fontSize: 12, refX: 0.1, refY: 0.5, textAnchor: 'middle', textVerticalAnchor: 'middle', writingMode: 'vertical-rl' },
  },
  ports,
}

export const swimlaneVertical: Node.Config = {
  inherit: 'rect',
  width: 120,
  height: 300,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'header' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#fafafa', stroke: '#999', strokeWidth: 1, rx: 0, ry: 0 },
    header: { refX: 0, refY: 0, refWidth: 1, refHeight: 0.1, fill: '#f0f0f0', stroke: '#999', strokeWidth: 1 },
    label: { fill: '#333', fontSize: 12, refX: 0.5, refY: 0.05, textAnchor: 'middle', textVerticalAnchor: 'middle' },
  },
  ports,
}

export const swimlanePool: Node.Config = {
  inherit: 'rect',
  width: 400,
  height: 300,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'header' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#fafafa', stroke: '#666', strokeWidth: 1.5, rx: 0, ry: 0 },
    header: { refX: 0, refY: 0, refWidth: 0.075, refHeight: 1, fill: '#e0e0e0', stroke: '#666', strokeWidth: 1 },
    label: { fill: '#333', fontSize: 13, fontWeight: 'bold', refX: 0.0375, refY: 0.5, textAnchor: 'middle', textVerticalAnchor: 'middle', writingMode: 'vertical-rl' },
  },
  ports,
}

export const swimlanePhase: Node.Config = {
  inherit: 'rect',
  width: 400,
  height: 40,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#f5f5f5', stroke: '#999', strokeWidth: 1, rx: 0, ry: 0 },
    label: { fill: '#333', fontSize: 12, refX: 0.5, refY: 0.5, textAnchor: 'middle', textVerticalAnchor: 'middle' },
  },
  ports,
}
