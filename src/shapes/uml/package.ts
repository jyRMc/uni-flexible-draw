import type { Node } from '@antv/x6'

export const umlPackage: Node.Config = {
  inherit: 'rect',
  width: 180,
  height: 100,
  markup: [
    { tagName: 'rect', selector: 'tab' },
    { tagName: 'text', selector: 'tabLabel' },
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    tab: {
      fill: '#e8e8e8',
      stroke: '#333333',
      strokeWidth: 1.5,
      width: 60,
      height: 20,
      x: 0,
      y: -20,
      rx: 4,
      ry: 4,
    },
    tabLabel: {
      fill: '#333333',
      fontSize: 11,
      x: 30,
      y: -8,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
    body: {
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 1.5,
      rx: 0,
      ry: 0,
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
