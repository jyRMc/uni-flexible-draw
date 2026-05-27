import type { Node } from '@antv/x6'

export const umlComponent: Node.Config = {
  inherit: 'rect',
  width: 140,
  height: 60,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'icon1' },
    { tagName: 'rect', selector: 'icon2' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 1.5,
      rx: 0,
      ry: 0,
    },
    icon1: {
      width: 14,
      height: 10,
      x: -7,
      y: 14,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 1,
    },
    icon2: {
      width: 14,
      height: 10,
      x: -7,
      y: 34,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 1,
    },
    label: {
      fill: '#333333',
      fontSize: 13,
      refX: 0.5,
      refY: 0.5,
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
