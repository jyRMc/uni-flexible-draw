import type { Node } from '@antv/x6'

export const umlClass: Node.Config = {
  inherit: 'rect',
  width: 140,
  height: 90,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'header' },
    { tagName: 'rect', selector: 'divider1' },
    { tagName: 'rect', selector: 'divider2' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refWidth: 1,
      refHeight: 1,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 1.5,
      rx: 0,
      ry: 0,
    },
    header: {
      refX: 0,
      refY: 0,
      refWidth: 1,
      refHeight: 0.3,
      fill: '#f0f0f0',
      stroke: 'none',
    },
    divider1: {
      refX: 0,
      refY: 0.3,
      refWidth: 1,
      refHeight: 0.014,
      fill: '#333333',
      stroke: 'none',
    },
    divider2: {
      refX: 0,
      refY: 0.62,
      refWidth: 1,
      refHeight: 0.014,
      fill: '#333333',
      stroke: 'none',
    },
    label: {
      fill: '#333333',
      fontSize: 13,
      fontWeight: 'bold',
      refX: 0.5,
      refY: 0.15,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: {
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
  },
}
