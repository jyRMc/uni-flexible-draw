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

export const dfdProcess: Node.Config = {
  inherit: 'circle',
  width: 80,
  height: 80,
  attrs: {
    body: { fill: '#e8f5e9', stroke: '#2e7d32', strokeWidth: 1.5 },
    label: { fill: '#2e7d32', fontSize: 12 },
  },
  ports,
}

export const dfdDataStore: Node.Config = {
  inherit: 'rect',
  width: 120,
  height: 40,
  markup: [
    { tagName: 'rect', selector: 'body'       },
    { tagName: 'rect', selector: 'topBar'     },
    { tagName: 'rect', selector: 'bottomBar'  },
    { tagName: 'text', selector: 'label'      },
  ],
  attrs: {
    body:      { refWidth: 1, refHeight: 1, fill: '#e3f2fd', stroke: 'none' },
    topBar:    { refX: 0, refY: 0,    refWidth: 1, refHeight: 0.06, fill: '#1565c0', stroke: 'none' },
    bottomBar: { refX: 0, refY: 0.94, refWidth: 1, refHeight: 0.06, fill: '#1565c0', stroke: 'none' },
    label:     { fill: '#1565c0', fontSize: 12, refX: 0.5, refY: 0.5, textAnchor: 'middle', textVerticalAnchor: 'middle' },
  },
  ports,
}

export const dfdExternalEntity: Node.Config = {
  inherit: 'rect',
  width: 120,
  height: 50,
  attrs: {
    body: { fill: '#fce4ec', stroke: '#c62828', strokeWidth: 1.5, rx: 0, ry: 0 },
    label: { fill: '#c62828', fontSize: 12 },
  },
  ports,
}

export const dfdDataFlow: Node.Config = {
  inherit: 'rect',
  width: 100,
  height: 1,
  attrs: {
    body: { fill: 'transparent', stroke: 'none' },
  },
}

export const dfdMultipleProcess: Node.Config = {
  inherit: 'circle',
  width: 80,
  height: 80,
  markup: [
    { tagName: 'circle', selector: 'outer' },
    { tagName: 'circle', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    outer: { fill: 'none', stroke: '#2e7d32', strokeWidth: 1.5, refCx: 0.5, refCy: 0.5, refR: 0.47 },
    body: { fill: '#e8f5e9', stroke: '#2e7d32', strokeWidth: 1.5 },
    label: { fill: '#2e7d32', fontSize: 12 },
  },
  ports,
}
